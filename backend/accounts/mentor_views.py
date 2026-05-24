from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.mentor_serializers import (
    MentorSerializer, 
    MentorAvailabilitySerializer, 
    MentorRequestSerializer,
    MenteeProfileSerializer,
    MentorAppointmentSerializer,
)
from accounts.models import Profile, MentorAvailability, MentorRequest, MentorAppointment


def _as_list(value):
    if isinstance(value, list):
        return value
    if not value:
        return []
    return [item.strip() for item in str(value).split(",") if item.strip()]


def _mentor_score(student_profile, mentor_profile):
    score = 0
    if not student_profile or not mentor_profile:
        return score
    if student_profile.university_id and student_profile.university_id == mentor_profile.university_id:
        score += 4
    if student_profile.city and mentor_profile.city and student_profile.city.lower() == mentor_profile.city.lower():
        score += 2
    if student_profile.language and student_profile.language == mentor_profile.language:
        score += 2
    if student_profile.country_origin and mentor_profile.country_origin and student_profile.country_origin.lower() == mentor_profile.country_origin.lower():
        score += 4
    return score


def _compatibility_label(score):
    if score >= 7:
        return "Très compatible"
    if score >= 3:
        return "Compatible"
    return "Peut aider"


def _apply_mentor_filters(qs, request):
    params = request.query_params
    university_id = params.get("university_id") or params.get("university")
    city = params.get("city") or params.get("campus")
    language = params.get("language")
    specialty = params.get("specialty") or params.get("help_topic")
    country_origin = params.get("country_origin")
    program = params.get("program")
    availability_status = params.get("availability_status")
    search = params.get("search")

    if university_id:
        qs = qs.filter(university_id=university_id)
    if city:
        qs = qs.filter(city__icontains=city) | qs.filter(campus__icontains=city)
    if language:
        qs = qs.filter(language=language)
    if specialty:
        qs = qs.filter(specialties__icontains=specialty)
    if country_origin:
        qs = qs.filter(country_origin__icontains=country_origin)
    if program:
        qs = qs.filter(program__icontains=program)
    if availability_status:
        qs = qs.filter(availability_status__icontains=availability_status)
    if search:
        qs = (
            qs.filter(user__first_name__icontains=search)
            | qs.filter(user__last_name__icontains=search)
            | qs.filter(user__email__icontains=search)
            | qs.filter(country_origin__icontains=search)
            | qs.filter(program__icontains=search)
            | qs.filter(specialties__icontains=search)
        )
    return qs.distinct()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentors_list(request):

    qs = Profile.objects.filter(role="mentor", is_active=True).select_related("user", "university")
    qs = _apply_mentor_filters(qs, request)
    student_profile = getattr(request.user, "profile", None)
    profiles = sorted(qs, key=lambda profile: _mentor_score(student_profile, profile), reverse=True)
    mentors = []
    for profile in profiles:
        profile.user._compatibility = _compatibility_label(_mentor_score(student_profile, profile))
        mentors.append(profile.user)
    serializer = MentorSerializer(mentors, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_mentors(request):
    student_profile = getattr(request.user, "profile", None)
    qs = Profile.objects.filter(role="mentor", is_active=True).exclude(user=request.user).select_related("user", "university")
    ranked = sorted(qs, key=lambda profile: _mentor_score(student_profile, profile), reverse=True)
    mentors = []
    for profile in ranked[:6]:
        profile.user._compatibility = _compatibility_label(_mentor_score(student_profile, profile))
        mentors.append(profile.user)
    return Response(MentorSerializer(mentors, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_detail(request, mentor_id):

    try:
        mentor = User.objects.get(pk=mentor_id, profile__role="mentor")
    except User.DoesNotExist:
        return Response({"detail": "Mentor introuvable."}, status=status.HTTP_404_NOT_FOUND)

    data = MentorSerializer(mentor, context={'request': request}).data
    availabilities = MentorAvailability.objects.filter(mentor=mentor)
    data["availabilities"] = MentorAvailabilitySerializer(availabilities, many=True).data
    
    return Response(data)


@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def mentor_availability(request, mentor_id=None):

    user = request.user
    
    if request.method in ["POST", "PUT", "DELETE"]:
        if not hasattr(user, 'profile') or user.profile.role != "mentor":
            return Response({"detail": "Action réservée aux mentors."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        target_user = user
        if mentor_id:
            try:
                target_user = User.objects.get(pk=mentor_id)
            except User.DoesNotExist:
                return Response({"detail": "Utilisateur introuvable."}, status=status.HTTP_404_NOT_FOUND)
        
        availabilities = MentorAvailability.objects.filter(mentor=target_user, is_available=True)
        serializer = MentorAvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = MentorAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(mentor=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PUT":
        avail_id = request.data.get("id")
        try:
            availability = MentorAvailability.objects.get(pk=avail_id, mentor=user)
            serializer = MentorAvailabilitySerializer(availability, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MentorAvailability.DoesNotExist:
            return Response({"detail": "Disponibilité introuvable."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == "DELETE":
        avail_id = request.data.get("id")
        try:
            availability = MentorAvailability.objects.get(pk=avail_id, mentor=user)
            availability.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MentorAvailability.DoesNotExist:
            return Response({"detail": "Disponibilité introuvable."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def mentor_request(request):

    user = request.user

    if request.method == "POST":
        mentor_id = request.data.get("mentor_id")
        message = request.data.get("message", "")

        if not mentor_id:
            return Response({"detail": "mentor_id est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mentor = User.objects.get(pk=mentor_id, profile__role="mentor")
        except User.DoesNotExist:
            return Response({"detail": "Mentor introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if mentor == user:
            return Response({"detail": "Vous ne pouvez pas vous demander vous-même."}, status=status.HTTP_400_BAD_REQUEST)

        if MentorRequest.objects.filter(mentee=user, mentor=mentor).exists():
            return Response({"detail": "Une demande existe déjà."}, status=status.HTTP_400_BAD_REQUEST)

        req = MentorRequest.objects.create(mentee=user, mentor=mentor, message=message)
        return Response(MentorRequestSerializer(req, context={'request': request}).data, status=status.HTTP_201_CREATED)

    else:  # GET
        if hasattr(user, 'profile') and user.profile.role == "mentor":
            requests = MentorRequest.objects.filter(mentor=user)
        else:
            requests = MentorRequest.objects.filter(mentee=user)

        serializer = MentorRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mentor_request_respond(request, request_id):

    action = request.data.get("action")
    if action not in ["accept", "reject"]:
        return Response({"detail": "Action invalide (doit être 'accept' ou 'reject')."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        mentor_req = MentorRequest.objects.get(pk=request_id, mentor=request.user)
    except MentorRequest.DoesNotExist:
        return Response({"detail": "Demande introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if mentor_req.status != "pending":
        return Response({"detail": "Demande déjà traitée."}, status=status.HTTP_400_BAD_REQUEST)

    mentor_req.status = "accepted" if action == "accept" else "rejected"
    mentor_req.responded_at = timezone.now()
    mentor_req.save()

    return Response(MentorRequestSerializer(mentor_req, context={'request': request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentee_profile_detail(request, mentee_id):

    if not hasattr(request.user, 'profile') or request.user.profile.role != "mentor":
        return Response({"detail": "Acc?s restreint aux mentors."}, status=status.HTTP_403_FORBIDDEN)

    try:
        profile = Profile.objects.get(user_id=mentee_id, role__in=["student", "newcomer"])
    except Profile.DoesNotExist:
        return Response({"detail": "Profil mentoré introuvable."}, status=status.HTTP_404_NOT_FOUND)

    serializer = MenteeProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def available_mentors(request):
    mentors = User.objects.filter(profile__role="mentor", mentor_availabilities__is_available=True).distinct()
    return Response(MentorSerializer(mentors, many=True, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    mentor_id = request.data.get("mentor")
    date = request.data.get("date")
    start_time = request.data.get("start_time")

    if not mentor_id or not date or not start_time:
        return Response({"detail": "mentor, date et start_time sont requis."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        mentor = User.objects.get(pk=mentor_id, profile__role="mentor")
    except User.DoesNotExist:
        return Response({"detail": "Mentor introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if MentorAppointment.objects.filter(mentor=mentor, date=date, start_time=start_time, status__in=["pending", "accepted"]).exists():
        return Response({"detail": "Ce créneau est déjà réservé."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = MentorAppointmentSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(student=request.user, mentor=mentor)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_appointments(request):
    qs = MentorAppointment.objects.filter(student=request.user).select_related("mentor", "mentor__profile", "mentor__profile__university")
    return Response(MentorAppointmentSerializer(qs, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def received_appointments(request):
    if not hasattr(request.user, "profile") or request.user.profile.role != "mentor":
        return Response({"detail": "Accès réservé aux mentors."}, status=status.HTTP_403_FORBIDDEN)
    qs = MentorAppointment.objects.filter(mentor=request.user).select_related("student", "student__profile")
    return Response(MentorAppointmentSerializer(qs, many=True, context={"request": request}).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, appointment_id):
    try:
        appointment = MentorAppointment.objects.get(pk=appointment_id, student=request.user)
    except MentorAppointment.DoesNotExist:
        return Response({"detail": "Rendez-vous introuvable."}, status=status.HTTP_404_NOT_FOUND)
    appointment.status = "cancelled"
    appointment.save(update_fields=["status", "updated_at"])
    return Response(MentorAppointmentSerializer(appointment, context={"request": request}).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def accept_appointment(request, appointment_id):
    try:
        appointment = MentorAppointment.objects.get(pk=appointment_id, mentor=request.user)
    except MentorAppointment.DoesNotExist:
        return Response({"detail": "Rendez-vous introuvable."}, status=status.HTTP_404_NOT_FOUND)
    appointment.status = "accepted"
    appointment.save(update_fields=["status", "updated_at"])
    return Response(MentorAppointmentSerializer(appointment, context={"request": request}).data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def refuse_appointment(request, appointment_id):
    try:
        appointment = MentorAppointment.objects.get(pk=appointment_id, mentor=request.user)
    except MentorAppointment.DoesNotExist:
        return Response({"detail": "Rendez-vous introuvable."}, status=status.HTTP_404_NOT_FOUND)
    appointment.status = "refused"
    appointment.save(update_fields=["status", "updated_at"])
    return Response(MentorAppointmentSerializer(appointment, context={"request": request}).data)

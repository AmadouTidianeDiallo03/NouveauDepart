from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.mentor_serializers import MentorSerializer, MentorAvailabilitySerializer, MentorRequestSerializer
from accounts.models import Profile, MentorAvailability, MentorRequest


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentors_list(request):
    """
    GET /api/mentors/
    Query params: university_id, city, language
    """
    qs = Profile.objects.filter(role="mentor").select_related("user", "university")

    university_id = request.query_params.get("university_id")
    city = request.query_params.get("city")
    language = request.query_params.get("language")

    if university_id:
        qs = qs.filter(university_id=university_id)
    if city:
        qs = qs.filter(city__icontains=city)
    if language:
        qs = qs.filter(language=language)

    mentors = [p.user for p in qs]
    serializer = MentorSerializer(mentors, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_detail(request, mentor_id):
    """
    GET /api/mentors/:id/
    Get detailed profile of a mentor (read-only for mentees)
    """
    try:
        mentor = User.objects.get(pk=mentor_id, profile__role="mentor")
    except User.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

    data = MentorSerializer(mentor).data
    
    # Add availability if requested
    availabilities = MentorAvailability.objects.filter(mentor=mentor)
    data["availabilities"] = MentorAvailabilitySerializer(availabilities, many=True).data
    
    return Response(data)


@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def mentor_availability(request, mentor_id=None):
    """
    GET    /api/mentors/:mentor_id/availability/  – list mentor's availability
    POST   /api/mentors/availability/              – add availability (mentor only)
    PUT    /api/mentors/availability/:id/          – update availability (mentor only)
    DELETE /api/mentors/availability/:id/          – delete availability (mentor only)
    """
    # Check if requester is a mentor
    if request.method in ["POST", "PUT", "DELETE"]:
        try:
            if request.user.profile.role != "mentor":
                return Response({"detail": "Only mentors can manage availability."}, status=status.HTTP_403_FORBIDDEN)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        if mentor_id:
            try:
                mentor = User.objects.get(pk=mentor_id)
                availabilities = MentorAvailability.objects.filter(mentor=mentor)
                serializer = MentorAvailabilitySerializer(availabilities, many=True)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            availabilities = MentorAvailability.objects.filter(mentor=request.user)
            serializer = MentorAvailabilitySerializer(availabilities, many=True)
            return Response(serializer.data)

    elif request.method == "POST":
        serializer = MentorAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(mentor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PUT":
        avail_id = request.data.get("id")
        try:
            availability = MentorAvailability.objects.get(pk=avail_id, mentor=request.user)
            serializer = MentorAvailabilitySerializer(availability, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MentorAvailability.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == "DELETE":
        avail_id = request.data.get("id")
        try:
            availability = MentorAvailability.objects.get(pk=avail_id, mentor=request.user)
            availability.delete()
            return Response({"detail": "Deleted."}, status=status.HTTP_204_NO_CONTENT)
        except MentorAvailability.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def mentor_request(request):
    """
    POST /api/mentor-requests/              – send a mentor request
    GET  /api/mentor-requests/              – list requests (received if mentor, sent if mentee)
    """
    if request.method == "POST":
        mentor_id = request.data.get("mentor_id")
        message = request.data.get("message", "")

        if not mentor_id:
            return Response({"detail": "mentor_id required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mentor = User.objects.get(pk=mentor_id, profile__role="mentor")
        except User.DoesNotExist:
            return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

        if mentor == request.user:
            return Response({"detail": "You cannot request yourself."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            req = MentorRequest.objects.get(mentee=request.user, mentor=mentor)
            return Response(
                {"detail": f"Request already exists with status: {req.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except MentorRequest.DoesNotExist:
            pass

        req = MentorRequest.objects.create(
            mentee=request.user,
            mentor=mentor,
            message=message
        )
        return Response(MentorRequestSerializer(req).data, status=status.HTTP_201_CREATED)

    else:  # GET
        try:
            is_mentor = request.user.profile.role == "mentor"
        except Profile.DoesNotExist:
            is_mentor = False

        if is_mentor:
            requests = MentorRequest.objects.filter(mentor=request.user)
        else:
            requests = MentorRequest.objects.filter(mentee=request.user)

        serializer = MentorRequestSerializer(requests, many=True)
        return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mentor_request_respond(request, request_id):
    """
    POST /api/mentor-requests/:id/respond/  – accept or reject a request
    Body: { "action": "accept" or "reject" }
    """
    action = request.data.get("action")
    if action not in ["accept", "reject"]:
        return Response({"detail": "action must be 'accept' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        mentor_req = MentorRequest.objects.get(pk=request_id)
    except MentorRequest.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if mentor_req.mentor != request.user:
        return Response({"detail": "Only the mentor can respond."}, status=status.HTTP_403_FORBIDDEN)

    if mentor_req.status != "pending":
        return Response({"detail": "Request already responded."}, status=status.HTTP_400_BAD_REQUEST)

    mentor_req.status = "accepted" if action == "accept" else "rejected"
    mentor_req.responded_at = timezone.now()
    mentor_req.save()

    return Response(MentorRequestSerializer(mentor_req).data)

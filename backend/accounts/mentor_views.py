from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.mentor_serializers import MentorSerializer
from accounts.models import Profile


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

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import IntegrationEvent, StudentBudget
from .serializers import IntegrationEventSerializer, StudentBudgetSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def events_list(request):
    if request.method == "POST" and not request.user.is_staff:
        return Response({"detail": "Action réservée aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "POST":
        serializer = IntegrationEventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    qs = IntegrationEvent.objects.select_related("university").filter(start_date__gte=timezone.now())
    category = request.query_params.get("category")
    university = request.query_params.get("university")
    campus = request.query_params.get("campus")
    if category:
        qs = qs.filter(category=category)
    if university:
        qs = qs.filter(university_id=university)
    if campus:
        qs = qs.filter(campus__icontains=campus)
    return Response(IntegrationEventSerializer(qs[:100], many=True).data)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def event_detail(request, event_id):
    try:
        event = IntegrationEvent.objects.select_related("university").get(pk=event_id)
    except IntegrationEvent.DoesNotExist:
        return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(IntegrationEventSerializer(event).data)

    if not request.user.is_staff:
        return Response({"detail": "Action réservée aux administrateurs."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "PUT":
        serializer = IntegrationEventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    event.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET", "POST", "PUT"])
@permission_classes([IsAuthenticated])
def budget(request):
    instance = StudentBudget.objects.filter(user=request.user).first()

    if request.method == "GET":
        if not instance:
            return Response({"detail": "Aucun budget enregistré.", "budget": None})
        return Response(StudentBudgetSerializer(instance).data)

    serializer = StudentBudgetSerializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

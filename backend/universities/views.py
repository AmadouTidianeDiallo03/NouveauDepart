from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import University
from .serializers import UniversitySerializer


class UniversityListView(generics.ListAPIView):
    """GET /api/universities/ – list all universities."""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]


class UniversityDetailView(generics.RetrieveAPIView):
    """GET /api/universities/:id/ – retrieve a university."""
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]

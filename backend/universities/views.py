from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import University
from .serializers import UniversitySerializer


class UniversityListView(generics.ListAPIView):

    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]


class UniversityDetailView(generics.RetrieveAPIView):

    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [IsAuthenticated]

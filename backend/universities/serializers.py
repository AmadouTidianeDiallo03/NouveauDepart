from rest_framework import serializers
from .models import University, PointOfInterest


class PointOfInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointOfInterest
        fields = ["id", "name", "category", "address", "latitude", "longitude", "description"]


class UniversitySerializer(serializers.ModelSerializer):
    pois = PointOfInterestSerializer(many=True, read_only=True)

    class Meta:
        model = University
        fields = ["id", "name", "city", "website_url", "latitude", "longitude", "resources_json", "pois"]

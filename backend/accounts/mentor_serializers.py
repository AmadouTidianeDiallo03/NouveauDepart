from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Profile
from universities.models import University


class MentorSerializer(serializers.ModelSerializer):
    university = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "university", "city", "language", "bio"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

    def get_university(self, obj):
        try:
            u = obj.profile.university
            return {"id": u.id, "name": u.name, "city": u.city} if u else None
        except Exception:
            return None

    def get_city(self, obj):
        try:
            return obj.profile.city
        except Exception:
            return ""

    def get_language(self, obj):
        try:
            return obj.profile.language
        except Exception:
            return "fr"

    def get_bio(self, obj):
        try:
            return obj.profile.bio
        except Exception:
            return ""

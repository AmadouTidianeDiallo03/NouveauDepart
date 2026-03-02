from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Profile, MentorAvailability, MentorRequest
from universities.models import University


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["role", "university", "city", "language", "bio", "avatar"]


class MentorSerializer(serializers.ModelSerializer):
    university = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "full_name", "email", "university", "city", "language", "bio", "avatar_url"]

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

    def get_avatar_url(self, obj):
        try:
            if obj.profile.avatar:
                return obj.profile.avatar.url
        except Exception:
            pass
        return None


class MentorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorAvailability
        fields = ["id", "day_of_week", "start_time", "end_time"]


class MentorRequestSerializer(serializers.ModelSerializer):
    mentor_info = serializers.SerializerMethodField()
    mentee_info = serializers.SerializerMethodField()

    class Meta:
        model = MentorRequest
        fields = ["id", "mentee", "mentor", "mentor_info", "mentee_info", "message", "status", "created_at"]

    def get_mentor_info(self, obj):
        return MentorSerializer(obj.mentor).data

    def get_mentee_info(self, obj):
        return MentorSerializer(obj.mentee).data

from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import MentorAvailability, MentorRequest, MentorAppointment
from accounts.serializers import UserSerializer, ProfileSerializer


class MentorSerializer(UserSerializer):
    university = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    specialties = serializers.SerializerMethodField()
    campus = serializers.SerializerMethodField()
    country_origin = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    program = serializers.SerializerMethodField()
    study_level = serializers.SerializerMethodField()
    help_topics = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()
    compatibility = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = [
            "id", "email", "first_name", "last_name", "full_name", "profile",
            "university", "city", "language", "bio", "avatar_url",
            "is_verified", "specialties", "campus", "country_origin", "languages",
            "program", "study_level", "help_topics", "availability_status", "compatibility",
        ]

    def _profile(self, obj):
        return getattr(obj, "profile", None)

    def get_university(self, obj):
        profile = self._profile(obj)
        if not profile or not profile.university:
            return None
        return {
            "id": profile.university.id,
            "name": profile.university.name,
            "city": profile.university.city,
            "latitude": profile.university.latitude,
            "longitude": profile.university.longitude,
        }

    def get_city(self, obj):
        profile = self._profile(obj)
        return profile.city if profile else ""

    def get_language(self, obj):
        profile = self._profile(obj)
        return profile.language if profile else "fr"

    def get_bio(self, obj):
        profile = self._profile(obj)
        return profile.bio if profile else ""

    def get_avatar_url(self, obj):
        profile = self._profile(obj)
        if not profile:
            return None
        return ProfileSerializer(context=self.context).get_avatar_url(profile)

    def get_is_verified(self, obj):
        profile = self._profile(obj)
        return profile.is_verified if profile else False

    def get_specialties(self, obj):
        profile = self._profile(obj)
        return profile.specialties if profile else ""

    def get_campus(self, obj):
        profile = self._profile(obj)
        return profile.campus if profile else ""

    def get_country_origin(self, obj):
        profile = self._profile(obj)
        return profile.country_origin if profile else ""

    def get_languages(self, obj):
        profile = self._profile(obj)
        if not profile:
            return ["Français"]
        if profile.languages:
            return profile.languages
        return ["English"] if profile.language == "en" else ["Français"]

    def get_program(self, obj):
        profile = self._profile(obj)
        return profile.program if profile else ""

    def get_study_level(self, obj):
        profile = self._profile(obj)
        return profile.study_level if profile else ""

    def get_help_topics(self, obj):
        profile = self._profile(obj)
        if not profile:
            return []
        if profile.help_topics:
            return profile.help_topics
        if profile.specialties:
            return [item.strip() for item in profile.specialties.split(",") if item.strip()]
        return ["Vie universitaire", "Démarches"]

    def get_availability_status(self, obj):
        profile = self._profile(obj)
        return profile.availability_status if profile else "Disponibilités à confirmer"

    def get_compatibility(self, obj):
        return getattr(obj, "_compatibility", "Peut aider")


class MenteeProfileSerializer(ProfileSerializer):

    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta(ProfileSerializer.Meta):
        fields = ["id", "full_name", "university_info", "university_name", "city", "language", "bio", "avatar_url", "created_at"]
        read_only_fields = fields


class MentorAvailabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = MentorAvailability
        fields = ["id", "day_of_week", "start_time", "end_time", "is_available"]


class MentorRequestSerializer(serializers.ModelSerializer):

    mentor_info = serializers.SerializerMethodField()
    mentee_info = serializers.SerializerMethodField()

    class Meta:
        model = MentorRequest
        fields = ["id", "mentee", "mentor", "mentor_info", "mentee_info", "message", "status", "created_at"]

    def get_mentor_info(self, obj):
        return MentorSerializer(obj.mentor, context=self.context).data

    def get_mentee_info(self, obj):
        try:
            return MenteeProfileSerializer(obj.mentee.profile, context=self.context).data
        except Exception:
            return None


class MentorAppointmentSerializer(serializers.ModelSerializer):
    mentor_info = MentorSerializer(source="mentor", read_only=True)
    student_info = serializers.SerializerMethodField()
    meeting_type_label = serializers.CharField(source="get_meeting_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = MentorAppointment
        fields = [
            "id", "student", "mentor", "mentor_info", "student_info",
            "date", "start_time", "end_time", "meeting_type", "meeting_type_label",
            "status", "status_label", "message", "created_at", "updated_at",
        ]
        read_only_fields = ["student", "status", "created_at", "updated_at"]

    def get_student_info(self, obj):
        try:
            return MenteeProfileSerializer(obj.student.profile, context=self.context).data
        except Exception:
            return {"full_name": obj.student.get_full_name() or obj.student.email}

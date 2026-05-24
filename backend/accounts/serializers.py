from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from universities.models import University


class UniversityBriefSerializer(serializers.ModelSerializer):

    class Meta:
        model = University
        fields = ["id", "name", "city", "latitude", "longitude"]


class ProfileSerializer(serializers.ModelSerializer):

    university_info = UniversityBriefSerializer(source="university", read_only=True)
    university = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        required=False,
        allow_null=True,
    )
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
            
        request = self.context.get('request')
        try:
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        except Exception:
            return None

    class Meta:
        model = Profile
        fields = [
            "id", "role", "university", "university_info", "city", 
            "language", "bio", "integration_stage", "onboarding_done", "avatar", "avatar_url", 
            "is_verified", "specialties", "country_origin", "campus", "program",
            "study_level", "languages", "help_topics", "availability_status", "is_active"
        ]
        read_only_fields = ["id"]


class UserSerializer(serializers.ModelSerializer):

    profile = ProfileSerializer(required=False)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "password", "profile", "role", "is_staff", "is_superuser"]
        read_only_fields = ["is_staff", "is_superuser"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return "admin"
        try:
            if obj.profile.role == "newcomer":
                return "student"
            return obj.profile.role
        except Exception:
            return "student"

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Cette adresse courriel est déjà utilisée.")
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop("profile", {})
        password = validated_data.pop("password")
        
        validated_data.setdefault("username", validated_data.get("email"))
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        profile, _ = Profile.objects.get_or_create(user=user)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)
        password = validated_data.pop("password", None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
        instance.save()
        
        if profile_data is not None:
            profile, _ = Profile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
            
        return instance


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField()

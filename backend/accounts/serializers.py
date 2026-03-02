from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from universities.models import University


class UniversityBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "city", "latitude", "longitude"]


class ProfileSerializer(serializers.ModelSerializer):
    university = UniversityBriefSerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(),
        source="university",
        write_only=True,
        required=False,
        allow_null=True,
    )
    avatar_url = serializers.SerializerMethodField()

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    class Meta:
        model = Profile
        fields = ["role", "university", "university_id", "city", "language", "bio", "onboarding_done", "avatar", "avatar_url"]
        read_only_fields = ["avatar_url"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(required=False)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "password", "profile"]

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
        # Use email as username
        validated_data.setdefault("username", validated_data.get("email", ""))
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
        for attr, value in validated_data.items():
            if attr == "password":
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        instance.save()
        
        if profile_data:
            profile, _ = Profile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

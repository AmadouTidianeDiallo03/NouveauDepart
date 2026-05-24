import hashlib

from django.contrib.auth.models import User
from rest_framework import serializers

from accounts.models import Profile, StageTask
from assistant.models import AssistantFeedback, KnowledgeChunk, KnowledgeDocument
from guides.models import Step
from studentlife.models import IntegrationEvent
from universities.models import PointOfInterest, University


class AdminStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = ["id", "title", "title_en", "category", "order", "description"]


class AdminStageTaskSerializer(serializers.ModelSerializer):
    stage_title = serializers.CharField(source="stage.title", read_only=True)

    class Meta:
        model = StageTask
        fields = ["id", "stage", "stage_title", "title", "description", "priority", "category", "order"]


class AdminUniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["id", "name", "city", "website_url", "latitude", "longitude", "resources_json"]


class AdminPointSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = PointOfInterest
        fields = ["id", "university", "university_name", "name", "category", "address", "latitude", "longitude", "description"]


class AdminEventSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = IntegrationEvent
        fields = [
            "id", "title", "description", "category", "university", "university_name",
            "campus", "location", "start_date", "end_date", "is_online",
            "meeting_link", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AdminKnowledgeDocumentSerializer(serializers.ModelSerializer):
    content = serializers.CharField(write_only=True, required=False, allow_blank=True)
    chunks_count = serializers.IntegerField(source="chunks.count", read_only=True)

    class Meta:
        model = KnowledgeDocument
        fields = [
            "id", "path", "title", "description", "category", "university",
            "campus", "language", "source_url", "updated_at_text",
            "content_hash", "indexed_at", "chunks_count", "content",
        ]
        read_only_fields = ["content_hash", "indexed_at", "chunks_count"]

    def create(self, validated_data):
        content = validated_data.pop("content", "")
        validated_data.setdefault("path", f"admin/{validated_data.get('title', 'document').lower().replace(' ', '-')}.md")
        validated_data["content_hash"] = hashlib.sha256(content.encode("utf-8")).hexdigest()
        document = KnowledgeDocument.objects.create(**validated_data)
        if content:
            KnowledgeChunk.objects.create(document=document, chunk_index=0, title=document.title, content=content, token_count=len(content.split()))
        return document

    def update(self, instance, validated_data):
        content = validated_data.pop("content", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if content is not None:
            instance.content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
            instance.chunks.all().delete()
            if content:
                KnowledgeChunk.objects.create(document=instance, chunk_index=0, title=instance.title, content=content, token_count=len(content.split()))
        instance.save()
        return instance


class AdminFeedbackSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = AssistantFeedback
        fields = ["id", "user_email", "question", "answer", "rating", "comment", "sources", "created_at"]


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_staff", "is_superuser", "role", "date_joined"]


class AdminMentorSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    university_name = serializers.CharField(source="university.name", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id", "user", "user_email", "full_name", "role", "university", "university_name",
            "campus", "city", "country_origin", "languages", "program", "study_level",
            "help_topics", "bio", "specialties", "availability_status", "is_active",
            "is_verified", "created_at",
        ]
        read_only_fields = ["role", "created_at"]

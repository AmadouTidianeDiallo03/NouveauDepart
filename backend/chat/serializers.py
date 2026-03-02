from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message, SharedResource


class UserBriefSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    university = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role", "university"]

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            return "newcomer"

    def get_university(self, obj):
        try:
            return obj.profile.university.name if obj.profile.university else None
        except Exception:
            return None


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "content", "created_at"]


class SharedResourceSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer(read_only=True)

    class Meta:
        model = SharedResource
        fields = ["id", "sender", "title", "description", "url", "resource_type", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_user", "last_message", "created_at"]

    def get_other_user(self, obj):
        request = self.context.get("request")
        other = obj.user2 if obj.user1 == request.user else obj.user1
        return UserBriefSerializer(other).data

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {"content": msg.content, "created_at": msg.created_at}
        return None

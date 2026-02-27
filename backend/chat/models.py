from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations_as_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations_as_user2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["user1", "user2"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Conversation: {self.user1.email} ↔ {self.user2.email}"

    @classmethod
    def get_or_create_between(cls, user_a, user_b):
        """Return (conversation, created) for a pair, regardless of order."""
        # Normalize order so user1.id < user2.id
        u1, u2 = (user_a, user_b) if user_a.id < user_b.id else (user_b, user_a)
        return cls.objects.get_or_create(user1=u1, user2=u2)


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email}: {self.content[:50]}"

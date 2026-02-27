from django.db import models
from django.contrib.auth.models import User


class AssistantLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assistant_logs")
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email}: {self.question[:60]}"

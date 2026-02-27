from django.db import models
from django.contrib.auth.models import User
from universities.models import University


class Profile(models.Model):
    ROLE_CHOICES = [
        ("newcomer", "Nouveau venu"),
        ("mentor", "Mentor"),
    ]
    LANG_CHOICES = [
        ("fr", "Français"),
        ("en", "English"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="newcomer")
    university = models.ForeignKey(
        University, on_delete=models.SET_NULL, null=True, blank=True, related_name="students"
    )
    city = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=5, choices=LANG_CHOICES, default="fr")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    onboarding_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

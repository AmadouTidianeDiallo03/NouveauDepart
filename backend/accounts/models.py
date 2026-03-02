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


class MentorAvailability(models.Model):
    DAYS = [
        ("monday", "Lundi"),
        ("tuesday", "Mardi"),
        ("wednesday", "Mercredi"),
        ("thursday", "Jeudi"),
        ("friday", "Vendredi"),
        ("saturday", "Samedi"),
        ("sunday", "Dimanche"),
    ]

    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_availabilities")
    day_of_week = models.CharField(max_length=10, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = [["mentor", "day_of_week", "start_time", "end_time"]]

    def __str__(self):
        return f"{self.mentor.username} - {self.day_of_week} {self.start_time}-{self.end_time}"


class MentorRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("accepted", "Acceptée"),
        ("rejected", "Refusée"),
    ]

    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_requests_sent")
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_requests_received")
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [["mentee", "mentor"]]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.mentee.username} → {self.mentor.username} ({self.status})"

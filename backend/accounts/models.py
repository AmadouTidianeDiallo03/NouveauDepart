from django.db import models
from django.contrib.auth.models import User
from universities.models import University


class Profile(models.Model):
    ROLE_CHOICES = [
        ("student", "Étudiant"),
        ("mentor", "Mentor"),
        ("admin", "Administrateur"),
    ]
    LANG_CHOICES = [
        ("fr", "Français"),
        ("en", "English"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    university = models.ForeignKey(
        University, on_delete=models.SET_NULL, null=True, blank=True, related_name="students"
    )
    city = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=5, choices=LANG_CHOICES, default="fr")
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    specialties = models.TextField(blank=True, help_text="Domaines d'expertise (ex: logement, études, emploi)")
    country_origin = models.CharField(max_length=100, blank=True)
    campus = models.CharField(max_length=120, blank=True)
    program = models.CharField(max_length=160, blank=True)
    study_level = models.CharField(max_length=100, blank=True)
    languages = models.JSONField(default=list, blank=True)
    help_topics = models.JSONField(default=list, blank=True)
    availability_status = models.CharField(max_length=80, blank=True, default="Disponible")
    is_active = models.BooleanField(default=True)
    integration_stage = models.CharField(max_length=30, blank=True, default="")
    onboarding_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class IntegrationStage(models.Model):
    key = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class StageTask(models.Model):
    stage = models.ForeignKey(IntegrationStage, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, default="moyenne")
    category = models.CharField(max_length=80, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["stage__order", "order"]

    def __str__(self):
        return f"{self.stage.key} - {self.title}"


class StudentStageProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="stage_progress")
    stage = models.ForeignKey(IntegrationStage, on_delete=models.CASCADE, related_name="student_progress")
    selected = models.BooleanField(default=False)
    completed_tasks = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["user", "stage"]]

    def __str__(self):
        return f"{self.user.username} - {self.stage.key}"


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
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = [["mentor", "day_of_week", "start_time", "end_time"]]

    def __str__(self):
        return f"{self.mentor.username} - {self.day_of_week} {self.start_time}-{self.end_time}"


class MentorAppointment(models.Model):
    MEETING_TYPES = [
        ("chat", "Clavardage"),
        ("video", "Appel vidéo"),
        ("in_person", "Rencontre en personne"),
    ]
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("accepted", "Accepté"),
        ("refused", "Refusé"),
        ("cancelled", "Annulé"),
        ("completed", "Complété"),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mentor_appointments")
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_appointments")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPES, default="chat")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["mentor", "date", "start_time"],
                condition=models.Q(status__in=["pending", "accepted"]),
                name="unique_active_mentor_appointment_slot",
            )
        ]

    def __str__(self):
        return f"{self.student.username} -> {self.mentor.username} ({self.date} {self.start_time})"


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

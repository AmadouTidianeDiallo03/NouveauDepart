from decimal import Decimal

from django.conf import settings
from django.db import models

from universities.models import University


class IntegrationEvent(models.Model):
    CATEGORY_CHOICES = [
        ("accueil", "Accueil"),
        ("universite", "Activité universitaire"),
        ("information", "Séance d'information"),
        ("immigration", "Atelier immigration"),
        ("emploi", "Atelier CV / emploi"),
        ("sport", "Activité sportive"),
        ("rencontre", "Rencontre étudiante"),
        ("communaute", "Événement communautaire"),
        ("integration", "Aide à l'intégration"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="integration")
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    campus = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date"]

    def __str__(self):
        return self.title


class StudentBudget(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_budget")
    housing = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    transport = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    food = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    phone = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    insurance = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    tuition = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    leisure = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    other = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    monthly_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    yearly_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def save(self, *args, **kwargs):
        amounts = [
            self.housing,
            self.transport,
            self.food,
            self.phone,
            self.insurance,
            self.tuition,
            self.leisure,
            self.other,
        ]
        self.monthly_total = sum(amounts, Decimal("0.00"))
        self.yearly_total = self.monthly_total * Decimal("12")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Budget {self.user_id} - {self.monthly_total}$/mois"

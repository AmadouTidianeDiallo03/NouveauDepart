from django.db import models


class University(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    website_url = models.URLField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    resources_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Universities"

    def __str__(self):
        return f"{self.name} – {self.city}"


class PointOfInterest(models.Model):
    CATEGORY_CHOICES = [
        ("admin", "Administration"),
        ("bank", "Banque"),
        ("grocery", "Épicerie"),
        ("transport", "Transport"),
        ("health", "Santé"),
        ("leisure", "Loisirs"),
        ("other", "Autre"),
    ]

    university = models.ForeignKey(
        University, on_delete=models.CASCADE, related_name="pois"
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.category})"

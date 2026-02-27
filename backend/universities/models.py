from django.db import models


class University(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    website_url = models.URLField(blank=True)
    resources_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Universities"

    def __str__(self):
        return f"{self.name} – {self.city}"

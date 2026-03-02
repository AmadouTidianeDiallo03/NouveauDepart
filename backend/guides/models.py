from django.db import models
from universities.models import University


class Step(models.Model):
    CATEGORY_CHOICES = [
        ("admin", "Administration"),
        ("university", "Université"),
        ("transport", "Transport"),
        ("housing", "Logement & Installation"),
        ("work", "Recherche d'Emploi"),
        ("lifestyle", "Vie au Québec"),
    ]

    title = models.CharField(max_length=200)
    title_en = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"[{self.category}] {self.title}"


class Task(models.Model):
    step = models.ForeignKey(Step, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=300)
    title_en = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    description_en = models.TextField(blank=True)
    
    how_to = models.TextField(blank=True, help_text="Comment obtenir/faire (FR)")
    how_to_en = models.TextField(blank=True, help_text="How to obtain/do (EN)")
    
    tips = models.TextField(blank=True, help_text="Conseils et astuces (FR)")
    tips_en = models.TextField(blank=True, help_text="Tips and tricks (EN)")
    
    locations = models.TextField(blank=True, help_text="Lieux et adresses (FR)")
    locations_en = models.TextField(blank=True, help_text="Locations and addresses (EN)")
    
    order = models.PositiveIntegerField(default=0)
    university = models.ForeignKey(
        University, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class UserTask(models.Model):
    from django.contrib.auth.models import User
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="user_tasks")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="user_tasks")
    done = models.BooleanField(default=False)
    done_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "task"]

    def __str__(self):
        status = "✓" if self.done else "○"
        return f"{status} {self.user.username} – {self.task.title}"

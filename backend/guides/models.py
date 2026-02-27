from django.db import models
from universities.models import University


class Step(models.Model):
    CATEGORY_CHOICES = [
        ("admin", "Administration"),
        ("university", "Université"),
        ("transport", "Transport"),
        ("study", "Réussite académique"),
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
    order = models.PositiveIntegerField(default=0)
    # If set, this task only applies to a specific university
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

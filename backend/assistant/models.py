from django.db import models
from django.contrib.auth.models import User


class KnowledgeDocument(models.Model):
    path = models.CharField(max_length=500, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    university = models.CharField(max_length=100, blank=True)
    campus = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=10, default="fr")
    source_url = models.URLField(blank=True)
    updated_at_text = models.CharField(max_length=50, blank=True)
    content_hash = models.CharField(max_length=64)
    indexed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["university", "category", "title"]

    def __str__(self):
        scope = self.university or self.category or "general"
        return f"{scope} - {self.title}"


class KnowledgeChunk(models.Model):
    document = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name="chunks")
    chunk_index = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    section = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    keywords = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    vector = models.JSONField(default=list, blank=True)
    token_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [["document", "chunk_index"]]
        ordering = ["document", "chunk_index"]

    def __str__(self):
        return f"{self.document.title} [{self.chunk_index}]"


class AssistantLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assistant_logs")
    question = models.TextField()
    answer = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    confidence = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email}: {self.question[:60]}"


class AssistantFeedback(models.Model):
    RATING_CHOICES = [
        ("useful", "Réponse utile"),
        ("incomplete", "Réponse incomplète"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="assistant_feedback")
    question = models.TextField()
    answer = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    rating = models.CharField(max_length=20, choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email}: {self.rating}"

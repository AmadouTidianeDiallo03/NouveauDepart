from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("assistant", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="KnowledgeDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("path", models.CharField(max_length=500, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("category", models.CharField(blank=True, max_length=100)),
                ("university", models.CharField(blank=True, max_length=100)),
                ("campus", models.CharField(blank=True, max_length=100)),
                ("language", models.CharField(default="fr", max_length=10)),
                ("source_url", models.URLField(blank=True)),
                ("updated_at_text", models.CharField(blank=True, max_length=50)),
                ("content_hash", models.CharField(max_length=64)),
                ("indexed_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["university", "category", "title"]},
        ),
        migrations.CreateModel(
            name="KnowledgeChunk",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("chunk_index", models.PositiveIntegerField()),
                ("title", models.CharField(max_length=255)),
                ("section", models.CharField(blank=True, max_length=255)),
                ("content", models.TextField()),
                ("keywords", models.TextField(blank=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("vector", models.JSONField(blank=True, default=list)),
                ("token_count", models.PositiveIntegerField(default=0)),
                ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chunks", to="assistant.knowledgedocument")),
            ],
            options={"ordering": ["document", "chunk_index"], "unique_together": {("document", "chunk_index")}},
        ),
        migrations.AddField(
            model_name="assistantlog",
            name="confidence",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name="assistantlog",
            name="sources",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name="AssistantFeedback",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("question", models.TextField()),
                ("answer", models.TextField()),
                ("sources", models.JSONField(blank=True, default=list)),
                ("rating", models.CharField(choices=[("useful", "Réponse utile"), ("incomplete", "Réponse incomplète")], max_length=20)),
                ("comment", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="assistant_feedback", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

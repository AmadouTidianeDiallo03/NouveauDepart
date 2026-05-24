from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def seed_events(apps, schema_editor):
    IntegrationEvent = apps.get_model("studentlife", "IntegrationEvent")
    University = apps.get_model("universities", "University")
    uqar = University.objects.filter(name__icontains="UQAR").first() or University.objects.filter(name__icontains="Rimouski").first()

    events = [
        ("Journée d’accueil des nouveaux étudiants", "accueil", "Campus de Lévis", "Hall principal", "2026-09-05 09:00:00"),
        ("Atelier immigration : CAQ et permis d’études", "immigration", "En ligne", "Visioconférence", "2026-09-12 13:30:00"),
        ("Rencontre mentors et étudiants internationaux", "rencontre", "Campus de Rimouski", "Café étudiant", "2026-09-18 17:00:00"),
        ("Atelier CV pour emploi étudiant", "emploi", "Campus de Lévis", "Local 204", "2026-10-03 10:00:00"),
    ]
    for title, category, campus, location, start in events:
        IntegrationEvent.objects.update_or_create(
            title=title,
            defaults={
                "description": "Activité destinée aux étudiants internationaux pour faciliter l’intégration universitaire et sociale.",
                "category": category,
                "university": uqar,
                "campus": campus,
                "location": location,
                "start_date": timezone.make_aware(timezone.datetime.fromisoformat(start)),
                "is_online": campus == "En ligne",
            },
        )


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("universities", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="IntegrationEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("category", models.CharField(choices=[("accueil", "Accueil"), ("universite", "Activité universitaire"), ("information", "Séance d'information"), ("immigration", "Atelier immigration"), ("emploi", "Atelier CV / emploi"), ("sport", "Activité sportive"), ("rencontre", "Rencontre étudiante"), ("communaute", "Événement communautaire"), ("integration", "Aide à l'intégration")], default="integration", max_length=30)),
                ("campus", models.CharField(blank=True, max_length=120)),
                ("location", models.CharField(blank=True, max_length=200)),
                ("start_date", models.DateTimeField()),
                ("end_date", models.DateTimeField(blank=True, null=True)),
                ("is_online", models.BooleanField(default=False)),
                ("meeting_link", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("university", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="events", to="universities.university")),
            ],
            options={"ordering": ["start_date"]},
        ),
        migrations.CreateModel(
            name="StudentBudget",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("housing", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("transport", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("food", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("phone", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("insurance", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("tuition", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("leisure", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("other", models.DecimalField(decimal_places=2, default=0, max_digits=9)),
                ("monthly_total", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("yearly_total", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="student_budget", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.RunPython(seed_events, migrations.RunPython.noop),
    ]

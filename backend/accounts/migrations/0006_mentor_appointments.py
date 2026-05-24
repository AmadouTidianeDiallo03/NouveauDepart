from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0005_integration_stages"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="mentoravailability",
            name="is_available",
            field=models.BooleanField(default=True),
        ),
        migrations.CreateModel(
            name="MentorAppointment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField()),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("meeting_type", models.CharField(choices=[("chat", "Clavardage"), ("video", "Appel vidéo"), ("in_person", "Rencontre en personne")], default="chat", max_length=20)),
                ("status", models.CharField(choices=[("pending", "En attente"), ("accepted", "Accepté"), ("refused", "Refusé"), ("cancelled", "Annulé"), ("completed", "Complété")], default="pending", max_length=20)),
                ("message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("mentor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="received_appointments", to=settings.AUTH_USER_MODEL)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="mentor_appointments", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["date", "start_time"]},
        ),
        migrations.AddConstraint(
            model_name="mentorappointment",
            constraint=models.UniqueConstraint(condition=models.Q(("status__in", ["pending", "accepted"])), fields=("mentor", "date", "start_time"), name="unique_active_mentor_appointment_slot"),
        ),
    ]

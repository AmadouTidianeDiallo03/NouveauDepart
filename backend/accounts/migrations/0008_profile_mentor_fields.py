from django.db import migrations, models


def seed_mentor_fields(apps, schema_editor):
    Profile = apps.get_model("accounts", "Profile")
    for profile in Profile.objects.filter(role="mentor"):
        changed = False
        if not profile.languages:
            profile.languages = ["Français"]
            changed = True
        if not profile.help_topics:
            profile.help_topics = ["Logement", "Vie universitaire", "Démarches"]
            changed = True
        if not profile.availability_status:
            profile.availability_status = "Disponible"
            changed = True
        if not profile.program and profile.specialties:
            profile.program = profile.specialties.split(",")[0].strip()[:160]
            changed = True
        if changed:
            profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_profile_student_admin_roles"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="availability_status",
            field=models.CharField(blank=True, default="Disponible", max_length=80),
        ),
        migrations.AddField(
            model_name="profile",
            name="campus",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="profile",
            name="country_origin",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="profile",
            name="help_topics",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="profile",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="profile",
            name="languages",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="profile",
            name="program",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="profile",
            name="study_level",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.RunPython(seed_mentor_fields, migrations.RunPython.noop),
    ]

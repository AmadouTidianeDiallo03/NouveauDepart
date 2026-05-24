from django.db import migrations, models


def migrate_newcomers_to_students(apps, schema_editor):
    Profile = apps.get_model("accounts", "Profile")
    Profile.objects.filter(role="newcomer").update(role="student")


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_mentor_appointments"),
    ]

    operations = [
        migrations.RunPython(migrate_newcomers_to_students, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="profile",
            name="role",
            field=models.CharField(
                choices=[
                    ("student", "Étudiant"),
                    ("mentor", "Mentor"),
                    ("admin", "Administrateur"),
                ],
                default="student",
                max_length=20,
            ),
        ),
    ]

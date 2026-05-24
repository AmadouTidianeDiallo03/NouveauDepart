from django.db import migrations, models
import django.db.models.deletion


STAGES = [
    {
        "key": "before_arrival",
        "title": "Avant mon arrivée",
        "description": "Préparer mon départ, mes documents et mon installation.",
        "order": 1,
        "tasks": [
            ("Vérifier ma lettre d’admission", "Confirmer que l’admission est reçue et conserver une copie.", "haute", "Admission"),
            ("Préparer mes documents", "Rassembler passeport, CAQ, permis d’études, assurances et documents universitaires.", "haute", "Documents"),
            ("Préparer mon budget", "Estimer les frais de scolarité, le logement, le transport et les premières dépenses.", "moyenne", "Budget"),
            ("Chercher un logement", "Comparer les options près du campus et prévoir une solution temporaire si nécessaire.", "haute", "Logement"),
            ("Préparer mes bagages", "Prévoir vêtements, documents papier et objets essentiels pour les premières semaines.", "basse", "Départ"),
        ],
    },
    {
        "key": "arrival",
        "title": "À mon arrivée",
        "description": "Faire mes premières démarches au Québec.",
        "order": 2,
        "tasks": [
            ("Acheter une carte SIM", "Obtenir un numéro local pour les démarches et les contacts importants.", "moyenne", "Installation"),
            ("Ouvrir un compte bancaire", "Comparer les banques et préparer les pièces d’identité nécessaires.", "moyenne", "Banque"),
            ("Comprendre le transport", "Repérer les trajets entre le logement, le campus et les services essentiels.", "haute", "Transport"),
            ("Visiter le campus", "Identifier le registrariat, la bibliothèque et les services aux étudiants.", "haute", "Campus"),
            ("Vérifier mon inscription", "Confirmer l’inscription aux cours, l’horaire et les accès numériques.", "haute", "Université"),
        ],
    },
    {
        "key": "after_arrival",
        "title": "Après mon arrivée",
        "description": "Réussir mon intégration et ma vie universitaire.",
        "order": 3,
        "tasks": [
            ("Consulter mon horaire", "Comprendre les cours, locaux, échéances et plateformes utilisées.", "haute", "Études"),
            ("Contacter un mentor", "Échanger avec un étudiant expérimenté pour poser tes questions.", "moyenne", "Mentorat"),
            ("Participer aux activités", "Découvrir la vie étudiante et créer un réseau.", "basse", "Vie étudiante"),
            ("Chercher un emploi étudiant", "Comprendre les règles, préparer un CV et repérer les offres.", "moyenne", "Emploi"),
            ("Utiliser les services aux étudiants", "Demander de l’aide au besoin : études, adaptation, santé ou finances.", "haute", "Soutien"),
        ],
    },
]


def seed_stages(apps, schema_editor):
    IntegrationStage = apps.get_model("accounts", "IntegrationStage")
    StageTask = apps.get_model("accounts", "StageTask")

    for stage_data in STAGES:
        tasks = stage_data["tasks"]
        stage, _ = IntegrationStage.objects.update_or_create(
            key=stage_data["key"],
            defaults={
                "title": stage_data["title"],
                "description": stage_data["description"],
                "order": stage_data["order"],
            },
        )
        for order, (title, description, priority, category) in enumerate(tasks, start=1):
            StageTask.objects.update_or_create(
                stage=stage,
                title=title,
                defaults={
                    "description": description,
                    "priority": priority,
                    "category": category,
                    "order": order,
                },
            )


def unseed_stages(apps, schema_editor):
    IntegrationStage = apps.get_model("accounts", "IntegrationStage")
    IntegrationStage.objects.filter(key__in=[stage["key"] for stage in STAGES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_profile_is_verified_profile_specialties"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="integration_stage",
            field=models.CharField(blank=True, default="", max_length=30),
        ),
        migrations.CreateModel(
            name="IntegrationStage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=30, unique=True)),
                ("title", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
            ],
            options={"ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="StageTask",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("priority", models.CharField(default="moyenne", max_length=20)),
                ("category", models.CharField(blank=True, max_length=80)),
                ("order", models.PositiveIntegerField(default=0)),
                ("stage", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to="accounts.integrationstage")),
            ],
            options={"ordering": ["stage__order", "order"]},
        ),
        migrations.CreateModel(
            name="StudentStageProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("selected", models.BooleanField(default=False)),
                ("completed_tasks", models.JSONField(blank=True, default=list)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("stage", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="student_progress", to="accounts.integrationstage")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="stage_progress", to="auth.user")),
            ],
            options={"unique_together": {("user", "stage")}},
        ),
        migrations.RunPython(seed_stages, unseed_stages),
    ]

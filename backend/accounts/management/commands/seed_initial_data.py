from pathlib import Path
from datetime import time

from django.apps import apps
from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from accounts.models import MentorAvailability, Profile
from universities.models import University


FIXTURE_PATH = Path(__file__).resolve().parents[3] / "fixtures" / "initial_data.json"

TARGET_MODELS = [
    "universities.University",
    "universities.PointOfInterest",
    "guides.Step",
    "guides.Task",
    "accounts.IntegrationStage",
    "accounts.StageTask",
    "studentlife.IntegrationEvent",
    "assistant.KnowledgeDocument",
    "assistant.KnowledgeChunk",
]

MENTORS = [
    {
        "email": "mentor.rimouski@nordik.local",
        "first_name": "Aminata",
        "last_name": "Diallo",
        "city": "Rimouski",
        "campus": "Rimouski",
        "bio": "Mentore pour les démarches d'arrivée, le logement et la vie à Rimouski.",
        "specialties": "logement, démarches, arrivée, campus",
        "country_origin": "Sénégal",
        "languages": ["Français"],
        "help_topics": ["Logement", "Démarches administratives", "Vie universitaire"],
    },
    {
        "email": "mentor.levis@nordik.local",
        "first_name": "Lucas",
        "last_name": "Gagnon",
        "city": "Lévis",
        "campus": "Lévis",
        "bio": "Mentor au campus de Lévis, disponible pour aider sur les cours, le transport et l'intégration.",
        "specialties": "cours, transport, intégration, UQAR Lévis",
        "country_origin": "Canada",
        "languages": ["Français", "English"],
        "help_topics": ["Transport", "Études", "Intégration culturelle"],
    },
    {
        "email": "mentor.admin@nordik.local",
        "first_name": "Fatima",
        "last_name": "Traoré",
        "city": "Rimouski",
        "campus": "Rimouski",
        "bio": "Mentore spécialisée dans les premières démarches : NAS, banque, assurance et organisation du budget.",
        "specialties": "NAS, budget, banque, assurance",
        "country_origin": "Maroc",
        "languages": ["Français"],
        "help_topics": ["Budget", "Démarches administratives", "Emploi étudiant"],
    },
]


class Command(BaseCommand):
    help = "Seed production with local initial content data without duplicating it on redeploy."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Load the fixture even if target tables already contain data.",
        )

    def handle(self, *args, **options):
        if not FIXTURE_PATH.exists():
            raise CommandError(f"Fixture not found: {FIXTURE_PATH}")

        counts = {}
        total_existing = 0
        for label in TARGET_MODELS:
            model = apps.get_model(label)
            count = model.objects.count()
            counts[label] = count
            total_existing += count

        self.stdout.write("Initial data status:")
        for label, count in counts.items():
            self.stdout.write(f"  - {label}: {count}")

        empty_models = [label for label, count in counts.items() if count == 0]
        has_complete_baseline = total_existing > 0 and not empty_models

        if has_complete_baseline and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "Initial data baseline already exists. Skipping fixture load to avoid unnecessary writes."
                )
            )
            self._seed_demo_mentors()
            self.stdout.write("Use `python manage.py seed_initial_data --force` for a manual reload.")
            return

        if empty_models:
            self.stdout.write(
                self.style.WARNING(
                    "Missing baseline data in: " + ", ".join(empty_models)
                )
            )

        self.stdout.write(f"Loading fixture: {FIXTURE_PATH}")
        call_command("loaddata", str(FIXTURE_PATH), verbosity=1)
        self._seed_demo_mentors()
        self.stdout.write(self.style.SUCCESS("Initial data loaded successfully."))

    def _seed_demo_mentors(self):
        university = University.objects.filter(name__icontains="UQAR").first()
        if not university:
            self.stdout.write(self.style.WARNING("No UQAR university found. Skipping demo mentors."))
            return

        created_count = 0
        for data in MENTORS:
            user, created = User.objects.get_or_create(
                email=data["email"],
                defaults={
                    "username": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                },
            )
            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])
                created_count += 1

            Profile.objects.update_or_create(
                user=user,
                defaults={
                    "role": "mentor",
                    "university": university,
                    "city": data["city"],
                    "campus": data["campus"],
                    "language": "fr",
                    "bio": data["bio"],
                    "specialties": data["specialties"],
                    "country_origin": data["country_origin"],
                    "languages": data["languages"],
                    "help_topics": data["help_topics"],
                    "availability_status": "Disponible",
                    "is_active": True,
                    "onboarding_done": True,
                },
            )

            for day in ["monday", "wednesday"]:
                MentorAvailability.objects.get_or_create(
                    mentor=user,
                    day_of_week=day,
                    start_time=time(14, 0),
                    end_time=time(16, 0),
                    defaults={"is_available": True},
                )

        self.stdout.write(self.style.SUCCESS(f"Demo mentors ready ({created_count} created)."))

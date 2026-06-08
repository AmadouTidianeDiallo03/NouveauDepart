from pathlib import Path

from django.apps import apps
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError


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

        if total_existing and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "Initial data already exists. Skipping fixture load to avoid duplicates or overwrites."
                )
            )
            self.stdout.write("Use `python manage.py seed_initial_data --force` for a manual reload.")
            return

        self.stdout.write(f"Loading fixture: {FIXTURE_PATH}")
        call_command("loaddata", str(FIXTURE_PATH), verbosity=1)
        self.stdout.write(self.style.SUCCESS("Initial data loaded successfully."))

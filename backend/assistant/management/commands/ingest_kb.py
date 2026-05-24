from django.core.management.base import BaseCommand

from assistant.rag import ingest_kb


class Command(BaseCommand):
    help = "Indexe les fichiers Markdown du dossier kb pour NordikBot."

    def add_arguments(self, parser):
        parser.add_argument("--path", default=None, help="Chemin du dossier kb à indexer.")
        parser.add_argument("--clear-missing", action="store_true", help="Supprime de l'index les documents absents du disque.")

    def handle(self, *args, **options):
        result = ingest_kb(kb_root=options["path"], clear_missing=options["clear_missing"])
        self.stdout.write(self.style.SUCCESS(
            f"Indexation terminée: {result['documents']} documents, {result['chunks']} chunks ({result['root']})."
        ))

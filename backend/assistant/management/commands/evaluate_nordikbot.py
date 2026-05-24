import json
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from assistant.rag import answer_question, dump_report, evaluation_row


class Command(BaseCommand):
    help = "Évalue NordikBot sur une liste de questions JSON."

    def add_arguments(self, parser):
        parser.add_argument(
            "--input",
            default=str(Path(settings.BASE_DIR) / "assistant" / "evaluation_questions.json"),
            help="Fichier JSON de questions.",
        )
        parser.add_argument(
            "--output",
            default=str(Path(settings.BASE_DIR) / "assistant" / "evaluation_report.json"),
            help="Fichier rapport généré.",
        )

    def handle(self, *args, **options):
        input_path = Path(options["input"])
        output_path = Path(options["output"])
        questions = json.loads(input_path.read_text(encoding="utf-8"))
        rows = []

        for question in questions:
            result = answer_question(
                message=question["message"],
                university=question.get("university", "UQAR"),
                campus=question.get("campus", ""),
                language=question.get("language", "fr"),
            )
            rows.append(evaluation_row(question, result))

        output_path.write_text(dump_report(rows), encoding="utf-8")
        complete = sum(1 for row in rows if row["complete"])
        self.stdout.write(self.style.SUCCESS(
            f"Évaluation terminée: {complete}/{len(rows)} réponses semblent complètes. Rapport: {output_path}"
        ))

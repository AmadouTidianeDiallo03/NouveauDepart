from django.core.management.base import BaseCommand
from guides.models import Step, Task

class Command(BaseCommand):
    help = "Seed the database with newcomer checklist items"

    def handle(self, *args, **kwargs):
        steps_data = [
            {"id": 1, "category": "admin", "title": "Démarches administratives", "title_en": "Administrative Steps", "order": 1},
            {"id": 2, "category": "university", "title": "Vie universitaire", "title_en": "University Life", "order": 2},
            {"id": 3, "category": "transport", "title": "Transport", "title_en": "Transportation", "order": 3},
            {"id": 4, "category": "study", "title": "Réussite académique", "title_en": "Academic Success", "order": 4},
        ]

        for s in steps_data:
            Step.objects.update_or_create(
                id=s["id"],
                defaults={
                    "category": s["category"],
                    "title": s["title"],
                    "title_en": s["title_en"],
                    "order": s["order"]
                }
            )

        tasks_data = [
            {
                "step_id": 1, "order": 1,
                "title": "Obtenir son Numéro d'assurance sociale (NAS)",
                "title_en": "Get your Social Insurance Number (SIN)",
                "description": "Le NAS est indispensable pour travailler. Obtenez-le dans un Centre Service Canada.",
                "description_en": "The SIN is essential for working. Get it from a Service Canada Centre."
            },
            {
                "step_id": 1, "order": 2,
                "title": "Ouvrir un compte bancaire",
                "title_en": "Open a bank account",
                "description": "Essentiel dès les premières semaines (Desjardins, TD, RBC, etc.).",
                "description_en": "Essential in the first few weeks (Desjardins, TD, RBC, etc.)."
            },
            {
                "step_id": 1, "order": 3,
                "title": "S'occuper de l'assurance maladie",
                "title_en": "Get health insurance",
                "description": "Inscrivez-vous à la RAMQ ou vérifiez l'assurance collective de l'université.",
                "description_en": "Register with RAMQ or check university group insurance."
            },
            {
                "step_id": 1, "order": 4,
                "title": "Trouver un logement permanent",
                "title_en": "Find permanent housing",
                "description": "Résidences, Kijiji, Marketplace ou colocation.",
                "description_en": "Residences, Kijiji, Marketplace, or roommates."
            },
            {
                "step_id": 1, "order": 5,
                "title": "Prendre un forfait téléphonique",
                "title_en": "Get a mobile plan",
                "description": "Opérateurs abordables : Public Mobile, Koodo, Fido, Lucky.",
                "description_en": "Affordable operators: Public Mobile, Koodo, Fido, Lucky."
            },
            {
                "step_id": 2, "order": 1,
                "title": "Obtenir son matricule et code permanent",
                "title_en": "Get your student ID and permanent code",
                "description": "Identifiants uniques pour tout votre parcours au Québec.",
                "description_en": "Unique identifiers for your entire academic journey in Quebec."
            },
            {
                "step_id": 2, "order": 2,
                "title": "S'inscrire aux cours",
                "title_en": "Register for courses",
                "description": "Via le portail étudiant plusieurs semaines avant la session.",
                "description_en": "Through the student portal several weeks before the session."
            },
            {
                "step_id": 3, "order": 1,
                "title": "Obtenir sa carte de transport (Opus)",
                "title_en": "Get your transit pass (Opus)",
                "description": "Profitez du tarif étudiant avec une preuve d'inscription.",
                "description_en": "Take advantage of the student rate with proof of enrollment."
            },
        ]

        for t in tasks_data:
            Task.objects.update_or_create(
                title=t["title"],
                defaults={
                    "step_id": t["step_id"],
                    "title_en": t["title_en"],
                    "description": t["description"],
                    "description_en": t["description_en"],
                    "order": t["order"]
                }
            )

        self.stdout.write(self.style.SUCCESS("Successfully seeded guide steps and tasks."))


import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def overhaul_universal_quebec():
    # 1. Ensure basic Steps exist
    steps_data = [
        {"id": "admin", "title": "Démarches administratives", "title_en": "Administrative Steps", "order": 1},
        {"id": "university", "title": "Vie Universitaire", "title_en": "University Life", "order": 2},
        {"id": "transport", "title": "Se déplacer", "title_en": "Getting Around", "order": 3},
        {"id": "housing", "title": "Logement & Installation", "title_en": "Housing & Setup", "order": 4},
        {"id": "work", "title": "Trouver du travail", "title_en": "Job Search", "order": 5},
    ]

    for s in steps_data:
        step, _ = Step.objects.get_or_create(category=s["id"], defaults={"title": s["title"], "order": s["order"]})
        step.title = s["title"]
        step.title_en = s["title_en"]
        step.order = s["order"]
        step.save()

    # 2. Get University objects for specific tasks
    uqar = University.objects.filter(name__icontains="UQAR").first()
    # You could add more universities here if needed

    # 3. Populate Tasks
    tasks_to_create = [
        # GLOBAL QUEBEC TASKS (university=None)
        {
            "step_id": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Le Numéro d'Assurance Sociale est indispensable pour travailler au Québec.",
            "how": "1. Localisez le centre Service Canada le plus proche de votre ville.\n2. Apportez votre passeport et votre permis d'études (original).\n3. L'agent vous donnera votre NAS immédiatement.",
            "tips": "Allez-y tôt le matin. C'est un service gratuit et obligatoire.",
            "loc": "Centres Service Canada partout au Québec (Montréal, Québec, Rimouski, etc.).",
            "uni": None
        },
        {
            "step_id": "admin", "title": "RAMQ : Assurance maladie", "title_en": "Health Insurance (RAMQ)",
            "desc": "Protection santé pour votre séjour au Québec.",
            "how": "Inscrivez-vous en ligne sur le site de la RAMQ. Préparez votre CAQ et votre permis d'études.",
            "tips": "Certains pays ont des ententes de réciprocité (France, Belgique). Vérifiez si vous êtes exempté des frais !",
            "loc": "ramq.gouv.qc.ca",
            "uni": None
        },
        {
            "step_id": "housing", "title": "Hydro-Québec", "title_en": "Electricity",
            "desc": "Gérer votre électricité et votre chauffage.",
            "how": "Dès que vous avez votre bail, appelez Hydro-Québec ou créez un compte en ligne pour transférer le service à votre nom.",
            "tips": "Le chauffage représente la plus grosse partie de la facture en hiver. Gardez vos fenêtres bien fermées !",
            "loc": "Services en ligne Hydro-Québec.",
            "uni": None
        },
        
        # UNIVERSITY SPECIFIC TASKS (Transport examples)
        {
            "step_id": "transport", "title": "Transport à Lévis (ST Lévis)", "title_en": "Transport in Lévis",
            "desc": "Spécifique pour les étudiants de l'UQAR Campus Lévis.",
            "how": "Utilisez votre carte étudiante pour obtenir le tarif réduit. Allez au centre de services STLévis à la Traverse.",
            "tips": "Téléchargez l'application Transit pour les horaires en temps réel.",
            "loc": "Gare fluviale de Lévis.",
            "uni": uqar
        },
        {
            "step_id": "university", "title": "Activer son portail UQAR", "title_en": "UQAR Student Portal",
            "desc": "Accès à vos cours, notes et factures.",
            "how": "Utilisez vos identifiants reçus par courriel pour vous connecter à 'Touka'.",
            "tips": "C'est ici que vous trouverez votre preuve d'inscription pour le NAS et la banque.",
            "loc": "monportail.uqar.ca",
            "uni": uqar
        },
        
        # WORK (Global Quebec)
        {
            "step_id": "work", "title": "CV au format Québécois", "title_en": "Quebec Style CV",
            "desc": "Le format de CV ici est très spécifique.",
            "how": "Pas de photo, pas d'âge, pas de nationalité. Focus sur les compétences (Skills) et l'expérience.",
            "tips": "Utilisez des mots-clés qui correspondent à l'offre d'emploi.",
            "loc": "Services de carrière de votre université.",
            "uni": None
        }
    ]

    for t_data in tasks_to_create:
        step = Step.objects.get(category=t_data["step_id"])
        # Update or create based on title AND university to avoid duplicates/collisions
        task, _ = Task.objects.update_or_create(
            step=step, 
            title=t_data["title"],
            defaults={
                "title_en": t_data["title_en"],
                "description": t_data["desc"],
                "how_to": t_data["how"],
                "tips": t_data["tips"],
                "locations": t_data["loc"],
                "university": t_data["uni"]
            }
        )
    # 4. Force update test user for demonstration
    from django.contrib.auth.models import User
    user = User.objects.filter(username__contains="amadoudiallo").first()
    if user:
        from accounts.models import Profile
        prof, _ = Profile.objects.get_or_create(user=user)
        prof.university = uqar
        prof.save()
        print(f"User {user.username} successfully assigned to {uqar.name}")

if __name__ == "__main__":
    overhaul_universal_quebec()

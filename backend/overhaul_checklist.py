
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task

def overhaul_checklist():
    Step.objects.filter(category="study").update(category="housing", title="Logement & Installation", title_en="Housing & Setup")
    
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

    tasks = [
        {
            "step_id": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Le Numéro d'Assurance Sociale est indispensable pour travailler.",
            "how": "1. Localisez le centre Service Canada le plus proche.\n2. Apportez votre passeport et permis d'études (original).\n3. L'agent vous donnera votre NAS sur papier immédiatement.",
            "tips": "Allez-y dès l'ouverture (8h30) pour éviter 2h d'attente. C'est gratuit !",
            "loc": "Service Canada : 123 Rue de la Gare, Lévis."
        },
        {
            "step_id": "admin", "title": "Ouvrir un compte bancaire", "title_en": "Open a bank account",
            "desc": "Essentiel pour recevoir vos bourses ou votre salaire.",
            "how": "Prenez rendez-vous en ligne chez Desjardins ou RBC. Demandez l'offre 'Nouveaux Arrivants' (souvent 1 an gratuit).",
            "tips": "Demandez une carte de crédit 'sans dépôt' pour commencer à bâtir votre historique de crédit canadien.",
            "loc": "Desjardins (Avenue Guillaume-Couture) ou RBC (Centre-ville)."
        },
        {
            "step_id": "housing", "title": "Ouvrir un compte Hydro-Québec", "title_en": "Setup Hydro-Quebec",
            "desc": "Pour avoir de l'électricité et du chauffage dans votre logement.",
            "how": "Appelez le 1-888-385-7252 ou créez votre compte sur le site web dès la signature du bail.",
            "tips": "Vérifiez si l'hydro est inclus dans votre loyer avant de vous inscrire !",
            "loc": "hydroquebec.com"
        },
        {
            "step_id": "housing", "title": "Trouver des meubles/électros", "title_en": "Furniture and appliances",
            "desc": "S'équiper à petit prix.",
            "how": "Utilisez Facebook Marketplace ou les friperies comme Renaissance ou l'Armée du Salut.",
            "tips": "Évitez de ramasser des meubles en tissu dans la rue à cause des punaises de lit.",
            "loc": "Marketplace, Kijiji, Village des Valeurs."
        },
        {
            "step_id": "work", "title": "Adapter son CV au style québécois", "title_en": "Adapt local CV",
            "desc": "Le format ici est différent de l'Europe ou de l'Afrique.",
            "how": "Supprimez votre photo, âge et état civil (interdit ici). Concentrez-vous sur vos compétences et réalisations.\nMaximum 2 pages.",
            "tips": "Utilisez des verbes d'action. Demandez une relecture au service de carrière de l'université.",
            "loc": "Modèles disponibles sur le site de l'UQAR."
        },
        {
            "step_id": "work", "title": "Chercher sur les portails", "title_en": "Job board search",
            "desc": "Trouver des offres partout.",
            "how": "Créez des alertes sur Indeed, LinkedIn et Guichet-Emploi. Pour les jobs étudiants, le campus a son propre portail.",
            "tips": "Postulez même si vous ne cochez pas 100% des cases.",
            "loc": "Indeed.ca, LinkedIn."
        },
    ]

    for t_data in tasks:
        step = Step.objects.get(category=t_data["step_id"])
        task, _ = Task.objects.get_or_create(step=step, title=t_data["title"])
        task.title_en = t_data["title_en"]
        task.description = t_data["desc"]
        task.how_to = t_data["how"]
        task.tips = t_data["tips"]
        task.locations = t_data["loc"]
        task.save()
        print(f"Propagated WOW info for: {task.title}")

if __name__ == "__main__":
    overhaul_checklist()

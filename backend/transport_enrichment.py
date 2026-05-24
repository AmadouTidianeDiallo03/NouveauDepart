
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def final_transport_enrichment():
    print("Enriching Transport & Local Navigation...")

    steps_data = [
        {"id": "admin", "title": "Démarches administratives", "title_en": "Administrative Steps", "order": 1},
        {"id": "university", "title": "Vie Universitaire", "title_en": "University Life", "order": 2},
        {"id": "transport", "title": "Se déplacer", "title_en": "Getting Around", "order": 3},
        {"id": "housing", "title": "Logement & Installation", "title_en": "Housing & Setup", "order": 4},
        {"id": "lifestyle", "title": "Vie au Québec", "title_en": "Life in Quebec", "order": 5},
        {"id": "work", "title": "Trouver du travail", "title_en": "Job Search", "order": 6},
    ]

    for s in steps_data:
        step, _ = Step.objects.get_or_create(category=s["id"], defaults={"title": s["title"], "order": s["order"]})
        step.title = s["title"]
        step.title_en = s["title_en"]
        step.order = s["order"]
        step.save()

    uqar = University.objects.filter(name__icontains="UQAR").first()

    new_tasks = [
        {
            "cat": "transport", "title": "Naviguer avec GPS (Google Maps / Waze)", "title_en": "GPS & Navigation Apps",
            "desc": "Ne jamais se perdre en ville ou sur la route.",
            "how": "Téléchargez les cartes hors-connexion sur **Google Maps** pour économiser votre forfait. **Waze** est excellent pour éviter le trafic et les travaux fréquents au Québec.",
            "tips": "Attention : Il est strictement interdit de manipuler son téléphone au volant. Utilisez un support fixe.",
            "loc": "App Store / Google Play Store.",
            "uni": None
        },
        {
            "cat": "transport", "title": "Bus & Metro : Guide d'utilisation", "title_en": "Bus & Metro Guide",
            "desc": "Maîtriser le transport en commun urbain.",
            "how": "Dans le bus, demandez une 'correspondance' (transfer) au chauffeur si vous ne payez pas par carte OPUS. Dans le métro, passez votre titre aux portillons.",
            "tips": "Le métro de Montréal est ultra-simple avec ses 4 lignes de couleurs. À Québec/Lévis, surveillez les bus 'Express' (800/801) qui passent très souvent.",
            "loc": "STM (Montréal), RTC (Québec), STLévis (Lévis).",
            "uni": None
        },
        {
            "cat": "transport", "title": "Applis Indispensables : Transit & Chrono", "title_en": "Must-have Transit Apps",
            "desc": "Connaître l'heure exacte de passage du bus.",
            "how": "Installez **Transit** pour voir les bus en temps réel autour de vous. **Chrono** permet de vérifier le solde de votre carte OPUS en la collant derrière votre téléphone (NFC).",
            "tips": "Mettez vos lignes favorites en 'favoris' pour recevoir des alertes en cas de retard ou de détour.",
            "loc": "Partout au Québec.",
            "uni": None
        },
        {
            "cat": "transport", "title": "Vélo en ville (À Vélo / BIXI)", "title_en": "City Biking",
            "desc": "Transport écologique et rapide en été.",
            "how": "Utilisez le service en libre-service **À Vélo** (Québec) ou **BIXI** (Montréal). Téléchargez l'app, déverrouillez et pédalez !",
            "tips": "C'est souvent plus rapide que le bus pour les trajets de moins de 15 minutes en centre-ville.",
            "loc": "Bornes en ville (Mai à Novembre).",
            "uni": None
        }
    ]

    for t_data in new_tasks:
        step = Step.objects.get(category=t_data["cat"])
        Task.objects.update_or_create(
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
    
    print(f"Added {len(new_tasks)} transport specialty tasks.")

if __name__ == "__main__":
    final_transport_enrichment()

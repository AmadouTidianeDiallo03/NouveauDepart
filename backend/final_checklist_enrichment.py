
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def final_enrichment():
    Task.objects.all().delete()
    Step.objects.all().delete()
    print("Cleaned existing data.")

    steps_data = [
        {"id": "admin", "title": "Démarches administratives", "title_en": "Administrative Steps", "order": 1},
        {"id": "university", "title": "Vie Universitaire", "title_en": "University Life", "order": 2},
        {"id": "housing", "title": "Logement & Installation", "title_en": "Housing & Setup", "order": 3},
        {"id": "lifestyle", "title": "Vie au Québec", "title_en": "Life in Quebec", "order": 4},
        {"id": "transport", "title": "Se déplacer", "title_en": "Getting Around", "order": 5},
        {"id": "work", "title": "Trouver du travail", "title_en": "Job Search", "order": 6},
    ]

    for s in steps_data:
        Step.objects.create(category=s["id"], title=s["title"], title_en=s["title_en"], order=s["order"])
    print("Steps created.")

    uqar = University.objects.filter(name__icontains="UQAR").first()

    all_tasks = [
        {
            "cat": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Indispensable pour travailler.",
            "how": "1. Localisez le centre Service Canada.\n2. Apportez votre passeport et permis d'études.\n3. L'agent vous donnera votre numéro immédiatement.",
            "tips": "Allez-y à 8h30. Ne donnez jamais votre NAS à un inconnu.",
            "loc": "Lévis: 123 Rue de la Gare.",
            "uni": None
        },
        {
            "cat": "admin", "title": "RAMQ : Assurance Maladie", "title_en": "RAMQ Health Insurance",
            "desc": "Protection santé publique.",
            "how": "Inscrivez-vous en ligne sur ramq.gouv.qc.ca dès votre arrivée.",
            "tips": "Utilisez le 811 (Info-Santé) pour parler à une infirmière gratuitement.",
            "loc": "ramq.gouv.qc.ca",
            "uni": None
        },

        {
            "cat": "housing", "title": "Sites de recherche de logement", "title_en": "Housing Search Sites",
            "desc": "Trouver son futur chez-soi.",
            "how": "Consultez quotidiennement **Centris** (pour les condos/appartements), **Kangane** et **Facebook Marketplace**.",
            "tips": "Méfiez-vous des offres trop belles (arnaques). Ne payez jamais avant d'avoir visité.",
            "loc": "Centris.ca, Facebook Marketplace, Kijiji.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Droits des locataires (TAL)", "title_en": "Tenant Rights",
            "desc": "Se protéger contre les abus.",
            "how": "Consultez le site du Tribunal administratif du logement (TAL) pour connaître vos droits sur l'augmentation du loyer et les réparations.",
            "tips": "Le propriétaire ne peut pas exiger de dépôt de garantie (caution) au Québec !",
            "loc": "tal.gouv.qc.ca",
            "uni": None
        },
        {
            "cat": "housing", "title": "Forfait Mobile & Internet", "title_en": "Mobile & Internet",
            "desc": "Rester connecté.",
            "how": "Allez chez **Fizz** (code de référence pour 25$ de rabais) ou **Public Mobile** pour le mobile. Pour internet, Fizz ou Virgin sont très populaires.",
            "tips": "Les forfaits 'BYOP' (Apportez votre téléphone) sont les moins chers.",
            "loc": "En ligne (fizz.ca) ou kiosques en centre commercial.",
            "uni": None
        },

        {
            "cat": "lifestyle", "title": "L'Hiver Québécois (-30°C)", "title_en": "Quebec Winter",
            "desc": "Apprivoiser le froid et la neige.",
            "how": "Achetez un manteau certifié pour -20/-30°C et des bottes imperméables. Habillez-vous en 'couches' (oignon).",
            "tips": "Vérifiez toujours le 'facteur vent' (windchill) sur MétéoMédia, c'est ce qui pique le plus.",
            "loc": "MétéoMédia (App), MEC, Simons, Village des Valeurs.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "L'Été Québécois (+30°C)", "title_en": "Quebec Summer",
            "desc": "Festivals et canicule.",
            "how": "Prévoyez des vêtements légers et de la crème solaire. Profitez des parcs nationaux (Sépaq) et des festivals gratuits.",
            "tips": "L'humidité (Humidex) peut rendre le 30°C très lourd. Cherchez l'air climatisé dans les commerces.",
            "loc": "Plaines d'Abraham (Québec), Parcs de la Sépaq.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "Où acheter quoi ? (Shopping)", "title_en": "Where to Shop",
            "desc": "Guide des meilleurs commerces.",
            "how": "- **Épicerie** : Maxi/Walmart (bas prix), IGA/Metro (qualité).\n- **Vêtements** : Simons, Winners, Friperies.\n- **Électros** : Best Buy, Bureau en Gros.",
            "tips": "Le **Costco** est imbattable pour les gros formats (abonnement requis).",
            "loc": "Laurier Québec, Place Ste-Foy, Galeries de la Capitale.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "Apprentissage du 'Québécois'", "title_en": "Learning Quebec French",
            "desc": "Comprendre les expressions locales.",
            "how": "Écoutez la radio locale et ne soyez pas gêné de faire répéter. Les gens sont très accueillants !",
            "tips": "Un 'char' est une voiture, un 'chum' est un ami/copain.",
            "loc": "Youtube : 'Ma prof de français' ou discussions quotidiennes.",
            "uni": None
        },

        {
            "cat": "transport", "title": "Carte OPUS / ST Lévis", "title_en": "Opus Card",
            "desc": "Transport en commun illimité.",
            "how": "Faites votre demande via votre portail étudiant pour avoir le tarif réduit, puis allez à la Gare fluviale.",
            "tips": "L'application **Transit** est indispensable pour ne pas attendre 30 min au froid.",
            "loc": "Gare fluviale de Lévis.",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Achat de voiture / Permis", "title_en": "Cars & License",
            "desc": "Pour les longs trajets.",
            "how": "Votre permis étranger est valide 6 mois. Après, vous devrez le changer à la SAAQ. Pour un achat d'occasion, utilisez Kijiji Autho ou Marketplace.",
            "tips": "Attention aux frais d'assurances jeunes/nouveaux arrivants, ils sont élevés.",
            "loc": "SAAQ : Place de la Cité (Québec).",
            "uni": None
        },

        {
            "cat": "work", "title": "CV Style Québécois", "title_en": "Quebec CV Style",
            "desc": "Maximiser vos chances de job.",
            "how": "Pas de photo. Pas d'âge. Uniquement compétences et réalisations. Max 2 pages.",
            "tips": "Utilisez LinkedIn pour réseauter et demander des 'cafés virtuels' aux recruteurs.",
            "loc": "Modèles sur le site du service de placement de l'université.",
            "uni": None
        },
    ]

    for t_data in all_tasks:
        step = Step.objects.get(category=t_data["cat"])
        Task.objects.create(
            step=step,
            title=t_data["title"],
            title_en=t_data["title_en"],
            description=t_data["desc"],
            how_to=t_data["how"],
            tips=t_data["tips"],
            locations=t_data["loc"],
            university=t_data["uni"]
        )
    
    from django.contrib.auth.models import User
    from accounts.models import Profile
    user = User.objects.filter(username__contains="amadoudiallo").first()
    if user:
        prof, _ = Profile.objects.get_or_create(user=user)
        prof.university = uqar
        prof.save()
        print(f"User {user.username} successfully assigned to {uqar.name}")

    print(f"Successfully enriched checklist with {len(all_tasks)} final comprehensive tasks.")

if __name__ == "__main__":
    final_enrichment()

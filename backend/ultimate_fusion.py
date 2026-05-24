
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def ultimate_fusion():
    print("Starting Ultimate Checklist Fusion...")

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

    master_tasks = [
        {
            "cat": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Indispensable pour travailler et recevoir des bourses.",
            "how": "1. Centre Service Canada.\n2. Passeport et permis d'études originaux.\n3. Délivré sur place.",
            "tips": "Ne donnez jamais votre NAS par téléphone.",
            "loc": "Service Canada (Lévis: 123 Rue de la Gare).",
            "uni": None
        },
        {
            "cat": "admin", "title": "Inscription RAMQ", "title_en": "RAMQ Health Insurance",
            "desc": "Couverture santé publique.",
            "how": "Formulaire en ligne sur ramq.gouv.qc.ca.",
            "tips": "Utilisez le 811 pour toute question de santé non-urgente.",
            "loc": "En ligne.",
            "uni": None
        },
        {
            "cat": "admin", "title": "Changement d'adresse (SQCA)", "title_en": "Update Official Address",
            "desc": "Informer les ministères de votre emménagement.",
            "how": "Via adresse.gouv.qc.ca.",
            "tips": "Faites-le dès la signature du bail.",
            "loc": "En ligne.",
            "uni": None
        },
        {
            "cat": "admin", "title": "Ouvrir un compte bancaire", "title_en": "Open Bank Account",
            "desc": "Nécessaire pour vos transactions.",
            "how": "Rendez-vous en succursale (Desjardins, RBC, BNC).",
            "tips": "Prenez une carte de crédit pour bâtir votre historique.",
            "loc": "Succursale la plus proche.",
            "uni": None
        },

        {
            "cat": "university", "title": "Portail Étudiant (Touka)", "title_en": "Student Portal",
            "desc": "Accès aux cours et notes.",
            "how": "Utilisez vos identifiants universitaires.",
            "tips": "Téléchargez vos preuves d'inscription ici.",
            "loc": "En ligne (portail université).",
            "uni": None
        },
        {
            "cat": "university", "title": "Carte Étudiante", "title_en": "Student ID",
            "desc": "Votre identité sur le campus.",
            "how": "Au registrariat avec une photo.",
            "tips": "Donne droit à de nombreux rabais (bus, ciné).",
            "loc": "Campus.",
            "uni": None
        },
        {
            "cat": "university", "title": "Associations Étudiantes", "title_en": "Student Associations",
            "desc": "Vie sociale et entraide.",
            "how": "Rejoignez l'association de votre programme.",
            "tips": "Excellent moyen de se faire des amis québécois.",
            "loc": "Locaux associatifs sur le campus.",
            "uni": None
        },
        {
            "cat": "university", "title": "Bibliothèque & Labos", "title_en": "Library & Labs",
            "desc": "Espaces d'étude et ressources.",
            "how": "Activez votre carte de bibliothèque.",
            "tips": "Réservez des salles d'étude en groupe à l'avance.",
            "loc": "Bâtiment central.",
            "uni": None
        },

        {
            "cat": "transport", "title": "Carte OPUS / ST Lévis", "title_en": "OPUS Card",
            "desc": "Transport en commun à tarif réduit.",
            "how": "Validation du statut étudiant puis achat à la Traverse.",
            "tips": "Utilisez l'app Transit pour les horaires en temps réel.",
            "loc": "Gare fluviale de Lévis.",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Le Traversier Lévis-Québec", "title_en": "Ferry Lévis-Québec",
            "desc": "Lien rapide entre les deux rives.",
            "how": "Départs fréquents avec carte OPUS.",
            "tips": "Profitez de la vue sur le Château Frontenac.",
            "loc": "Rue de la Rive-Sud, Lévis.",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Orléans Express", "title_en": "Intercity Bus",
            "desc": "Voyager partout au Québec.",
            "how": "Billets en ligne (rimouski, québec, montréal).",
            "tips": "Tarifs étudiants disponibles.",
            "loc": "Terminus locaux.",
            "uni": None
        },
        {
            "cat": "transport", "title": "Permis & SAAQ", "title_en": "Driving & License",
            "desc": "Conduire au Québec.",
            "how": "Permis étranger valide 6 mois, puis échange obligatoire.",
            "tips": "Prenez rendez-vous longtemps à l'avance à la SAAQ.",
            "loc": "SAAQ (Place de la Cité, Québec).",
            "uni": None
        },

        {
            "cat": "housing", "title": "Hydro-Québec", "title_en": "Electricity",
            "desc": "Compteur à votre nom.",
            "how": "Ouverture de compte en ligne.",
            "tips": "Évitez de mettre le chauffage trop haut en hiver.",
            "loc": "Hydroquebec.com.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Assurance Habitation", "title_en": "Tenant Insurance",
            "desc": "Indispensable pour vos biens.",
            "how": "Souscription rapide en ligne (Duuo, SquareOne).",
            "tips": "Protège aussi vos vols d'ordi à l'uni.",
            "loc": "En ligne.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Forfait Mobile (Fizz/Public)", "title_en": "Mobile Plan",
            "desc": "Rester joignable.",
            "how": "Évitez les contrats longs, prenez du prépayé ou sans engagement.",
            "tips": "Fizz offre les meilleurs tarifs et données reportables.",
            "loc": "En ligne ou Galeries de la Capitale.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Meubles & Friperies", "title_en": "Furniture",
            "desc": "S'équiper à bas prix.",
            "how": "Marketplace, Renaissance, Village des Valeurs.",
            "tips": "Gros rabais le 1er juillet.",
            "loc": "Magasins de seconde main.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Internet Résidentiel", "title_en": "Home Internet",
            "desc": "Wi-Fi à la maison.",
            "how": "Comparez Virgin, Fizz et Ebox.",
            "tips": "L'installation peut prendre 1 semaine.",
            "loc": "En ligne.",
            "uni": None
        },

        {
            "cat": "lifestyle", "title": "L'Hiver Québécois", "title_en": "Quebec Winter",
            "desc": "Survivre au froid.",
            "how": "Achetez un manteau -30 et des bottes Sorel.",
            "tips": "La technique de l'oignon (couches).",
            "loc": "Sport Expert, MEC.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "L'Été & Festivals", "title_en": "Summer & Festivals",
            "desc": "Canicule et sorties.",
            "how": "Accès gratuit aux festivals (FEQ à Québec).",
            "tips": "Planifiez des sorties à la Sépaq (parcs nationaux).",
            "loc": "Plaines d'Abraham.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "Épicerie & Alimentation", "title_en": "Grocery Guide",
            "desc": "Économiser sur la bouffe.",
            "how": "Maxi, Walmart (Petit prix) / IGA, Metro (Qualité).",
            "tips": "Utilisez Flashfood pour les invendus.",
            "loc": "Commerces locaux.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "Commerces d'achat (Malls)", "title_en": "Shopping Centers",
            "desc": "Où faire son magasinage.",
            "how": "Laurier Québec, Galeries de la Capitale.",
            "tips": "Le Costco est idéal pour les familles.",
            "loc": "Québec / Lévis.",
            "uni": None
        },
        {
            "cat": "lifestyle", "title": "Expressions Locales", "title_en": "Quebec Slang",
            "desc": "Comprendre les gens d'ici.",
            "how": "Lexique des mots 'char', 'chum', 'blonde', 'puck'.",
            "tips": "Ne soyez pas surpris par le tutoiement fréquent.",
            "loc": "Partout.",
            "uni": None
        },

        {
            "cat": "work", "title": "CV Style Québécois", "title_en": "Quebec CV",
            "desc": "Se faire recruter.",
            "how": "Format 2 pages, compact, sans photo.",
            "tips": "Utilisez des mots-clés du secteur.",
            "loc": "Service de placement.",
            "uni": None
        },
        {
            "cat": "work", "title": "LinkedIn & Réseautage", "title_en": "Networking",
            "desc": "Le marché caché.",
            "how": "Provoquer des rencontres (cafés).",
            "tips": "Le réseau fait 80% des embauches ici.",
            "loc": "LinkedIn / Événements.",
            "uni": None
        },
        {
            "cat": "work", "title": "Sites d'emploi (Indeed/Jobillico)", "title_en": "Job Boards",
            "desc": "Postuler en ligne.",
            "how": "Indeed, Guichet-Emploi, Grenier aux Nouvelles.",
            "tips": "Faites des alertes automatiques.",
            "loc": "En ligne.",
            "uni": None
        },
    ]

    for t_data in master_tasks:
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
    
    from django.contrib.auth.models import User
    from accounts.models import Profile
    user = User.objects.filter(username__contains="amadoudiallo").first()
    if user:
        prof, _ = Profile.objects.get_or_create(user=user)
        prof.university = uqar
        prof.save()
        print(f"User {user.username} successfully assigned to {uqar.name}")

    print(f"Ultimate Fusion Complete: {len(master_tasks)} tasks active.")

if __name__ == "__main__":
    ultimate_fusion()

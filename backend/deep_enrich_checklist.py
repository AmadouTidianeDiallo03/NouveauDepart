
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def deep_enrich_checklist():
    # 0. Clean slate
    Task.objects.all().delete()
    Step.objects.all().delete()
    print("Cleaned existing data.")

    # 1. Ensure Steps exist
    steps_data = [
        {"id": "admin", "title": "Démarches administratives", "title_en": "Administrative Steps", "order": 1},
        {"id": "university", "title": "Vie Universitaire", "title_en": "University Life", "order": 2},
        {"id": "transport", "title": "Se déplacer", "title_en": "Getting Around", "order": 3},
        {"id": "housing", "title": "Logement & Installation", "title_en": "Housing & Setup", "order": 4},
        {"id": "work", "title": "Trouver du travail", "title_en": "Job Search", "order": 5},
    ]

    for s in steps_data:
        Step.objects.create(category=s["id"], title=s["title"], title_en=s["title_en"], order=s["order"])
    print("Steps created.")

    # 2. Get specific universities
    uqar = University.objects.filter(name__icontains="UQAR").first()

    # 3. Massive Task List (Primordial Tasks)
    all_tasks = [
        # --- ADMINISTRATION ---
        {
            "cat": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Indispensable pour travailler et recevoir des revenus.",
            "how": "1. Localisez le centre Service Canada le plus proche de chez vous.\n2. Apportez votre passeport et votre permis d'études (originaux).\n3. L'agent vous donnera votre NAS papier immédiatement.",
            "tips": "Allez-y dès l'ouverture (8h30-9h00). Ne donnez JAMAIS votre NAS par téléphone ou courriel, c'est confidentiel.",
            "loc": "Service Canada (Lévis: 123 Rue de la Gare, Montréal: Guy-Favreau).",
            "uni": None
        },
        {
            "cat": "admin", "title": "RAMQ : Assurance Maladie", "title_en": "Health Insurance (RAMQ)",
            "desc": "La couverture santé publique du Québec.",
            "how": "Inscrivez-vous en ligne sur ramq.gouv.qc.ca. Préparez votre CAQ et permis d'études. Un délai de carence peut s'appliquer.",
            "tips": "Les étudiants français/belges sont exemptés de carence avec le formulaire SE-401-Q-102.",
            "loc": "Site RAMQ : ramq.gouv.qc.ca",
            "uni": None
        },
        {
            "cat": "admin", "title": "Mise à jour d'adresse (Service Québec)", "title_en": "Update Address",
            "desc": "Signaler votre changement d'adresse aux autorités.",
            "how": "Utilisez le 'Service québécois de changement d'adresse' (SQCA) en ligne pour informer 6 ministères en une fois.",
            "tips": "Faites-le dès que vous avez votre bail définitif pour recevoir vos documents officiels.",
            "loc": "adresse.gouv.qc.ca",
            "uni": None
        },

        # --- UNIVERSITY ---
        {
            "cat": "university", "title": "Activer son portail (UQAR Touka/Portail)", "title_en": "Activate Student Portal",
            "desc": "Votre centre de commande académique.",
            "how": "Suivez les instructions reçues par courriel. Vos codes d'accès vous permettent de voir vos notes, horaires et factures.",
            "tips": "Téléchargez vos attestations d'inscription dès maintenant, elles servent pour TOUT (Banque, Bus, etc.).",
            "loc": "monportail.uqar.ca",
            "uni": uqar
        },
        {
            "cat": "university", "title": "Obtenir sa carte étudiante", "title_en": "Get Student Card",
            "desc": "Votre identité sur le campus.",
            "how": "Rendez-vous au Registrariat (UQAR) avec une photo et une pièce d'identité.",
            "tips": "Profitez-en pour activer vos accès à la bibliothèque et aux installations sportives (PEPS/etc).",
            "loc": "Local du Registrariat.",
            "uni": None
        },
        {
            "cat": "university", "title": "Se joindre à son Association Étudiante", "title_en": "Join Student Association",
            "desc": "Parfait pour ne pas rester seul et s'impliquer.",
            "how": "Chaque programme a son asso (AGECALE, etc.). Passez les voir dans leurs locaux ou suivez-les sur Facebook.",
            "tips": "Ils organisent des partys, des sorties et offrent souvent du café gratuit !",
            "loc": "Locaux de l'AGECALE (Lévis).",
            "uni": uqar
        },

        # --- TRANSPORT ---
        {
            "cat": "transport", "title": "Carte OPUS / ST Lévis", "title_en": "Transport Card",
            "desc": "Le sésame pour voyager moins cher.",
            "how": "Rendez-vous à la Gare fluviale (Lévis) avec votre attestation d'études temps plein pour avoir le tarif étudiant.",
            "tips": "Rechargez votre carte aux bornes automatiques ou dans les pharmacies (Jean Coutu/Uniprix).",
            "loc": "Gare fluviale de Lévis.",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Installer Transit / Chrono", "title_en": "Download Transit App",
            "desc": "Ne manquez plus jamais votre bus.",
            "how": "Installez l'application **Transit** sur votre téléphone. Elle fonctionne pour la ST Lévis et le RTC (Québec).",
            "tips": "Elle indique en temps réel où se trouve le bus par rapport à votre arrêt.",
            "loc": "App Store / Google Play.",
            "uni": None
        },
        {
            "cat": "transport", "title": "Orléans Express (Interurbain)", "title_en": "Inter-city Bus",
            "desc": "Pour voyager entre Rimouski, Lévis et Montréal.",
            "how": "Réservez vos billets en ligne. Le terminus de Lévis est situé à la station de service Shell près de l'autoroute.",
            "tips": "Réservez au moins 1 semaine à l'avance pour avoir les meilleurs tarifs.",
            "loc": "orleansexpress.com",
            "uni": None
        },

        # --- HOUSING ---
        {
            "cat": "housing", "title": "Forfait Mobile (Fidji, Lucky...)", "title_en": "Mobile Plan",
            "desc": "Rester connecté sans payer une fortune.",
            "how": "Ne prenez pas de contrat de 2 ans. Allez chez **Fizz** (en ligne), **Public Mobile** ou **Lucky Mobile** (dans les centres commerciaux).",
            "tips": "Un forfait de 20-30 Go suffit largement pour 30-35$/mois.",
            "loc": "Carrefour Saint-Romuald ou Galeries de Lévis.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Assurance Habitation", "title_en": "Home Insurance",
            "desc": "Obligatoire si c'est écrit dans votre bail.",
            "how": "Ne passez pas par une banque, c'est trop cher. Regardez chez **Duuo** ou **Square One** (tout se fait en 5 min en ligne).",
            "tips": "Elle vous couvre aussi si on vous vole votre ordinateur à la bibliothèque de l'université !",
            "loc": "duuo.ca / squareone.ca",
            "uni": None
        },
        {
            "cat": "housing", "title": "Électricité (Hydro-Québec)", "title_en": "Electricity",
            "desc": "Mettre le compteur à votre nom.",
            "how": "Le plus simple est via leur site web. Indiquez la date de début de votre bail.",
            "tips": "En hiver, baissez le chauffage de 2 degrés quand vous sortez, ça fait une énorme différence sur la facture.",
            "loc": "hydroquebec.com",
            "uni": None
        },

        # --- SETUP & ESSENTIALS ---
        {
            "cat": "housing", "title": "S'habiller pour l'hiver (MEC, Simons)", "title_en": "Winter Clothing",
            "desc": "Survivre au froid québécois (-30°C).",
            "how": "Attendez d'être sur place. Allez chez Simons (Québec) ou Sport Expert. Pour du moins cher, allez chez Village des Valeurs.",
            "tips": "Investissez dans une BONNE paire de bottes (Sorel/Kamik) et un manteau chaud. Le multicouches (oignon) est votre meilleur ami.",
            "loc": "Laurier Québec / Place Ste-Foy.",
            "uni": None
        },
        {
            "cat": "housing", "title": "Faire ses courses (Maxi vs IGA)", "title_en": "Grocery Shopping",
            "desc": "Économiser sur la nourriture.",
            "how": "**Maxi** et **Walmart** sont les moins chers. **IGA** et **Metro** sont plus chers mais plus de choix. Téléchargez l'app **Flashfood** pour des rabais de 50%.",
            "tips": "Prenez les cartes de fidélité (PC Optimum chez Maxi, Scene+ chez IGA). Les points montent vite !",
            "loc": "Maxi Lévis (Chemin du Sault).",
            "uni": None
        },

        # --- HEALTH ---
        {
            "cat": "admin", "title": "Connaitre le 811 (Info-Santé)", "title_en": "Healthcare 811",
            "desc": "Appeler une infirmière gratuitement.",
            "how": "Composez simplement le 811 sur votre téléphone pour parler à une infirmière 24h/24 si vous êtes malade ou avez une question.",
            "tips": "C'est beaucoup plus rapide que d'aller aux urgences pour un simple rhume ou une inquiétude.",
            "loc": "Partout via téléphone.",
            "uni": None
        },

        # --- WORK ---
        {
            "cat": "work", "title": "Adapter son CV", "title_en": "Adapt local CV",
            "desc": "Format Québec / Canada.",
            "how": "Pas de photo. Pas d'âge. Uniquement vos compétences et expériences pertinentes. Max 2 pages.",
            "tips": "Demandez une relecture gratuite au service de placement de l'université.",
            "loc": "Site de votre université.",
            "uni": None
        },
        {
            "cat": "work", "title": "LinkedIn & Réseautage", "title_en": "LinkedIn & Networking",
            "desc": "Trouver le 'marché caché' de l'emploi.",
            "how": "Mettez votre profil à jour en indiquant que vous êtes à Lévis/Québec. Connectez-vous avec des anciens de votre université.",
            "tips": "Le café-réseautage est très commun ici. N'hésitez pas à demander 15 min à un pro pour discuter de son métier.",
            "loc": "LinkedIn.com",
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
    
    print(f"Successfully enriched checklist with {len(all_tasks)} primordial tasks.")

if __name__ == "__main__":
    deep_enrich_checklist()

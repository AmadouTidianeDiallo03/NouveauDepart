
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task
from universities.models import University

def restore_full_quebec_checklist():
    Task.objects.all().delete()
    Step.objects.all().delete()
    print("Cleaned existing data.")

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

    uqar = University.objects.filter(name__icontains="UQAR").first()

    all_tasks = [
        {
            "cat": "admin", "title": "Obtenir son NAS", "title_en": "Get your SIN",
            "desc": "Indispensable pour travailler et recevoir des bourses.",
            "how": "1. Localisez le centre Service Canada le plus proche.\n2. Apportez votre passeport et votre permis d'études (originaux).\n3. L'agent vous remettra votre numéro immédiatement sur place.",
            "tips": "Allez-y dès l'ouverture à 8h30 pour éviter l'attente. C'est totalement gratuit !",
            "loc": "Centres Service Canada (Lévis: 123 Rue de la Gare, Montréal: Guy-Favreau).",
            "uni": None
        },
        {
            "cat": "admin", "title": "RAMQ : Assurance Maladie", "title_en": "Health Insurance (RAMQ)",
            "desc": "La couverture santé publique du Québec.",
            "how": "Inscrivez-vous en ligne sur ramq.gouv.qc.ca. Vous devrez joindre une copie de votre CAQ et permis d'études.",
            "tips": "Si vous venez de France ou Belgique, demandez le formulaire SE-401-Q-102 avant de partir pour être couvert sans délai !",
            "loc": "En ligne : ramq.gouv.qc.ca",
            "uni": None
        },
        {
            "cat": "admin", "title": "Ouvrir un compte bancaire", "title_en": "Open a Bank Account",
            "desc": "Nécessaire pour vos transactions quotidiennes.",
            "how": "Prenez rendez-vous chez Desjardins, RBC ou BNC. Demandez le 'Forfait Nouveaux Arrivants'.",
            "tips": "Demandez une carte de crédit pour bâtir votre historique de crédit dès le premier mois.",
            "loc": "Succursales bancaires proches du campus.",
            "uni": None
        },

        {
            "cat": "university", "title": "Activer son portail étudiant", "title_en": "Activate Student Portal",
            "desc": "Accès central à vos cours et services.",
            "how": "Utilisez le lien envoyé par l'université après votre admission (Touka pour l'UQAR).",
            "tips": "C'est ici que vous imprimerez vos attestations d'inscription pour le NAS et la banque.",
            "loc": "Site web de votre université.",
            "uni": None
        },
        {
            "cat": "university", "title": "Obtenir sa carte étudiante", "title_en": "Get Student Card",
            "desc": "Votre identité sur le campus et pour les rabais.",
            "how": "Rendez-vous au comptoir des services aux étudiants. Apportez une pièce d'identité avec photo.",
            "tips": "Elle donne droit à des rabais dans les cinémas, magasins et bus.",
            "loc": "Comptoir des services (UQAR: Registrariat).",
            "uni": None
        },

        {
            "cat": "transport", "title": "Transport à Lévis (ST Lévis)", "title_en": "Transport in Lévis",
            "desc": "Se déplacer sur la Rive-Sud (UQAR Lévis).",
            "how": "Obtenez votre carte OPUS au centre de services STLévis. Présentez votre attestation d'études temps plein.",
            "tips": "Utilisez l'application Transit pour suivre les bus en temps réel.",
            "loc": "Gare fluviale de Lévis (Traverse).",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Le Traversier Lévis-Québec", "title_en": "Lévis-Québec Ferry",
            "desc": "Relier Lévis et le Vieux-Québec en 12 minutes.",
            "how": "Le départ se fait toutes les 30 ou 60 min. Paiement via carte OPUS ou au guichet.",
            "tips": "Le trajet offre la plus belle vue sur le Château Frontenac, surtout au coucher du soleil.",
            "loc": "Gare fluviale de Lévis (5995 Rue Saint-Laurent).",
            "uni": uqar
        },
        {
            "cat": "transport", "title": "Transport au Québec (Général)", "title_en": "Transport in Quebec",
            "desc": "Conseils pour les autres régions.",
            "how": "Toutes les grandes villes (Montréal, Québec, Sherbrooke) utilisent des cartes à puce (Opus ou équivalent).",
            "tips": "L'application Transit fonctionne partout au Québec et est indispensable.",
            "loc": "Kiosques de transport locaux.",
            "uni": None
        },

        {
            "cat": "housing", "title": "Électricité (Hydro-Québec)", "title_en": "Electricity (Hydro)",
            "desc": "Transfert de service à votre nom.",
            "how": "Contactez Hydro-Québec en ligne dès la signature de votre bail pour signaler votre emménagement.",
            "tips": "Le chauffage est souvent électrique au Québec. Isolez bien vos fenêtres en hiver !",
            "loc": "hydroquebec.com",
            "uni": None
        },
        {
            "cat": "housing", "title": "Trouver des meubles à petit prix", "title_en": "Affordable Furniture",
            "desc": "S'équiper sans se ruiner.",
            "how": "Consultez quotidiennement Facebook Marketplace et Kijiji. Visitez les friperies (Renaissance, Village des Valeurs).",
            "tips": "Le 1er juillet est le jour national du déménagement : beaucoup de meubles sont donnés dans les rues !",
            "loc": "Marketplace, Kijiji, Friperies locales.",
            "uni": None
        },

        {
            "cat": "work", "title": "Adapter son CV au style québécois", "title_en": "Quebec Style CV",
            "desc": "Un format différent pour maximiser vos chances.",
            "how": "Supprimez photo, âge et nationalité. Mettez en avant vos compétences et vos accomplissements concrets.",
            "tips": "Faites relire votre CV par le service de carrière de votre université.",
            "loc": "Services à la vie étudiante.",
            "uni": None
        },
        {
            "cat": "work", "title": "Utiliser les portails d'emploi", "title_en": "Using Job Boards",
            "desc": "Où chercher du travail efficacement.",
            "how": "Créez des alertes sur LinkedIn, Indeed et Guichet-Emploi. Pour les jobs étudiants, surveillez le portail interne du campus.",
            "tips": "Le réseautage est clé au Québec : n'hésitez pas à contacter des gens sur LinkedIn.",
            "loc": "LinkedIn.ca, Indeed.ca.",
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
    
    print(f"Successfully restored {len(all_tasks)} tasks across all categories.")

if __name__ == "__main__":
    restore_full_quebec_checklist()

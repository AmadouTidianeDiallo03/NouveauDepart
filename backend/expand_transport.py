
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Step, Task

def expand_transport_guides():
    transport_step = Step.objects.get(category="transport")
    
    transport_tasks = [
        {
            "title": "Obtenir sa carte de transport (Opus ou STLevis)",
            "title_en": "Get your transport card (Opus or STLevis)",
            "desc": "La carte est indispensable pour bénéficier des tarifs réduits étudiants.",
            "how": "1. Obtenez votre attestation d'études temps plein sur votre portail étudiant.\n2. Rendez-vous au comptoir de la STLévis (Traverse ou Terminus) avec l'attestation et une pièce d'identité.\n3. La carte coûte environ 15$ et est valide pour l'année scolaire.",
            "tips": "Faites-le dès votre arrivée ! La file d'attente s'allonge énormément pendant la première semaine de cours.",
            "loc": "Centre de services de la STLévis (Lévis) ou comptoir RTC (Québec)."
        },
        {
            "title": "Applications indispensables pour se déplacer",
            "title_en": "Must-have transport apps",
            "desc": "Ne manquez plus votre bus grâce au suivi en temps réel.",
            "how": "Téléchargez l'application **Transit** ou **Chrono**. Elles calculent vos trajets, vous donnent les horaires en temps réel et les alertes de retard.",
            "tips": "L'application Transit est la plus précise pour la région de Québec/Lévis. Elle indique même si le bus est bondé.",
            "loc": "Google Play Store / Apple App Store."
        },
        {
            "title": "Achat et recharge de titres",
            "title_en": "Buying and topping up tickets",
            "desc": "Comment payer vos trajets sans stress.",
            "how": "Vous pouvez recharger votre carte aux bornes automatiques dans les terminus, dans les pharmacies participantes (Jean Coutu, Uniprix) ou via l'application mobile (selon le réseau).",
            "tips": "L'abonnement mensuel est rentabilisé si vous faites plus de 10 allers-retours par mois. Sinon, achetez des passages par lots de 10.",
            "loc": "Pharmacies locales, Terminus de bus, Bornes automatiques."
        },
        {
            "title": "Le service de Traverse (Lévis-Québec)",
            "title_en": "Ferry service (Lévis-Québec)",
            "desc": "Le moyen le plus rapide (et beau) de traverser le fleuve.",
            "how": "Utilisez votre carte de transport ou achetez un billet au guichet de la traverse. Le départ se fait toutes les 30 ou 60 minutes selon la saison.",
            "tips": "Le trajet offre la meilleure vue sur le Château Frontenac. C'est magique le soir au coucher du soleil !",
            "loc": "Gare fluviale de Lévis : 5995 Rue Saint-Laurent."
        }
    ]

    for t_data in transport_tasks:
        task, created = Task.objects.get_or_create(step=transport_step, title=t_data["title"])
        task.title_en = t_data["title_en"]
        task.description = t_data["desc"]
        task.how_to = t_data["how"]
        task.tips = t_data["tips"]
        task.locations = t_data["loc"]
        task.save()
        status = "Created" if created else "Updated"
        print(f"{status} Transport task: {task.title}")

if __name__ == "__main__":
    expand_transport_guides()

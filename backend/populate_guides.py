
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from guides.models import Task

def populate_sample_guides():
    # NAS Task
    nas_task = Task.objects.filter(title__icontains="NAS").first()
    if nas_task:
        nas_task.how_to = "1. Trouvez le centre Service Canada le plus proche.\n2. Apportez votre passeport et votre permis d'études.\n3. Demandez votre NAS au comptoir."
        nas_task.tips = "Allez-y tôt le matin pour éviter les files d'attente ! C'est gratuit."
        nas_task.locations = "Service Canada : 123 Rue de la Gare, Lévis (ou en ligne)."
        nas_task.save()
        print(f"Updated: {nas_task.title}")

    # Bank Task
    bank_task = Task.objects.filter(title__icontains="bancaire").first()
    if bank_task:
        bank_task.how_to = "Choisissez une banque (Desjardins, RBC, etc.) et prenez rendez-vous.\nIndiquez que vous êtes étudiant étranger pour avoir un compte gratuit."
        bank_task.tips = "Apportez votre preuve d'inscription à l'université."
        bank_task.locations = "Succursale Desjardins à proximité du campus."
        bank_task.save()
        print(f"Updated: {bank_task.title}")

    # Insurance Task
    ins_task = Task.objects.filter(title__icontains="maladie").first()
    if ins_task:
        ins_task.how_to = "Inscrivez-vous en ligne sur le site de la RAMQ avec votre CAQ et permis d'études."
        ins_task.tips = "Attention, il peut y avoir un délai de carence de 3 mois."
        ins_task.locations = "ramq.gouv.qc.ca"
        ins_task.save()
        print(f"Updated: {ins_task.title}")

if __name__ == "__main__":
    populate_sample_guides()

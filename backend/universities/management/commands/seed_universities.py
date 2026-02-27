from django.core.management.base import BaseCommand
from universities.models import University

class Command(BaseCommand):
    help = "Seed the database with Quebec universities"

    def handle(self, *args, **kwargs):
        universities = [
            {"name": "Université du Québec à Rimouski (UQAR)", "city": "Rimouski", "url": "https://www.uqar.ca"},
            {"name": "Université Laval", "city": "Québec", "url": "https://www.ulaval.ca"},
            {"name": "Université de Montréal (UdeM)", "city": "Montréal", "url": "https://www.umontreal.ca"},
            {"name": "Université du Québec à Montréal (UQAM)", "city": "Montréal", "url": "https://www.uqam.ca"},
            {"name": "Université McGill", "city": "Montréal", "url": "https://www.mcgill.ca"},
            {"name": "Université Concordia", "city": "Montréal", "url": "https://www.concordia.ca"},
            {"name": "Université de Sherbrooke", "city": "Sherbrooke", "url": "https://www.usherbrooke.ca"},
            {"name": "Université du Québec à Trois-Rivières (UQTR)", "city": "Trois-Rivières", "url": "https://www.uqtr.ca"},
            {"name": "Université du Québec à Chicoutimi (UQAC)", "city": "Saguenay", "url": "https://www.uqac.ca"},
            {"name": "Université du Québec en Outaouais (UQO)", "city": "Gatineau", "url": "https://www.uqo.ca"},
            {"name": "Université du Québec en Abitibi-Témiscamingue (UQAT)", "city": "Rouyn-Noranda", "url": "https://www.uqat.ca"},
            {"name": "École de technologie supérieure (ÉTS)", "city": "Montréal", "url": "https://www.etsmtl.ca"},
            {"name": "HEC Montréal", "city": "Montréal", "url": "https://www.hec.ca"},
            {"name": "Polytechnique Montréal", "city": "Montréal", "url": "https://www.polymtl.ca"},
            {"name": "Université Bishop's", "city": "Sherbrooke", "url": "https://www.ubishops.ca"},
            {"name": "Institut national de la recherche scientifique (INRS)", "city": "Québec", "url": "https://inrs.ca"},
            {"name": "École nationale d'administration publique (ENAP)", "city": "Québec", "url": "https://www.enap.ca"},
            {"name": "Université TÉLUQ", "city": "À distance", "url": "https://www.teluq.ca"},
        ]

        count = 0
        for uni_data in universities:
            obj, created = University.objects.get_or_create(
                name=uni_data["name"],
                defaults={
                    "city": uni_data["city"],
                    "website_url": uni_data["url"]
                }
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {count} universities."))

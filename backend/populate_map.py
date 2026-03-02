
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from universities.models import University, PointOfInterest

def populate_map_data():
    print("Populating Premium Map Data...")

    # Data structure: [Name Snippet, City, Lat, Lon]
    uni_coords = [
        ["Rimouski", "Lévis", 46.786475, -71.162705],
        ["Laval", "Québec", 46.7816, -71.2721],
        ["Montréal (UdeM)", "Montréal", 45.5017, -73.6139],
        ["McGill", "Montréal", 45.5048, -73.5772],
        ["Concordia", "Montréal", 45.4971, -73.5790],
        ["UQAM", "Montréal", 45.5131, -73.5606],
        ["HEC", "Montréal", 45.5031, -73.6200],
        ["Polytechnique", "Montréal", 45.5041, -73.6128],
        ["Sherbrooke", "Sherbrooke", 45.3797, -71.9261],
        ["Trois-Rivières", "Trois-Rivières", 46.3475, -72.5761],
        ["Chicoutimi", "Saguenay", 48.4208, -71.0531]
    ]

    city_pois = {
        "Québec": [
            {"name": "Service Canada (Gare du Palais)", "cat": "admin", "addr": "450 Rue de la Gare-du-Palais", "lat": 46.8175, "lon": -71.2135, "desc": "Administration fédérale (NAS)."},
            {"name": "RAMQ (Santé)", "cat": "health", "addr": "1125 Grand Allée O", "lat": 46.8015, "lon": -71.2450, "desc": "Assurance maladie du Québec."},
            {"name": "Place Ste-Foy (Shopping/Hiver)", "cat": "grocery", "addr": "2450 Boul. Laurier", "lat": 46.7725, "lon": -71.2825, "desc": "Vêtements d'hiver et commerces."},
            {"name": "Pharmaprix", "cat": "health", "addr": "Chemin Ste-Foy", "lat": 46.7915, "lon": -71.2650, "desc": "Pharmacie et produits de base."},
            {"name": "Gare du Palais", "cat": "transport", "addr": "Québec, QC", "lat": 46.8170, "lon": -71.2130, "desc": "Train et Autocar (Orléans Express)."}
        ],
        "Lévis": [
            {"name": "Service Canada (Admin)", "cat": "admin", "addr": "123 Rue de la Gare, Lévis", "lat": 46.8043, "lon": -71.1855, "desc": "Administration (NAS)."},
            {"name": "Desjardins (Banque)", "cat": "bank", "addr": "100 Ave des Commandeurs", "lat": 46.8016, "lon": -71.1812, "desc": "Ouverture de compte."},
            {"name": "Maxi Lévis (Épicerie)", "cat": "grocery", "addr": "375 Boul. Guillaume-Couture", "lat": 46.7932, "lon": -71.1715, "desc": "Prix imbattables."},
            {"name": "Walmart Supercentre", "cat": "grocery", "addr": "4800 Boul. Guillaume-Couture", "lat": 46.7755, "lon": -71.1355, "desc": "Tout pour l'installation."},
            {"name": "Traversier Lévis-Québec", "cat": "transport", "addr": "Gare fluviale", "lat": 46.8123, "lon": -71.1875, "desc": "Accès rapide au Vieux-Québec."}
        ],
        "Montréal": [
            {"name": "Service Canada Guy-Favreau", "cat": "admin", "addr": "200 Boul. René-Lévesque O", "lat": 45.5075, "lon": -73.5615, "desc": "NAS et services fédéraux."},
            {"name": "RAMQ Montréal", "cat": "health", "addr": "425 Boul. de Maisonneuve O", "lat": 45.5030, "lon": -73.5690, "desc": "Assurance maladie."},
            {"name": "Pharmaprix Place Ville-Marie", "cat": "health", "addr": "Montréal, QC", "lat": 45.5015, "lon": -73.5685, "desc": "Pharmacie centrale."},
            {"name": "Centre Eaton (Commerces/Hiver)", "cat": "grocery", "addr": "705 Rue Ste-Catherine O", "lat": 45.5035, "lon": -73.5725, "desc": "Idéal pour l'équipement d'hiver."},
            {"name": "Gare Centrale (Via Rail/REM)", "cat": "transport", "addr": "895 Rue de la Gauchetière O", "lat": 45.4995, "lon": -73.5665, "desc": "Hub de transport majeur."}
        ]
    }

    # Generic fallback
    generic_pois = [
        {"name": "Service Canada", "cat": "admin", "desc": "Administration fédérale (NAS)."},
        {"name": "Banque majoritaire", "cat": "bank", "desc": "Gestion financière."},
        {"name": "Épicerie locale", "cat": "grocery", "desc": "Course de base."},
        {"name": "Clinique médicale", "cat": "health", "desc": "Soins de santé."}
    ]

    for name_part, city_name, lat, lon in uni_coords:
        uni = University.objects.filter(name__icontains=name_part).first()
        if uni:
            uni.latitude = lat
            uni.longitude = lon
            uni.save()
            print(f"Updated {uni.name}")

            PointOfInterest.objects.filter(university=uni).delete()
            
            pois_data = city_pois.get(city_name, [])
            if not pois_data:
                # Add generic ones offset from uni coords
                for i, g in enumerate(generic_pois):
                    PointOfInterest.objects.create(
                        university=uni,
                        name=f"{g['name']} ({city_name})",
                        category=g['cat'],
                        address=f"Centre-ville, {city_name}",
                        latitude=lat + (0.005 * (i+1)),
                        longitude=lon + (0.005 * (i+1)),
                        description=g['desc']
                    )
            else:
                for p in pois_data:
                    PointOfInterest.objects.create(
                        university=uni,
                        name=p["name"],
                        category=p["cat"],
                        address=p["addr"],
                        latitude=p["lat"],
                        longitude=p["lon"],
                        description=p["desc"]
                    )
            print(f"Added POIs for {uni.name}")

    print("Premium population complete.")

if __name__ == "__main__":
    populate_map_data()

"""
Management command: python manage.py seed
Creates sample data: universities, steps, tasks, mentor accounts.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from universities.models import University
from guides.models import Step, Task
from accounts.models import Profile


UNIVERSITIES = [
    {
        "name": "Université du Québec à Rimouski (UQAR) – Campus Lévis",
        "city": "Lévis",
        "website_url": "https://www.uqar.ca",
        "resources_json": {
            "registrariat": "https://www.uqar.ca/inscription",
            "services_internationaux": "https://www.uqar.ca/international",
            "bibliothèque": "https://www.uqar.ca/bibliotheque",
            "café_étudiant": "Campus Lévis – Pavillon principal",
        },
    },
    {
        "name": "Université Laval",
        "city": "Québec",
        "website_url": "https://www.ulaval.ca",
        "resources_json": {
            "registrariat": "https://www.ulaval.ca/admission",
            "services_internationaux": "https://www.ulaval.ca/international",
            "bibliothèque": "https://www.bibl.ulaval.ca",
        },
    },
    {
        "name": "Université du Québec à Montréal (UQAM)",
        "city": "Montréal",
        "website_url": "https://www.uqam.ca",
        "resources_json": {
            "registrariat": "https://inscription.uqam.ca",
            "services_internationaux": "https://international.uqam.ca",
            "bibliothèque": "https://bibliotheques.uqam.ca",
        },
    },
]

STEPS = [
    {
        "title": "Administration à l'arrivée",
        "title_en": "Administrative Steps on Arrival",
        "category": "admin",
        "order": 1,
        "tasks": [
            ("Obtenir votre numéro d'assurance sociale (NAS)", "Get your Social Insurance Number (SIN)", "Rendez-vous à Service Canada avec votre permis d'études.", "Go to Service Canada with your study permit."),
            ("Ouvrir un compte bancaire", "Open a bank account", "TD, RBC, Desjardins offrent des comptes étudiants sans frais.", "TD, RBC, Desjardins offer free student accounts."),
            ("Souscrire à l'assurance maladie (RAMQ ou privée)", "Get medical insurance (RAMQ or private)", "Les résidents permanents peuvent s'inscrire à la RAMQ. Pour les permis d'études, vérifiez votre couverture.", "Permanent residents can apply to RAMQ. For study permits, check your plan."),
            ("Trouver un logement temporaire ou permanent", "Find temporary or permanent housing", "Utilisez Kijiji, Facebook Marketplace, ou le bureau de logement de votre université.", "Use Kijiji, Facebook Marketplace, or your university housing office."),
            ("Obtenir une pièce d'identité provinciale (optionnel)", "Get a provincial ID (optional)", "Vous pouvez demander une carte RAMQ ou un permis de conduire québécois.", "You can apply for a RAMQ card or Quebec driver's licence."),
            ("S'inscrire à une adresse postale locale", "Register a local mailing address", "Nécessaire pour recevoir vos documents officiels.", "Required to receive official documents."),
            ("Activer votre forfait téléphonique canadien", "Activate a Canadian phone plan", "Fido, Koodo, Public Mobile offrent des forfaits abordables.", "Fido, Koodo, Public Mobile offer affordable plans."),
            ("Envoyer votre nouvelle adresse à votre pays d'origine", "Send your new address to your home country", "Prévenir famille, banque, ambassade.", "Notify family, bank, embassy."),
        ],
    },
    {
        "title": "Université – Premiers pas",
        "title_en": "University – First Steps",
        "category": "university",
        "order": 2,
        "tasks": [
            ("Activer votre compte étudiant (courriel, VPN, portail)", "Activate your student account (email, VPN, portal)", "Connectez-vous sur le portail de votre université pour activer les accès.", "Log in to your university portal to activate access."),
            ("Récupérer votre carte étudiante", "Pick up your student card", "Rendez-vous au bureau des inscriptions avec une pièce d'identité.", "Go to the registrar's office with a photo ID."),
            ("Assister à la journée d'orientation", "Attend orientation day", "Obligatoire pour les nouveaux étudiants – vérifiez la date sur votre portail.", "Mandatory for new students – check the date on your portal."),
            ("Visiter le campus – repérer vos salles de cours", "Visit campus – locate your classrooms", "Téléchargez le plan du campus.", "Download the campus map."),
            ("Rejoindre les groupes étudiants (Discord, Facebook)", "Join student groups (Discord, Facebook)", "Cherchez le groupe de votre programme sur les réseaux sociaux.", "Search for your program's group on social media."),
            ("Rencontrer votre conseiller pédagogique", "Meet your academic advisor", "Planifiez un rendez-vous dès la première semaine.", "Schedule a meeting during the first week."),
            ("Comprendre votre horaire et votre grille de cours", "Understand your schedule and course grid", "Vérifiez les crédits requis et les cours obligatoires.", "Check required credits and mandatory courses."),
            ("Connaître les services d'aide à la réussite", "Learn about academic success services", "Tuteurs, centre d'aide à la rédaction, soutien psychologique.", "Tutors, writing centres, psychological support."),
        ],
    },
    {
        "title": "Transport & Mobilité",
        "title_en": "Transport & Mobility",
        "category": "transport",
        "order": 3,
        "tasks": [
            ("Obtenir la carte de transport en commun étudiant", "Get a student transit card", "Rendez-vous au bureau de la STL, STM, RTC, ou Exo selon votre ville.", "Visit the STL, STM, RTC, or Exo office depending on your city."),
            ("Télécharger les applications de transport (Chrono, m ticketing)", "Download transit apps (Chrono, m ticketing)", "Permet de voir les horaires en temps réel.", "Shows real-time schedules."),
            ("Localiser les arrêts de bus/métro proches de chez vous", "Find bus/metro stops near your home", "Utilisez Google Maps ou l'app de votre réseau de transport.", "Use Google Maps or your transit app."),
            ("Apprendre les lignes clés vers votre campus", "Learn key routes to campus", "Mémorisez 1–2 alternatives en cas de retard.", "Memorize 1–2 alternatives in case of delays."),
            ("Vérifier si votre université offre un service de navette", "Check if your university offers a shuttle service", "Certains campus ont des navettes gratuites vers la ville.", "Some campuses have free shuttles to the city."),
            ("Explorer les options de covoiturage (Netlift, BlaBlaCar)", "Explore carpooling options (Netlift, BlaBlaCar)", "Utile pour les déplacements hors campus.", "Useful for off-campus travel."),
        ],
    },
    {
        "title": "Réussite académique",
        "title_en": "Academic Success",
        "category": "study",
        "order": 4,
        "tasks": [
            ("Comprendre le système de crédits québécois", "Understand the Quebec credit system", "Un cours = 3 crédits en général. Baccalauréat = 90 crédits.", "One course = 3 credits in general. Bachelor's = 90 credits."),
            ("Connaître le mode d'évaluation (pondération)", "Learn the grading system (weighting)", "Travaux, midterms, examen final – vérifiez le plan de cours.", "Assignments, midterms, final exam – check the course plan."),
            ("Lire et comprendre le plan de cours (syllabus)", "Read and understand the course syllabus", "Le plan de cours définit les règles, les dates, et les critères.", "The course plan defines rules, dates, and criteria."),
            ("Créer un calendrier de révision", "Create a study schedule", "Répartissez vos études sur toute la session.", "Spread your study sessions across the semester."),
            ("Identifier les ressources d'aide en ligne (bibliothèque, bases de données)", "Identify online resources (library, databases)", "Accès gratuit à Érudit, ProQuest, REPÈRES via votre université.", "Free access to Érudit, ProQuest, REPÈRES through your university."),
            ("Pratiquer l'écriture académique en français/anglais", "Practice academic writing in French/English", "Utilisez le centre d'aide à la rédaction de votre université.", "Use your university's writing center."),
            ("Rejoindre un groupe d'étude", "Join a study group", "Demandez à vos collègues de cours.", "Ask your classmates."),
            ("Connaître la politique sur l'intégrité académique (plagiat)", "Learn the academic integrity policy (plagiarism)", "Important : citation, paraphrase, Turnitin.", "Important: citation, paraphrasing, Turnitin."),
            ("Utiliser les outils numériques universitaires (Moodle, Teams, Zoom)", "Use university digital tools (Moodle, Teams, Zoom)", "Vérifiez les plateformes utilisées dans chaque cours.", "Check which platforms each course uses."),
            ("Demander de l'aide avant les examens", "Ask for help before exams", "N'attendez pas la dernière minute – contactez votre professeur ou tuteur.", "Don't wait until the last minute – contact your professor or tutor."),
        ],
    },
]

MENTORS = [
    {
        "email": "ayoub.mentor@nordik.local",
        "first_name": "Ayoub",
        "last_name": "Benali",
        "password": "mentor1234",
        "university_index": 0,  # UQAR
        "city": "Lévis",
        "language": "fr",
        "bio": "Étudiant en informatique à l'UQAR – Campus Lévis depuis 2 ans. Je peux vous aider à vous repérer dans la ville et à l'université.",
    },
    {
        "email": "sarah.mentor@nordik.local",
        "first_name": "Sarah",
        "last_name": "Tremblay",
        "password": "mentor1234",
        "university_index": 1,  # ULaval
        "city": "Québec",
        "language": "fr",
        "bio": "Finissante en génie à l'Université Laval. Je parle français et anglais.",
    },
    {
        "email": "james.mentor@nordik.local",
        "first_name": "James",
        "last_name": "Osei",
        "password": "mentor1234",
        "university_index": 2,  # UQAM
        "city": "Montréal",
        "language": "en",
        "bio": "3rd year student at UQAM. Originally from Ghana. Happy to help newcomers navigate Montreal and UQAM.",
    },
    {
        "email": "fatima.mentor@nordik.local",
        "first_name": "Fatima",
        "last_name": "Diallo",
        "password": "mentor1234",
        "university_index": 0,  # UQAR
        "city": "Lévis",
        "language": "fr",
        "bio": "Arrivée au Québec en 2022 depuis le Sénégal. Je connais bien le processus d'immigration et la vie étudiante à l'UQAR.",
    },
    {
        "email": "lucas.mentor@nordik.local",
        "first_name": "Lucas",
        "last_name": "García",
        "password": "mentor1234",
        "university_index": 1,  # ULaval
        "city": "Québec",
        "language": "en",
        "bio": "From Mexico, studying business at Université Laval. Fluent in English, Spanish, and intermediate French.",
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample universities, steps, tasks, and mentors."

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")

        # ── Universities ─────────────────────────────────────────────────
        universities = []
        for data in UNIVERSITIES:
            uni, created = University.objects.update_or_create(
                name=data["name"],
                defaults=data,
            )
            universities.append(uni)
            action = "created" if created else "updated"
            self.stdout.write(f"  ✓ University {action}: {uni.name}")

        # ── Steps & Tasks ────────────────────────────────────────────────
        for step_data in STEPS:
            tasks_data = step_data.pop("tasks")
            step, created = Step.objects.update_or_create(
                category=step_data["category"],
                defaults=step_data,
            )
            action = "created" if created else "updated"
            self.stdout.write(f"  ✓ Step {action}: {step.title}")

            for order, (title_fr, title_en, desc_fr, desc_en) in enumerate(tasks_data, start=1):
                Task.objects.update_or_create(
                    step=step,
                    title=title_fr,
                    defaults={
                        "title_en": title_en,
                        "description": desc_fr,
                        "description_en": desc_en,
                        "order": order,
                    },
                )
            self.stdout.write(f"      {len(tasks_data)} tasks seeded")

        # ── Mentors ──────────────────────────────────────────────────────
        for mentor_data in MENTORS:
            uni_index = mentor_data.pop("university_index")
            uni = universities[uni_index]
            email = mentor_data["email"]
            password = mentor_data.pop("password")
            city = mentor_data.pop("city")
            language = mentor_data.pop("language")
            bio = mentor_data.pop("bio")

            user, created = User.objects.update_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": mentor_data["first_name"],
                    "last_name": mentor_data["last_name"],
                },
            )
            if created:
                user.set_password(password)
                user.save()

            Profile.objects.update_or_create(
                user=user,
                defaults={
                    "role": "mentor",
                    "university": uni,
                    "city": city,
                    "language": language,
                    "bio": bio,
                    "onboarding_done": True,
                },
            )
            action = "created" if created else "updated"
            self.stdout.write(f"  ✓ Mentor {action}: {user.get_full_name()} ({uni.city})")

        self.stdout.write(self.style.SUCCESS("\n✅ Seed complete!"))
        self.stdout.write("   Mentor password for all test accounts: mentor1234")

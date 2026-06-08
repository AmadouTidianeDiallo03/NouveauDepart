import json
import unicodedata
from functools import lru_cache
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"

INTENT_KEYWORDS = {
    "admission": ["admission", "demande d'admission", "candidature", "admis", "admission en ligne"],
    "inscription_cours": ["inscription aux cours", "inscrire aux cours", "choisir mes cours", "horaire", "cours"],
    "frais_scolarite": ["frais", "scolarité", "scolarite", "paiement", "payer", "état de compte", "versement"],
    "calendrier": ["calendrier", "date importante", "dates importantes", "trimestre", "session", "abandon", "examens"],
    "preuve_inscription": ["preuve d'inscription", "attestation d'inscription", "confirmation d'inscription"],
    "releve_notes": ["relevé de notes", "releve de notes", "notes"],
    "dossier_etudiant": ["mon dossier", "portail", "portail étudiant", "dossier étudiant", "dossier etudiant"],
    "registrariat": ["registrariat", "registre", "dossier universitaire"],
    "contacts": ["contact", "contacter", "joindre", "qui contacter", "annuaire", "bottin", "personne", "service"],
    "vie_etudiante": ["vie étudiante", "vie etudiante", "services aux étudiants", "activités", "soutien"],
    "logement": ["logement", "appartement", "résidence", "residence", "colocation"],
    "transport": ["transport", "autobus", "bus", "déplacement", "trajet"],
    "nas": ["nas", "numéro d'assurance sociale", "numero d'assurance sociale", "assurance sociale"],
    "caq": ["caq", "certificat d'acceptation", "immigration québec", "immigration quebec"],
    "permis_etudes": ["permis d'études", "permis etudes", "visa étudiant", "visa etudiant", "ircc"],
    "ramq": ["ramq", "assurance maladie", "carte soleil"],
    "mentor": ["mentor", "mentors", "accompagnement"],
    "evenement": ["événement", "evenement", "activité", "activite", "atelier"],
    "campus": ["campus", "rimouski", "lévis", "levis", "adresse"],
    "programme_informatique": [
        "bac informatique",
        "bac en informatique",
        "baccalauréat informatique",
        "baccalauréat en informatique",
        "baccalaureat informatique",
        "baccalaureat en informatique",
        "informatique uqar",
        "programme informatique",
        "cours informatique",
        "grille de cheminement",
    ],
    "programme": ["programme", "programmes", "formation", "baccalauréat", "baccalaureat", "maîtrise", "maitrise", "doctorat"],
    "international": ["international", "étranger", "etranger", "étudiant international", "etudiant international"],
}

SOURCE_BY_INTENT = {
    "admission": ["uqar_admission", "uqar_admission_international", "uqar_admission_online", "uqar_mon_dossier", "uqar_main"],
    "inscription_cours": ["uqar_mon_dossier", "uqar_calendar", "uqar_main"],
    "frais_scolarite": ["uqar_fees", "uqar_mon_dossier", "uqar_calendar"],
    "calendrier": ["uqar_calendar"],
    "preuve_inscription": ["uqar_mon_dossier", "uqar_main"],
    "releve_notes": ["uqar_mon_dossier", "uqar_main"],
    "dossier_etudiant": ["uqar_mon_dossier", "uqar_main"],
    "registrariat": ["uqar_mon_dossier", "uqar_directory", "uqar_main"],
    "contacts": ["uqar_directory", "uqar_main"],
    "vie_etudiante": ["uqar_life", "uqar_directory", "uqar_main"],
    "campus": ["uqar_main", "uqar_directory"],
    "programme": ["uqar_programs", "uqar_admission", "uqar_main"],
    "programme_informatique": ["uqar_programs", "uqar_admission", "uqar_main"],
    "international": ["uqar_admission_international", "immigration_quebec", "canada_study_permit"],
    "nas": ["service_canada_sin"],
    "caq": ["immigration_quebec"],
    "permis_etudes": ["canada_study_permit"],
    "ramq": ["ramq"],
}

CONTACT_INTENTS = {
    "contacts",
    "vie_etudiante",
    "frais_scolarite",
    "preuve_inscription",
    "releve_notes",
    "dossier_etudiant",
    "registrariat",
    "campus",
    "international",
}


@lru_cache(maxsize=1)
def load_official_sources():
    return _load_json("uqar_official_sources.json")


@lru_cache(maxsize=1)
def load_uqar_contacts():
    return _load_json("uqar_contacts.json")


@lru_cache(maxsize=1)
def load_uqar_programs():
    return _load_json("uqar_programs.json")


def detect_intent(message):
    text = _fold(message)
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(_fold(keyword) in text for keyword in keywords):
            return intent
    return "general"


def detect_uqar_intent(message):
    return detect_intent(message)


def get_relevant_sources(message, user_context=None):
    intent = detect_intent(message)
    sources = load_official_sources()
    by_key = {source["key"]: source for source in sources}

    selected = []
    for key in SOURCE_BY_INTENT.get(intent, []):
        if key in by_key:
            selected.append(_source_payload(by_key[key]))

    text = _fold(message)
    if not selected:
        for source in sources:
            if any(_fold(keyword) in text for keyword in source.get("keywords", [])):
                selected.append(_source_payload(source))

    if not selected and _is_uqar_context(message, user_context):
        selected.append(_source_payload(by_key["uqar_main"]))
        if "uqar_directory" in by_key and intent in {"contacts", "general"}:
            selected.append(_source_payload(by_key["uqar_directory"]))

    return _dedupe(selected)


def get_relevant_contacts(message, user_context=None):
    user_context = user_context or {}
    intent = detect_intent(message)
    if intent not in CONTACT_INTENTS and not _mentions_contact_or_campus(message):
        return []

    contacts = load_uqar_contacts()
    campus = _detect_campus(message, user_context)
    text = _fold(message)
    selected = []

    if campus:
        selected.extend(contact for contact in contacts if _fold(contact.get("campus")) == _fold(campus))

    if not selected and intent in CONTACT_INTENTS:
        selected.extend(contact for contact in contacts if contact["key"].startswith("guichet_"))

    if "annuaire" in text or "personne" in text or "service" in text:
        selected.extend(contact for contact in contacts if contact["key"] == "annuaire_uqar")

    return _dedupe_contacts([_contact_payload(contact) for contact in selected])


def get_relevant_programs(message, user_context=None):
    text = _fold(message)
    selected = []
    for program in load_uqar_programs():
        if any(_fold(keyword) in text for keyword in program.get("keywords", [])):
            selected.append(_program_payload(program))
    return selected[:3]


def get_relevant_uqar_sources(intent, user_message, user_context=None):
    return get_relevant_sources(user_message, user_context)


def get_relevant_uqar_contacts(intent, user_message, user_context=None):
    return get_relevant_contacts(user_message, user_context)


def format_sources_for_prompt(sources):
    if not sources:
        return "- Aucune source officielle spécifique fournie."
    return "\n".join(f"- {source['title']} : {source['url']}" for source in sources)


def format_contacts_for_prompt(contacts):
    if not contacts:
        return "- Aucun contact officiel spécifique fourni."
    lines = []
    for contact in contacts:
        lines.append(
            f"- {contact['label']} | campus : {contact.get('campus') or 'non précisé'} | "
            f"courriel : {contact.get('email') or 'non précisé'} | téléphone : {contact.get('phone') or 'non précisé'} | "
            f"lieu : {contact.get('location') or 'non précisé'}"
        )
    return "\n".join(lines)


def format_programs_for_prompt(programs):
    if not programs:
        return "- Aucun programme UQAR spécifique fourni."
    lines = []
    for program in programs:
        lines.append(
            f"- {program['title']} | niveau : {program.get('level') or 'non précisé'} | "
            f"domaine : {program.get('domain') or 'non précisé'} | description : {program.get('description') or 'non précisé'} | "
            f"source : {program.get('source_title')} ({program.get('source_url')})"
        )
    return "\n".join(lines)


def _load_json(filename):
    with (KNOWLEDGE_DIR / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def _source_payload(source):
    return {"title": source["title"], "url": source["url"]}


def _contact_payload(contact):
    return {
        "label": contact["label"],
        "campus": contact.get("campus", ""),
        "email": contact.get("email", ""),
        "phone": contact.get("phone", ""),
        "location": contact.get("location", ""),
    }


def _program_payload(program):
    return {
        "key": program["key"],
        "title": program["title"],
        "level": program.get("level", ""),
        "domain": program.get("domain", ""),
        "university": program.get("university", ""),
        "description": program.get("description", ""),
        "source_title": program.get("source_title", ""),
        "source_url": program.get("source_url", ""),
    }


def _detect_campus(message, user_context=None):
    user_context = user_context or {}
    text = _fold(f"{message} {user_context.get('campus', '')} {user_context.get('city', '')}")
    if "levis" in text:
        return "Lévis"
    if "rimouski" in text:
        return "Rimouski"
    return ""


def _mentions_contact_or_campus(message):
    text = _fold(message)
    return any(word in text for word in ["contact", "contacter", "joindre", "campus", "levis", "rimouski", "guichet", "annuaire"])


def _is_uqar_context(message, user_context=None):
    user_context = user_context or {}
    return "uqar" in _fold(f"{message} {user_context.get('university', '')}")


def _dedupe(items):
    deduped = []
    seen = set()
    for item in items:
        key = item.get("url") or item.get("title")
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped[:5]


def _dedupe_contacts(items):
    deduped = []
    seen = set()
    for item in items:
        key = item.get("email") or item.get("label")
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)
    return deduped[:4]


def _fold(text):
    normalized = unicodedata.normalize("NFKD", str(text or ""))
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()

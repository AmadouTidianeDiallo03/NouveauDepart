import json
import logging
import re
import unicodedata

import requests
from django.conf import settings

from .uqar_knowledge_service import get_relevant_contacts, get_relevant_sources

logger = logging.getLogger(__name__)

DOMAINS = {"nouveaudepart_app", "uqar", "administrative", "academic", "general", "unknown"}

APP_KEYWORDS = {
    "mentor": "mentor_contact",
    "mentors": "mentor_contact",
    "rendez-vous": "appointment",
    "rdv": "appointment",
    "checklist": "checklist",
    "budget": "budget",
    "evenement": "events",
    "evenement": "events",
    "profil": "profile",
    "parcours": "journey",
    "carte": "map",
    "guide": "guides",
    "guides": "guides",
    "nordikbot": "assistant",
    "nouveaudepart": "app_overview",
    "nouveau depart": "app_overview",
}

UQAR_KEYWORDS = {
    "demande d'admission": "admission",
    "admission": "admission",
    "inscription aux cours": "inscription_cours",
    "rimouski": "campus",
    "levis": "campus",
    "mon dossier": "dossier_etudiant",
    "registrariat": "registrariat",
    "frais de scolarite": "frais_scolarite",
    "calendrier universitaire": "calendrier",
    "releve de notes": "releve_notes",
    "preuve d'inscription": "preuve_inscription",
    "guichet": "contacts",
    "campus": "campus",
    "uqar": "uqar_general",
}

ADMIN_KEYWORDS = {
    "nas": "nas",
    "numero d'assurance sociale": "nas",
    "assurance sociale": "nas",
    "caq": "caq",
    "certificat d'acceptation": "caq",
    "permis d'etudes": "permis_etudes",
    "visa": "permis_etudes",
    "ramq": "ramq",
    "assurance maladie": "ramq",
    "service canada": "nas",
    "immigration quebec": "caq",
}

ACADEMIC_KEYWORDS = {
    "cours": "course_definition",
    "credits": "credits",
    "credit": "credits",
    "programme": "programme",
    "examen": "examens",
    "session": "session",
    "trimestre": "session",
    "horaire": "course_schedule",
}

UQAR_CONTEXTUAL_INTENTS = {"frais_scolarite"}


def analyze_question_context(message, user_context=None):
    user_context = user_context or {}
    classification = classify_with_gemini(message, user_context)
    classification = _normalize_classification(classification)
    classification = _apply_keyword_safety(message, user_context, classification)
    classification["reason"] = _build_reason(message, classification)
    return classification


def classify_with_gemini(message, user_context=None):
    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        return _keyword_classification(message, user_context)

    model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    prompt = _build_classifier_prompt(message, user_context or {})
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 220,
            "topP": 0.7,
        },
    }

    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            headers={"x-goog-api-key": api_key},
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
        raw = _extract_text(response.json())
        parsed = _parse_classifier_json(raw)
        if parsed:
            return parsed
    except Exception as exc:
        logger.info("NordikBot Gemini classification fallback used: %s", exc)

    return _keyword_classification(message, user_context)


def get_sources_by_domain_and_intent(domain, intent, message, user_context=None):
    domain = domain if domain in DOMAINS else "general"
    if domain == "nouveaudepart_app":
        return []
    if domain == "general":
        return []
    if domain == "unknown":
        return []
    if domain == "administrative":
        return get_relevant_sources(message, {})
    if domain == "academic" and not _message_mentions_uqar(message):
        return []
    if domain == "uqar" or (domain == "academic" and _message_mentions_uqar(message)):
        return get_relevant_sources(message, user_context)
    return []


def get_contacts_by_domain_and_intent(domain, intent, message, user_context=None):
    domain = domain if domain in DOMAINS else "general"
    if domain != "uqar":
        return []
    if intent in {"contacts", "contact_service", "campus", "guichet_etudiant", "vie_etudiante", "frais_scolarite", "registrariat", "dossier_etudiant", "preuve_inscription", "releve_notes", "international"}:
        return get_relevant_contacts(message, user_context)
    return []


def _build_classifier_prompt(message, user_context):
    context = {
        "university": user_context.get("university", ""),
        "campus": user_context.get("campus", ""),
        "city": user_context.get("city", ""),
        "stage": user_context.get("stage", ""),
        "language": user_context.get("language", ""),
    }
    return f"""
Tu es un classificateur d'intention pour NordikBot.
Tu dois analyser la question de l'utilisateur et déterminer son domaine.

Domaines possibles :
- nouveaudepart_app : question sur l'application NouveauDépart, ses pages ou ses fonctionnalités.
- uqar : question sur l'Université du Québec à Rimouski, ses campus, services, frais, admission, Mon dossier, registrariat, calendrier.
- administrative : question sur les démarches officielles Québec/Canada comme NAS, CAQ, permis d'études, RAMQ, immigration, Service Canada.
- academic : question générale sur les cours, crédits, programme, examens, session, inscription aux cours.
- general : question générale qui ne concerne pas directement NouveauDépart, l'UQAR ou les démarches.
- unknown : question impossible à comprendre.

Retourne uniquement un JSON valide, sans texte autour.

Format :
{{
  "domain": "...",
  "intent": "...",
  "needs_sources": true,
  "needs_contacts": false
}}

Exemples :
Question : Comment contacter un mentor ?
Réponse : {{"domain":"nouveaudepart_app","intent":"mentor_contact","needs_sources":false,"needs_contacts":false}}

Question : Comment faire une demande d'admission à l'UQAR ?
Réponse : {{"domain":"uqar","intent":"admission","needs_sources":true,"needs_contacts":false}}

Question : Comment faire mon NAS ?
Réponse : {{"domain":"administrative","intent":"nas","needs_sources":true,"needs_contacts":false}}

Question : C'est quoi un cours obligatoire ?
Réponse : {{"domain":"academic","intent":"course_definition","needs_sources":false,"needs_contacts":false}}

Question : Quelle est la capitale de la France ?
Réponse : {{"domain":"general","intent":"general_question","needs_sources":false,"needs_contacts":false}}

Contexte utilisateur :
{json.dumps(context, ensure_ascii=False)}

Question :
{message}
""".strip()


def _keyword_classification(message, user_context=None):
    text = _fold(message)
    for keyword, intent in ADMIN_KEYWORDS.items():
        if keyword in text:
            return {"domain": "administrative", "intent": intent, "needs_sources": True, "needs_contacts": False}
    for keyword, intent in UQAR_KEYWORDS.items():
        if keyword in text:
            if intent in UQAR_CONTEXTUAL_INTENTS and not _mentions_uqar(message, user_context):
                return {"domain": "academic", "intent": intent, "needs_sources": False, "needs_contacts": False}
            return {"domain": "uqar", "intent": intent, "needs_sources": True, "needs_contacts": intent in {"contacts", "campus", "vie_etudiante", "registrariat", "dossier_etudiant", "preuve_inscription", "releve_notes"}}
    for keyword, intent in APP_KEYWORDS.items():
        if keyword in text:
            return {"domain": "nouveaudepart_app", "intent": intent, "needs_sources": False, "needs_contacts": False}
    for keyword, intent in ACADEMIC_KEYWORDS.items():
        if keyword in text:
            return {"domain": "academic", "intent": intent, "needs_sources": False, "needs_contacts": False}
    return {"domain": "general", "intent": "general_question", "needs_sources": False, "needs_contacts": False}


def _apply_keyword_safety(message, user_context, classification):
    text = _fold(message)
    user_context = user_context or {}

    if any(keyword in text for keyword in ADMIN_KEYWORDS):
        intent = next(intent for keyword, intent in ADMIN_KEYWORDS.items() if keyword in text)
        return {"domain": "administrative", "intent": intent, "needs_sources": True, "needs_contacts": False}

    if any(keyword in text for keyword in UQAR_KEYWORDS):
        intent = next(intent for keyword, intent in UQAR_KEYWORDS.items() if keyword in text)
        if intent in UQAR_CONTEXTUAL_INTENTS and not _mentions_uqar(message, user_context):
            return {"domain": "academic", "intent": intent, "needs_sources": False, "needs_contacts": False}
        return {
            "domain": "uqar",
            "intent": intent,
            "needs_sources": True,
            "needs_contacts": intent in {"contacts", "campus", "vie_etudiante", "registrariat", "dossier_etudiant", "preuve_inscription", "releve_notes"},
        }

    if any(keyword in text for keyword in APP_KEYWORDS):
        intent = next(intent for keyword, intent in APP_KEYWORDS.items() if keyword in text)
        return {"domain": "nouveaudepart_app", "intent": intent, "needs_sources": False, "needs_contacts": False}

    if any(keyword in text for keyword in ACADEMIC_KEYWORDS):
        intent = next(intent for keyword, intent in ACADEMIC_KEYWORDS.items() if keyword in text)
        if _message_mentions_uqar(message):
            return {"domain": "uqar", "intent": intent, "needs_sources": True, "needs_contacts": False}
        return {"domain": "academic", "intent": intent, "needs_sources": False, "needs_contacts": False}

    return classification


def _normalize_classification(value):
    value = value or {}
    domain = value.get("domain") if value.get("domain") in DOMAINS else "general"
    intent = str(value.get("intent") or "general_question").strip() or "general_question"
    return {
        "domain": domain,
        "intent": intent,
        "needs_sources": bool(value.get("needs_sources")),
        "needs_contacts": bool(value.get("needs_contacts")),
    }


def _extract_text(data):
    candidates = data.get("candidates") or []
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", []) or []
    return "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()


def _parse_classifier_json(raw):
    raw = (raw or "").strip()
    if not raw:
        return None
    raw = re.sub(r"^```(?:json)?|```$", "", raw, flags=re.IGNORECASE | re.MULTILINE).strip()
    match = re.search(r"\{.*\}", raw, flags=re.DOTALL)
    if match:
        raw = match.group(0)
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _mentions_uqar(message, user_context=None):
    user_context = user_context or {}
    text = _fold(f"{message} {user_context.get('university', '')}")
    return "uqar" in text or "universite du quebec a rimouski" in text


def _message_mentions_uqar(message):
    text = _fold(message)
    return "uqar" in text or "universite du quebec a rimouski" in text


def _build_reason(message, classification):
    return f"Classé en {classification['domain']} avec l'intention {classification['intent']}."


def _fold(text):
    normalized = unicodedata.normalize("NFKD", str(text or ""))
    return "".join(char for char in normalized if not unicodedata.combining(char)).lower()

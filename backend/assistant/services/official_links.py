def _normalize(text):
    return (text or "").lower()


def _has_any(text, keywords):
    return any(keyword in text for keyword in keywords)


OFFICIAL_LINKS = {
    "uqar": {
        "title": "Site officiel de l'UQAR",
        "url": "https://www.uqar.ca",
    },
    "uqar_admission": {
        "title": "Admission UQAR",
        "url": "https://www.uqar.ca/admission",
    },
    "immigration_quebec": {
        "title": "Immigration Québec",
        "url": "https://www.quebec.ca/immigration",
    },
    "canada_study_permit": {
        "title": "Permis d'études - Gouvernement du Canada",
        "url": "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada/permis-etudes.html",
    },
    "service_canada_sin": {
        "title": "Service Canada - Numéro d'assurance sociale",
        "url": "https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html",
    },
    "service_canada": {
        "title": "Service Canada",
        "url": "https://www.canada.ca/fr/emploi-developpement-social/ministere/portefeuille/service-canada.html",
    },
    "ramq": {
        "title": "RAMQ - Assurance maladie Québec",
        "url": "https://www.ramq.gouv.qc.ca",
    },
}


def match_official_sources(message, user_context=None, conversation_history=None):
    user_context = user_context or {}
    message_text = _normalize(message)
    history_text = " ".join(_normalize(item.get("content", "")) for item in (conversation_history or [])[-2:])
    haystack = f"{message_text} {history_text if _is_followup_or_link_request(message_text) else ''}"
    user_university = _normalize(user_context.get("university", ""))

    sources = []

    if _has_any(haystack, ["nas", "numéro d'assurance sociale", "numero d'assurance sociale", "numéro assurance sociale", "numero assurance sociale", "assurance sociale"]):
        sources.append(OFFICIAL_LINKS["service_canada_sin"])

    if _has_any(haystack, ["caq", "certificat d'acceptation du québec", "certificat d'acceptation du quebec"]):
        sources.append(OFFICIAL_LINKS["immigration_quebec"])

    if _has_any(haystack, ["permis d'études", "permis etudes", "visa étudiant", "visa etudiant", "ircc"]):
        sources.append(OFFICIAL_LINKS["canada_study_permit"])

    if _has_any(haystack, ["ramq", "assurance maladie", "carte soleil"]):
        sources.append(OFFICIAL_LINKS["ramq"])

    talks_uqar = "uqar" in haystack or "uqar" in user_university
    if talks_uqar and _has_any(haystack, ["admission", "demande d'admission", "candidature", "programme", "admis"]):
        sources.extend([OFFICIAL_LINKS["uqar"], OFFICIAL_LINKS["uqar_admission"]])
    elif talks_uqar and _has_any(haystack, ["inscription aux cours", "inscrire aux cours", "registrariat", "relevé de notes", "releve de notes", "preuve d'inscription", "calendrier universitaire"]):
        sources.append(OFFICIAL_LINKS["uqar"])

    return _dedupe_sources(sources)


def format_sources_for_prompt(sources):
    if not sources:
        return "- Aucune source officielle spécifique fournie par le backend."
    return "\n".join(f"- {source['title']} : {source['url']}" for source in sources)


def _is_followup_or_link_request(text):
    normalized = _normalize(text).strip()
    return normalized in {
        "lesquelles",
        "lesquelles ?",
        "où",
        "où ?",
        "ou",
        "ou ?",
        "comment",
        "comment ?",
        "explique",
        "explique-moi",
        "les liens",
        "donne les liens",
    } or _has_any(normalized, ["lien", "liens", "site officiel", "sources", "url"])


def _dedupe_sources(sources):
    deduped = []
    seen = set()
    for source in sources:
        if source["url"] in seen:
            continue
        seen.add(source["url"])
        deduped.append(source)
    return deduped[:4]

import logging
import re
import unicodedata

import requests
from django.conf import settings

from .question_context_service import (
    analyze_question_context,
    get_contacts_by_domain_and_intent,
    get_sources_by_domain_and_intent,
)
from .uqar_knowledge_service import (
    format_contacts_for_prompt,
    format_programs_for_prompt,
    format_sources_for_prompt,
    get_relevant_programs,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
Tu es NordikBot, l'assistant intelligent de NouveauDépart.

NouveauDépart aide les étudiants internationaux à mieux comprendre leur intégration au Québec, leur université et leurs démarches.

Tu dois répondre comme un assistant IA naturel, utile, clair et rassurant.

Règles principales :
- Réponds dans la langue de l'utilisateur.
- Si l'utilisateur écrit en français, réponds en français.
- Réponds directement à la question.
- Si la question est compréhensible, donne toujours une réponse utile.
- Ne dis pas trop vite que tu n'as pas assez d'information.
- Si tu n'as pas une information officielle exacte, donne une réponse générale prudente et indique que les détails doivent être vérifiés auprès de la source officielle.
- Ne réponds pas comme un robot froid.
- Ne dis pas "En tant qu'assistant intelligent".
- Ne dis pas "je n'ai pas de sentiments".
- Si l'utilisateur te demande comment ça va, réponds simplement et naturellement.
- Donne des réponses complètes quand la question demande une démarche.
- Ne coupe pas tes réponses.
- Ne rejette pas une question simple.
- Ne demande pas de reformuler si la question est compréhensible.
- Utilise le contexte de conversation quand l'utilisateur pose une question de suivi.
- Structure tes réponses avec des paragraphes courts ou des listes propres.
- Ne mets pas d'astérisques Markdown visibles.
- Ne montre jamais ton raisonnement interne.
- Ne montre jamais de brouillon.
- Ne donne pas de fausses informations officielles.
- Ne fabrique pas de faux liens, de faux cours, de faux contacts ou de fausses conditions.
- Utilise les sources fournies par le backend quand elles sont disponibles.
- Si une information peut changer, conseille de vérifier auprès du site officiel ou du service concerné.

Domaines d'aide :
- démarches d'arrivée ;
- admission ;
- inscription aux cours ;
- UQAR ;
- logement ;
- NAS ;
- CAQ ;
- permis d'études ;
- budget ;
- transport ;
- mentors ;
- événements ;
- vie universitaire.

Style :
- français facile ;
- naturel ;
- clair ;
- professionnel ;
- humain ;
- utile ;
- pas trop long, mais complet.
""".strip()

FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]
INVALID_FALLBACK = (
    "Je peux t'aider. Donne-moi simplement un peu plus de contexte, par exemple l'université, le programme, la démarche ou la page de NouveauDépart dont tu parles."
)
INVALID_RESPONSE_PATTERNS = [
    r"\bwait\b",
    r"do not cut off",
    r"let'?s write",
    r"final clean version",
    r"final answer",
    r"\bdraft\b",
    r"réponse finale",
    r"voici le prompt",
    r"system prompt",
    r"consignes? internes?",
]
UNFINISHED_ENDINGS = (" de", " à", " pour", " avec", " sans", " et", " ou", " l'", " d'", " qu'", " que", " qui")


class GeminiServiceError(Exception):
    pass


def generate_gemini_response(message, user_context=None, conversation_history=None, question_analysis=None):
    direct_answer = _direct_answer_for_simple_chat(message)
    if direct_answer:
        logger.info("NordikBot direct conversational answer used for question=%r", message)
        return direct_answer

    api_key = getattr(settings, "GEMINI_API_KEY", "")
    if not api_key:
        fallback = fallback_answer_for_question(message, user_context)
        if fallback:
            return fallback
        raise GeminiServiceError("GEMINI_API_KEY is not configured.")

    user_context = user_context or {}
    history = _clean_history(conversation_history or [])
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    domain = question_analysis["domain"]
    intent = question_analysis["intent"]
    official_sources = build_official_sources(
        message=message,
        user_context=user_context,
        conversation_history=history,
        question_analysis=question_analysis,
    )
    contacts = build_official_contacts(
        message=message,
        user_context=user_context,
        conversation_history=history,
        question_analysis=question_analysis,
    )
    programs = build_relevant_programs(
        message=message,
        user_context=user_context,
        question_analysis=question_analysis,
    )
    answer_strategy = build_answer_strategy(domain, intent, official_sources, programs)
    model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    models = [model] + [fallback for fallback in FALLBACK_MODELS if fallback != model]

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": _build_contents(
            history,
            _build_prompt(
                message,
                user_context,
                history,
                domain,
                intent,
                official_sources,
                contacts,
                programs,
                answer_strategy,
            ),
        ),
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2000,
            "topP": 0.8,
        },
    }

    last_error = None
    logger.info("NordikBot question=%r", message)
    for model_name in models:
        try:
            answer, finish_reason = _call_gemini_model(model_name, api_key, payload)
            logger.info("RAW GEMINI model=%s finish=%s length=%s text=%r", model_name, finish_reason, len(answer or ""), answer)
            cleaned = clean_ai_response(answer, fallback="")
            is_valid, reason = validate_ai_response(message, cleaned)
            logger.info("CLEANED length=%s validation=%s reason=%s text=%r", len(cleaned or ""), is_valid, reason, cleaned)

            if finish_reason == "MAX_TOKENS" and _looks_incomplete_answer(cleaned):
                logger.warning("Gemini response rejected because MAX_TOKENS produced an incomplete answer.")
                continue

            if is_valid:
                logger.info("FINAL ANSWER length=%s", len(cleaned))
                return cleaned
        except Exception as exc:
            last_error = exc
            logger.warning("Gemini model %s failed: %s", model_name, exc)

    fallback = fallback_answer_for_question(message, user_context)
    if fallback:
        logger.info("Theme fallback used for question=%r length=%s", message, len(fallback))
        return fallback

    if last_error:
        logger.warning("Gemini failed after all attempts: %s", last_error)
    return INVALID_FALLBACK


def analyze_message_context(message, user_context=None):
    return analyze_question_context(message, user_context)


def build_official_sources(message, answer="", user_context=None, conversation_history=None, question_analysis=None):
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    if not question_analysis.get("needs_sources"):
        return []
    return get_sources_by_domain_and_intent(
        question_analysis["domain"],
        question_analysis["intent"],
        message,
        user_context,
    )


def build_official_contacts(message, answer="", user_context=None, conversation_history=None, question_analysis=None):
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    if not question_analysis.get("needs_contacts"):
        return []
    return get_contacts_by_domain_and_intent(
        question_analysis["domain"],
        question_analysis["intent"],
        message,
        user_context,
    )


def build_relevant_programs(message, user_context=None, question_analysis=None):
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    if question_analysis.get("intent") not in {"programme", "programme_informatique"}:
        return []
    if question_analysis.get("domain") not in {"uqar", "academic"}:
        return []
    return get_relevant_programs(message, user_context)


def build_answer_strategy(domain, intent, sources=None, programs=None):
    sources = sources or []
    programs = programs or []
    if domain == "uqar" and programs:
        return (
            "Réponds avec une vue d'ensemble utile du programme UQAR fourni. "
            "Ne donne pas de cours, de durée, de stages ou de conditions précises si ces détails ne sont pas dans les informations officielles fournies. "
            "Oriente vers les sources officielles pour les détails exacts."
        )
    if domain == "uqar" and sources:
        return "Réponds dans le contexte de l'UQAR avec les sources officielles fournies."
    if domain == "uqar":
        return "Donne une réponse générale prudente dans le contexte de l'UQAR et recommande de vérifier le site officiel."
    if domain == "academic":
        return "Réponds directement avec une explication pédagogique claire. N'exige pas une source sauf si la question demande une information officielle."
    if domain == "administrative":
        return "Donne les étapes générales et rappelle de vérifier les sources gouvernementales pertinentes."
    if domain == "nouveaudepart_app":
        return "Explique comment utiliser NouveauDépart, sans ajouter de sources externes inutiles."
    return "Réponds normalement de façon claire et utile."


def build_detected_intent(message, user_context=None, question_analysis=None):
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    return question_analysis["intent"]


def build_detected_domain(message, user_context=None, question_analysis=None):
    question_analysis = question_analysis or analyze_question_context(message, user_context)
    return question_analysis["domain"]


def _call_gemini_model(model_name, api_key, payload):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
    response = requests.post(
        url,
        headers={"x-goog-api-key": api_key},
        json=payload,
        timeout=45,
    )
    response.raise_for_status()
    return extract_gemini_text(response.json())


def extract_gemini_text(data):
    candidates = data.get("candidates") or []
    if not candidates:
        return "", ""

    candidate = candidates[0]
    finish_reason = candidate.get("finishReason", "")
    parts = candidate.get("content", {}).get("parts", []) or []
    texts = [part.get("text", "") for part in parts if part.get("text")]
    return "\n".join(texts).strip(), finish_reason


def _build_prompt(message, user_context, history, domain, intent, official_sources, contacts, programs, answer_strategy):
    context_lines = []
    if user_context.get("first_name"):
        context_lines.append(f"Prénom : {user_context['first_name']}")
    if user_context.get("university"):
        context_lines.append(f"Université : {user_context['university']}")
    if user_context.get("campus"):
        context_lines.append(f"Campus : {user_context['campus']}")
    if user_context.get("city"):
        context_lines.append(f"Ville : {user_context['city']}")
    if user_context.get("stage"):
        context_lines.append(f"Étape actuelle : {user_context['stage']}")
    if user_context.get("language"):
        context_lines.append(f"Langue préférée : {user_context['language']}")

    context = "\n".join(f"- {line}" for line in context_lines) if context_lines else "- Aucun contexte utilisateur précis."
    return (
        "Contexte utilisateur :\n"
        f"{context}\n\n"
        "Historique récent propre :\n"
        f"{_format_history(history)}\n\n"
        "Question actuelle :\n"
        f"{message}\n\n"
        "Domaine détecté :\n"
        f"{domain}\n\n"
        "Intention détectée :\n"
        f"{intent}\n\n"
        "Sources officielles disponibles pour cette question :\n"
        f"{format_sources_for_prompt(official_sources)}\n\n"
        "Programmes UQAR pertinents disponibles :\n"
        f"{format_programs_for_prompt(programs)}\n\n"
        "Contacts UQAR disponibles pour cette question :\n"
        f"{format_contacts_for_prompt(contacts)}\n\n"
        "Stratégie de réponse :\n"
        f"{answer_strategy}\n\n"
        "Exemples de style attendu :\n"
        "Question : Comment ça va aujourd'hui ?\n"
        "Réponse : Ça va bien, merci ! Je suis prêt à t'aider aujourd'hui. Tu peux me poser une question sur ton arrivée au Québec, l'UQAR, le logement, le budget ou tes démarches.\n\n"
        "Question : Quelles sont les premières démarches à mon arrivée ?\n"
        "Réponse : Voici les premières démarches importantes à faire à ton arrivée : vérifier tes documents, confirmer ton logement, acheter une carte SIM, ouvrir un compte bancaire, faire ton NAS si tu veux travailler, vérifier ton inscription et repérer les services utiles du campus.\n\n"
        "Consigne :\n"
        "Réponds uniquement selon le domaine détecté.\n"
        "Ne mélange pas les domaines.\n"
        "Si la question concerne NouveauDépart, explique comment utiliser l'application.\n"
        "Si la question concerne l'UQAR, réponds avec le contexte UQAR et les sources UQAR fournies.\n"
        "Si la question concerne une démarche administrative, réponds avec les sources gouvernementales pertinentes fournies.\n"
        "Si la question est générale, réponds normalement sans forcer le contexte UQAR.\n"
        "N'ajoute pas de liens hors sujet.\n"
        "N'ajoute pas de contacts inutiles.\n"
        "Ne donne pas Immigration Québec si la question ne parle pas d'immigration.\n"
        "Ne donne pas Service Canada si la question ne parle pas du NAS ou d'un service fédéral.\n"
        "Ne donne pas UQAR si la question ne parle pas de l'UQAR.\n"
        "Réponds à la question de manière complète, claire et structurée.\n"
        "Si les détails officiels exacts manquent, donne une explication générale fiable puis indique de vérifier les sources officielles.\n"
        "N'écris pas que tu n'as pas assez d'information si tu peux donner une réponse générale utile.\n"
        "Ne rejette pas une question simple.\n"
        "Ne demande pas de reformuler si la question est compréhensible.\n"
        "Ne coupe pas la réponse.\n"
        "Utilise uniquement les sources et contacts fournis par le backend pour les liens, services et coordonnées.\n"
        "Ne fabrique jamais de lien, de courriel, de téléphone, de local ou de personne à contacter.\n"
        "Si aucun contact précis n'est fourni, recommande l'annuaire UQAR ou le guichet étudiant.\n"
        "Mentionne le service responsable quand c'est utile.\n"
        "Ne mets pas d'astérisques Markdown visibles.\n"
        "Ne donne pas de lien inventé.\n"
        "Les liens officiels seront affichés séparément par l'interface."
    )


def _build_contents(history, prompt):
    contents = []
    for item in history:
        role = "model" if item["role"] == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": item["content"]}]})
    contents.append({"role": "user", "parts": [{"text": prompt}]})
    return contents


def _format_history(history):
    if not history:
        return "- Aucun échange précédent utile."
    labels = {"user": "Utilisateur", "assistant": "NordikBot"}
    return "\n".join(f"- {labels[item['role']]} : {item['content']}" for item in history)


def _clean_history(history):
    cleaned = []
    for item in history[-10:]:
        role = item.get("role")
        content = (item.get("content") or "").strip()
        if role not in {"user", "assistant"} or not content:
            continue
        if _is_parasitic_text(content) or _is_welcome_message(content):
            continue
        if role == "assistant":
            content = clean_ai_response(content, fallback="")
            if not content:
                continue
        cleaned.append({"role": role, "content": content[:1400]})
    return cleaned[-6:]


def clean_ai_response(text, fallback=INVALID_FALLBACK):
    text = (text or "").strip()
    if not text:
        return fallback

    text = text.strip().strip('"').strip("'").strip()
    text = re.sub(r"(?is)^here is the final answer\s*[:\-]?\s*", "", text).strip()
    text = re.sub(r"(?is)^voici (une version|la réponse finale|la réponse)\s*[:\-]?\s*", "", text).strip()
    text = re.sub(r"(?is)^bien sûr,?\s+voici\s*[:\-]?\s*", "", text).strip()
    text = re.sub(r"(?is)^draft\s*[:\-]?\s*", "", text).strip()
    text = re.sub(r"(?is)^réponse finale\s*[:\-]?\s*", "", text).strip()
    text = re.sub(r"(?is)wait,?\s*do not cut off\.?", "", text).strip()
    text = re.sub(r"(?is)let'?s write the final clean version\.?", "", text).strip()
    text = re.sub(r"(?is)\n?\s*sources?\s+(utiles?|officielles?)\s*:\s*.*$", "", text).strip()
    text = re.sub(r"(?m)^\s{0,3}#{1,6}\s*", "", text)
    text = re.sub(r"(?m)^\s{0,3}\*\s+", "- ", text)
    text = re.sub(r"(?m)^\s{0,3}[-•]\s+", "- ", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"__(.*?)__", r"\1", text)
    text = re.sub(r"(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)", r"\1", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if _is_parasitic_text(text):
        return fallback
    return text


def validate_ai_response(question, answer):
    if not answer or not answer.strip():
        return False, "empty"
    if _is_parasitic_text(answer):
        return False, "internal_text"
    if _question_is_french(question) and _looks_english_response(answer):
        return False, "wrong_language"
    if _looks_ill_formed(answer):
        return False, "ill_formed"
    return True, "ok"


def fallback_answer_for_question(message, user_context=None):
    text = _fold(message)
    university = (user_context or {}).get("university") or "ton université"

    if _has_any(text, ["bac informatique", "bac en informatique", "baccalaureat informatique", "baccalaureat en informatique", "informatique uqar", "programme informatique"]):
        if "uqar" in text or "uqar" in _fold(university):
            return (
                "Oui, je peux t'en parler. Le baccalauréat en informatique de l'UQAR est un programme de premier cycle lié aux bases de l'informatique et du développement logiciel.\n\n"
                "De façon générale, ce type de programme touche à la programmation, aux bases de données, aux systèmes, au génie logiciel, aux réseaux, aux mathématiques appliquées et à la résolution de problèmes informatiques.\n\n"
                "Pour l'UQAR, il faut vérifier la page officielle du programme pour connaître les cours exacts, les conditions d'admission, la durée, les stages possibles et le cheminement proposé. Si tu es étudiant international, vérifie aussi les documents demandés et les dates limites."
            )
        return (
            "Oui. Un baccalauréat en informatique est généralement un programme de premier cycle qui forme aux bases de la programmation, des bases de données, du génie logiciel, des systèmes, des réseaux et du développement d'applications.\n\n"
            "Les cours exacts, les conditions d'admission, la durée et les stages possibles varient selon l'université. Il faut donc vérifier la page officielle du programme de l'établissement qui t'intéresse."
        )

    if _has_any(text, ["arrivée", "arrivee", "arriv", "premières démarches", "premieres demarches", "installation", "nouvel arrivant"]):
        return (
            "Voici les premières démarches importantes à faire à ton arrivée :\n\n"
            "1. Vérifier tes documents : passeport, CAQ, permis d'études et lettre d'admission.\n"
            "2. Confirmer ton logement et ton adresse au Québec.\n"
            "3. Acheter une carte SIM ou activer un numéro canadien.\n"
            "4. Ouvrir un compte bancaire pour gérer tes paiements.\n"
            "5. Faire ton NAS si tu veux travailler au Canada.\n"
            "6. Vérifier ton inscription, ton horaire et ton portail étudiant.\n"
            "7. Repérer ton campus, les services aux étudiants, la bibliothèque et le registrariat.\n\n"
            "Si tu es à l'UQAR, tu peux aussi contacter les services aux étudiants ou le registrariat pour confirmer les démarches propres à ton dossier."
        )

    if _has_any(text, ["nas", "numéro d'assurance sociale", "numero d'assurance sociale", "assurance sociale"]):
        return (
            "Pour obtenir ton Numéro d'assurance sociale, tu as deux options principales.\n\n"
            "1. Faire la demande en ligne\n"
            "Tu peux faire la demande sur le site officiel du gouvernement du Canada. C'est pratique si tu veux éviter de te déplacer.\n\n"
            "2. Faire la demande en personne\n"
            "Tu peux aussi te rendre dans un Centre Service Canada avec tes documents. Cette option peut être plus rapide si ton dossier est complet.\n\n"
            "Documents généralement nécessaires :\n"
            "- passeport ;\n"
            "- permis d'études valide ;\n"
            "- adresse au Canada ;\n"
            "- documents demandés par Service Canada.\n\n"
            "Le NAS est important si tu veux travailler au Canada. Vérifie toujours les conditions exactes sur le site officiel."
        )

    if _has_any(text, ["admission", "demande d'admission", "candidature"]):
        return (
            f"Pour faire une demande d'admission à {university}, commence par choisir le programme qui t'intéresse et vérifie les conditions d'admission.\n\n"
            "Ensuite, prépare les documents demandés, remplis la demande en ligne et suis l'évolution de ton dossier. "
            "Si tu es étudiant international, commence tôt, car après l'admission tu pourrais devoir faire des démarches comme le CAQ et le permis d'études.\n\n"
            "Pour les dates, les frais et les documents exacts, vérifie toujours le site officiel de l'université."
        )

    if _has_any(text, ["inscription aux cours", "inscrire aux cours", "horaire", "cours à l'uqar", "cours a l'uqar"]):
        return (
            "Pour t'inscrire à tes cours, commence par te connecter à ton portail étudiant. "
            "Consulte ensuite ton programme, les cours offerts et ton cheminement recommandé.\n\n"
            "Choisis tes cours, vérifie ton horaire, puis confirme ton inscription. "
            "Si tu hésites, contacte ton département, le registrariat ou une personne responsable de ton programme."
        )

    if _has_any(text, ["logement", "appartement", "résidence", "residence"]):
        return (
            "Pour trouver un logement, commence par chercher près de ton campus ou dans une zone bien desservie par le transport.\n\n"
            "Regarde les résidences étudiantes, les annonces locales, les groupes étudiants et les plateformes de location. "
            "Compare le prix, la distance, ce qui est inclus et les conditions du bail. "
            "Évite d'envoyer de l'argent avant d'avoir vérifié l'annonce ou visité le logement."
        )

    if _has_any(text, ["caq", "certificat d'acceptation"]):
        return (
            "Pour renouveler ton CAQ, vérifie d'abord la date d'expiration de ton document et commence les démarches assez tôt.\n\n"
            "Tu devras généralement préparer tes documents d'identité, une preuve d'inscription, des preuves financières et les informations demandées par le gouvernement du Québec. "
            "Après l'envoi, suis ton dossier en ligne et conserve les preuves de dépôt.\n\n"
            "Comme les règles peuvent changer, vérifie toujours les consignes officielles d'Immigration Québec."
        )

    if _has_any(text, ["mentor", "mentors", "contacter un mentor"]):
        return (
            "Pour contacter un mentor sur NouveauDépart, va dans la section Mentors. "
            "Tu peux consulter les profils disponibles, choisir un mentor selon ton université, ta ville, ta langue ou ton pays d'origine, puis ouvrir son profil.\n\n"
            "Ensuite, tu peux lui envoyer un message ou prendre rendez-vous si cette option est disponible."
        )

    if _has_any(text, ["budget", "dépenses", "depenses", "argent"]):
        return (
            "Pour préparer ton budget étudiant, commence par estimer tes dépenses principales : logement, transport, alimentation, téléphone, assurances, frais universitaires et loisirs.\n\n"
            "Le plus important est de prévoir une marge pour les premières semaines, car l'installation coûte souvent plus cher que prévu. "
            "Tu peux utiliser le module Budget de NouveauDépart pour calculer ton total mensuel et repérer ta dépense la plus importante."
        )

    if _has_any(text, ["c'est quoi nouveaudépart", "c'est quoi nouveau départ", "nouveaudépart", "nouveau départ"]):
        return (
            "NouveauDépart est une plateforme qui accompagne les étudiants internationaux dans leur intégration au Québec.\n\n"
            "Elle regroupe un tableau de bord, une checklist, des guides, une carte, des mentors, des événements, un module budget et un assistant IA. "
            "L'objectif est de t'aider à savoir quoi faire avant ton arrivée, à ton arrivée et après ton installation."
        )

    return ""


def _direct_answer_for_simple_chat(message):
    text = _fold(message).strip()
    if _has_any(text, ["comment ça va", "comment ca va", "ça va", "ca va"]):
        return "Ça va bien, merci ! Je suis prêt à t'aider aujourd'hui. Tu peux me poser une question sur ton arrivée au Québec, l'UQAR, le logement, le budget ou tes démarches."
    return ""


def _has_any(text, keywords):
    folded_text = _fold(text)
    return any(_fold(keyword) in folded_text for keyword in keywords)


def _fold(text):
    normalized = unicodedata.normalize("NFKD", str(text or ""))
    without_accents = "".join(char for char in normalized if not unicodedata.combining(char))
    return without_accents.lower()


def _is_parasitic_text(text):
    normalized = (text or "").lower()
    return any(re.search(pattern, normalized, flags=re.IGNORECASE) for pattern in INVALID_RESPONSE_PATTERNS)


def _looks_ill_formed(text):
    stripped = (text or "").strip()
    if len(stripped) < 3:
        return True
    lowered = stripped.lower()
    if lowered.endswith(UNFINISHED_ENDINGS):
        return True
    if stripped.endswith((",", ":", ";", "-", "–")):
        return True
    return False


def _looks_incomplete_answer(text):
    return _looks_ill_formed(text)


def _question_is_french(text):
    normalized = (text or "").lower()
    french_markers = [
        "comment",
        "quoi",
        "pourquoi",
        "où",
        "inscrire",
        "cours",
        "logement",
        "arrivée",
        "démarches",
        "c'est",
        "lesquelles",
        "explique",
        "nas",
    ]
    return any(marker in normalized for marker in french_markers) or bool(re.search(r"[àâçéèêëîïôùûü]", normalized))


def _looks_english_response(text):
    normalized = (text or "").lower().strip()
    english_starters = ("you can", "to ", "first,", "here", "the ", "if you", "for ")
    english_markers = ["student", "university", "housing", "course", "register", "application", "you should"]
    return normalized.startswith(english_starters) or sum(marker in normalized for marker in english_markers) >= 3


def _response_matches_language(question, answer):
    if _question_is_french(question) and _looks_english_response(answer):
        return False
    return True


def _is_welcome_message(text):
    normalized = (text or "").lower()
    return "bonjour, je suis nordikbot" in normalized and "pose-moi ta question simplement" in normalized

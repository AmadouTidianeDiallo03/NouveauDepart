import hashlib
import json
import logging
import math
import re
import unicodedata
from pathlib import Path

import requests
from django.conf import settings
from django.db.models import Q

from .models import KnowledgeChunk, KnowledgeDocument

logger = logging.getLogger(__name__)

DEFAULT_GEMINI_MODEL = "gemini-2.0-flash"
FALLBACK_GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
VECTOR_SIZE = 384
MAX_CONTEXT_CHARS = 6200

STOPWORDS = {
    "a", "au", "aux", "avec", "ce", "ces", "dans", "de", "des", "du", "elle", "en",
    "et", "est", "faire", "il", "je", "la", "le", "les", "ma", "me", "mes", "mon",
    "nous", "ou", "où", "pour", "que", "qui", "quoi", "sur", "ta", "te", "tes",
    "ton", "tu", "un", "une", "vous", "votre", "vos", "the", "and", "for", "how",
    "what", "where", "with", "your", "can", "about", "need", "please",
    "uqar", "universite", "université",
    "question", "questions", "totalement", "obscure",
}

SYNONYMS = {
    "etranger": ["international", "internationaux", "etrangers", "étranger", "étrangers"],
    "etudiant": ["etudiante", "etudiants", "etudiantes", "étudiant", "étudiante", "étudiants", "étudiantes"],
    "accueil": ["arrivee", "arrivée", "integration", "intégration", "accompagnement", "orientation"],
    "preuve": ["attestation", "inscription", "document"],
    "frais": ["scolarite", "scolarité", "paiement"],
    "logement": ["residence", "résidence", "bail", "hebergement", "hébergement"],
    "transport": ["autobus", "gare", "aeroport", "aéroport", "deplacement", "déplacement"],
    "inscription": ["inscrire", "cours", "choix", "trimestre", "admission"],
    "admission": ["demande", "candidature", "programme", "conditions", "documents"],
    "arrivee": ["arrivée", "demarches", "démarches", "installation", "nouvel", "arrivant", "premieres", "premières"],
}

INTENT_RULES = [
    {
        "name": "demarches_arrivee",
        "triggers": {"arrivee", "arrivée", "demarches", "démarches", "installation", "arrivant", "premieres", "premières"},
        "preferred_categories": {"demarches_arrivee", "immigration", "etudiants_internationaux", "services", "campus", "contacts", "transport", "logement"},
        "category_rank": ["demarches_arrivee", "etudiants_internationaux", "services", "campus", "contacts", "transport", "logement", "immigration"],
        "blocked_categories": {"emploi", "bibliotheque", "frais_scolarite"},
        "required_any": {"arrivee", "arrivée", "demarches", "démarches", "installation", "arrivant", "premieres", "premières"},
    },
    {
        "name": "admission",
        "triggers": {"admission", "demande", "candidature", "programme", "conditions"},
        "preferred_categories": {"admission", "etudiants_internationaux", "calendrier", "faq"},
        "category_rank": ["admission", "etudiants_internationaux", "calendrier", "faq"],
        "blocked_categories": {"immigration", "transport", "logement", "emploi", "assurances"},
        "required_any": {"admission", "demande", "candidature", "programme", "conditions"},
    },
    {
        "name": "international_welcome",
        "triggers": {"accueil", "arrivee", "arrivée", "integration", "intégration", "etranger", "étranger", "international"},
        "preferred_categories": {"etudiants_internationaux", "services", "contacts", "campus"},
        "category_rank": ["etudiants_internationaux", "services", "contacts", "campus"],
        "blocked_categories": {"immigration", "emploi"},
        "required_any": {"accueil", "arrivee", "arrivée", "integration", "intégration", "international", "etranger", "étranger"},
    },
    {
        "name": "registrar_documents",
        "triggers": {"preuve", "attestation", "releve", "relevé", "dossier"},
        "preferred_categories": {"registrariat", "faq"},
        "category_rank": ["registrariat", "faq"],
        "blocked_categories": {"immigration", "transport", "logement"},
        "required_any": {"preuve", "attestation", "releve", "relevé", "dossier"},
    },
    {
        "name": "course_registration",
        "triggers": {"inscription", "inscrire", "cours", "choix", "trimestre"},
        "preferred_categories": {"etudiants_internationaux", "admission", "calendrier", "registrariat", "faq"},
        "category_rank": ["inscription", "etudiants_internationaux", "admission", "calendrier", "registrariat", "faq"],
        "blocked_categories": {"immigration", "transport", "logement"},
        "required_any": {"inscription", "inscrire", "cours", "choix", "trimestre"},
    },
    {
        "name": "tuition",
        "triggers": {"frais", "scolarite", "scolarité", "paiement", "payer"},
        "preferred_categories": {"frais_scolarite", "calendrier", "faq"},
        "category_rank": ["frais_scolarite", "calendrier", "faq"],
        "blocked_categories": {"immigration", "transport", "logement"},
        "required_any": {"frais", "scolarite", "scolarité", "paiement", "payer"},
    },
    {
        "name": "housing",
        "triggers": {"logement", "residence", "résidence", "bail", "hebergement", "hébergement"},
        "preferred_categories": {"logement"},
        "category_rank": ["logement"],
        "blocked_categories": {"immigration", "transport"},
        "required_any": {"logement", "residence", "résidence", "bail", "hebergement", "hébergement"},
    },
    {
        "name": "transport",
        "triggers": {"transport", "autobus", "gare", "aeroport", "aéroport"},
        "preferred_categories": {"transport", "campus"},
        "category_rank": ["transport", "campus"],
        "blocked_categories": {"immigration", "logement"},
        "required_any": {"transport", "autobus", "gare", "aeroport", "aéroport"},
    },
]

SYSTEM_PROMPT = (
    "Tu es NordikBot, l'assistant intelligent de NouveauDépart. "
    "Tu aides les étudiants internationaux à comprendre les démarches universitaires, "
    "administratives et pratiques au Québec. Tu dois répondre simplement, clairement et "
    "directement. Tu dois privilégier les réponses courtes, utiles et concrètes. Tu ne dois "
    "pas écrire de longs textes inutiles. Tu ne dois pas inventer une université. Si "
    "l'utilisateur est associé à l'UQAR, tu dois répondre dans le contexte de l'UQAR. "
    "Tu dois utiliser les sources récupérées, mais tu ne dois pas les copier directement. "
    "Tu dois rédiger une réponse naturelle et pratique. Si l'information est incomplète, "
    "donne une réponse générale utile avec prudence et recommande de vérifier auprès du "
    "service officiel. Tu dois répondre dans la langue de l'utilisateur. N'utilise pas de "
    "Markdown complexe comme des astérisques."
)


def normalize(text):
    text = unicodedata.normalize("NFKD", text or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return text.lower()


def tokenize(text):
    return [
        word
        for word in re.findall(r"[a-zA-ZÀ-ÿ0-9']+", normalize(text))
        if len(word) > 2 and word not in STOPWORDS
    ]


def expand_terms(terms):
    expanded = set(terms)
    for term in list(terms):
        expanded.update(SYNONYMS.get(term, []))
    return expanded


def detect_intents(terms):
    normalized_terms = expand_terms(terms)
    intents = []
    for rule in INTENT_RULES:
        if normalized_terms & rule["triggers"]:
            intents.append(rule)
    return intents


def primary_intent(intents):
    return intents[0] if intents else None


def explicit_immigration_request(terms):
    immigration_terms = {"caq", "permis", "visa", "immigration", "ircc", "mifi"}
    return bool(expand_terms(terms) & immigration_terms)


def vectorize(text):
    vector = [0.0] * VECTOR_SIZE
    for token in tokenize(text):
        digest = hashlib.md5(token.encode("utf-8")).hexdigest()
        index = int(digest[:8], 16) % VECTOR_SIZE
        vector[index] += 1.0
    norm = math.sqrt(sum(value * value for value in vector))
    if not norm:
        return vector
    return [round(value / norm, 6) for value in vector]


def cosine(vec_a, vec_b):
    if not vec_a or not vec_b:
        return 0.0
    return sum(float(a) * float(b) for a, b in zip(vec_a, vec_b))


def parse_front_matter(raw):
    if not raw.startswith("---"):
        return {}, raw
    parts = raw.split("---", 2)
    if len(parts) < 3:
        return {}, raw
    meta = {}
    for line in parts[1].splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip().strip('"')
    return meta, parts[2].strip()


def extract_title(content, fallback):
    match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    return match.group(1).strip() if match else fallback


def extract_keywords(content, meta):
    if meta.get("keywords"):
        return meta["keywords"]
    match = re.search(r"(?im)^mots-clés\s*:\s*(.+)$", content)
    return match.group(1).strip() if match else ""


def split_markdown(content, max_chars=1300, overlap=180):
    sections = []
    current_title = ""
    current = []

    for line in content.splitlines():
        heading = re.match(r"^(#{2,3})\s+(.+)$", line)
        if heading and current:
            sections.append((current_title, "\n".join(current).strip()))
            current = []
        if heading:
            current_title = heading.group(2).strip()
        current.append(line)

    if current:
        sections.append((current_title, "\n".join(current).strip()))

    chunks = []
    for section, text in sections:
        if len(text) <= max_chars:
            chunks.append((section, text))
            continue
        start = 0
        while start < len(text):
            end = min(start + max_chars, len(text))
            chunks.append((section, text[start:end].strip()))
            if end == len(text):
                break
            start = max(0, end - overlap)
    return [(section, text) for section, text in chunks if text]


def project_root():
    return Path(settings.BASE_DIR).parent


def ingest_kb(kb_root=None, clear_missing=False):
    root = Path(kb_root) if kb_root else project_root() / "kb"
    root.mkdir(parents=True, exist_ok=True)
    seen_paths = set()
    indexed_docs = 0
    indexed_chunks = 0

    for path in sorted(root.rglob("*.md")):
        relative_path = path.relative_to(project_root()).as_posix()
        seen_paths.add(relative_path)
        raw = path.read_text(encoding="utf-8")
        meta, content = parse_front_matter(raw)
        content_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        title = meta.get("title") or extract_title(content, path.stem.replace("_", " ").title())

        document, _ = KnowledgeDocument.objects.update_or_create(
            path=relative_path,
            defaults={
                "title": title,
                "description": meta.get("description", ""),
                "category": meta.get("category", ""),
                "university": meta.get("university", ""),
                "campus": meta.get("campus", ""),
                "language": meta.get("language", "fr"),
                "source_url": meta.get("source_url", ""),
                "updated_at_text": meta.get("updated_at", ""),
                "content_hash": content_hash,
            },
        )
        document.chunks.all().delete()

        keywords = extract_keywords(content, meta)
        for index, (section, chunk_text) in enumerate(split_markdown(content), start=1):
            KnowledgeChunk.objects.create(
                document=document,
                chunk_index=index,
                title=title,
                section=section,
                content=chunk_text,
                keywords=keywords,
                metadata={
                    "path": relative_path,
                    "source_url": document.source_url,
                    "university": document.university,
                    "campus": document.campus,
                    "category": document.category,
                },
                vector=vectorize(" ".join([title, section, keywords, chunk_text])),
                token_count=len(tokenize(chunk_text)),
            )
            indexed_chunks += 1
        indexed_docs += 1

    if clear_missing:
        KnowledgeDocument.objects.exclude(path__in=seen_paths).delete()

    return {"documents": indexed_docs, "chunks": indexed_chunks, "root": str(root)}


def detect_language(text, fallback="fr"):
    normalized = normalize(text)
    english = sum(marker in normalized for marker in ["hello", "how", "what", "where", "when", "study permit"])
    french = sum(marker in normalized for marker in ["bonjour", "comment", "quoi", "où", "quand", "université"])
    if english > french:
        return "en"
    return fallback or "fr"


def search_chunks(message, university="", campus="", limit=6):
    query_vector = vectorize(message)
    raw_terms = set(tokenize(message))
    terms = expand_terms(raw_terms)
    intents = detect_intents(raw_terms)
    main_intent = primary_intent(intents)
    wants_immigration = explicit_immigration_request(raw_terms)
    qs = KnowledgeChunk.objects.select_related("document").all()

    if university:
        uni_q = Q(document__university__iexact=university) | Q(document__university="")
        qs = qs.filter(uni_q)

    scored = []
    for chunk in qs:
        category = chunk.document.category
        if main_intent and category in main_intent.get("blocked_categories", set()) and not wants_immigration:
            continue

        semantic = cosine(query_vector, chunk.vector)
        text = normalize(" ".join([chunk.title, chunk.section, chunk.content, chunk.keywords]))
        lexical_hits = sum(1 for term in terms if term in text)
        lexical = lexical_hits / max(len(terms), 1)
        if lexical_hits == 0 and not intents:
            continue
        boost = 0.0
        penalty = 0.0
        if university and chunk.document.university.lower() == university.lower():
            boost += 0.18
        if campus and chunk.document.campus and campus.lower() in chunk.document.campus.lower():
            boost += 0.08
        if chunk.document.university.lower() == "uqar":
            boost += 0.04

        for intent in intents:
            intent_terms = intent["required_any"]
            has_intent_term = bool(intent_terms & set(tokenize(text)))
            if category in intent["preferred_categories"]:
                boost += 0.26
            elif not has_intent_term:
                penalty += 0.22

        if main_intent and category == main_intent.get("category_rank", [""])[0]:
            boost += 0.22

        if main_intent and main_intent["name"] == "demarches_arrivee":
            if "bail" in text and not any(term in raw_terms for term in {"bail", "logement"}):
                penalty += 0.28

        if "source officielle" in normalize(chunk.section) and len(chunk.content) < 180:
            penalty += 0.35

        if lexical_hits == 0:
            penalty += 0.18

        score = semantic * 0.50 + lexical * 0.50 + boost - penalty
        if score > 0.05:
            scored.append((score, chunk))

    if intents:
        rank = main_intent.get("category_rank", []) if main_intent else []
        preferred = set(rank)

        def category_position(category):
            try:
                return rank.index(category)
            except ValueError:
                return len(rank) + 1

        scored.sort(
            key=lambda item: (
                item[1].document.category in preferred,
                -category_position(item[1].document.category),
                item[0],
            ),
            reverse=True,
        )
    else:
        scored.sort(key=lambda item: item[0], reverse=True)
    return diversify_sources(scored, limit=limit)


def diversify_sources(scored, limit=6):
    selected = []
    seen = {}
    for score, chunk in scored:
        key = chunk.document.path
        if seen.get(key, 0) >= 2:
            continue
        selected.append((score, chunk))
        seen[key] = seen.get(key, 0) + 1
        if len(selected) >= limit:
            break
    return selected


def confidence_from_scores(scored):
    if not scored:
        return "faible"
    top = scored[0][0]
    if top >= 0.55 and len(scored) >= 2:
        return "élevé"
    if top >= 0.28:
        return "moyen"
    return "faible"


def serialize_sources(scored):
    sources = []
    seen_paths = set()
    for score, chunk in scored:
        if chunk.document.path in seen_paths:
            continue
        seen_paths.add(chunk.document.path)
        sources.append({
            "title": chunk.document.title,
            "path": f"/{chunk.document.path}",
            "section": chunk.section or chunk.title,
            "type": chunk.document.category or "base de connaissances",
            "university": chunk.document.university,
            "campus": chunk.document.campus,
            "source_url": chunk.document.source_url,
            "excerpt": compact(chunk.content, 360),
            "score": round(score, 3),
        })
    return sources


def compact(text, limit=420):
    text = re.sub(r"\s+", " ", text or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def build_context(scored):
    chunks = []
    total = 0
    for index, (_, chunk) in enumerate(scored, start=1):
        excerpt = compact(chunk.content, 1100)
        item = (
            f"[{index}] {chunk.document.title}\n"
            f"Université: {chunk.document.university or 'général'}\n"
            f"Campus: {chunk.document.campus or 'non précisé'}\n"
            f"Section: {chunk.section or chunk.title}\n"
            f"Source officielle: {chunk.document.source_url or 'non précisée'}\n"
            f"Extrait: {excerpt}\n"
            "Rappel: ne pas copier cet extrait mot à mot; le reformuler en réponse pratique."
        )
        if total + len(item) > MAX_CONTEXT_CHARS:
            break
        chunks.append(item)
        total += len(item)
    return "\n\n".join(chunks)


def guarded_fallback(language, confidence, has_sources):
    if language == "en":
        if not has_sources:
            return (
                "I did not find this information in my knowledge base. Please check the "
                "official university website or contact the relevant service. You can also "
                "ask a mentor for help."
            )
        return (
            "I found related sources, but not enough to answer with high confidence. "
            "Here is the safest summary from the available documents, and you should "
            "verify important details with the official service."
        )
    if not has_sources:
        return (
            "Je n'ai pas trouvé cette information dans ma base de connaissances. "
            "Je vous recommande de vérifier sur le site officiel de l'université ou de "
            "contacter le service concerné. Vous pouvez aussi parler à un mentor."
        )
    return (
        "J'ai trouvé des sources liées à votre question, mais pas assez précises pour "
        "répondre avec une confiance élevée. Je résume prudemment ce qui est disponible "
        "et je vous recommande de vérifier les détails importants auprès du service officiel."
    )


def general_guidance_answer(message, language, university="", confidence="faible", has_sources=False):
    normalized = normalize(message)
    is_admission = any(word in normalized for word in ["admission", "demande", "candidature"])
    is_registration = any(word in normalized for word in ["inscription", "inscrire", "cours"])
    is_caq = "caq" in normalized or "permis" in normalized
    is_arrival = any(word in normalized for word in ["arrivee", "arrivée", "demarches", "démarches", "installation", "arrivant"])

    if language == "en":
        if is_admission:
            return (
                "An admission request generally happens in a few steps: choose the program, "
                "check the admission requirements and deadlines, prepare the required documents, "
                "submit the online application, then follow the status of your file. For an "
                "international student, it is important to start early because immigration steps "
                "such as study authorizations may come after admission. I do not have enough "
                "local source detail to confirm every requirement, so verify the official "
                "university admission page."
            )
        return (
            "I do not have enough precise information in my local sources to confirm every "
            "detail. In general, you should identify the relevant university service, read the "
            "official instructions, prepare your documents, and contact the service or a mentor "
            "if your situation is specific."
        )

    if is_admission:
        scope = f" à {university}" if university else ""
        return (
            f"Une demande d'admission{scope} se fait généralement en plusieurs étapes. "
            "D'abord, tu choisis le programme qui t'intéresse et le trimestre visé. Ensuite, "
            "tu vérifies les conditions d'admission, les documents demandés et les dates limites. "
            "Après cela, tu remplis la demande en ligne, tu ajoutes les documents nécessaires "
            "et tu suis l'état de ton dossier. Pour un étudiant international, il faut commencer "
            "tôt, parce qu'après l'admission il peut aussi y avoir des démarches comme le CAQ, "
            "le permis d'études, les preuves financières et la préparation de l'arrivée. "
            "Je te recommande de confirmer les détails sur la page officielle d'admission de "
            "l'université concernée."
        )
    if is_arrival:
        suffix = " Pour l'UQAR, contacte les services aux étudiants, l'accueil international ou le registrariat si tu as une question sur ton dossier."
        return (
            "À ton arrivée au Québec, commence par vérifier tes documents importants : passeport, CAQ, permis d'études et lettre d'admission.\n"
            "Ensuite, installe-toi correctement : logement, adresse au Québec, téléphone et compte bancaire.\n"
            "Connecte-toi aux services de ton université et vérifie ton dossier étudiant.\n"
            "Confirme ton inscription aux cours, ton horaire et les messages officiels reçus.\n"
            "Repère ton campus, les services aux étudiants, la bibliothèque et les lieux utiles.\n"
            "Organise aussi ton transport et vérifie ta couverture d'assurance maladie ou hospitalisation."
            + suffix
        )
    if is_registration:
        return (
            "L'inscription consiste généralement à choisir tes cours pour un trimestre, selon "
            "ton programme et les consignes de ton université. Pour un nouvel étudiant "
            "international, certaines pièces peuvent être demandées avant l'inscription finale, "
            "comme les documents d'identité ou d'immigration selon le cas. Il faut aussi vérifier "
            "les dates limites dans le calendrier universitaire et suivre les courriels officiels "
            "de l'université."
        )
    if is_caq:
        return (
            "Pour un CAQ ou un permis d'études, je peux seulement donner une orientation générale : "
            "il faut suivre la procédure officielle du gouvernement, préparer les documents demandés "
            "et vérifier les délais à jour. Comme les règles peuvent changer, la source officielle "
            "du gouvernement doit toujours être prioritaire."
        )
    return (
        "Je n'ai pas trouvé assez d'informations précises dans ma base pour confirmer tous les "
        "détails. De façon générale, commence par identifier le service concerné, vérifie les "
        "consignes officielles, prépare tes documents, puis contacte l'université ou un mentor si "
        "ta situation est particulière."
    )


def generate_ai_answer(user_question, retrieved_contexts, language, university="", campus="", confidence="faible"):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return None
    preferred_model = getattr(settings, "GEMINI_MODEL", DEFAULT_GEMINI_MODEL)
    models = [preferred_model] + [model for model in FALLBACK_GEMINI_MODELS if model != preferred_model]

    context = build_context(retrieved_contexts) if retrieved_contexts else "Aucun extrait local pertinent trouvé."
    prompt = (
        f"Question :\n{user_question}\n\n"
        f"Université de l'utilisateur :\n{university or 'Non précisée'}\n\n"
        f"Campus :\n{campus or 'Non précisé'}\n\n"
        f"Sources disponibles :\n{context}\n\n"
        "Consigne de réponse :\n"
        "Réponds directement à la question.\n"
        "Fais une réponse courte et pratique.\n"
        "Maximum 8 à 12 lignes.\n"
        "Utilise des étapes simples si nécessaire.\n"
        "Ne mentionne pas une autre université que celle indiquée.\n"
        "Ne commence pas par « Bienvenue » sauf si l'utilisateur vient de commencer la conversation.\n"
        "Ne fais pas de texte trop général.\n"
        "Ne dis pas « il est normal de » sauf si c'est nécessaire.\n"
        "Ne mets pas de Markdown avec des astérisques.\n"
        "Si les sources ne suffisent pas, donne une réponse générale prudente et propose de vérifier auprès du service officiel."
    )
    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.25, "maxOutputTokens": 360},
    }
    last_error = None
    for model in models:
        try:
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            response = requests.post(
                gemini_url,
                headers={"x-goog-api-key": api_key},
                json=payload,
                timeout=25,
            )
            response.raise_for_status()
            data = response.json()
            candidates = data.get("candidates") or []
            if not candidates:
                continue
            parts = candidates[0].get("content", {}).get("parts", [])
            text = "\n".join(part.get("text", "") for part in parts).strip()
            text = clean_llm_answer(text) if text else ""
            if is_valid_llm_answer(text):
                return text
            logger.warning("Gemini model %s returned an invalid/truncated answer: %r", model, text[:120])
        except requests.HTTPError as exc:
            last_error = exc
            status_code = exc.response.status_code if exc.response is not None else "?"
            logger.warning("Gemini model %s HTTP error %s.", model, status_code)
        except Exception as exc:
            last_error = exc
            logger.warning("Gemini model %s unexpected error: %s", model, exc)
    if last_error:
        raise last_error
    return None


def call_llm(message, language, scored, confidence):
    return generate_ai_answer(
        user_question=message,
        retrieved_contexts=scored,
        language=language,
        confidence=confidence,
    )


def clean_llm_answer(text):
    text = text.strip()
    text = re.sub(
        r"^(bonjour\s*!?\s*)?je suis nordikbot[^\n]*\n+",
        "",
        text,
        flags=re.IGNORECASE,
    ).strip()
    text = re.sub(
        r"^bonjour\s*!\s*je suis là pour (vous|t')?\s*(guider|expliquer|aider|accompagner)[^\n]*\n+",
        "",
        text,
        flags=re.IGNORECASE,
    ).strip()
    text = text.replace("**", "")
    return text


def is_valid_llm_answer(text):
    if not text or len(text.strip()) < 120:
        return False
    if text.rstrip().endswith(("dérou", "l'", "de", "à", "pour", "sur")):
        return False
    return True


def local_grounded_answer(message, language, scored, confidence):
    if not scored:
        return general_guidance_answer(message, language, confidence=confidence, has_sources=False)

    if confidence == "faible" or any(word in normalize(message) for word in ["arrivee", "arrivée", "demarches", "démarches", "installation", "arrivant"]):
        university = scored[0][1].document.university if scored and scored[0][1].document.university else ""
        return general_guidance_answer(message, language, university=university, confidence=confidence, has_sources=True)

    facts = [clean_chunk_for_answer(chunk) for _, chunk in scored[:3]]
    if language == "en":
        return (
            "Here is the clearest answer I can give from the available sources. "
            + " ".join(facts)
            + " For official or time-sensitive procedures, verify with the university or government source."
        )
    return (
        "Voici l'explication la plus claire que je peux donner à partir des sources disponibles. "
        + " ".join(facts)
        + " Pour les démarches officielles ou sensibles aux dates, vérifie toujours auprès de la source officielle."
    )


def clean_chunk_for_answer(chunk):
    text = re.sub(r"^#+\s*", "", chunk.content.strip())
    text = re.sub(r"\n#+\s*", "\n", text)
    text = re.sub(r"\n+", " ", text)
    return compact(text, 320)


def answer_question(message, user=None, university="", campus="", language="fr"):
    language = language or detect_language(message)
    university = (university or "").strip()
    campus = (campus or "").strip()

    if not university and user and getattr(user, "profile", None) and user.profile.university:
        university = user.profile.university.name
    if not campus and user and getattr(user, "profile", None):
        campus = user.profile.city

    scored = search_chunks(message, university=university, campus=campus)
    confidence = confidence_from_scores(scored)
    sources = serialize_sources(scored)

    answer = None
    try:
            answer = generate_ai_answer(
                user_question=message,
                retrieved_contexts=scored,
                language=language,
                university=university,
                campus=campus,
                confidence=confidence,
            )
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else "?"
        body = exc.response.text[:300] if exc.response is not None else ""
        logger.warning("Gemini HTTP error %s. Falling back to local RAG answer. %s", status_code, body)
    except Exception:
        logger.exception("Gemini unexpected error. Falling back to local RAG answer.")

    if not answer:
        answer = local_grounded_answer(message, language, scored, confidence)

    return {
        "answer": answer,
        "sources": sources,
        "confidence": confidence,
    }


def evaluation_row(question, result):
    return {
        "question": question.get("message", ""),
        "answer": result["answer"],
        "sources": result["sources"],
        "confidence": result["confidence"],
        "complete": bool(result["sources"]) and result["confidence"] in {"moyen", "élevé"},
    }


def dump_report(rows):
    return json.dumps(rows, ensure_ascii=False, indent=2)

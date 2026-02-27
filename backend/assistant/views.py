import logging
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AssistantLog

logger = logging.getLogger(__name__)

FALLBACK_FR = (
    "Je n'ai pas trouvé de réponse précise.\n\n"
    "**Où vérifier :**\n"
    "- Le registrariat de ton université\n"
    "- Les services aux étudiants internationaux\n"
    "- Le site officiel de ton université"
)

FALLBACK_EN = (
    "I could not find a precise answer.\n\n"
    "**Where to check:**\n"
    "- Your university's registrar's office\n"
    "- International student services\n"
    "- Your university's official website"
)

SYSTEM_PROMPT = (
    "Tu es NouveauBot, un assistant IA chaleureux et bienveillant pour les étudiants internationaux "
    "qui arrivent au Québec, Canada. Tu aides avec : les démarches administratives (NAS, RAMQ, permis "
    "d'études, CAQ, ouverture de compte bancaire), la vie universitaire au Québec (crédits, sessions, "
    "cote R, plan de cours, registrariat), le logement, le transport (carte OPUS), la vie quotidienne, "
    "l'intégration culturelle, la réussite académique (méthodes d'étude, ressources universitaires) et "
    "les universités québécoises (UQAR, UQAM, ULaval, UdeM, Concordia, McGill, etc.). "
    "Réponds TOUJOURS dans la langue de la question (FR ou EN). "
    "Sois clair, structuré, encourageant. Utilise des listes à puces quand c'est utile."
)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


def detect_language(text: str) -> str:
    fr_markers = ["le ", "la ", "les ", "est ", "je ", "qu'", "de ", "du ", "un ", "une ",
                  "et ", "pour ", "comment ", "où ", "quand ", "mon ", "ma ", "mes "]
    text_lower = text.lower()
    fr_count = sum(1 for m in fr_markers if m in text_lower)
    return "fr" if fr_count >= 2 else "en"


def call_gemini(api_key: str, question: str) -> str:
    """Call Gemini REST API directly — no SDK needed."""
    payload = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [
            {"role": "user", "parts": [{"text": question}]}
        ],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
        },
    }
    resp = requests.post(
        GEMINI_URL,
        params={"key": api_key},
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ask_view(request):
    """
    POST /api/assistant/ask
    Body: { "question": "..." }
    """
    question = request.data.get("question", "").strip()
    if not question:
        return Response({"detail": "question required."}, status=status.HTTP_400_BAD_REQUEST)

    lang = detect_language(question)
    fallback = FALLBACK_FR if lang == "fr" else FALLBACK_EN

    api_key = settings.GEMINI_API_KEY

    if not api_key:
        answer = (
            "⚠️ NouveauBot n'est pas encore configuré. Contacte l'administrateur."
            if lang == "fr"
            else "⚠️ NouveauBot is not configured yet. Contact the administrator."
        )
        AssistantLog.objects.create(user=request.user, question=question, answer=answer)
        return Response({"answer": answer})

    try:
        answer = call_gemini(api_key, question)
        if not answer:
            answer = fallback
    except requests.HTTPError as exc:
        err_body = exc.response.text if exc.response is not None else str(exc)
        logger.error("Gemini HTTP error %s: %s", exc.response.status_code if exc.response else "?", err_body)
        if settings.DEBUG:
            answer = f"⚠️ Erreur API ({exc.response.status_code if exc.response else '?'}): {err_body[:300]}"
        else:
            answer = fallback
    except Exception as exc:
        logger.error("Gemini unexpected error: %s", exc, exc_info=True)
        if settings.DEBUG:
            answer = f"⚠️ Erreur inattendue: {type(exc).__name__}: {exc}"
        else:
            answer = fallback

    AssistantLog.objects.create(user=request.user, question=question, answer=answer)
    return Response({"answer": answer})

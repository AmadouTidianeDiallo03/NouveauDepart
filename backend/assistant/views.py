import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AssistantFeedback, AssistantLog
from .services.gemini_service import (
    GeminiServiceError,
    analyze_message_context,
    build_detected_domain,
    build_detected_intent,
    build_official_contacts,
    build_official_sources,
    generate_gemini_response,
)

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_view(request):
    message = request.data.get("message") or request.data.get("question") or ""
    message = message.strip()
    if not message:
        return Response({"detail": "message required."}, status=status.HTTP_400_BAD_REQUEST)

    user_context = build_user_context(request)
    history = request.data.get("history") or []
    question_analysis = analyze_message_context(message, user_context)

    try:
        answer = generate_gemini_response(
            message=message,
            user_context=user_context,
            conversation_history=history,
            question_analysis=question_analysis,
        )
        domain = build_detected_domain(message, user_context, question_analysis)
        intent = build_detected_intent(message, user_context, question_analysis)
        sources = build_official_sources(
            message=message,
            answer=answer,
            user_context=user_context,
            conversation_history=history,
            question_analysis=question_analysis,
        )
        contacts = build_official_contacts(
            message=message,
            answer=answer,
            user_context=user_context,
            conversation_history=history,
            question_analysis=question_analysis,
        )
        logger.info(
            "NordikBot API answer length=%s domain=%s intent=%s sources=%s contacts=%s",
            len(answer or ""),
            domain,
            intent,
            len(sources),
            len(contacts),
        )
    except GeminiServiceError:
        logger.exception("NordikBot Gemini service error for question=%r", message)
        answer = "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."
        domain = "general"
        sources = []
        contacts = []
        intent = "general"
    except Exception:
        logger.exception("NordikBot unexpected error for question=%r", message)
        answer = "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."
        domain = "general"
        sources = []
        contacts = []
        intent = "general"

    AssistantLog.objects.create(
        user=request.user,
        question=message,
        answer=answer,
        sources=sources,
        confidence="",
    )
    return Response({"answer": answer, "domain": domain, "intent": intent, "sources": sources, "contacts": contacts})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ask_view(request):
    return chat_view(request)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def feedback_view(request):
    rating = request.data.get("rating")
    if rating not in {"useful", "incomplete"}:
        return Response({"detail": "rating must be useful or incomplete."}, status=status.HTTP_400_BAD_REQUEST)

    feedback = AssistantFeedback.objects.create(
        user=request.user,
        question=request.data.get("question", ""),
        answer=request.data.get("answer", ""),
        sources=[],
        rating=rating,
        comment=request.data.get("comment", ""),
    )
    return Response({"id": feedback.id, "status": "saved"}, status=status.HTTP_201_CREATED)


def build_user_context(request):
    payload_context = request.data.get("user_context") or {}
    user = request.user
    profile = getattr(user, "profile", None)

    context = {
        "first_name": user.first_name,
        "role": getattr(profile, "role", "") if profile else "",
        "university": "",
        "campus": "",
        "city": "",
        "stage": "",
        "language": "",
    }

    if profile:
        university = getattr(profile, "university", None)
        campus = getattr(profile, "campus", "") or ""
        context["university"] = getattr(university, "name", "") if university else ""
        context["city"] = getattr(profile, "city", "") or ""
        context["campus"] = getattr(campus, "name", campus) or context["city"]
        context["stage"] = getattr(profile, "integration_stage", "") or ""
        context["language"] = getattr(profile, "language", "") or ""

    for key in ["university", "campus", "city", "stage", "language"]:
        if payload_context.get(key):
            context[key] = payload_context[key]

    return context

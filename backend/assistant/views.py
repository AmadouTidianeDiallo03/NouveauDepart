from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AssistantFeedback, AssistantLog
from .services.gemini_service import GeminiServiceError, build_official_sources, generate_gemini_response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_view(request):
    message = request.data.get("message") or request.data.get("question") or ""
    message = message.strip()
    if not message:
        return Response({"detail": "message required."}, status=status.HTTP_400_BAD_REQUEST)

    user_context = build_user_context(request)
    history = request.data.get("history") or []

    try:
        answer = generate_gemini_response(
            message=message,
            user_context=user_context,
            conversation_history=history,
        )
        sources = build_official_sources(
            message=message,
            answer=answer,
            user_context=user_context,
            conversation_history=history,
        )
    except GeminiServiceError:
        answer = "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."
        sources = []
    except Exception:
        answer = "Désolé, je n'arrive pas à répondre pour le moment. Réessaie dans quelques instants."
        sources = []

    AssistantLog.objects.create(
        user=request.user,
        question=message,
        answer=answer,
        sources=sources,
        confidence="",
    )
    return Response({"answer": answer, "sources": sources})


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

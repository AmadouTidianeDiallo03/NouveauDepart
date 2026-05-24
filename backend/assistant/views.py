from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AssistantFeedback, AssistantLog
from .rag import answer_question


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_view(request):
    message = request.data.get("message") or request.data.get("question") or ""
    message = message.strip()
    if not message:
        return Response({"detail": "message required."}, status=status.HTTP_400_BAD_REQUEST)

    result = answer_question(
        message=message,
        user=request.user,
        university=request.data.get("university", ""),
        campus=request.data.get("campus", ""),
        language=request.data.get("language", "fr"),
    )
    AssistantLog.objects.create(
        user=request.user,
        question=message,
        answer=result["answer"],
        sources=result["sources"],
        confidence=result["confidence"],
    )
    return Response(result)


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
        sources=request.data.get("sources", []),
        rating=rating,
        comment=request.data.get("comment", ""),
    )
    return Response({"id": feedback.id, "status": "saved"}, status=status.HTTP_201_CREATED)

import json
from pathlib import Path

from django.contrib.auth.models import User
from django.core.management import call_command
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.permissions import IsAdminRole
from accounts.models import Profile, StageTask
from assistant.models import AssistantFeedback, KnowledgeDocument
from guides.models import Step
from studentlife.models import IntegrationEvent
from universities.models import PointOfInterest, University

from .admin_serializers import (
    AdminEventSerializer,
    AdminFeedbackSerializer,
    AdminKnowledgeDocumentSerializer,
    AdminMentorSerializer,
    AdminPointSerializer,
    AdminStageTaskSerializer,
    AdminStepSerializer,
    AdminUniversitySerializer,
    AdminUserSerializer,
)


class AdminModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminRole]


class AdminGuideViewSet(AdminModelViewSet):
    queryset = Step.objects.all()
    serializer_class = AdminStepSerializer


class AdminChecklistViewSet(AdminModelViewSet):
    queryset = StageTask.objects.select_related("stage").all()
    serializer_class = AdminStageTaskSerializer


class AdminUniversityViewSet(AdminModelViewSet):
    queryset = University.objects.all()
    serializer_class = AdminUniversitySerializer


class AdminMapPointViewSet(AdminModelViewSet):
    queryset = PointOfInterest.objects.select_related("university").all()
    serializer_class = AdminPointSerializer


class AdminEventViewSet(AdminModelViewSet):
    queryset = IntegrationEvent.objects.select_related("university").all()
    serializer_class = AdminEventSerializer


class AdminKnowledgeViewSet(AdminModelViewSet):
    queryset = KnowledgeDocument.objects.all()
    serializer_class = AdminKnowledgeDocumentSerializer


class AdminFeedbackViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminRole]
    queryset = AssistantFeedback.objects.select_related("user").all()
    serializer_class = AdminFeedbackSerializer


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminRole]
    queryset = User.objects.select_related("profile").all()
    serializer_class = AdminUserSerializer


class AdminMentorViewSet(AdminModelViewSet):
    queryset = Profile.objects.filter(role="mentor").select_related("user", "university")
    serializer_class = AdminMentorSerializer


class AdminUQARSourceViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminRole]

    @property
    def path(self):
        return Path(__file__).resolve().parent.parent / "assistant" / "knowledge" / "uqar_official_sources.json"

    def list(self, request):
        return Response(self._items())

    def create(self, request):
        items = self._items()
        payload = self._normalize_payload(request.data)
        if not payload.get("key"):
            payload["key"] = f"uqar_source_{len(items) + 1}"
        items.append(payload)
        self._save(items)
        return Response({**payload, "id": payload["key"]}, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        items = self._items()
        for index, item in enumerate(items):
            if item.get("key") == pk:
                payload = {**item, **self._normalize_payload(request.data), "key": pk}
                items[index] = payload
                self._save(items)
                return Response({**payload, "id": payload["key"]})
        return Response({"detail": "Source UQAR introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        items = self._items()
        filtered = [item for item in items if item.get("key") != pk]
        if len(filtered) == len(items):
            return Response({"detail": "Source UQAR introuvable."}, status=status.HTTP_404_NOT_FOUND)
        self._save(filtered)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _items(self):
        with self.path.open("r", encoding="utf-8") as file:
            return [{**item, "id": item.get("key")} for item in json.load(file)]

    def _save(self, items):
        cleaned = [{key: value for key, value in item.items() if key != "id"} for item in items]
        with self.path.open("w", encoding="utf-8") as file:
            json.dump(cleaned, file, ensure_ascii=False, indent=2)

    def _normalize_payload(self, data):
        keywords = data.get("keywords", [])
        if isinstance(keywords, str):
            keywords = [word.strip() for word in keywords.split(",") if word.strip()]
        return {
            "key": data.get("key") or "",
            "title": data.get("title") or "",
            "url": data.get("url") or "",
            "category": data.get("category") or "general",
            "keywords": keywords,
        }


@api_view(["GET"])
@permission_classes([IsAdminRole])
def admin_stats(request):
    return Response(
        {
            "users": User.objects.count(),
            "guides": Step.objects.count(),
            "checklists": StageTask.objects.count(),
            "universities": University.objects.count(),
            "map_points": PointOfInterest.objects.count(),
            "events": IntegrationEvent.objects.count(),
            "mentors": Profile.objects.filter(role="mentor").count(),
            "feedbacks": AssistantFeedback.objects.count(),
            "knowledge_documents": KnowledgeDocument.objects.count(),
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminRole])
def reindex_knowledge_base(request):
    try:
        call_command("ingest_kb")
    except Exception as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"detail": "Réindexation lancée avec succès."})

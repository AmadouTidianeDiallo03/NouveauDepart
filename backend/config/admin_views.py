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

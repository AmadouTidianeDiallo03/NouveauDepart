from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from guides.models import Step

from .models import IntegrationStage, StageTask, StudentStageProgress


STAGE_GUIDE_KEYWORDS = {
    "before_arrival": ["admission", "document", "caq", "permis", "logement", "budget", "départ"],
    "arrival": ["arrivée", "transport", "campus", "inscription", "banque", "téléphone", "services"],
    "after_arrival": ["réussite", "emploi", "mentor", "bibliothèque", "vie", "horaire", "intégration"],
}

STAGE_QUICK_ACTIONS = {
    "before_arrival": [
        {"label": "Voir ma checklist", "to": "/checklist"},
        {"label": "Poser une question à NordikBot", "to": "/assistant"},
        {"label": "Chercher un mentor", "to": "/mentors"},
    ],
    "arrival": [
        {"label": "Ouvrir la carte", "to": "/carte"},
        {"label": "Voir les informations du campus", "to": "/university"},
        {"label": "Poser une question à NordikBot", "to": "/assistant"},
    ],
    "after_arrival": [
        {"label": "Contacter un mentor", "to": "/mentors"},
        {"label": "Consulter les guides", "to": "/study-success"},
        {"label": "Voir mes messages", "to": "/conversations"},
    ],
}


def serialize_stage(stage):
    if not stage:
        return None
    return {
        "id": stage.id,
        "key": stage.key,
        "title": stage.title,
        "description": stage.description,
        "order": stage.order,
    }


def get_profile(user):
    try:
        return user.profile
    except Exception:
        return None


def get_current_stage(user):
    profile = get_profile(user)
    key = profile.integration_stage if profile and profile.integration_stage else "arrival"
    return IntegrationStage.objects.filter(key=key).first() or IntegrationStage.objects.order_by("order").first()


def get_progress(user, stage):
    progress, _ = StudentStageProgress.objects.get_or_create(user=user, stage=stage)
    return progress


def stage_tasks_payload(user, stage):
    progress = get_progress(user, stage)
    completed = set(progress.completed_tasks or [])
    tasks = StageTask.objects.filter(stage=stage)
    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": "complété" if task.id in completed else "à faire",
            "priority": task.priority,
            "category": task.category,
        }
        for task in tasks
    ]


def recommended_guides_payload(stage):
    keywords = STAGE_GUIDE_KEYWORDS.get(stage.key, [])
    query = Q()
    for keyword in keywords:
        query |= Q(title__icontains=keyword) | Q(description__icontains=keyword)

    steps = Step.objects.filter(query).distinct() if query else Step.objects.none()
    if not steps.exists():
        steps = Step.objects.all()

    return [
        {
            "id": step.id,
            "title": step.title,
            "category": step.get_category_display(),
            "description": step.description,
        }
        for step in steps.order_by("order")[:5]
    ]


def stage_dashboard_payload(user):
    stage = get_current_stage(user)
    if not stage:
        return {
            "current_stage": None,
            "tasks": [],
            "recommended_guides": [],
            "quick_actions": [],
        }

    return {
        "current_stage": serialize_stage(stage),
        "tasks": stage_tasks_payload(user, stage),
        "recommended_guides": recommended_guides_payload(stage),
        "quick_actions": STAGE_QUICK_ACTIONS.get(stage.key, []),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stages_list(request):
    stages = IntegrationStage.objects.prefetch_related("tasks").all()
    return Response(
        [
            {
                **serialize_stage(stage),
                "tasks_count": stage.tasks.count(),
            }
            for stage in stages
        ]
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_stage(request):
    return Response({"current_stage": serialize_stage(get_current_stage(request.user))})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def select_stage(request):
    key = request.data.get("key") or request.data.get("stage")
    stage = IntegrationStage.objects.filter(key=key).first()
    if not stage:
        return Response({"detail": "Étape inconnue."}, status=status.HTTP_400_BAD_REQUEST)

    profile = get_profile(request.user)
    if profile:
        profile.integration_stage = stage.key
        profile.save(update_fields=["integration_stage"])

    StudentStageProgress.objects.filter(user=request.user).update(selected=False)
    progress, _ = StudentStageProgress.objects.get_or_create(user=request.user, stage=stage)
    progress.selected = True
    progress.save(update_fields=["selected", "updated_at"])

    return Response(stage_dashboard_payload(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    return Response(stage_dashboard_payload(request.user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_stage_task(request, task_id):
    stage = get_current_stage(request.user)
    task = StageTask.objects.filter(id=task_id, stage=stage).first()
    if not task:
        return Response({"detail": "Tâche introuvable pour l’étape actuelle."}, status=status.HTTP_404_NOT_FOUND)

    progress = get_progress(request.user, stage)
    completed = set(progress.completed_tasks or [])
    if task.id in completed:
        completed.remove(task.id)
    else:
        completed.add(task.id)

    progress.completed_tasks = sorted(completed)
    progress.save(update_fields=["completed_tasks", "updated_at"])
    return Response(stage_dashboard_payload(request.user))

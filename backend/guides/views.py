from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Step, Task, UserTask
from .serializers import StepSerializer, StepListSerializer, TaskSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def steps_list(request):
    """GET /api/guides/steps/ – list all steps with progress counts."""
    steps = Step.objects.prefetch_related("tasks").all()
    serializer = StepListSerializer(steps, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def step_tasks(request, step_id):
    """GET /api/guides/steps/:id/tasks/ – tasks for a specific step."""
    try:
        step = Step.objects.prefetch_related("tasks").get(pk=step_id)
    except Step.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = StepSerializer(step, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_task(request, task_id):
    """POST /api/guides/tasks/:id/toggle/ – toggle task done/undone."""
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    user_task, _ = UserTask.objects.get_or_create(user=request.user, task=task)
    user_task.done = not user_task.done
    user_task.done_at = timezone.now() if user_task.done else None
    user_task.save()

    return Response({"task_id": task.id, "done": user_task.done})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def progress(request):
    """GET /api/guides/progress/ – overall completion stats."""
    total = Task.objects.count()
    done = UserTask.objects.filter(user=request.user, done=True).count()
    percentage = round((done / total) * 100) if total else 0

    steps = Step.objects.prefetch_related("tasks").all()
    by_category = []
    for step in steps:
        total_step = step.tasks.count()
        done_step = step.tasks.filter(user_tasks__user=request.user, user_tasks__done=True).count()
        by_category.append({
            "step_id": step.id,
            "title": step.title,
            "title_en": step.title_en,
            "category": step.category,
            "total": total_step,
            "done": done_step,
        })

    return Response({
        "total_tasks": total,
        "done_tasks": done,
        "percentage": percentage,
        "by_category": by_category,
    })

from django.db.models import Prefetch, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Step, Task, UserTask
from .serializers import StepSerializer, StepListSerializer, TaskSerializer


def get_user_university(user):
    try:
        return user.profile.university
    except AttributeError:
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def steps_list(request):

    university = get_user_university(request.user)
    task_filter = Q(university__isnull=True) | Q(university=university)
    
    steps = Step.objects.prefetch_related(
        Prefetch("tasks", queryset=Task.objects.filter(task_filter))
    ).all()
    
    serializer = StepListSerializer(steps, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def step_tasks(request, step_id):

    university = get_user_university(request.user)
    task_filter = Q(university__isnull=True) | Q(university=university)
    
    try:
        step = Step.objects.prefetch_related(
            Prefetch("tasks", queryset=Task.objects.filter(task_filter))
        ).get(pk=step_id)
    except Step.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = StepSerializer(step, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_task(request, task_id):

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

    university = get_user_university(request.user)
    task_filter = Q(university__isnull=True) | Q(university=university)
    
    visible_tasks = Task.objects.filter(task_filter)
    total = visible_tasks.count()
    done = UserTask.objects.filter(user=request.user, task__in=visible_tasks, done=True).count()
    percentage = round((done / total) * 100) if total else 0

    steps = Step.objects.prefetch_related(
        Prefetch("tasks", queryset=visible_tasks)
    ).all()
    
    by_category = []
    for step in steps:
        tasks_in_step = step.tasks.all() # Corrected to use the prefetched/filtered set
        total_step = tasks_in_step.count()
        done_step = UserTask.objects.filter(user=request.user, task__in=tasks_in_step, done=True).count()
        
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

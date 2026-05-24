from django.db.models import Max, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from chat.models import Conversation
from guides.models import Step, Task, UserTask
from studentlife.models import IntegrationEvent, StudentBudget
from .integration_views import stage_dashboard_payload
from .models import MentorAppointment


CATEGORY_LABELS = {
    "admin": "Administration",
    "university": "Université",
    "transport": "Transport",
    "housing": "Logement",
    "work": "Emploi",
    "lifestyle": "Vie au Québec",
}


def _user_profile(user):
    try:
        return user.profile
    except Exception:
        return None


def _visible_tasks(user, university):
    task_filter = Q(university__isnull=True)
    if university:
        task_filter |= Q(university=university)
    return Task.objects.select_related("step", "university").filter(task_filter)


def _progress_payload(user, tasks):
    total = tasks.count()
    completed = UserTask.objects.filter(user=user, task__in=tasks, done=True).count()
    percentage = round((completed / total) * 100) if total else 0
    return {
        "completed_tasks": completed,
        "total_tasks": total,
        "percentage": percentage,
    }


def _important_tasks(user, tasks):
    stage_payload = stage_dashboard_payload(user)
    stage_tasks = stage_payload.get("tasks") or []
    if stage_tasks:
        return [
            {
                "id": task["id"],
                "title": task["title"],
                "status": task["status"],
                "category": task.get("category") or "Parcours",
                "priority": task.get("priority", "moyenne"),
                "source": "stage",
            }
            for task in stage_tasks[:5]
        ]

    completed_ids = set(
        UserTask.objects.filter(user=user, task__in=tasks, done=True).values_list("task_id", flat=True)
    )
    priority_words = [
        "document",
        "admission",
        "inscription",
        "horaire",
        "transport",
        "logement",
        "mentor",
        "assurance",
    ]

    def score(task):
        text = f"{task.title} {task.description} {task.step.title}".lower()
        value = 0 if task.id not in completed_ids else 100
        value -= 10 if task.university_id else 0
        for index, word in enumerate(priority_words):
            if word in text:
                value -= 20 - index
        return (value, task.step.order, task.order, task.id)

    selected = sorted(tasks, key=score)[:5]
    return [
        {
            "id": task.id,
            "title": task.title,
            "status": "complété" if task.id in completed_ids else "à faire",
            "category": CATEGORY_LABELS.get(task.step.category, task.step.category),
        }
        for task in selected
    ]


def _recommended_guides(tasks, university):
    guide_candidates = []
    seen_steps = set()
    preferred_categories = ["admin", "university", "housing", "transport", "lifestyle"]

    for task in tasks:
        step = task.step
        if step.id in seen_steps:
            continue
        seen_steps.add(step.id)
        university_bonus = 0 if not university or task.university_id == university.id else 10
        category_bonus = preferred_categories.index(step.category) if step.category in preferred_categories else 20
        guide_candidates.append((university_bonus, category_bonus, step.order, step))

    guide_candidates.sort(key=lambda item: item[:3])
    return [
        {
            "id": step.id,
            "title": step.title,
            "category": CATEGORY_LABELS.get(step.category, step.category),
            "description": step.description,
        }
        for _, _, _, step in guide_candidates[:5]
    ]


def _mentor_messages(user):
    conversations = (
        Conversation.objects.filter(Q(user1=user) | Q(user2=user))
        .annotate(last_activity=Max("messages__created_at"))
        .select_related("user1", "user2")
        .order_by("-last_activity", "-created_at")[:3]
    )

    payload = []
    for conversation in conversations:
        other = conversation.user2 if conversation.user1_id == user.id else conversation.user1
        last_message = conversation.messages.order_by("-created_at").first()
        payload.append(
            {
                "id": conversation.id,
                "mentor_name": other.get_full_name() or other.email,
                "last_message": last_message.content if last_message else "Conversation démarrée.",
                "created_at": last_message.created_at if last_message else conversation.created_at,
            }
        )
    return payload


def _campus_info(profile, university):
    services = ["Registrariat", "Bibliothèque", "Services aux étudiants"]
    if university and "uqar" in university.name.lower():
        services = ["Registrariat", "Bibliothèque", "Services aux étudiants", "Accueil international"]

    return {
        "university": university.name if university else "",
        "campus": profile.city if profile and profile.city else university.city if university else "",
        "city": profile.city if profile and profile.city else university.city if university else "",
        "services": services,
        "website_url": university.website_url if university else "",
    }


def _upcoming_events(university):
    qs = IntegrationEvent.objects.select_related("university")
    if university:
        qs = qs.filter(university__isnull=True) | qs.filter(university=university)
    return [
        {
            "id": event.id,
            "title": event.title,
            "category": event.get_category_display(),
            "date": event.start_date,
            "location": event.location or event.campus,
        }
        for event in qs.order_by("start_date")[:3]
    ]


def _budget_payload(user):
    budget = StudentBudget.objects.filter(user=user).first()
    if not budget:
        return None
    return {
        "monthly_total": budget.monthly_total,
        "yearly_total": budget.yearly_total,
    }


def _appointments_payload(user):
    appointment = MentorAppointment.objects.filter(
        student=user,
        status__in=["pending", "accepted"],
    ).select_related("mentor").order_by("date", "start_time").first()
    if not appointment:
        return {"next": None}
    return {
        "next": {
            "id": appointment.id,
            "mentor_name": appointment.mentor.get_full_name() or appointment.mentor.email,
            "date": appointment.date,
            "start_time": appointment.start_time,
            "status": appointment.get_status_display(),
            "meeting_type": appointment.get_meeting_type_display(),
        }
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    user = request.user
    profile = _user_profile(user)
    university = profile.university if profile else None
    visible_tasks = _visible_tasks(user, university)
    stage_payload = stage_dashboard_payload(user)

    return Response(
        {
            "user": {
                "first_name": user.first_name or user.username or user.email,
                "last_name": user.last_name,
                "email": user.email,
            },
            "profile": {
                "role": profile.role if profile else "newcomer",
                "university": university.name if university else "",
                "university_id": university.id if university else None,
                "campus": profile.city if profile and profile.city else university.city if university else "",
                "city": profile.city if profile else "",
                "integration_stage": profile.integration_stage if profile else "",
            },
            "current_stage": stage_payload.get("current_stage"),
            "progress": _progress_payload(user, visible_tasks),
            "important_tasks": _important_tasks(user, list(visible_tasks)),
            "recommended_guides": stage_payload.get("recommended_guides") or _recommended_guides(visible_tasks.select_related("step"), university),
            "stage_quick_actions": stage_payload.get("quick_actions", []),
            "mentor_messages": _mentor_messages(user),
            "campus_info": _campus_info(profile, university),
            "upcoming_events": _upcoming_events(university),
            "budget": _budget_payload(user),
            "mentor_appointments": _appointments_payload(user),
        }
    )

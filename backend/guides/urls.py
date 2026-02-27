from django.urls import path
from . import views

urlpatterns = [
    path("steps/", views.steps_list, name="guides-steps"),
    path("steps/<int:step_id>/tasks/", views.step_tasks, name="guides-step-tasks"),
    path("tasks/<int:task_id>/toggle/", views.toggle_task, name="guides-toggle-task"),
    path("progress/", views.progress, name="guides-progress"),
]

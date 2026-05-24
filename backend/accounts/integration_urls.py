from django.urls import path

from . import integration_views


urlpatterns = [
    path("", integration_views.stages_list, name="integration-stages"),
    path("current/", integration_views.current_stage, name="integration-stage-current"),
    path("select/", integration_views.select_stage, name="integration-stage-select"),
    path("dashboard/", integration_views.dashboard, name="integration-stage-dashboard"),
    path("tasks/<int:task_id>/toggle/", integration_views.toggle_stage_task, name="integration-stage-task-toggle"),
]

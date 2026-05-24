from django.urls import path, include
from accounts.dashboard_views import dashboard
from accounts import mentor_views

urlpatterns = [
    path("auth/", include("accounts.urls")),
    path("admin/", include("config.admin_urls")),
    path("mentors/", mentor_views.mentors_list, name="api-mentors-list"),
    path("mentors/recommended/", mentor_views.recommended_mentors, name="api-mentors-recommended"),
    path("mentors/<int:mentor_id>/", mentor_views.mentor_detail, name="api-mentor-detail"),
    path("mentors/available/", mentor_views.available_mentors, name="api-available-mentors"),
    path("mentors/<int:mentor_id>/availability/", mentor_views.mentor_availability, name="api-mentor-availability"),
    path("mentor-appointments/", mentor_views.create_appointment, name="api-mentor-appointment-create"),
    path("mentor-appointments/my/", mentor_views.my_appointments, name="api-mentor-appointments-my"),
    path("mentor-appointments/received/", mentor_views.received_appointments, name="api-mentor-appointments-received"),
    path("mentor-appointments/<int:appointment_id>/cancel/", mentor_views.cancel_appointment, name="api-mentor-appointment-cancel"),
    path("mentor-appointments/<int:appointment_id>/accept/", mentor_views.accept_appointment, name="api-mentor-appointment-accept"),
    path("mentor-appointments/<int:appointment_id>/refuse/", mentor_views.refuse_appointment, name="api-mentor-appointment-refuse"),
    path("dashboard/", dashboard, name="student-dashboard"),
    path("integration-stages/", include("accounts.integration_urls")),
    path("", include("studentlife.urls")),
    path("universities/", include("universities.urls")),
    path("guides/", include("guides.urls")),
    path("chat/", include("chat.urls")),
    path("assistant/", include("assistant.urls")),
]

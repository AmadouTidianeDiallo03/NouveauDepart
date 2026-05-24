from django.urls import path
from . import views
from .mentor_views import (
    mentors_list,
    recommended_mentors,
    mentor_detail,
    mentor_availability,
    mentor_request,
    mentor_request_respond,
    mentee_profile_detail,
    available_mentors,
    create_appointment,
    my_appointments,
    received_appointments,
    cancel_appointment,
    accept_appointment,
    refuse_appointment,
)

urlpatterns = [
    path("register/", views.register_view, name="auth-register"),
    path("login/", views.login_view, name="auth-login"),
    path("me/", views.me_view, name="auth-me"),
    path("mentors/", mentors_list, name="mentors-list"),
    path("mentors/recommended/", recommended_mentors, name="mentors-recommended"),
    path("mentors/<int:mentor_id>/", mentor_detail, name="mentor-detail"),
    path("mentors/availability/", mentor_availability, name="mentor-availability"),
    path("mentors/<int:mentor_id>/availability/", mentor_availability, name="mentor-availability-get"),
    path("mentor-requests/", mentor_request, name="mentor-requests"),
    path("mentor-requests/<int:request_id>/respond/", mentor_request_respond, name="mentor-request-respond"),
    path("mentee-profile/<int:mentee_id>/", mentee_profile_detail, name="mentee-profile-detail"),
    path("mentors/available/", available_mentors, name="available-mentors"),
    path("mentor-appointments/", create_appointment, name="mentor-appointment-create"),
    path("mentor-appointments/my/", my_appointments, name="mentor-appointments-my"),
    path("mentor-appointments/received/", received_appointments, name="mentor-appointments-received"),
    path("mentor-appointments/<int:appointment_id>/cancel/", cancel_appointment, name="mentor-appointment-cancel"),
    path("mentor-appointments/<int:appointment_id>/accept/", accept_appointment, name="mentor-appointment-accept"),
    path("mentor-appointments/<int:appointment_id>/refuse/", refuse_appointment, name="mentor-appointment-refuse"),
]

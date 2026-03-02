from django.urls import path
from . import views
from .mentor_views import (
    mentors_list,
    mentor_detail,
    mentor_availability,
    mentor_request,
    mentor_request_respond,
)

urlpatterns = [
    path("register/", views.register_view, name="auth-register"),
    path("login/", views.login_view, name="auth-login"),
    path("me/", views.me_view, name="auth-me"),
    path("mentors/", mentors_list, name="mentors-list"),
    path("mentors/<int:mentor_id>/", mentor_detail, name="mentor-detail"),
    path("mentors/availability/", mentor_availability, name="mentor-availability"),
    path("mentors/<int:mentor_id>/availability/", mentor_availability, name="mentor-availability-get"),
    path("mentor-requests/", mentor_request, name="mentor-requests"),
    path("mentor-requests/<int:request_id>/respond/", mentor_request_respond, name="mentor-request-respond"),
]

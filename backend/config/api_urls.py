"""API URL routing – all /api/* endpoints."""
from django.urls import path, include
from accounts.mentor_views import mentors_list

urlpatterns = [
    path("auth/", include("accounts.urls")),
    path("universities/", include("universities.urls")),
    path("guides/", include("guides.urls")),
    path("chat/", include("chat.urls")),
    path("assistant/", include("assistant.urls")),
]

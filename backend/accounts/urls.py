from django.urls import path
from . import views
from .mentor_views import mentors_list

urlpatterns = [
    path("register", views.register_view, name="auth-register"),
    path("login", views.login_view, name="auth-login"),
    path("me", views.me_view, name="auth-me"),
]

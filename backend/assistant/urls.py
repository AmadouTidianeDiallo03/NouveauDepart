from django.urls import path
from . import views

urlpatterns = [
    path("chat/", views.chat_view, name="assistant-chat"),
    path("ask/", views.ask_view, name="assistant-ask"),
    path("feedback/", views.feedback_view, name="assistant-feedback"),
]

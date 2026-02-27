from django.urls import path
from . import views

urlpatterns = [
    path("conversations/", views.conversations_view, name="chat-conversations"),
    path("conversations/<int:conv_id>/messages/", views.messages_view, name="chat-messages"),
]

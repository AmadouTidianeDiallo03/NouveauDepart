from django.urls import path

from . import views


urlpatterns = [
    path("events/", views.events_list, name="events-list"),
    path("events/<int:event_id>/", views.event_detail, name="event-detail"),
    path("budget/", views.budget, name="student-budget"),
]

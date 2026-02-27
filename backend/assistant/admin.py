from django.contrib import admin
from .models import AssistantLog


@admin.register(AssistantLog)
class AssistantLogAdmin(admin.ModelAdmin):
    list_display = ["user", "question", "created_at"]
    search_fields = ["question", "user__email"]
    readonly_fields = ["user", "question", "answer", "created_at"]

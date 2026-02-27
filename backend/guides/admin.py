from django.contrib import admin
from .models import Step, Task, UserTask


@admin.register(Step)
class StepAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "order"]
    list_filter = ["category"]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "step", "order", "university"]
    list_filter = ["step__category"]
    search_fields = ["title"]


@admin.register(UserTask)
class UserTaskAdmin(admin.ModelAdmin):
    list_display = ["user", "task", "done", "done_at"]
    list_filter = ["done"]

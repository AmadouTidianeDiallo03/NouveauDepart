from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "role", "university", "city", "language", "onboarding_done"]
    list_filter = ["role", "language"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]

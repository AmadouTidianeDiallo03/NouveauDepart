from django.contrib import admin
from .models import AssistantFeedback, AssistantLog, KnowledgeChunk, KnowledgeDocument


@admin.register(AssistantLog)
class AssistantLogAdmin(admin.ModelAdmin):
    list_display = ["user", "question", "confidence", "created_at"]
    search_fields = ["question", "answer", "user__email"]
    list_filter = ["confidence", "created_at"]
    readonly_fields = ["user", "question", "answer", "sources", "confidence", "created_at"]


@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display = ["title", "university", "campus", "category", "language", "indexed_at"]
    search_fields = ["title", "description", "path", "university", "campus"]
    list_filter = ["university", "campus", "category", "language"]


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ["title", "section", "document", "chunk_index", "token_count"]
    search_fields = ["title", "section", "content", "keywords"]
    list_filter = ["document__university", "document__category"]


@admin.register(AssistantFeedback)
class AssistantFeedbackAdmin(admin.ModelAdmin):
    list_display = ["user", "rating", "created_at"]
    search_fields = ["user__email", "question", "answer", "comment"]
    list_filter = ["rating", "created_at"]

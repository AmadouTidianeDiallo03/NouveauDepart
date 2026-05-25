from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import admin_views


router = DefaultRouter()
router.register("users", admin_views.AdminUserViewSet, basename="admin-users")
router.register("guides", admin_views.AdminGuideViewSet, basename="admin-guides")
router.register("checklists", admin_views.AdminChecklistViewSet, basename="admin-checklists")
router.register("universities", admin_views.AdminUniversityViewSet, basename="admin-universities")
router.register("map-points", admin_views.AdminMapPointViewSet, basename="admin-map-points")
router.register("events", admin_views.AdminEventViewSet, basename="admin-events")
router.register("knowledge-base", admin_views.AdminKnowledgeViewSet, basename="admin-knowledge-base")
router.register("feedbacks", admin_views.AdminFeedbackViewSet, basename="admin-feedbacks")
router.register("mentors", admin_views.AdminMentorViewSet, basename="admin-mentors")
router.register("uqar-sources", admin_views.AdminUQARSourceViewSet, basename="admin-uqar-sources")

urlpatterns = [
    path("stats/", admin_views.admin_stats, name="admin-stats"),
    path("knowledge-base/reindex/", admin_views.reindex_knowledge_base, name="admin-kb-reindex"),
    path("", include(router.urls)),
]

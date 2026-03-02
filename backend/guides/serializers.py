from rest_framework import serializers
from .models import Step, Task, UserTask


class TaskSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "title", "title_en", "description", "description_en", 
            "how_to", "how_to_en", "tips", "tips_en", "locations", "locations_en",
            "order", "university", "done"
        ]

    def get_done(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.user_tasks.filter(user=request.user, done=True).exists()
        return False


class StepSerializer(serializers.ModelSerializer):
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Step
        fields = ["id", "title", "title_en", "category", "order", "description", "tasks"]

    def get_tasks(self, obj):
        request = self.context.get("request")
        # In Django, prefetched results are in the internal '_prefetched_objects_cache'
        # Calling .all() on the related manager uses this cache if it exists.
        return TaskSerializer(obj.tasks.all(), many=True, context={"request": request}).data

class StepListSerializer(serializers.ModelSerializer):
    total_tasks = serializers.SerializerMethodField()
    done_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Step
        fields = ["id", "title", "title_en", "category", "order", "total_tasks", "done_tasks"]

    def get_total_tasks(self, obj):
        # obj.tasks.all() will return the prefetched (filtered) tasks
        return len(obj.tasks.all())

    def get_done_tasks(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            # Count done tasks from the prefetched list to stay consistent with filtering
            return sum(1 for t in obj.tasks.all() if t.user_tasks.filter(user=request.user, done=True).exists())
        return 0


class UserTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTask
        fields = ["id", "task", "done", "done_at"]

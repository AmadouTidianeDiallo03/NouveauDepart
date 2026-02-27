from rest_framework import serializers
from .models import Step, Task, UserTask


class TaskSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "title", "title_en", "description", "description_en", "order", "university", "done"]

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
        return TaskSerializer(obj.tasks.all(), many=True, context={"request": request}).data


class StepListSerializer(serializers.ModelSerializer):
    total_tasks = serializers.SerializerMethodField()
    done_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Step
        fields = ["id", "title", "title_en", "category", "order", "total_tasks", "done_tasks"]

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_done_tasks(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.tasks.filter(user_tasks__user=request.user, user_tasks__done=True).count()
        return 0


class UserTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTask
        fields = ["id", "task", "done", "done_at"]

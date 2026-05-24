from rest_framework import serializers

from .models import IntegrationEvent, StudentBudget


class IntegrationEventSerializer(serializers.ModelSerializer):
    university_name = serializers.CharField(source="university.name", read_only=True)
    category_label = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = IntegrationEvent
        fields = [
            "id", "title", "description", "category", "category_label",
            "university", "university_name", "campus", "location",
            "start_date", "end_date", "is_online", "meeting_link",
            "created_at", "updated_at",
        ]


class StudentBudgetSerializer(serializers.ModelSerializer):
    largest_category = serializers.SerializerMethodField()
    advice = serializers.SerializerMethodField()

    class Meta:
        model = StudentBudget
        fields = [
            "id", "housing", "transport", "food", "phone", "insurance",
            "tuition", "leisure", "other", "monthly_total", "yearly_total",
            "largest_category", "advice", "created_at", "updated_at",
        ]
        read_only_fields = ["monthly_total", "yearly_total", "created_at", "updated_at"]

    def _amounts(self, obj):
        return {
            "logement": obj.housing,
            "transport": obj.transport,
            "alimentation": obj.food,
            "téléphone": obj.phone,
            "assurances": obj.insurance,
            "frais universitaires": obj.tuition,
            "loisirs": obj.leisure,
            "autres dépenses": obj.other,
        }

    def get_largest_category(self, obj):
        amounts = self._amounts(obj)
        label, amount = max(amounts.items(), key=lambda item: item[1])
        return {"label": label, "amount": amount}

    def get_advice(self, obj):
        largest = self.get_largest_category(obj)["label"]
        if largest == "logement":
            return "Compare les options de logement et vérifie les coûts inclus comme chauffage, internet ou électricité."
        if largest == "transport":
            return "Pense à vérifier les tarifs étudiants et les options de transport disponibles dans ta ville."
        if largest == "frais universitaires":
            return "Planifie les paiements universitaires à l’avance et vérifie les dates limites officielles."
        return "Garde une petite marge pour les imprévus des premières semaines."

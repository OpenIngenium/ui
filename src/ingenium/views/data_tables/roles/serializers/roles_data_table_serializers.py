from django.template.loader import render_to_string
from rest_framework import serializers

from ingenium.views.ingenium_models.role_model import RoleModel


class RolesBaseDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    id = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    actions = serializers.SerializerMethodField()

    class Meta:
        model = RoleModel
        fields = (
            'id', 'name', 'description', 'actions',
        )

    def get_actions(self, role):
        return render_to_string('ui/data_tables/roles/role_actions.html', {
            'role': role,
        })

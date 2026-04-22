from django.template.loader import render_to_string
from rest_framework import serializers

from ingenium.views.ingenium_models.user_group_model import UserGroupModel


class UserGroupBaseDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    name = serializers.CharField()
    role = serializers.SerializerMethodField()
    scope = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    create_date = serializers.SerializerMethodField()
    update_date = serializers.SerializerMethodField()

    class Meta:
        model = UserGroupModel
        fields = (
            'name', 'role', 'scope', 'user', 'create_date', 'update_date',
        )

    def get_role(self, group):
        return render_to_string('ui/data_tables/groups/roles_column.html', {
            'roles': group.get_roles(),
        })

    def get_scope(self, group):
        return render_to_string('ui/data_tables/groups/scopes_column.html', {
            'scopes': group.get_scopes(),
        })

    def get_user(self, group):
        return render_to_string('ui/data_tables/groups/users_column.html', {
            'group': group,
        })

    def get_create_date(self, group):
        return group.get_create_date()

    def get_update_date(self, group):
        return group.get_updated_date()

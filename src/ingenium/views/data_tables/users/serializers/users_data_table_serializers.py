from django.template.loader import render_to_string
from rest_framework import serializers

from ingenium.views.ingenium_models.user_model import UserModel


class UsersBaseDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    display_name = serializers.CharField()
    username = serializers.CharField()
    logged_in = serializers.SerializerMethodField()
    scope = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    group = serializers.SerializerMethodField()
    create_date = serializers.SerializerMethodField()
    update_date = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = (
            'display_name', 'username', 'logged_in', 'scope', 'role', 'group', 'create_date', 'update_date',
        )

    def get_logged_in(self, user):
        return user.get_logged_in()

    def get_scope(self, user):
        return render_to_string('ui/data_tables/groups/scopes_column.html', {
            'scopes': user.get_scopes(),
        })

    def get_role(self, user):
        return render_to_string('ui/data_tables/groups/roles_column.html', {
            'roles': user.get_roles(),
        })

    def get_group(self, user):
        return render_to_string('ui/data_tables/users/groups_column.html', {
            'groups': user.get_groups(),
        })

    def get_create_date(self, user):
        return user.get_create_date()

    def get_update_date(self, user):
        return user.get_updated_date()

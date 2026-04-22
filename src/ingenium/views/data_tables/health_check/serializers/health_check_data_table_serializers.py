from django.template.loader import render_to_string
from rest_framework import serializers

from ingenium.views.ingenium_models.health_check_model import HealthCheckModel


class HealthCheckBaseDataTableSerializer(serializers.Serializer):

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    name = serializers.CharField()
    address = serializers.SerializerMethodField()
    status = serializers.CharField()
    color_status = serializers.SerializerMethodField()

    class Meta:
        model = HealthCheckModel
        fields = (
            'name', 'address', 'status', 'color_status',
        )

    def get_address(self, obj):
        return render_to_string('ui/data_tables/address/address.html', {
            'user_is_admin': self.context.user.is_admin(),
            'address': obj.address
        })

    def get_color_status(self, health):
        return render_to_string('ui/data_tables/health_check/color_status.html', {
            'status': health.status,
        })

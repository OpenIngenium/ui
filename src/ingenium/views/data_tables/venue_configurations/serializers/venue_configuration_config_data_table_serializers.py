from rest_framework import serializers
from time import strftime, strptime
import dateutil.parser
from django.template.loader import render_to_string

from ingenium.views.ingenium_models.venue_config_element_model import VenueConfigElementModel
from ingenium.views.ingenium_models.venue_configuration_config_model import VenueConfigurationConfigModel


class VenueConfigurationConfigDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    elem_name = serializers.CharField()
    description = serializers.CharField()
    type_field = serializers.SerializerMethodField()
    status = serializers.CharField()
    serial_number = serializers.CharField()
    notes = serializers.CharField()

    class Meta:
        model = VenueConfigurationConfigModel
        fields = (
            'elem_name', 'description', 'type_field', 'status', 'serial_number', 'notes'
        )

    def get_type_field(self, element):
        return element.get_type()

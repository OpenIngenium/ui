from rest_framework import serializers
from time import strftime, strptime
import dateutil.parser
from django.template.loader import render_to_string

from ingenium.views.ingenium_models.venue_configuration_history_model import VenueConfigurationHistoryModel


class VenueConfigurationHistoryDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    toggle = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    elem_name = serializers.CharField()

    class Meta:
        model = VenueConfigurationHistoryModel
        fields = (
            'toggle', 'time', 'elem_name'
        )

    def get_time(self, model):
        d = dateutil.parser.parse(model.time)
        return d.strftime("%b. %d, %Y, %I:%M %p")

    def get_toggle(self, model):
        return render_to_string('ui/data_tables/venue_configurations/vc_history_child_row.html', {
            'changes': model.get_changes()
        })

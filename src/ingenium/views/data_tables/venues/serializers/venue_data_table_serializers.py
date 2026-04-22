from django.template.loader import render_to_string
from rest_framework import serializers

from ingenium.views.ingenium_models.venue_model import VenueModel


class VenueBaseDataTableSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    name = serializers.SerializerMethodField()
    description = serializers.CharField()
    # ampcs_address = serializers.CharField()
    # sse_address = serializers.CharField()
    # location = serializers.CharField()
    type = serializers.CharField()
    status = serializers.SerializerMethodField()
    actions = serializers.SerializerMethodField()

    class Meta:
        model = VenueModel
        fields = (
            'name', 'description', 'type', 'status'
        )

    def get_actions(self, venue):
        return render_to_string("ui/data_tables/venues/venue_actions.html", {
            'venue': venue,
        })

    def get_status(self, venue):
        return venue.get_friendly_status()

    def get_name(self, venue):
        return render_to_string("ui/data_tables/venues/venue_name.html", {
            'venue': venue,
        })


class VenueExportDataTableSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField()
    ampcs_address = serializers.CharField()
    sse_address = serializers.CharField()
    location = serializers.CharField()
    type = serializers.CharField()

    class Meta:
        model = VenueModel
        fields = (
            'name', 'description', 'ampcs_address', 'sse_address', 'location', 'type',
        )

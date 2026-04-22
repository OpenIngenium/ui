from django.shortcuts import render

from ingenium.views.controllers.venue_configuration_controller import get_venue_configuration_config_by_id
from ingenium.views.controllers.venue_controller import get_all_venues, get_venue_by_id
from ingenium.views.data_tables.venue_configurations.venue_configuration_history_data_table import \
    VenueConfigurationHistoryDataTable
from ingenium.views.ingenium_models.venue_config_element_model import VenueConfigElementModel


def venue_configuration_page(request, venue_type, venue_id):
    venue_count, venues = get_all_venues(request, venue_type=venue_type)
    total, venue_config_elements = get_venue_configuration_config_by_id(request, venue_id=venue_id)
    venue = get_venue_by_id(request, venue_id)

    return render(request, 'ui/pages/venue_configuration/venue_configuration.html', {
        'venue_type': venue_type,
        'venue_id': venue_id,
        'venue_name': venue.get_name(),
        'venues': venues,
        'elements': venue_config_elements,
        'element_types': VenueConfigElementModel.TYPES,
        'statuses': VenueConfigElementModel.STATUSES
    })


def venue_configuration_history_page(request, venue_type, venue_id):
    venue_count, venues = get_all_venues(request, venue_type=venue_type)
    venue = get_venue_by_id(request, venue_id)

    return render(request, 'ui/pages/venue_configuration/venue_configuration_history.html', {
        'venue_type': venue_type,
        'venue_id': venue_id,
        'venues': venues,
        'venue_name': venue.get_name(),
        'data_table': VenueConfigurationHistoryDataTable(request, additional_forms='#async_venue_id'),
    })


def venue_configuration_index_page(request, venue_type):
    venue_count, venues = get_all_venues(request, venue_type=venue_type)
    return render(request, 'ui/pages/venue_configuration/venue_configuration_index.html', {
        'venue_type': venue_type,
        'venues': venues,
    })

from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.controllers.venue_configuration_controller import get_venue_configuration_config_by_id
from ingenium.views.data_tables.venue_configurations.columns.venue_configuration_config_data_table_columns import \
    VenueConfigurationConfigColumns
from ingenium.views.data_tables.venue_configurations.filters.venue_configurations_data_table_filters import \
    VenueConfigurationsDataTableFilters
from ingenium.views.data_tables.venue_configurations.serializers.venue_configuration_config_data_table_serializers \
    import VenueConfigurationConfigDataTableSerializer


class VenueConfigurationConfigDataTable(DataTableBase):
    table_name = "venue_configuration_config_table"

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="Venue Configuration",
        table_icon_class="glyphicon glyphicon-wrench",
        table_empty_table_label="This venue has no configuration."
    )

    column_controller = DataTableColumnController(
        columns=[
            VenueConfigurationConfigColumns.ELEMENT,
            VenueConfigurationConfigColumns.DESCRIPTION,
            VenueConfigurationConfigColumns.TYPE,
            VenueConfigurationConfigColumns.STATUS,
            VenueConfigurationConfigColumns.SERIAL,
            VenueConfigurationConfigColumns.NOTES
        ],
    )

    filters = (
        VenueConfigurationsDataTableFilters.NAME_SEARCH,
    )

    def filter_and_order_queryset(self, queryset):
        """
        Override the Default behavior since we don't want to run the filter and order on Django Models
        :param queryset:
        :return:
        """
        return queryset

    def paginate_queryset(self, queryset):
        return queryset

    def query(self):
        """
        Query VENUE API for all venues
        :return:
        """

        self.__retrieve_data_table_parameters__()

        # Sorting
        order = self.request.POST.get('order[0][dir]', None)

        if order:
            order = order.upper()

        # Filters
        elem_name = string_from_request(self.request.POST, 'filter_name_search', None)

        try:
            venue_id = self.kwargs.get('venue_id', None)

            total, results = get_venue_configuration_config_by_id(request=self.request,
                                                                  venue_id=venue_id,
                                                                  limit=self.pagination_display_delta,
                                                                  offset=self.start_index,
                                                                  sort=order,
                                                                  elem_name=elem_name,
                                                                  )
            self.__total_count_cache__ = total
        except Exception as e:
            self.__total_count_cache__ = 0
            results = []

        return results

    def filter_count(self):
        return self.total_count()

    def total_count(self):
        return self.__total_count_cache__

    def serializer(self):
        return VenueConfigurationConfigDataTableSerializer

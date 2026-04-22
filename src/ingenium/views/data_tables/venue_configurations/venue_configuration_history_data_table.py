from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.columns.data_table_column_order import DataTableColumnOrder
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData

from ingenium.views.controllers.venue_configuration_controller import get_venue_configuration_history_by_id
from ingenium.views.data_tables.venue_configurations.columns.venue_configuration_history_data_table_columns import VenueConfigurationHistoryColumns
from ingenium.views.data_tables.venue_configurations.serializers.venue_configuration_history_data_table_serializers import VenueConfigurationHistoryDataTableSerializer


class VenueConfigurationHistoryDataTable(DataTableBase):
    table_name = "venue_configuration_history_table"

    metadata = DataTableMetaData(
        table_title_class=None,
        table_title=None,
        table_icon_class=None,
        table_empty_table_label="This venue has no history."
    )

    column_controller = DataTableColumnController(
        columns=[
            VenueConfigurationHistoryColumns.TOGGLE,
            VenueConfigurationHistoryColumns.TIME,
            VenueConfigurationHistoryColumns.ELEMENT,
        ],
        initial_order_by=[DataTableColumnOrder(VenueConfigurationHistoryColumns.TIME, DataTableColumnOrder.DESCENDING)]
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
        order = self.request.POST.get('order[0][dir]', None)

        if order:
            order = order.upper()
        try:
            venue_id = self.request.POST.get('venue_id')
            total, results = get_venue_configuration_history_by_id(
                request=self.request,
                venue_id=venue_id,
                limit=self.pagination_display_delta,
                offset=self.start_index,
                sort=order
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
        return VenueConfigurationHistoryDataTableSerializer

from django.template.loader import render_to_string
from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData
from django_data_tables.view.exporters.data_table_exporter import DataTableExporter
from django_data_tables.view.exporters.field_sets.export_field_set_base import BasicExportFieldSet

from ingenium.views.controllers.venue_controller import get_all_venues
from ingenium.views.data_tables.venues.columns.venues_data_table_columns import VenueColumns
from ingenium.views.data_tables.venues.serializers.venue_data_table_serializers import VenueBaseDataTableSerializer, \
    VenueExportDataTableSerializer


class ManageVenuesDataTable(DataTableBase):
    table_name = "manage_venues_table"
    filters = (
    )

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="Manage Venues",
        table_icon_class="glyphicon glyphicon-oil",
        table_empty_table_label="There are no Venues setup"
    )

    column_controller = DataTableColumnController(
        columns=[
            VenueColumns.NAME,
            VenueColumns.DESCRIPTION,
            VenueColumns.TYPE,
            VenueColumns.STATUS,
            VenueColumns.ACTIONS,
        ],
        # initial_order_by=[DataTableColumnOrder(StateColumns.ID, DataTableColumnOrder.ASCENDING)]
    )

    def filter_and_order_queryset(self, queryset):
        """
        Override the Default behavior since we don't want to run the filter and order on Django Models
        :param queryset: 
        :return: 
        """
        return queryset

    def additional_action_buttons_html(self):
        return render_to_string("ui/data_tables/venues/venue_data_table_buttons.html", {

        })

    def query(self):
        self.__retrieve_data_table_parameters__()

        # Sorting
        order = self.request.POST.get('order[0][dir]', None)

        if order:
            order = order.upper()

        try:
            total, results = get_all_venues(request=self.request,
                                            limit=self.pagination_display_delta,
                                            offset=self.start_index,
                                            sort=order,
                                            )

            self.__total_count_cache__ = total

        except Exception:
            self.__total_count_cache__ = 0
            results = []

        return results

    def filter_count(self):
        return self.total_count()

    def paginate_queryset(self, queryset):
        return queryset

    def total_count(self):
        if self.__total_count_cache__ is None:
            self.get_query()

        return self.__total_count_cache__

    def serializer(self):
        return VenueBaseDataTableSerializer

    exporter = DataTableExporter(
        export_field_sets=BasicExportFieldSet(VenueExportDataTableSerializer, file_name="VenueExport"),
    )

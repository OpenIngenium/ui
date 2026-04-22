from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData

from ingenium.views.controllers.health_check_controller import get_all_health_check
from ingenium.views.data_tables.health_check.columns.health_check_data_table_columns import HealthCheckColumns
from ingenium.views.data_tables.health_check.serializers.health_check_data_table_serializers import \
    HealthCheckBaseDataTableSerializer


class HealthCheckDataTable(DataTableBase):
    table_name = "health_check_table"

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="Health Check",
        table_icon_class="glyphicon glyphicon-heart",
    )

    column_controller = DataTableColumnController(
        columns=[
            HealthCheckColumns.NAME,
            HealthCheckColumns.ADDRESS,
            HealthCheckColumns.STATUS,
            HealthCheckColumns.COLOR_STATUS,
        ],
    )

    def filter_and_order_queryset(self, queryset):
        """
        Override the Default behavior since we don't want to run the filter and order on Django Models
        :param queryset: 
        :return: 
        """
        return queryset

    def query(self):
        results = get_all_health_check(self.request)
        self.__total_count_cache__ = len(results)
        return results

    def filter_count(self):
        return self.total_count()

    def total_count(self):
        if self.__total_count_cache__ is None:
            self.get_query()

        return self.__total_count_cache__

    def serializer(self):
        return HealthCheckBaseDataTableSerializer

from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class HealthCheckColumns:
    def __init__(self):
        pass

    NAME = DataTableColumn(
        column_name="Name",
        serializer_field="name",
    )

    ADDRESS = DataTableColumn(
        column_name="Address",
        serializer_field="address",
        column_class="col-sm-4"
    )

    STATUS = DataTableColumn(
        column_name="Status",
        serializer_field="status",
        column_class="col-sm-2"
    )

    COLOR_STATUS = DataTableColumn(
        column_name="",
        serializer_field="color_status",
        column_class="col-sm-2"
    )

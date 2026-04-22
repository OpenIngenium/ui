from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class VenueConfigurationHistoryColumns:
    def __init__(self):
        pass

    TOGGLE = DataTableColumn(
        column_name="   ",
        serializer_field="toggle",
    )

    TIME = DataTableColumn(
        column_name="When",
        serializer_field="time",
        order_by="time",
        column_class="col-md-6"
    )

    ELEMENT = DataTableColumn(
        column_name="Element",
        serializer_field="elem_name",
        column_class="col-md-6"
    )

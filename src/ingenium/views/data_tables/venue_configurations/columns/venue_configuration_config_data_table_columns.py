from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class VenueConfigurationConfigColumns:
    def __init__(self):
        pass

    ELEMENT = DataTableColumn(
        column_name="Element",
        serializer_field="elem_name",
        order_by="asc"
    )

    DESCRIPTION = DataTableColumn(
        column_name="Description",
        serializer_field="description",
    )

    TYPE = DataTableColumn(
        column_name="Type",
        serializer_field="type_field",
    )

    STATUS = DataTableColumn(
        column_name="Status",
        serializer_field="status",
    )

    SERIAL = DataTableColumn(
        column_name="Serial",
        serializer_field="serial_number",
    )

    NOTES = DataTableColumn(
        column_name="Notes",
        serializer_field="notes",
    )

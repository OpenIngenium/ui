from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class VenueColumns:
    def __init__(self):
        pass

    ID = DataTableColumn(
        column_name="Venue Id",
        serializer_field="venue_id",
        # order_by="id"
    )

    NAME = DataTableColumn(
        column_name="Name",
        serializer_field="name",
        order_by="name"
    )

    DESCRIPTION = DataTableColumn(
        column_name="Description",
        serializer_field="description",
    )

    AMPCS_ADDRESS = DataTableColumn(
        column_name="AMPCS Address",
        serializer_field="ampcs_address",
    )

    SSE_ADDRESS = DataTableColumn(
        column_name="SSE Address",
        serializer_field="sse_address",
    )

    LOCATION = DataTableColumn(
        column_name="Location",
        serializer_field="location",
    )

    TYPE = DataTableColumn(
        column_name="Type",
        serializer_field="type",
    )

    STATUS = DataTableColumn(
        column_name="Status",
        serializer_field="status",
    )

    ACTIONS = DataTableColumn(
        column_name="Actions",
        serializer_field="actions",
    )

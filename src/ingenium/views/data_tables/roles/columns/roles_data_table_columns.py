from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class RoleColumns:
    def __init__(self):
        pass

    ID = DataTableColumn(
        column_name="#",
        serializer_field="id",
        column_class="col-sm-2"
    )

    NAME = DataTableColumn(
        column_name="Name",
        serializer_field="name",
    )

    DESCRIPTION = DataTableColumn(
        column_name="Description",
        serializer_field="description",
    )

    ACTIONS = DataTableColumn(
        column_name="Actions",
        serializer_field="actions",
        column_class="col-sm-2"
    )

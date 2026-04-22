from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class UserGroupColumns:
    def __init__(self):
        pass

    ID = DataTableColumn(
        column_name="Id",
        serializer_field="id",
        column_class="col-sm-2"
    )

    NAME = DataTableColumn(
        column_name="Name",
        serializer_field="name",
        order_by='order',
    )

    ROLE = DataTableColumn(
        column_name="Role(s)",
        serializer_field="role",
    )

    SCOPE = DataTableColumn(
        column_name="Scope(s)",
        serializer_field="scope",
    )

    USER = DataTableColumn(
        column_name="User(s)",
        serializer_field="user",
    )

    CREATE_DATE = DataTableColumn(
        column_name="Created At",
        serializer_field="create_date",
    )

    UPDATE_DATE = DataTableColumn(
        column_name="Updated At",
        serializer_field="update_date",
    )

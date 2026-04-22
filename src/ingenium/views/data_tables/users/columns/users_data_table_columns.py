from django_data_tables.view.data_table.columns.data_table_column import DataTableColumn


class UserColumns:
    def __init__(self):
        pass

    DISPLAY_NAME = DataTableColumn(
        column_name="Display Name",
        serializer_field="display_name",
    )

    USERNAME = DataTableColumn(
        column_name="Username",
        serializer_field="username",
        column_class="col-sm-2",
        order_by='order',
    )

    LOGGED_IN = DataTableColumn(
        column_name="Logged In",
        serializer_field="logged_in",
        column_class="col-sm-1"
    )

    SCOPES = DataTableColumn(
        column_name="Scope(s)",
        serializer_field="scope",
    )

    ROLES = DataTableColumn(
        column_name="Role(s)",
        serializer_field="role",
    )

    GROUPS = DataTableColumn(
        column_name="Group(s)",
        serializer_field="group",
    )

    CREATE_DATE = DataTableColumn(
        column_name="Created At",
        serializer_field="create_date",
    )

    UPDATE_DATE = DataTableColumn(
        column_name="Updated At",
        serializer_field="update_date",
    )

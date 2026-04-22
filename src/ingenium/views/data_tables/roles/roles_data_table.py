from django.template.loader import render_to_string
from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.controllers.role_controller import get_all_roles
from ingenium.views.data_tables.roles.columns.roles_data_table_columns import RoleColumns
from ingenium.views.data_tables.roles.filters.roles_data_table_filters import UsersDataTableFilters
from ingenium.views.data_tables.roles.serializers.roles_data_table_serializers import RolesBaseDataTableSerializer


class RolesDataTable(DataTableBase):
    table_name = "manage_roles_table"

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="Manage Roles",
        table_icon_class="glyphicon glyphicon-eye-open",
        table_empty_table_label="There are no Roles in the system"
    )

    column_controller = DataTableColumnController(
        columns=[
            RoleColumns.ID,
            RoleColumns.NAME,
            RoleColumns.DESCRIPTION,
            RoleColumns.ACTIONS,
        ],
    )

    filters = (
        UsersDataTableFilters.NAME_SEARCH,
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
        """
        Query AUTH API for all users
        :return: 
        """
        filter_name_search = string_from_request(self.request.POST, 'filter_name_search', None)

        return get_all_roles(self.request,
                             filter_name_search=filter_name_search,
                             )

    def additional_action_buttons_html(self):
        return render_to_string('ui/data_tables/roles/roles_additional_buttons.html', {

        })

    def filter_count(self):
        return self.total_count()

    def total_count(self):
        return len(self.get_query())

    def serializer(self):
        return RolesBaseDataTableSerializer

from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.controllers.user_controller import get_all_users
from ingenium.views.data_tables.users.columns.users_data_table_columns import UserColumns
from ingenium.views.data_tables.users.filters.users_data_table_filters import UserDataTableFilters
from ingenium.views.data_tables.users.serializers.users_data_table_serializers import UsersBaseDataTableSerializer


class UsersDataTable(DataTableBase):
    table_name = "manage_users_table"

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="Manage Users",
        table_icon_class="glyphicon glyphicon-user",
        table_empty_table_label="There are no Users in the system"
    )

    column_controller = DataTableColumnController(
        columns=[
            UserColumns.USERNAME,
            UserColumns.DISPLAY_NAME,
            UserColumns.LOGGED_IN,
            UserColumns.SCOPES,
            UserColumns.ROLES,
            UserColumns.GROUPS,
            UserColumns.CREATE_DATE,
            UserColumns.UPDATE_DATE,
        ],
    )

    filters = (
        UserDataTableFilters.LOGGED_IN,
        UserDataTableFilters.ROLE_SEARCH,
        UserDataTableFilters.SCOPE_SEARCH,
        UserDataTableFilters.GROUP_SEARCH,
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
        # This is a bit of a hack and eventually i will rework the base datatable to allow for custom OrderBy Handlers
        self.__retrieve_data_table_parameters__()

        # Sorting
        order = self.request.POST.get('order[0][dir]', None)

        # Filters
        logged_in_filter = string_from_request(self.request.POST, 'filter_logged_in', None)
        role_search_filter = string_from_request(self.request.POST, 'filter_role_search', None)
        scope_search_filter = string_from_request(self.request.POST, 'filter_scope_search', None)
        filter_group_search = string_from_request(self.request.POST, 'filter_group_search', None)

        try:
            total, results = get_all_users(
                request=self.request,
                limit=self.pagination_display_delta,
                offset=self.start_index,
                order=order,
                logged_in_filter=logged_in_filter,
                role_search_filter=role_search_filter,
                scope_search_filter=scope_search_filter,
                filter_group_search=filter_group_search,
            )

            self.__total_count_cache__ = total
        except Exception:
            self.__total_count_cache__ = 0
            results = []

        return results

    def filter_count(self):
        return self.total_count()

    def total_count(self):
        if self.__total_count_cache__ is None:
            self.get_query()

        return self.__total_count_cache__

    def serializer(self):
        return UsersBaseDataTableSerializer

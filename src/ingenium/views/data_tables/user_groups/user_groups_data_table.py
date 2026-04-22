from django_data_tables.view.data_table.columns.data_table_column_controller import DataTableColumnController
from django_data_tables.view.data_table.data_table import DataTableBase, DataTableMetaData
from django_up_tools.views.get_param_from_request import string_from_request

from ingenium.views.controllers.user_group_controller import get_all_user_groups
from ingenium.views.data_tables.user_groups.columns.user_groups_data_table_columns import UserGroupColumns
from ingenium.views.data_tables.user_groups.filters.groups_data_table_filters import GroupDataTableFilters
from ingenium.views.data_tables.user_groups.serializers.user_groups_data_table_serializers import \
    UserGroupBaseDataTableSerializer


class UserGroupsDataTable(DataTableBase):
    table_name = "manage_user_groups_table"

    metadata = DataTableMetaData(
        table_title_class="h2",
        table_title="View User Groups",
        table_icon_class="glyphicon glyphicon-folder-close",
        table_empty_table_label="There are no User groups"
    )

    column_controller = DataTableColumnController(
        columns=[
            UserGroupColumns.NAME,
            UserGroupColumns.ROLE,
            UserGroupColumns.SCOPE,
            UserGroupColumns.USER,
            UserGroupColumns.CREATE_DATE,
            UserGroupColumns.UPDATE_DATE,
        ],
    )

    filters = (
        GroupDataTableFilters.GROUP_SEARCH,
        GroupDataTableFilters.ROLE_SEARCH,
        GroupDataTableFilters.SCOPE_SEARCH,
        GroupDataTableFilters.USER_SEARCH,
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
        Query AUTH API for all user Groups
        :return: 
        """
        # This is a bit of a hack and eventually i will rework the base datatable to allow for custom OrderBy Handlers
        self.__retrieve_data_table_parameters__()

        # Sorting
        order = self.request.POST.get('order[0][dir]', None)

        # Filters
        role_search_filter = string_from_request(self.request.POST, 'filter_role_search', None)
        scope_search_filter = string_from_request(self.request.POST, 'filter_scope_search', None)
        filter_user_search = string_from_request(self.request.POST, 'filter_user_search', None)
        filter_group_search = string_from_request(self.request.POST, 'filter_group_search', None)

        try:
            total, results = get_all_user_groups(
                request=self.request,
                limit=self.pagination_display_delta,
                offset=self.start_index,
                order=order,
                token=self.user.get_token(),
                role_search_filter=role_search_filter,
                scope_search_filter=scope_search_filter,
                filter_user_search=filter_user_search,
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
        return UserGroupBaseDataTableSerializer

from django_data_tables.view.filters.filters.data_table_filters import SearchFilter


class UsersDataTableFilters:
    def __init__(self):
        pass

    NAME_SEARCH = SearchFilter(field_label="Role Name",
                               model_attribute="name_search",
                               active_filter_label="Role Name",
                               filter_method=None,
                               url_parameter_name="role_name"
                               )

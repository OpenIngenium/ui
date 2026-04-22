from django_data_tables.view.filters.filters.data_table_filters import SearchFilter


class GroupDataTableFilters:
    def __init__(self):
        pass

    GROUP_SEARCH = SearchFilter(field_label="Group",
                                model_attribute="group_search",
                                active_filter_label="Group",
                                filter_method=None,
                                url_parameter_name="group_name"
                                )

    ROLE_SEARCH = SearchFilter(field_label="Role",
                               model_attribute="role_search",
                               active_filter_label="Role",
                               filter_method=None
                               )

    SCOPE_SEARCH = SearchFilter(field_label="Scope",
                                model_attribute="scope_search",
                                active_filter_label="Scope",
                                filter_method=None
                                )

    USER_SEARCH = SearchFilter(field_label="User",
                               model_attribute="user_search",
                               active_filter_label="User",
                               filter_method=None
                               )

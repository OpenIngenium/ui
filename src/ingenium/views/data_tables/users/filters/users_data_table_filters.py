from django_data_tables.view.filters.filters.data_table_filters import SelectionFilter, SearchFilter

LOGGED_IN_CHOICES = (
    ("Yes", "Yes"),
    ("No", "No"),
)


class UserDataTableFilters:
    def __init__(self):
        pass

    LOGGED_IN = SelectionFilter(choices=LOGGED_IN_CHOICES,
                                field_label="Logged In",
                                active_filter_label="Logged In",
                                empty_status="Any",
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

    GROUP_SEARCH = SearchFilter(field_label="Group",
                                model_attribute="group_search",
                                active_filter_label="Group",
                                filter_method=None,
                                url_parameter_name="group_name"
                                )

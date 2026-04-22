from django_data_tables.view.filters.filters.data_table_filters import SearchFilter


class VenueConfigurationsDataTableFilters:
    def __init__(self):
        pass

    NAME_SEARCH = SearchFilter(field_label="Element Name",
                               model_attribute="name_search",
                               active_filter_label="Element Name",
                               filter_method=None
                               )

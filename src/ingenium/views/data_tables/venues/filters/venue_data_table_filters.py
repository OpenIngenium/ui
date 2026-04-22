from django_data_tables.view.filters.filters.data_table_filters import SelectionFilter

TYPE_CHOICES = (
    (1, "Type A"),
    (2, "Type B"),
    (3, "Type C"),
    (4, "Type D"),
)


class VenueDataTableFilters:
    def __init__(self):
        pass

    TYPE_FILTER = SelectionFilter(choices=TYPE_CHOICES,
                                  field_label="Type",
                                  active_filter_label="Type",
                                  empty_status="Any"
                                  )

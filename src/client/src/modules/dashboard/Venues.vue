<template>
    <div>
        <div class="venue-content">
            <template>
                <dashboard-filter
                    :columns="tableColumns"
                    :filters="filters"
                    :setFilterValues="setFilterValues"
                    :clearFilter="clearFilter"
                    :itemsPerPage="limit"
                    :tableId="tableId"
                >
                </dashboard-filter>
                <template v-if="totalVenues === 0">
                    <div class="alert alert-warning" style="margin-top: 16px;">There are no venues on the server</div>
                </template>
                <template>
                    <div class="all-venues all-venues-tile">
                        <div class="row">
                            <div class="col-md-2 col-sm-2 col-xs-6" v-for="venue in venues" :key="venue.venueId">
                                <venue-tile
                                    :venue-data="venue"
                                    :current-user="currentUser">
                                </venue-tile>
                            </div>
                        </div>
                    </div>
                </template>
                <dashboard-paginator
                    :total="totalVenues"
                    :callback="venueCallback"
                    :offset="offset"
                    :limit="limit"
                    >
                </dashboard-paginator>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import VenueTile from "./VenueTile.vue";
    import Paginator from "../common/Paginator.vue";
    import DashboardPaginator from "./DashboardPaginator.vue";
    import DashboardFilter from "./DashboardFilter.vue";
    import { loadFromLocalStorage, saveToLocalStorage } from "../common/utils";


    export default {
        name: "Venues",
        components: {
            "paginator": Paginator,
            "venue-tile": VenueTile,
            "dashboard-paginator": DashboardPaginator,
            "dashboard-filter": DashboardFilter,
        },
        props: {
            currentUser: {
                type: String,
                required: true
            },
        },
        data() {
            return {
                offset: 0,
                limit: 18,
                filterValues: {},
                tableId: 'Dashboard-Venue',
            };
        },
        created: async function() {
            this.loadFilterFromLocalStorage();
            this.venueCallback({
                offset: this.offset,
                limit: this.limit,
            });
        },
        mounted: async function() {
            await this.getVenueGroups({limit: 1000});
            // load any saved filters from cache
        },
        computed: {
            ...mapGetters([
                "venues",
                "activeVenueGroupNames",
                "totalVenues"
            ]),
            tableColumns: function(state)  {
                return [
                    {
                        field: "venueGroup",
                        name: "Venue Group",
                        filterType: 'selection',
                        filterChoices: this.activeVenueGroupNames,
                    },
                    {
                        field: "name",
                        name: "Venue Name",
                        html: true,
                        filterType: 'search',
                    },
                    {
                        field: "status",
                        name: "Venue Status",
                        filterType: 'selection',
                        filterChoices: ['AVAILABLE', 'IN_USE', 'DOWN'],
                    },
                    {
                        field: 'type',
                        name: 'Venue Type',
                        filterType: 'selection',
                        filterChoices: ['WSTS', 'Testbed', 'ATLO', 'Other'],
                    },
                ];
            },
            filters: function() {
                const filters = {};
                for (const column of this.tableColumns) {
                    if (column.filterType) {
                        filters[column.field] = {
                            field: column.field,
                            name: column.name,
                            filterType: column.filterType,
                            value: this.filterValues[column.field],
                            labelAction: column.labelAction ? column.labelAction : undefined,
                            filterChoices: column.filterChoices ? column.filterChoices : undefined
                        };
                    }
                }
                return filters;
            },
        },
        watch: {
            filters: {
                deep: true,
                handler: 'filtersWatcher'
            }
        },
        methods: {
            ...mapActions([
                "getVenueGroups",
                "getVenues"
            ]),
            clearFilter(field) {
                this.filterValues[field] = null;
                saveToLocalStorage(this.getTableFiltersKey(), this.filterValues);
            },
            setFilterValues(filterValues) {
                this.filterValues = filterValues;
                saveToLocalStorage(this.getTableFiltersKey(), filterValues);
            },
            venueCallback({offset, limit}) {
                this.offset = offset;
                this.limit = limit;
                let name = this.filters.name ? this.filters.name.value : null;
                let status = this.filters.status ? this.filters.status.value : null;
                let type = this.filters.type ? this.filters.type.value : null;
                let venue_group_name = this.filters.venueGroup ? this.filters.venueGroup.value : null;
                this.getVenues({offset, limit, venue_name: name, status: status, venue_type: type, venue_group_name: venue_group_name, venue_group_status: 'ACTIVE', exclude_status: 'RETIRED'});
            },
            filtersWatcher(filters) {
                if (filters) {
                    this.offset = 0;

                    let offset = this.offset;
                    let limit = this.limit;
                    let name = filters.name ? filters.name.value : null;
                    let status = filters.status ? filters.status.value : null;
                    let type = filters.type ? filters.type.value : null;
                    let venue_group_name = this.filters.venueGroup ? this.filters.venueGroup.value : null;
                    this.getVenues({offset, limit, venue_name: name, status: status, venue_type: type, venue_group_name: venue_group_name, venue_group_status: 'ACTIVE', exclude_status: 'RETIRED'});
                }                
            },
            getTableFiltersKey() {
                return `${this.tableId}-TableFilters`;
            },
            loadFilterFromLocalStorage() {
                if (this.tableId) {
                    const filterValues = loadFromLocalStorage(this.getTableFiltersKey(), null) || {};
                    const filterValuesList = filterValues == null ? [] : Object.values(filterValues);
                    if (filterValuesList.length && filterValuesList[0] && filterValuesList[0].field) {
                        // ignore data in old style
                        this.filterValues = {};
                    } else {
                        this.filterValues = filterValues;
                    }
                }
            }            
        }
    };
</script>

<style scoped>
    .venue-content {
        margin-bottom: 50px;
    }
</style>

<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <div style="display: flex; align-items: flex-start; justify-content: flex-end; margin-bottom: 2px;">
                    <div style="display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 2px;">
                        <ing-table-filter
                            ref="filter"
                            :setFilterValues="setFilterValues"
                            :filters="filters"
                            :tableId="tableId">
                        </ing-table-filter>
                    </div>
                </div>
            </div>
            <div v-if="activeFilters.length" class="active-filter-col col-md-12">
                <span class="glyphicon glyphicon-filter"></span>
                <strong>Filters:</strong>
                <span class="active-filters-container">
                    <div v-for="filter in activeFilters" class="active-filter" :key="filter.name">
                        {{filter.name}}: {{filter.value}}
                        <span v-on:click="clearFilter(filter.field)" class="close">x</span>
                    </div>
                </span>
            </div>
        </div>
    </div>
</template>


<script>
    import IngTableFilter from "../common/IngTableFilter.vue";

    export default {
        name: "DashboardFilter",
        components: {
            "ing-table-filter": IngTableFilter,
        },
        props: {
            filters: {
                type: Object,
                required: true
            },
            setFilterValues: {
                type: Function,
                required: true
            },
            clearFilter: {
                type: Function,
                required: true
            },
            tableId: {
                type: String
            }
        },
        computed: {
            activeFilters: function() {
                const activeFilters = [];
                for (const key in this.filters) {
                    let filter = this.filters[key];
                    if (filter && filter.value) {
                        activeFilters.push(filter);
                    }
                }             
                return activeFilters;
            },
        },
    };
</script>

<style lang="scss" scoped>

    .active-filter-col {
        margin-bottom: 8px;
        margin-right: auto;
        order: 0;

        .active-filters-container {
            margin: 10px 0px;

            .active-filter {
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 10px;
                color: #333;
                display: inline-block;
                margin: 0 2px;
                padding: 5px 8px 5px 10px;
                white-space: nowrap;
            }
            .close {
                float: right;
                font-size: 21px;
                font-weight: 700;
                padding-left: 3px;
                line-height: 1;
                color: #000;
                text-shadow: 0 1px 0 #fff;
                filter: alpha(opacity=20);
                opacity: .2;
            }
        }
    }
</style>

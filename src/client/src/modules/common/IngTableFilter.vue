<template>
    <div v-if="anyFilters" class="filter-btn btn-group">
        <button @click="showFilterDropdown = !showFilterDropdown" type="button" id="filter-dropdown" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
            aria-expanded="false">
            <span class="glyphicon glyphicon-filter">Filters</span>
        </button>
        <ul v-if="showFilterDropdown" class="dropdown-menu table-filter-dropdown dropdown-menu-right">
            <form>
                <div v-for="filter in Object.values(filters)" :key="filter.field">
                    <li class="filter-dropdown-element">
                        <label>{{filter.name}} <a v-if="['author', 'test_conductor'].includes(filter.field)" style="cursor: pointer;" @click="() => {
                                filterValues[filter.field] = getCurrentUsername();
                            }">Current user</a></label>
                        <template v-if="filter.filterType === 'search'">
                            <input type="text" :value="filterValues[filter.field]" @input="setFilterValue(filter.field, $event.target.value)" class="form-control">
                        </template>
                        <template v-else-if="filter.filterType === 'selection'">
                            <select class="form-control" :value="filterValues[filter.field]" @input="setFilterValue(filter.field, $event.target.value)">
                                <option v-for="choice in filter.filterChoices" :value="choice" :key="choice">{{choice}}</option>
                            </select>
                        </template>
                    </li>
                </div>
                <div class="button-container">
                    <button type="button" v-on:click.prevent="clearFilters()" data-toggle="dropdown" class="btn btn-danger pull-left">Clear
                    </button>
                    <button type="submit" class="btn btn-primary pull-right" data-toggle="dropdown" v-on:click.prevent="applyFilters">Filter
                    </button>
                </div>
            </form>
        </ul>
    </div>
</template>


<script>
    import { getUsername } from '../common/utils';
    import { deepCopy } from "./utils";
    export default {
        name: 'IngTableFilter',
        data() {
            return {
                filterValues: {},
                showFilterDropdown: false,
                showDateTimeModal: false
            };
        },
        props: {
            tableId: {
                type: String
            },
            filters: {
                type: Object,
                required: true
            },
            setFilterValues: {
                type: Function,
                required: true
            },
        },
        computed: {
            anyFilters: function() {
                return Object.keys(this.filters).length;
            }
        },
        methods: {
            getTableFiltersKey() {
                return `${this.tableId}-TableFilters`;
            },
            setFilterValue(field, value) {
                this.filterValues[field] = value;
            },
            applyFilters() {
                // use deepCopy not to couple states between
                // this component and its parent.
                this.setFilterValues(deepCopy(this.filterValues));
            },
            clearFilters: function() {
                for (let key in this.filterValues) {
                    this.filterValues[key] = null;
                }
                this.setFilterValues(deepCopy(this.filterValues));
            },
            handleClickOutside(event) {
                if (!this.$el.contains(event.target)) {
                    this.showFilterDropdown = false;
                }
            },
            getCurrentUsername() {
                return getUsername();
            }
        },

        mounted() {
            const filterValues = {};
            for (const filter of Object.values(this.filters)) {
                filterValues[filter.field] = filter.value;
            }
            this.filterValues = filterValues;
            document.addEventListener('click', this.handleClickOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },
    };
</script>

<style lang="scss" scoped>
    .dropdown-menu {
        display: block;
    }
    .dropdown-menu-right {
        right: 0; 
        left: auto; 
    }
    .table-filter-dropdown {
        padding: 12px;
        min-width: 275px;
    }
    .button-container {
        margin-top: 14px;
    }
    .filter-dropdown-element {
        margin: 5px 0;
    }
    .filter-btn {
        margin: 0 0 0 auto;
    }
    .filter-btn.btn-group > button.btn {
        border-radius: 4px !important;
    }
</style>

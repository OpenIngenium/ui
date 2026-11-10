<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <div style="display: flex; align-items: flex-start; justify-content: flex-end; margin-bottom: 2px;">
                    <h2 style="margin-right: auto;">
                        <span class="glyphicon" :class="glyphicon"></span>
                        {{ tableTitle }}
                    </h2>
                    <div style="display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 2px;">
                        <ing-table-filter
                            ref="filter"
                            :setFilterValues="setFilterValues"
                            :filters="filters"
                            :tableId="tableId">
                        </ing-table-filter>
                        <template v-if="buttons.length">
                            <span v-for="button in buttons" :key="button.name">
                                <template v-if="button.component">
                                    <component :is="button.component" :data="button.data"></component>
                                </template>
                            </span>
                        </template>
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
            <div class="col-md-12 ing-table-container">
                <table class="ing-table table table-striped">
                    <thead>
                        <tr>
                            <th v-for="col in visibleColumns" :key="col.field">
                                <template v-if="col.sortable">
                                    <div class="sortable" @click="changeSort({'sortField': col.field, 'sortDirection': sortDirection })">
                                        <i v-if="col.name === 'edit-icon'" class="glyphicon glyphicon-pencil" style="padding-left:13px;"></i>
                                        <i v-else-if="col.name === 'delete-icon'" class="glyphicon glyphicon-trash" style="padding-left:13px;"></i>
                                        <span v-else>{{ col.name }}</span>
                                        <template v-if="sortField === col.field">
                                            <span :class="`glyphicon glyphicon-chevron-${sortCaretDirection}`"></span>
                                        </template>
                                        <template v-else>
                                            <span class="icon-combine">
                                                <span class="glyphicon glyphicon-triangle-top"></span>
                                                <span class="glyphicon glyphicon-triangle-bottom"></span>
                                            </span>
                                        </template>
                                    </div>
                                </template>
                                <template v-else>
                                    <i v-if="col.name === 'edit-icon'" class="glyphicon glyphicon-pencil" style="padding-left:13px;"></i>
                                    <i v-else-if="col.name === 'delete-icon'" class="glyphicon glyphicon-trash" style="padding-left:13px;"></i>
                                    <span v-else>{{ col.name }}</span>
                                </template>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in data" :key="row.elem_id">
                            <td :class="tdClass({wrap: col.wordWrap, normalWrap: col.normalWrap})" :style="tdStyle({width: col.width})" v-for="col in visibleColumns" :key="col.field">
                                <template v-if="col.component">
                                    <component :is="col.component" :data="row" :index="index" :field="col.field" v-on:tableEvent="handleTableEvent"></component>
                                </template>
                                <template v-else-if="col.html">
                                    <div v-html="row[col.field]"></div>
                                </template>
                                <template v-else-if="col.maxTextSize">
                                    {{ row[col.field] | trimTo(col.maxTextSize) }}
                                </template>
                                <template v-else>
                                    {{row[col.field]}}
                                </template>
                            </td>
                        </tr>
                        <tr v-if="!data.length">
                            <td v-for="(col, index) in visibleColumns" :key="col.field">
                                <template v-if="index === 0">{{emptyMessage}}</template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="includeFooter" class="row table-footer">
            <div class="col-md-4 msg-col">
                <span>Showing {{startNum}} to {{endNum}} of {{total}} entries.</span>
            </div>
            <div class="col-md-4 paginator-col">
                <paginator
                    :limit="limit"
                    :total-items="total"
                    :ellipsis-threshold="5"
                    :window-radius="1"
                    :callback="(({limit, offset}) => {this.changeLimitOffsetFromPagination({limit, offset})})">
                </paginator>
            </div>
            <div class="col-md-4 limit-col">
                <label v-if="showItemsPerPageSelector">
                    Show
                    <select class="form-control input-sm" v-model="limit" @change="changeLimitFromDropdown">
                        <option v-for="limit in limitChoices" :value="limit" :key="limit">{{limit}}</option>
                    </select>
                    Entries
                </label>
            </div>
        </div>
    </div>
</template>


<script>
    import IngTableFilter from "./IngTableFilter.vue";
    import Paginator from "./Paginator.vue";
    import { loadFromLocalStorage, saveToLocalStorage } from "./utils";

    export default {
        name: "IngTable",
        components: {
            "ing-table-filter": IngTableFilter,
            "paginator": Paginator
        },
        data() {
            return {
                sortDirection: "ASC",
                sortField: undefined,
                filterValues: {},
                offset: 0,
                limit: this.itemsPerPage,
                limitChoices: this.pageLimitChoices,
            };
        },
        props: {
            glyphicon: {
                type: String,
                default: ''
            },
            tableId: {
                type: String,
                default: ''
            },
            tableTitle: {
                type: String,
                default: ''
            },
            data: {
                type: Array,
                default: () => []
            },
            buttons: {
                type: Array,
                default: () => []
            },
            total: {
                type: Number,
                default: 0
            },
            columns: {
                type: Array,
                default: () => []
            },
            callback: Function,
            emptyMessage: {
                type: String,
                default: () => "There is no data to display."
            },
            includeFooter: {
                type: Boolean,
                default: true
            },
            itemsPerPage: {
                type: Number,
                default: 10
            },
            pageLimitChoices: {
                type: Array,
                default: () => [10, 25, 50, 100]
            },
            showItemsPerPageSelector: {
                type: Boolean,
                default: true
            },
            initialSortField: {
                type: String,
                default: undefined
            },
            initialSortDirection: {
                type: String,
                default: 'ASC'
            },
        },
        mounted: function() {
            // apply any filter that may have been loaded from cache
            this.triggerCallback();
        },
        created: function() {
            // load any saved filters from cache
            this.loadFilterFromLocalStorage();

            this.sortField = this.initialSortField;
            this.sortDirection = this.initialSortDirection;
        },
        watch: {
            filters: {
                deep: true,
                handler: 'saveFilterToLocalStorage'
            }
        },
        computed: {
            startNum: function() {
                return this.total > 0 ? this.offset + 1 : 0;
            },
            endNum: function() {
                if (this.offset + this.limit > this.total) {
                    return this.total;
                } else {
                    return this.limit + this.offset;
                }
            },
            sortCaretDirection: function() {
                return this.sortDirection === "ASC" ? "up" : "down";
            },
            filters: function() {
                const filters = {};
                for (const column of this.columns) {
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
            visibleColumns: function() {
                return this.columns.filter(function(col) {
                    return col.hasOwnProperty('visible') ? col.visible : true;
                });
            },
            activeFilters: function() {
                const activeFilters = [];
                for (const key in this.filters) {
                    let filter = this.filters[key];
                    if (filter && filter.value) {
                        activeFilters.push(filter);
                    }
                }              
                return activeFilters;
            }
        },
        methods: {
            getTableFiltersKey() {
                return `${this.tableId}-TableFilters`;
            },
            handleTableEvent: function(customEvent) {
                this.$emit('handleEvent', customEvent);
            },
            triggerCallback: function() {
                if (this.callback) {
                    this.callback({
                        sortDirection: this.sortDirection,
                        sortField: this.sortField,
                        filters: this.filters,
                        limit: this.limit,
                        offset: this.offset
                    });
                }
            },
            clearFilter: function(field) {
                this.offset = 0;
                this.filterValues[field] = null;
                this.triggerCallback();
            },
            changeLimitFromDropdown: function(el) {
                this.limit = parseInt(el.target.value, 10);
                this.offset = 0;
                this.triggerCallback();
            },
            changeLimitOffsetFromPagination: function(params) {
                this.limit = params.limit;
                this.offset = params.offset;
                this.triggerCallback();
            },
            changeSort: function(sortParams) {
                this.sortDirection = sortParams.sortDirection === "ASC" ? "DESC" : "ASC";
                this.sortField = sortParams.sortField;
                this.triggerCallback();
            },
            setFilterValues: function(filterValues) {
                this.offset = 0;
                this.filterValues = filterValues;
                this.triggerCallback();
            },
            tdStyle: function({width}) {
                let ret = '';
                if (width) {
                    ret = {
                        width: `${width}%`
                    };
                }
                return ret;
            },
            tdClass: function({wrap, normalWrap}) {
                if(wrap) {
                    return "wrap";
                }
                else if(!normalWrap) {
                    return "no-wrap";
                }
                return "";
            },
            saveFilterToLocalStorage() {
                saveToLocalStorage(this.getTableFiltersKey(), this.filterValues);
            },
            loadFilterFromLocalStorage() {
                if (this.tableId) {
                    const filterValues = loadFromLocalStorage(this.getTableFiltersKey(), null) || {};
                    const filterValuesList = Object.values(filterValues);
                    if (filterValuesList.length && filterValuesList[0] && filterValuesList[0].field) {
                        // ignore data in old style
                        this.filterValues = {};
                    } else {
                        this.filterValues = filterValues;
                    }
                }
            }
        },
        filters: {
            trimTo(str, size) {
                if(!str) {
                    return '';
                }
                else if(str.length <= size) {
                    return str;
                }
                else {
                    const maxLookback = 10;
                    for(let i = 0; i <= maxLookback && 10 < size && maxLookback < str.length; i++) {
                        if(str.charAt(size) === " ") {
                            break;
                        }
                        size--;
                    }
                    return `${str.substr(0, size)}...`;
                }
            },
        }
    };
</script>

<style lang="scss" scoped>
    .table-footer {
        .paginator-col {
            text-align: center;
        }
        .limit-col,
        .msg-col {
            margin: 20px 0;
        }
        .limit-col {
            text-align: right;
            label {
                font-weight: normal;
                text-align: left;
                display: inline-block;
                max-width: 100%;
            }
            .form-control {
                width: 75px;
                display: inline-block;
            }
        }
    }

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

    th {
        div.sortable {
            cursor: pointer;
            white-space: nowrap;
        }
    }

    .ing-table {
        max-width: 100%;
    }

    .no-wrap {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .wrap {
        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;

        /* Adds a hyphen where the word breaks, if supported (No Blink) */
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    }

    .icon-combine {
        position: relative;
    }

    .icon-combine .glyphicon {
        font-size: 1rem;
    }
    
    .icon-combine .glyphicon:first-child {
        font-size: 1rem;
        z-index: 1;
        position: absolute;
        top: -3px;
        left: 0px;
    }
</style>

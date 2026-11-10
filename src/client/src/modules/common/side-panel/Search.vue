<template>
    <div>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">
            <div class="row" style="margin-bottom: 0;">
                <div class="col-xs-12">
                    <button 
                        @click="handleClearFilters"
                        type="button" 
                        class="btn btn-default btn-xs" 
                        style="float: right;">Clear Filters</button>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-6">
                    <label>Search String</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        v-model="searchString">
                </div>
                <div class="col-xs-6">
                    <button 
                        @click="handleSearch"
                        type="button" 
                        class="btn btn-priamry search">
                        <i class="glyphicon glyphicon-search"></i>
                        Find
                    </button>
                </div>
            </div>
            <div class="row" >
                <div class="col-xs-6">
                    <label for="whole_case"><input type="checkbox" id="whole_case" v-model="matchCase"> Match Case</label>
                </div>
                <div class="col-xs-6">
                    <label for="whole_word"><input type="checkbox" id="whole_word" v-model="matchWholeWord"> Match Whole Word</label>
                </div>
            </div>
            <div v-if="replace" class="row" style="margin-bottom: 0;">
                <div class="col-xs-6">
                    <label>Replace</label>
                    <input 
                        v-model="replaceString"
                        class="form-control"
                        type="text">
                </div>
                <div class="col-xs-6">
                    <button
                        @click="handleReplaceAll"
                        type="button" 
                        class="btn btn-priamry search">
                        <i class="glyphicon glyphicon-refresh"></i>
                        Replace All
                    </button>
                </div>
            </div>
        </div>
        <div class="row" style="margin-top: 10px;">
            <div class="col-xs-6">
                <label>Step Type Filter</label>
                <multiselect
                    v-model="stepTypeFilter"
                    :options="stepTypeValues"
                    placeholder="Step type filter"
                    :multiple="true"
                    :taggable="false"
                    :searchable="false"
                    :showPointer="false"
                    :selectedLabel="''"
                    :closeOnSelect="false"
                    v-on:select="addStepTypeFilterTrigger">
                    <template slot="selection" slot-scope="{ values, search, isOpen }">
                        <span class="multiselect__single">Step type filter</span>
                    </template>
                </multiselect>
                <span v-if="stepTypeFilter.length > 0" style="font-size: 13px; word-wrap: break-word;"><b>Field filter:</b> {{ stepTypeFilter.join(", ") }}</span>
            </div>
            <div class="col-xs-6">
                <label>Field Filter</label>
                <multiselect
                    v-model="commonFieldFilter"
                    :options="commonFieldValues"
                    placeholder="Field filter"
                    :multiple="true"
                    :taggable="false"
                    :searchable="false"
                    :showPointer="false"
                    :selectedLabel="''"
                    :closeOnSelect="false"
                    v-on:select="addCommonFieldFilterTrigger">
                    <template slot="selection" slot-scope="{ values, search, isOpen }">
                        <span class="multiselect__single">Field filter</span>
                    </template>
                </multiselect>
                <span v-if="commonFieldFilter.length > 0" style="font-size: 13px; word-wrap: break-word;"><b>Field filter:</b> {{ commonFieldFilter.join(", ") }}</span>
            </div>
        </div>
        <div v-if="this.mode !== 'authoring'"  class="row" style="margin-top: 10px;">
            <div class="col-xs-12">
                <label>Status Filter</label>
                <multiselect
                    v-model="statusFilter"
                    :options="statusValues"
                    placeholder="Status filter"
                    :multiple="true"
                    :taggable="false"
                    :searchable="false"
                    :showPointer="false"
                    :selectedLabel="''"
                    :closeOnSelect="false"
                    v-on:select="addStatusFilterTrigger">
                    <template slot="selection" slot-scope="{ values, search, isOpen }">
                        <span class="multiselect__single">Status filter</span>
                    </template>
                </multiselect>
                <span v-if="statusFilter.length > 0" style="font-size: 13px; word-wrap: break-word;"><b>Selected:</b> {{ statusFilter.join(", ") }}</span>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-6">
                <label>Step Start Filter</label>
                <select class="form-control" v-model="stepStartFilter">
                    <option v-for="outlineElement in stepTypeDropdown()" :key="outlineElement.value" :value="outlineElement.value">{{ outlineElement.key }}</option>
                </select>
            </div>
            <div class="col-xs-6">
                <label>Step End Filter</label>
                <select class="form-control" v-model="stepEndFilter">
                    <option v-for="outlineElement in stepTypeDropdown()" :key="outlineElement.value" :value="outlineElement.value">{{ outlineElement.key }}</option>
                </select>
            </div>
        </div>
        <div v-if="this.mode !== 'authoring'" class="row">
            <div class="col-xs-6">
                <label>
                    Start Time Filter
                </label>
                <input 
                    v-model="startTimeFilter"
                    placeholder="2021-01-31T13:00:00.000Z"
                    class="form-control"
                    type="text">
            </div>
            <div class="col-xs-6">
                <label>
                    End Time Filter
                </label>
                <input 
                    v-model="endTimeFilter"
                    placeholder="2021-01-31T13:00:00.000Z"
                    class="form-control"
                    type="text">
            </div>
        </div>
        <div 
            v-if="this.resultsSearchFor.length > 0"
            class="row">
            <div class="col-xs-12" >
                <p style="text-align: center;">{{ this.resultsMatches.length }} matches for &quot;{{ this.resultsSearchFor }}&quot;</p>
                <p v-if="this.resultsTotalCount > this.resultsMatches.length" style="text-align: center;">(out of total of {{ this.resultsTotalCount }} matches) </p>
                <search-result-card 
                    v-for="(match, index) in this.resultsMatches" :key="index"
                    :data="match"
                    :index="index"
                    :search-string="searchString"
                    :jump-to-step="jumpToStep"
                    :handle-replace="handleReplace"
                    :edit-mode="editMode">
                </search-result-card>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import IngTable from '../IngTable.vue';
    import SearchResultCard from './SearchResultCard.vue';
    import Multiselect from 'vue-multiselect';

    export default {
        name: "Search",
        components: {
            IngTable,
            'search-result-card': SearchResultCard,
            'multiselect': Multiselect,
        },
        methods: {
            ...mapActions([
                'search',
                'replaceMatches',
                'clearSearchResults'
            ]),
            handleSearch: async function() {
                // AUTHORING
                if(this.procedureVersion) {
                    await this.search({
                        version: this.procedureVersion, 
                        searchPayload: {
                            search_for: this.searchString,
                            match_case: this.matchCase,
                            match_whole_word: this.matchWholeWord,
                            step_type_filters: this.stepTypeFilter,
                            field_filters: this.commonFieldFilter,
                            start_elem_id: this.stepStartFilter,
                            end_elem_id: this.stepEndFilter
                        }
                    });
                // EXECUTION
                } else {
                    await this.search({
                        searchPayload: {
                            status_filters: this.statusFilter,
                            search_for: this.searchString,
                            match_case: this.matchCase,
                            match_whole_word: this.matchWholeWord,
                            step_type_filters: this.stepTypeFilter,
                            field_filters: this.commonFieldFilter,
                            start_elem_id: this.stepStartFilter,
                            end_elem_id: this.stepEndFilter,
                            from_time: this.startTimeFilter,
                            to_time: this.endTimeFilter
                        }
                    });
                }
            },
            handleClearFilters: function() {
                // Clear search box 
                this.searchStringLocal = '';
                this.replaceStringLocal = '';
                this.matchCaseLocal = false;
                this.matchWholeWordLocal = false;
                
                // Clear filters
                this.statusFilterLocal = [];
                this.stepTypeFilterLocal = [];
                this.commonFieldFilterLocal = [];
                this.stepStartFilterLocal = '';
                this.stepEndFilterLocal = '';
                this.startTimeFilterLocal = '';
                this.endTimeFilterLocal = '';

                this.clearSearchResults();
            },
            handleReplace: async function(elementProperties) {
                await this.replaceMatches({
                    replacePayload: {
                        search_for: this.searchString,
                        replace_with: this.replaceString,
                        match_case: this.matchCase,
                        match_whole_word: this.matchWholeWord,
                        replacements: [ elementProperties ]
                    }
                });
            },
            handleReplaceAll: async function() {
                const replacements = this.resultsMatches.filter(match => match.replaceable && !match.replaced).map(
                    ({ elem_id, number, field_path, is_html }) => ({
                        elem_id, number, field_path, is_html
                    })
                );
                
                await this.replaceMatches({
                    replacePayload: {
                        search_for: this.searchString,
                        replace_with: this.replaceString,
                        match_case: this.matchCase,
                        match_whole_word: this.matchWholeWord,
                        replacements
                    }
                });

                this.disableAllReplace = true;
            },
            addStepTypeFilterTrigger: function(selected, id) {
                this.stepTypeFilter = [
                    ...this.stepTypeFilter,
                    selected
                ];
            },
            addCommonFieldFilterTrigger: function(selected, id) {
                this.commonFieldFilter = [
                    ...this.commonFieldFilter,
                    selected
                ];
            },
            addStatusFilterTrigger: function(selected, id) {
                this.statusFilter = [
                    ...this.statusFilter,
                    selected
                ];
            },
            getOutlineElements(outline) {       
                let result = [];
                let kvOutlineElements = [];
                if(!Array.isArray(outline)) {
                    kvOutlineElements = Object.entries(outline).map(([key, value]) => {
                        return {
                            key, 
                            number: value.number,
                            title: value.title ? value.title : 'No Title',
                            children: value.children 
                        };
                    });
                } else {
                    kvOutlineElements = outline;
                }

                kvOutlineElements.forEach(item => {
                    const {key, number, title, children} = item;
                    result.push({ 
                        key: `${number} - ${title ? title : 'No Title'}`, 
                        value: key 
                    });
                    if (children)
                        result.push(...this.getOutlineElements(children));
                });

                return result;
            },
            stepTypeDropdown() {
                return [
                    { key: 'Select...', value: ''},
                    ...this.getOutlineElements(this.outlineElements)
                ];
            }
        },
        data() {
            return {
                procedureVersion: this.$route.params.version,
                searchStringLocal: '',
                replaceStringLocal: '',
                matchCaseLocal: false,
                matchWholeWordLocal: false,
                statusFilterLocal: [],
                stepTypeFilterLocal: [],
                commonFieldFilterLocal: [],
                stepStartFilterLocal: '',
                stepEndFilterLocal: '',
                startTimeFilterLocal: '',
                endTimeFilterLocal: '',

                searchColumns: [
                    {
                        field: 'step_number',
                        name: 'Step #',
                        sortable: false
                    },
                    {
                        field: 'step_title',
                        name: 'Step Title',
                        sortable: false
                    },
                    {
                        field: 'step_type',
                        name: 'Step Type',
                        sortable: false
                    },
                    {
                        field: 'field',
                        name: 'Field',
                        sortable: false
                    },
                    {
                        field: 'content',
                        name: 'Content',
                        sortable: false
                    }
                ],
                stepTypeValues: [
                    "MANUAL_INPUT",
                    "MANUAL_EIP",
                    "VENUE_CONFIG_MANUAL",
                    "ENVIRONMENT_MANUAL",
                    "GDS_MANUAL",
                    "VERIFICATION_ITEM",
                    "VERIFICATION_ITEM_STATUS",
                    "GRAPH_EHA",
                    "QUERY_EVR",
                    "VERIFY_EHA",
                    "WAIT_EHA",
                    "BUS_1553",
                    "WAIT_EVR",
                    "LIST_DATA_PRODUCTS",
                    "WAIT_DATA_PRODUCTS",
                    "CMD",
                    "CMD_FILE",
                    "CMD_SCMF",
                    "CMD_SSE",
                    "TIME_REFERENCE",
                    "VENUE_CONFIG_GET",
                    "VENUE_CONFIG_UPDATE",
                    "VENUE_CONFIG_CHECK",
                    "MANUAL_VERIFICATION",
                    "CUSTOM_SCRIPT",
                    "ANALYSIS",
                    "WAIT", 
                    "TOC"
                ],
                commonFieldValues: [
                    "TITLE",
                    "DESCRIPTION",
                    "ELEM_TYPE",
                    "STEP_TYPE",
                    "STATUS",
                    "COMMENT",
                    "DATA_PATH",
                    "COMMAND_STRING",
                    "EVR_NAME",
                    "CHANNEL_NAME",
                    "CHANNEL_ID",
                    "START_TIME",
                    "END_TIME",
                    "DURATION",
                    "TIMEOUT",
                    "LOOKBACK",
                ],
                statusValues: [
                    "PASS",
                    "FAIL",
                    "OVERRIDE_PASS",
                    "OVERRIDE_FAIL",
                    "ERROR",
                    "RUNNING",
                    "NONE"
                ],
                disableAllReplace: false
            };
        },
        computed: {
            ...mapGetters([
                "mode",
                "searchResult",
                "fetchOutlinePrecomputed",
                "editMode"
            ]),
            outlineElements() {
                const outlineElements = Object.entries(this.fetchOutlinePrecomputed).map(([key, value]) => ({
                    key, 
                    number: value.number,
                    title: value.title ? value.title : 'No Title',
                    children: value.children
                }));
                
                return outlineElements && outlineElements.length > 0 ? outlineElements : [];
            },
            searchString: {
                get: function() {
                    return this.searchStringLocal;
                },
                set: function(val) {
                    this.searchStringLocal = val;
                }
            },
            replaceString: {
                get: function() {
                    return this.replaceStringLocal;
                },
                set: function(val) {
                    this.replaceStringLocal = val;
                }
            },
            matchCase: {
                get: function() {
                    return this.matchCaseLocal;
                },
                set: function(val) {
                    this.matchCaseLocal = val;
                }
            },
            matchWholeWord: {
                get: function() {
                    return this.matchWholeWordLocal;
                },
                set: function(val) {
                    this.matchWholeWordLocal = val;
                }
            },
            statusFilter: {
                get: function() {
                    return this.statusFilterLocal;
                },
                set: function(val) {
                    this.statusFilterLocal = val;
                }
            },
            stepTypeFilter: {
                get: function() {
                    return this.stepTypeFilterLocal;
                },
                set: function(val) {
                    this.stepTypeFilterLocal = val;
                }
            },
            commonFieldFilter: {
                get: function() {
                    return this.commonFieldFilterLocal;
                },
                set: function(val) {
                    this.commonFieldFilterLocal = val;
                }
            },
            stepStartFilter: {
                get: function() {
                    return this.stepStartFilterLocal;
                },
                set: function(val) {
                    this.stepStartFilterLocal = val;
                }
            },
            stepEndFilter: {
                get: function() {
                    return this.stepEndFilterLocal;
                },
                set: function(val) {
                    this.stepEndFilterLocal = val;
                }
            },
            startTimeFilter: {
                get: function() {
                    return this.startTimeFilterLocal;
                },
                set: function(val) {
                    this.startTimeFilterLocal = val;
                }
            },
            endTimeFilter: {
                get: function() {
                    return this.endTimeFilterLocal;
                },
                set: function(val) {
                    this.endTimeFilterLocal = val;
                }
            },
            resultsSearchFor: function() {
                const searchResult = this.searchResult;
                return searchResult.hasOwnProperty("search_for") ? searchResult.search_for : '';
            },
            resultsMatchCase: function() {
                const searchResult = this.searchResult;
                return searchResult.hasOwnProperty("match_case") ? searchResult.match_case : false;
            },
            resultsMatchWholeWord: function() {
                const searchResult = this.searchResult;
                return searchResult.hasOwnProperty("match_whole_word") ? searchResult.match_whole_word : false;
            },
            resultsMatches: function() {
                const searchResult = this.searchResult;
                return searchResult.hasOwnProperty("matchMap") ? Object.values(searchResult.matchMap) : [];
            },
            resultsTotalCount: function() {
                const searchResult = this.searchResult;
                return searchResult.hasOwnProperty("total_count") ? searchResult.total_count : 0;
            }
        },
        props: {
            replace: {
                type: Boolean,
                required: false,
                default: false
            },
            jumpToStep: {
                type: Function
            }
        }
    };
</script>

<style lang="scss" scoped>
label {
    color: #545454;
    margin: 0;
}
.search {
    position: relative;
    top: 20px;
    width: 100%;
}
.row {
    margin-bottom: 10px;
}
</style>
<!-- eslint-disable vue/html-self-closing -->
<template>
    <div class="control-section">
        <div class="row">
            <div class="col-md-12">
                <div :style="{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px'}">
                    <h2 :style="{marginRight: 'auto'}"><i class="glyphicon glyphicon-search"></i> Search</h2>
                </div>
            </div>
        </div>
        <div class="col-lg-12 querybuilder-control">
            <!--Console Buttons-->
            <div class="btn-group" role="group" style="float:right; z-index: 1;">
                <div class="btn-condition-group">
                    <label v-for="(option, index) in dataOptions" 
                        :key="index" class="btn"
                        :class="option.value === dataOptionSelected ? 'active' : 'inactive'" 
                        style="border-radius: 2px !important;">
                    <input type="radio" class="hide-radio-circle" v-model="dataOptionSelected" :value="option.value">
                        {{ option.label }}
                    </label>
                </div>
                <button 
                    @click="getSavedRule"
                    type="button"
                    class="btn btn-primary">
                    <i 
                        class="glyphicon glyphicon-open"
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        title="load search rules"
                    >
                    </i>
                </button>
                <button
                    @click="showSaveRuleModal = true;"
                    type="button"
                    class="btn btn-primary dropdown-toggle"
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false">
                    <i 
                        class="glyphicon glyphicon-floppy-disk"
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        title="save search rules"
                    >
                    </i>
                </button>
            </div>
            <!--query Builder-->
            <div class="form-group console query-builder">
                <query-builder ref="queryBuilder" :importedRules.sync="importRules"></query-builder>
            </div>
            <!--Search Button-->
            <div class="btn-group" role="group" style="float:right;">
                <button 
                    @click="search"
                    :disabled="isDisableSearch"
                    type="button"
                    class="btn btn-primary search-button">
                    <i class="glyphicon glyphicon-search"></i>
                    &nbsp;Search
                </button>
            </div>
        </div>  

        <div class="col-xs-12">
            <div class="right-toolbar">
                <button
                    type="button"
                    class="btn btn-default"
                    :disabled="!enableReport"
                    @click="getSearchReport">
                    <i class="glyphicon glyphicon-book"></i>&nbsp;Report
                </button>
            </div>
            <ing-table
                tableId="search"
                tableTitle=""
                empty-message="No result to display."
                :data="searchData"
                :columns="tableColumns"
                :total="searchResultCount"
                :limit="limit"
                :callback="tableCallback"
                >
            </ing-table>
        </div>
        
        <!--Save Rule Modal-->
        <save-rule-modal :showModal="showSaveRuleModal" @close="showSaveRuleModal=false" @save="saveRule"></save-rule-modal>
        <!--Load Rule Modal-->      
        <load-rule-modal :showModal="showLoadRuleModal" :loadSaveRule="savedRules" @close="showLoadRuleModal=false" @load="loadRule" @delete="deleteRule"></load-rule-modal>
        <spinner-modal v-if="spinner"></spinner-modal>
        <feedback-modal></feedback-modal>
    </div>
</template>

<script>
    import QueryBuilder from './QueryBuilder.vue';
    import SaveRuleModal from './SaveRuleModal.vue';
    import LoadRuleModal from './LoadRuleModal.vue';
    import searchApi from '../../api/search';
    import IngTable from '../common/IngTable.vue';
    import SearchSource from './SearchSource.vue';
    import SearchResult from './SearchResult.vue';
    import SearchVenue from './SearchVenue.vue';
    import SearchStepType from './SearchStepType.vue';
    import SearchDetails from './SearchDetails.vue';
    import SpinnerModal from "../common/SpinnerModal.vue";
    import FeedbackModal from '../common/FeedbackModal.vue';
    import reportApi from '../../api/report';
    import {forceFileDownload} from "../common/utils";
    import { mapActions } from "vuex";

    export default {
        name: "Search",
        components: {
            'query-builder': QueryBuilder,
            'save-rule-modal': SaveRuleModal,
            'load-rule-modal': LoadRuleModal,
            'ing-table': IngTable,
            'spinner-modal' : SpinnerModal,
            'feedback-modal' : FeedbackModal
        },
        data: function() {
            return {
                showSaveRuleModal: false,
                showLoadRuleModal: false,
                enableReport: false,
                importRules: { condition: "AND", rules: [{field: '', operator: '', value: ''}] },
                savedRules: [],
                searchData: [],
                offset: 0,
                limit: 10,
                tableColumns: [
                    {
                        field: 'results',
                        name: 'Results',
                        component: SearchResult,
                        wordWrap: true,
                    },
                    {
                        field: 'step_type',
                        name: 'Step Type',
                        component: SearchStepType,
                    },
                    {
                        field: 'venue',
                        name: 'Venue',
                        component: SearchVenue,
                    },
                    {
                        field: 'source',
                        name: 'Source (Procedure/Execution)',
                        component: SearchSource,
                        
                    },
                    {
                        field: 'details',
                        name: 'Details',
                        component: SearchDetails,
                    },
                    
                ],
                searchResultCount: 0,
                dataOptions: [
                    { label: 'All', value: 'all' },
                    { label: 'Procedure', value: 'procedure_element' },
                    { label: 'Execution', value: 'element' },
                ],
                dataOptionSelected: 'all',
                spinner: false
            };
        },
        created() {
            this.loadRuleFromURL();
        },
        computed:{
            isDisableSearch:function() {
                if( this.importRules.rules.length == 0 || this.isInvalid) {
                    return true;
                } else {
                    return false;
                }
            },
            isInvalid: function() {
                return !this.checkRulesValidation(this.importRules);
            },
        },
        methods:{
            ...mapActions([
                "displayFeedback"
            ]),
            loadRuleFromURL: async function() {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                if (id) {
                    const response = await searchApi.getQueryBuilder(id);
                    this.importRules = response.data.pop().queryBuilderParams;
                } 
            },
            checkRulesValidation:function(rules) {
                if (typeof rules !== "object" || !rules) {
                    return false;
                }
                if ("field" in rules && "operator" in rules && "value" in rules) {
                    if (rules.field === "" || rules.operator === "" || rules.value === "") {
                        return false;
                    }
                }
                if ("rules" in rules && Array.isArray(rules.rules)) {
                    if (rules.rules.length === 0) {
                        return false; 
                    }    
                    for (let rule of rules.rules) {
                        if (!this.checkRulesValidation(rule)) {
                            return false;
                        }
                    }
                }
                return true;
            },
            getSavedRule: async function() {
                this.showLoadRuleModal = true;
                const response = await searchApi.getAllQueryBuilder();
                this.savedRules = response.data;
            },
            loadRule: function({queryBuilderParams}) {
                this.showLoadRuleModal = false;
                this.importRules = queryBuilderParams;
            },
            deleteRule: async function({id}) {
                this.showLoadRuleModal = false;
                await searchApi.deleteQueryBuilder(id);
            },
            saveRule: async function({name, description}) {
                this.showSaveRuleModal = false;
                await searchApi.saveQueryBuilder({
                    name, 
                    description,
                    queryBuilderParams: this.$refs.queryBuilder.importedRules
                });
            },
            tableCallback: async function({limit, offset}) {
                try {
                    this.limit = limit;
                    this.offset = offset;
                    if(this.$refs.queryBuilder.importedRules.rules.length !== 0 && this.$refs.queryBuilder.importedRules.rules[0].field !== '') {
                        this.spinner = true;
                        const response = await searchApi.searchElasticService({
                            queryBuilderParams: this.$refs.queryBuilder.importedRules,
                            index: this.dataOptionSelected,
                            limit, 
                            offset, 
                        });
                        this.searchData = response.data.results;
                        this.searchResultCount = response.data.total;
                        this.spinner = false;
                    }
                } catch (error) {
                    this.displayFeedback({ type: 'error', errorObj: error });
                    this.spinner = false;
                }
            },
            search: async function() {
                try {
                    this.spinner = true;
                    const response = await searchApi.searchElasticService({
                        queryBuilderParams: this.$refs.queryBuilder.importedRules,
                        index: this.dataOptionSelected,
                        limit: 10,
                        offset: 0
                    });
                    this.searchData = response.data.results;
                    this.searchResultCount = response.data.total;
                    this.spinner = false;
                    this.enableReport = true;
                } catch (error) {
                    this.displayFeedback({ type: 'error', errorObj: error });
                    this.spinner = false;
                }
            },      
            async getSearchReport() {
                try {
                    this.spinner = true;
                    const searchParams = {
                        queryBuilderParams: this.$refs.queryBuilder.importedRules,
                        index: this.dataOptionSelected
                    };
                    const response = await reportApi.getSearchReport(searchParams);
                    const timestamp = (new Date()).toISOString();
                    forceFileDownload(response, `search_report_${timestamp}.xlsx`);
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error });
                } finally {
                    this.spinner = false;
                }
            },      
        }
        
    };
</script>

<style lang="scss" scoped>

    .query-builder {
        width: 100%;
        height: auto;
        margin: 0 auto;
    }
    
    .console {
        border: 1px solid;
        border-color: #e0e0e0;
        border-radius: 0px;
        padding: 12px;
        margin-bottom: 0px;
    }

    .code-console {
        box-shadow: 0 2px 6px #d3d3d3;
        border: 1px solid #fff;
        margin-top: 30px;
    }

    .search-button {
        margin-top: 10px;
    }

    .btn.active {
        background: #e3165b;
        border-color: #e3165b;
        color: #fff;
        outline: #fafafa 0 solid;
        outline-offset: 0;
        font-size: 12px;
        line-height: 1.5834em;
    }

    .btn.inactive {
        font-size: 12px;
        line-height: 1.5834em;
        border: 1px solid rgba(113, 109, 109, 0.341);
    }

    .hide-radio-circle {
        display: none;
    }

    .right-toolbar{
        float: right;
        margin-top: 25px;
        margin-bottom: -20px;
    }

</style>
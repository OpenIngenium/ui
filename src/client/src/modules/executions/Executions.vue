<template>
    <div class="spa">
        <div class="right-toolbar">
            <button
                type="button"
                class="btn btn-default"
                @click="showImportModal=true">
                <i class="glyphicon glyphicon-open actionable"></i>&nbsp;Import
            </button>
            <button
                type="button"
                class="btn btn-default"
                @click="getExecutionsReport">
                <i class="glyphicon glyphicon-book"></i>&nbsp;Report
            </button>
        </div>
        <ing-table
            tableId="executions"
            empty-message="No executions to display."
            :data="executionsData"
            :columns="tableColumns"
            :total="executionsCount"
            :limit="limit"
            initialSortField="execution_id"
            initialSortDirection="DESC"            
            :callback="tableCallback">
        </ing-table>
        <!-- IMPORT MODAL -->
        <execution-import-modal 
            :show-modal="showImportModal" 
            @close="showImportModal=false" 
            @imported-execution="refresh"
            @select-execution="tableEvent"
        >
        </execution-import-modal>
        <feedback-modal></feedback-modal>
        <spinner-modal v-if="isPending || importingExecution"></spinner-modal>

        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>

<script>
    import IngTable from "../common/IngTable.vue";
    import DisplayListElements from "../common/IngTableElementDisplayList.vue";
    import DisplayProceduresList from "./DisplayProceduresList.vue";
    import ExecutionDropdownButton from "./ExecutionDropdownButton.vue";
    import SelectExecutionButton from "./SelectExecutionButton.vue";
    import SelectVenueButton from "./SelectVenueButton.vue";
    import FeedbackModal from '../common/FeedbackModal.vue';
    import SpinnerModal from '../common/SpinnerModal.vue';
    import IngFooter from "../common/IngFooter.vue";
    import ExecutionImportModal from './ExecutionImportModal.vue';
    import reportApi from '../../api/report';
    import { mapGetters, mapActions } from 'vuex';
    import {forceFileDownload} from "../common/utils";

    export default {
        name: "Executions",
        components: {
            'ing-table': IngTable,
            'feedback-modal': FeedbackModal,
            'spinner-modal': SpinnerModal,
            'execution-import-modal': ExecutionImportModal,
            'ing-footer': IngFooter
        },
        data() {
            return {
                offset: 0,
                limit: 10,
                filters: undefined,
                showImportModal: false,
                tableColumns: [
                    {
                        field: 'execution_id',
                        name: 'Exec. #',
                        component: SelectExecutionButton,
                        sortable: true,
                    },
                    {
                        field: 'venue_name',
                        name: 'Venue',
                        sortable: true,
                        component: SelectVenueButton,
                    },
                    {
                        field: 'venue_name', 
                        name: 'Venue Name',
                        filterType: 'search',
                        visible: false,  // show up in filter only 
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        filterType: 'search',
                        wordWrap: true,
                    },
                    {
                        field: 'venue_type',
                        name: 'Venue Type',
                        filterType: 'selection',
                        filterChoices: ['WSTS', 'Testbed', 'ATLO', 'Other'],
                        visible: false,
                    },
                    {
                        field: 'execution_id',  // for ordering purposes in the filter
                        name: 'Execution ID',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'procedure_id', 
                        name: 'Procedure ID (Ingenium)',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'institutional_id',
                        name: 'Procedure Institutional ID',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'institutional_release_id',
                        name: 'Procedure Revision',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'conductors',
                        name: 'Conductors',
                        component: DisplayListElements
                    },
                    {
                        field: 'run_for_score',
                        name: 'Run For Record',
                        filterType: 'selection',
                        filterChoices: ['true', 'false'],

                    },
                    {
                        name: 'Procedure ID(s) (Institutional ID(s) / Revisions)', 
                        component: DisplayProceduresList
                    },
                    {
                        field: 'comment_summary',
                        name: 'Comments (Unresolved/Total)',
                        html: true
                    },
                    {
                        field: 'time_started',
                        name: 'Time Started',
                        sortable: true
                    },
                    {
                        field: 'time_completed',
                        name: 'Time Completed',
                        sortable: true
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        filterType: 'selection',
                        filterChoices: ['RUNNING','IDLE', 'PAUSED', 'HALTED', 'SUSPENDED', 'CLOSED', 'IN_REVIEW', 'FINALIZED'],
                        sortable: true
                    },
                    {
                        field: 'test_conductor',
                        name: 'Test Conductor',
                        filterType: 'search',
                        visible: false,
                    },
                    {
                        field: 'from_time',
                        name: 'Date Range (From)',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'to_time',
                        name: 'Date Range (To)',
                        filterType: 'search',
                        visible: false
                    },
                    {
                        field: 'dropdown',
                        name: '',
                        component: ExecutionDropdownButton,
                        normalWrap: true,
                    },
                ],
            };
        },
        created: function() {
        },
        computed: {
            ...mapGetters([
                'executions',
                'executionsCount',
                'isPending',
                'importingExecution'
            ]),
            executionsData: function() {
                let updatedData = [];
                this.executions.forEach(execution => {
                    let executionData = {
                        ...execution,
                        comment_summary: `<span style="color: orange">${execution.unresolved_conversations_count}</span> / <span>${execution.conversations_count}</span>`
                    };
                    updatedData.push(executionData);
                }); 
                return updatedData;
            }
        },
        methods: {
            ...mapActions([
                'fetchExecutions',
                'setPending',
                'displayFeedback',
            ]),
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                this.filters = filters;

                this.fetchExecutions({
                    limit,
                    offset,
                    filters, 
                    sort: sortDirection, 
                    sortBy: sortField
                });
            },
            refresh: function() {
                // Wait 0.5 sec because core takes time to register the 
                // newly added procedure
                setTimeout(
                    () => {
                        this.tableCallback({
                            sortDirection: this.sortDirection, 
                            sortField: this.sortField, 
                            filters: this.filters,
                            limit: this.limit, 
                            offset: this.offset
                    });},
                    500
                );
            },
            
            async getExecutionsReport() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                try {
                    const response = await reportApi.getExecutionsReport(this.getActiveFilters());
                    const timestamp = (new Date()).toISOString();
                    forceFileDownload(response, `executions_report_${timestamp}.xlsx`);
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
            
            getActiveFilters() {
                let activeFilters = {};
                Object.keys(this.filters).forEach(filterName => {
                    const value = this.filters[filterName].value;
                    if (value) {
                        activeFilters[filterName] = value;
                    }
                });
                return activeFilters;
            },
            tableEvent: function(event) {
                switch(event.action) {
                    case "selectExecution":
                        this.showImportModal = false;
                        window.location.href = `/execute/as_run/${event.data.execution_id}`;
                        break;
                    default:
                        break;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
.spa {
    margin-left: 30px;
}
.right-toolbar{
    float: right;
    margin: 5px 0;
}
</style>


<template>
    <div>
        <ing-table
            tableId="selectExecutionTable"
            tableTitle="Executions"
            glyphicon="glyphicon-dashboard"
            :data="executionsData"
            :columns="columns"
            :total="executionsCount"
            v-on:handleEvent="setExecution"
            :callback="fetchExecutionsCallback"
            :limit="10">
        </ing-table>
    </div>
</template>

<script>

    import {
        mapActions,
        mapGetters
    } from 'vuex';

    import IngTable from '../common/IngTable.vue';
    import ExecutionSelectButton from './ExecutionSelectButton.vue';
    import DisplayListElements from "../common/IngTableElementDisplayList.vue";
    import DisplayProceduresList from "../executions/DisplayProceduresList.vue";

    export default {
        name: 'SelectExecutionTable',
        components: {
            'ing-table': IngTable,
        },
        data() {
            return {
                columns: [
                    {
                        field: 'execution_id',
                        name: 'Exec. #',
                        sortable: true,
                    },
                    {
                        field: 'venue_name',
                        name: 'Venue',
                        sortable: true,
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
                        field: 'choose',
                        name: 'Choose',
                        component: ExecutionSelectButton,
                    },
                ],
                offset: 0,
                limit: 10,
                filters: undefined,
            };
        },
        computed: {
            ...mapGetters([
                'executions',
                'executionsCount',
            ]),
            executionsData: function() {
                return this.executions;
            }
        },
        created: function() {
        },
        methods: {
            ...mapActions([
                'fetchExecutions'
            ]),
            fetchExecutionsCallback: function({ sortDirection, sortField, filters, limit, offset }) {
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
            setExecution: function(customEvent) {
                this.$emit('setExecution', customEvent);
            },
        }
    };

</script>

<style lang="scss" scoped>

</style>

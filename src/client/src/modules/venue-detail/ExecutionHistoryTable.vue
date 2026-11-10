<template>
    <div>
        <ing-table
            tableId="executionRecordsTable"
            tableTitle="Execution Records"
            glyphicon="glyphicon-dashboard"
            :data="generateRows()"
            :total="totalExecutionElements"
            :columns="columns"
            :callback="fetchExecutionsCallback">
        </ing-table>
    </div>
</template>

<script>

    import {
        mapActions,
        mapGetters
    } from 'vuex';

    import IngTable from '../common/IngTable.vue';

    export default {
        name: 'Execution-History-Table',
        components: {
            'ing-table': IngTable,
        },
        data() {
            return {
                columns: [
                    {
                        name: 'Exec. #',
                        field: 'executionId',
                        sortable: true,
                        html: true
                    },
                    {
                        name: 'Conductors',
                        field: 'conductors'
                    },
                    {
                        name: 'Time Started',
                        field: 'timeStarted',
                        sortable: true
                    },
                    {
                        name: 'Time Completed',
                        field: 'timeCompleted',
                        sortable: true
                    },
                    {
                        name: 'Description',
                        field: 'description',
                        visible: false,
                        filterType: 'search',
                        wordWrap: true
                    },
                    {
                        name: 'Procedure ID',
                        visible: false,
                        filterType: 'search',
                        field: 'procedureId'
                    },
                    {
                        name: 'Procedures',
                        field: 'usedProcedures',
                        wordWrap: true
                    },
                    {
                        name: 'Status',
                        field: 'status',
                        visible: true,
                        sortable: true,
                        filterType: 'selection',
                        filterChoices: ['RUNNING','IDLE', 'PAUSED', 'HALTED', 'SUSPENDED', 'CLOSED', 'IN_REVIEW', 'FINALIZED'],
                    }
                ]
            };
        },
        props: {
            venueId: {
                type: String,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "executionElements",
                "totalExecutionElements"
            ]),
        },
        created: function() {
            this.fetchExecutions({
                limit: 10,
                venueId: this.venueId
            });
        },

        methods: {
            ...mapActions([
                'fetchExecutions'
            ]),
            generateRows: function() {
                return this.executionElements.map(execution => ({
                    executionId: `<a href="/execute/as_run/${execution.executionId}">${execution.executionId}</a>`,
                    conductors: execution.conductors,
                    timeStarted: execution.timeStarted,
                    timeCompleted: execution.timeCompleted,
                    usedProcedures: execution.usedProcedures,
                    description: execution.description,
                    status: execution.status,
                }));
            },
            fetchExecutionsCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.fetchExecutions({
                    venueId: this.venueId,
                    limit: limit,
                    offset: offset,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    filters: filters,
                });
            }
        }
    };

</script>

<style lang="scss" scoped>

</style>

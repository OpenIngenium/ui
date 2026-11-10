<template>
    <div style="min-height: 500px;">
        <ing-table
            tableId="selectProcedureTable"
            tableTitle="Procedures"
            glyphicon="glyphicon-dashboard"
            :data="procedures"
            :columns="tableColumns"
            :total="procedureCount"
            v-on:handleEvent="setProcedure"
            :callback="fetchProceduresCallback"
            :limit="10"
            :show-items-per-page-selector="false">
        </ing-table>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import ProcedureSelectButton from "./ProcedureSelectButton.vue";
    import ProcedureDetailsButton from "./ProcedureDetailsButton.vue";
    import { mapActions, mapGetters } from "vuex";
    import ProcedureLabelsDisplay from '../../../authoring/ProcedureLabelsDisplay.vue';

    export default {
        name: "SelectProcedureTable",
        components: { IngTable },
        data() {
            return {
                tableColumns: [
                    {
                        field: "title",
                        name: "Title",
                        filterType: "search",
                        wordWrap: true,
                    },
                    {
                        field: "procedure_id",
                        name: "Proc. Id",
                    },
                    {
                        field: 'author',
                        name: 'Author',
                        filterType: "search",
                    },
                    {
                        field: 'time_saved',
                        name: 'Saved',
                    },
                    {
                        field: 'institutional_id',
                        name: 'JPL ID',
                        filterType: "search"
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        wordWrap: true,
                    },
                    {
                        field: 'procedure_type',
                        name: 'Type',
                        filterType: 'selection',
                        filterChoices: ['STR', 'SOP', 'Template', 'V&V', 'EIP', 'Functional']
                    },
                    {
                        field: 'hazardous',
                        name: 'Hazardous',
                        filterType: 'selection',
                        filterChoices: ['true', 'false']
                    },
                    {
                        field: 'label',
                        name: 'Label',
                        component: ProcedureLabelsDisplay,
                        filterType: 'search',
                        normalWrap: true,
                    },
                    {
                        field: 'details',
                        name: 'Details',
                        component: ProcedureDetailsButton,
                        normalWrap: true,
                    },
                    {
                        field: 'choose',
                        name: 'Choose',
                        component: ProcedureSelectButton,
                    },
                ],
                pagination: {
                    limit: 10,
                    page: 1,  // offset = page * 10 - 10
                },
                backwardOpacity: 0.15,
                forwardOpacity: 0.15,
            };
        },
        computed: {
            ...mapGetters([
                "procedures",
                "procedureCount"
            ])
        },
        created: function() {
            // This is empty since procedures are loaded when ing-table is created.
        },
        watch: {
            procedures: function() {
                this.backwardOpacity = this.pagination.page === 1 ? 0.15 : 1;
                this.forwardOpacity = this.pagination.limit > this.procedures.length ? 0.15 : 1;
            },
        },
        methods: {
            ...mapActions([
                "fetchProcedures"
            ]),
            fetchProceduresCallback: function({filters, limit, offset}) {
                this.fetchProcedures({
                    filters: filters,
                    limit: limit,
                    offset: offset
                });
            },
            setProcedure: function(customEvent) {
                this.$emit('setProcedure', customEvent);
            },
        }
    };
</script>

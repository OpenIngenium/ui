<template>
    <div style="margin-top: 5px">
        <div class="col-xs-12" v-if="$can('create', 'Procedure')">
            <div class="right-toolbar">
                <button
                    type="button"
                    class="btn btn-default"
                    @click="showImportModal=true">
                    <i class="glyphicon glyphicon-open actionable"></i>&nbsp;Import Procedure
                </button>
                <button
                    type="button"
                    class="btn btn-default"
                    @click="showAddModal=true">
                    <i class="glyphicon glyphicon-plus"></i>&nbsp;Add
                </button>
            </div>
        </div>
        <div class="col-xs-12">
            <ing-table
                tableId="procedures"
                tableTitle=""
                empty-message="No procedures to display."
                :data="authoringProcedures"
                :columns="tableColumns"
                :total="authoringProceduresCount"
                :limit="limit"
                initialSortField="procedure_id"
                initialSortDirection="DESC"
                :callback="tableCallback"
                @handleEvent="tableEvent">
            </ing-table>
        </div>
        <!-- ADD MODAL -->
        <add-modal :show-modal="showAddModal" @close="showAddModal=false" @created-procedure="refresh"></add-modal>
        <!-- IMPORT MODAL -->
        <import-modal 
            :show-modal="showImportModal"
            @close="showImportModal=false" 
            @imported-procedure="refresh"
            @select-procedure="tableEvent"
        >
        </import-modal>
        <!-- EXPORTED PROCEDURE MODAL -->
        <export-modal :show-modal="showExportModal" :procedure-id="procedureId" @close="showExportModal=false"></export-modal>
        <!-- SPINNER MODAL -->
        <spinner-modal v-if="importingProcedure || isPending"></spinner-modal>
        <feedback-modal></feedback-modal>
        <!-- FOOTER -->
        <div class="col-xs-12">
            <ing-footer></ing-footer>
        </div>
    </div>
</template>
<script>
    import IngTable from '../common/IngTable.vue';
    import AddModal from './ProceduresAddModal.vue';
    import SelectProcedureButton from './SelectProcedureButton.vue';
    import ReleaseVersionDisplay from './ReleaseVersionDisplay.vue';
    import ProcedureLabelsDisplay from './ProcedureLabelsDisplay.vue';
    import { mapGetters, mapActions } from 'vuex';
    import ImportModal from './ImportModal.vue';
    import ExportModal from './ExportModal.vue';
    import SpinnerModal from "../common/SpinnerModal.vue";
    import ProcedureDropdownButton from './ProcedureDropdownButton.vue';
    import FeedbackModal from "../common/FeedbackModal.vue";
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: 'Procedures',
        components: {
            'ing-table': IngTable,
            'add-modal': AddModal,
            'select-procedure-button': SelectProcedureButton,
            'release-version-display': ReleaseVersionDisplay,
            'import-modal': ImportModal,
            'spinner-modal': SpinnerModal,
            'export-modal': ExportModal,
            'feedback-modal': FeedbackModal,
            'ing-footer': IngFooter
        },
        data() {
            return {
                sortDirection: "DESC",
                sortField: 'procedure_id',
                filters: undefined,
                offset: 0,
                limit: 10,
                tableColumns: [
                    {
                        field: 'procedure_id',
                        name: 'Procedure ID',
                        component: SelectProcedureButton,
                        filterType: 'search',
                        sortable: true
                    },
                    {
                        field: 'institutional_id',
                        name: 'Institutional ID',
                        filterType: 'search',
                        sortable: true
                    },
                    {
                        field: 'title',
                        name: 'Title',
                        filterType: 'search',
                    },
                    {
                        field: 'current_version',
                        name: 'Current Version',
                        filterType: 'search',
                    },
                    {
                        field: 'current_released_version',
                        name: 'Released Version',
                        component: ReleaseVersionDisplay,
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
                        field: 'time_saved',
                        name: 'Last Updated',
                        sortable: true
                    },
                    {
                        field: 'author',
                        name: 'Author(s)',
                        filterType: 'search',
                    },
                    {
                        field: 'dropdown',
                        name: '',
                        component: ProcedureDropdownButton,
                        normalWrap: true,
                    },
                ],
                showAddModal: false,
                showImportModal: false,
                showExportModal: false,
                procedureId: '',
            };
        },
        created: function() {
        },
        computed: {
            ...mapGetters([
                'authoringProcedures',
                'authoringProceduresCount',
                'importingProcedure',
                'isPending',
            ]),
        },
        methods: {
            ...mapActions([
                'fetchAuthoringProcedures',
                'setAuthoringProcedureIndex',
            ]),
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.sortDirection = sortDirection;
                this.sortField = sortField;
                this.filters = filters;
                this.limit = limit;
                this.offset = offset;

                this.fetchAuthoringProcedures({
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
                        });
                    },
                    500
                );
            },
            tableEvent: function(event) {
                switch(event.action) {
                    case "selectProcedure":
                        if (event.index !== undefined) {
                            this.setAuthoringProcedureIndex({index: event.index});
                        }
                        this.$router.push({path: `/procedures/${event.data.procedure_id}`});
                        break;
                    case "exportProcedureVersions":
                        this.showExportModal = true;
                        this.procedureId = event.data.procedureId;
                        break;
                    default:
                        break;
                }
            },
        },
    };
</script>
<style lang="scss" scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
</style>

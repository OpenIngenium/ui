<template>
    <div id="admin-spa">
        <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-md-10">
            
                    <button
                        type="button"
                        class="btn btn-default right-toolbar"
                        @click="onAddProcedureLabels">
                        <i class="glyphicon glyphicon-plus"></i>&nbsp;Add Procedure Labels
                    </button>

                    <h2>
                        <span class="glyphicon glyphicon-tag"></span>
                        Manage Procedure Labels
                    </h2>

                    <ing-table
                        tableId="procedureLabels"
                        tableTitle=""
                        empty-message="No labels to display."
                        :data="labels"
                        :total="totalLabels"
                        :limit="limit"
                        initialSortField="name"
                        initialSortDirection="ASC"
                        :columns="tableColumns"
                        :callback="tableCallback"
                        @handleEvent="tableEvent"
                    ></ing-table>

                    <!-- Add Modal -->
                    <add-procedure-label-modal
                        :show-modal="showAddProcedureLabelModal"
                        @close="onCloseAddProcedureLabelModal"
                        :prepopulateData="prepopulateData"
                    ></add-procedure-label-modal>

                    <delete-procedure-label-modal
                        :show-modal="showDeleteLabelModal"
                        :prepopulateData="deleteLabelData"
                        @close="onCloseDeleteProcedureLabelModal"
                        @confirm="onDeleteVenueModal">
                    </delete-procedure-label-modal>
                    
                    <feedback-modal></feedback-modal>
                    <spinner-modal v-if="isPending"></spinner-modal>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DeleteProcedureLabelModal from './DeleteProcedureLabelModal.vue';
    import IngTable from "../../common/IngTable.vue";
    import FeedbackModal from '../../common/FeedbackModal.vue';
    import SpinnerModal from '../../common/SpinnerModal.vue';
    import Sidebar from '../Sidebar.vue';
    import AddProcedureLabelModal from './AddProcedureLabelModal.vue';
    import AdminProcedureLabelActionsDropdown from './AdminProcedureLabelActionsDropdown.vue';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "AdminProcedureLabels",
        data() {
            return {
                offset: 0,
                limit: 10,
                // filters is based on the format used by IngTable
                filters: {
                    name: {
                        value: null
                    }
                },
                showAddProcedureLabelModal: false,
                showDeleteLabelModal: false,
                deleteLabelData: {},
                tableColumns: [
                    {
                        field: 'name',
                        name: 'Name',
                        sortable: true,
                        wordWrap: true
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        sortable: false,
                        wordWrap: true
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: AdminProcedureLabelActionsDropdown,
                        wordWrap: true
                    }
                ],
                prepopulateData: {}
            };
        },
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable,
            'add-procedure-label-modal': AddProcedureLabelModal,
            'delete-procedure-label-modal': DeleteProcedureLabelModal,
            'feedback-modal': FeedbackModal,
            'spinner-modal': SpinnerModal,
        },
        computed: {
            ...mapGetters([
                'labels',
                'totalLabels',
                'isPending'
            ])
        },
        methods: {
            ...mapActions([
                "getLabels",
                "deleteLabel",
                "setPending"
            ]),
            onCloseAddProcedureLabelModal: function(action) {
                this.showAddProcedureLabelModal = false;
                if (action === 'submit') {
                    this.getLabels({
                        limit: this.limit,
                        offset: this.offset,
                        name: this.filters.name ? this.filters.name.value : null
                    });
                }
            },
            onCloseDeleteProcedureLabelModal: function(action) {
                this.showDeleteLabelModal = false;
                if (action === 'submit') {
                    this.getLabels({
                        limit: this.limit,
                        offset: this.offset,
                        name: this.filters.name ? this.filters.name.value : null
                    });
                }
            },
            onAddProcedureLabels: function(event) {
                // reset prepopulateData
                this.prepopulateData = {};
                this.showAddProcedureLabelModal=true;
            },
            tableEvent: async function(event) {
                switch(event.action) {
                    case "deleteLabel": {
                        this.deleteLabelData = event.data;
                        this.showDeleteLabelModal = true;

                        break;
                    }
                }
            },
            onDeleteVenueModal: async function(event) {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);

                this.showDeleteLabelModal = false;
                
                await this.deleteLabel(event.label_id);
                // reload labels so that we can show the venues according to the
                // current pagination of the venues table.
                await this.getLabels({
                    limit: this.limit,
                    offset: this.offset,
                    name: this.filters.name ? this.filters.name.value : null
                });
                this.setPending(false);
            },
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                // note that filters may be an empty object when no filter is set
                this.filters = filters;

                let name = filters.name ? filters.name.value : null;

                this.getLabels({
                    limit,
                    offset,
                    name: name,
                    sort: sortDirection, 
                    sortBy: sortField
                });
            },
        },
    };
</script>

<style scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
</style>
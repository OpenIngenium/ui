<template>
    <div id="admin-spa">
        <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-md-10">
            
                    <button
                        type="button"
                        class="btn btn-default right-toolbar"
                        @click="onAddVenue">
                        <i class="glyphicon glyphicon-plus"></i>&nbsp;Add Venue
                    </button>

                    <h2>
                        <span class="glyphicon glyphicon-oil"></span>
                        Manage Venues
                    </h2>

                    <ing-table
                        tableId="venues"
                        tableTitle=""
                        empty-message="No venues to display."
                        :data="venues"
                        :total="totalVenues"
                        :limit="limit"
                        initialSortField="name"
                        initialSortDirection="ASC"
                        :columns="tableColumns"
                        :callback="tableCallback"
                        @handleEvent="tableEvent"
                    ></ing-table>

                    <!-- Add Modal -->
                    <add-modal
                        :show-modal="showAddVenueModal"
                        @close="onCloseAddVenueModal"
                        :prepopulateData="prepopulateData"
                    ></add-modal>

                    <delete-venue-modal
                        :show-modal="showDeleteVenueModal"
                        :prepopulateData="deleteVenueData"
                        @close="onCloseDeleteVenueModal"
                        @confirm="onDeleteVenueModal">
                    </delete-venue-modal>

                    <!-- Confirm Force Suspend Modal -->
                    <confirm-force-suspend-modal
                        :show-modal="showForceSuspendModal"
                        :prepopulateData="confirmForceSuspendData"
                        @close="onCloseForceSuspendModal"
                        @confirm="onConfirmForceSuspendModal">
                    </confirm-force-suspend-modal>

                    <!-- Confirm Stop Execution Modal -->
                    <confirm-close-execution-modal
                        :show-modal="showStopExecutionModal"
                        :prepopulateData="confirmStopExecutionData"
                        @close="onCloseStopExecutionModal"
                        @confirm="onConfirmStopExecutionModal">
                    </confirm-close-execution-modal>

                    <!-- Change Status Modal -->
                    <change-status-modal
                        :show-modal="showChangeStatusModal"
                        :prepopulateData="changeStatusData"
                        @close="onCloseChangeStatusModal"
                        @confirm="onConfirmChangeStatusModal">
                    </change-status-modal>
                    
                    <feedback-modal></feedback-modal>
                    <spinner-modal v-if="isPending"></spinner-modal>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ConfirmForceSuspend from './ConfirmForceSuspendModal.vue';
    import ConfirmForceClose from './ConfirmForceCloseModal.vue';
    import ChangeStatusModal from './ChangeStatusModal.vue';
    import DeleteVenueModal from './DeleteVenueModal.vue';
    import IngTable from "../../common/IngTable.vue";
    import FeedbackModal from '../../common/FeedbackModal.vue';
    import SpinnerModal from '../../common/SpinnerModal.vue';
    import Sidebar from '../Sidebar.vue';
    import AddModal from './AddModal.vue';
    import AdminVenueActionsDropdown from './AdminVenueActionsDropdown.vue';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "AdminVenues",
        data() {
            return {
                offset: 0,
                limit: 10,
                // filters is based on the format used by IngTable
                filters: {
                    name: {
                        value: null
                    },
                    status: {
                        value: null
                    },
                    venueType: {
                        value: null
                    }
                },
                showAddVenueModal: false,
                showDeleteVenueModal: false,
                showForceSuspendModal: false,
                deleteVenueData: {},
                confirmForceSuspendData: {},
                showStopExecutionModal: false,
                showChangeStatusModal: false,
                confirmStopExecutionData: {},
                changeStatusData: {},
                prepopulateData: {}
            };
        },
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable,
            'add-modal': AddModal,
            'confirm-force-suspend-modal': ConfirmForceSuspend,
            'confirm-close-execution-modal': ConfirmForceClose,
            'change-status-modal':ChangeStatusModal,
            'delete-venue-modal': DeleteVenueModal,
            'feedback-modal': FeedbackModal,
            'spinner-modal': SpinnerModal,
        },
        mounted() {
            this.getVenueGroups({limit: 1000});
        },
        computed: {
            ...mapGetters([
                'venues',
                'totalVenues',
                'isPending',
                'venueGroupNames'
            ]),
            tableColumns: function(state)  {
                return [
                    {
                        field: 'name',
                        name: 'Name',
                        sortable: true,
                        filterType: 'search'
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        sortable: false
                    },
                    {
                        field: 'type',
                        name: 'Type',
                        sortable: false
                    },
                    {
                        field: 'status',
                        name: 'Status',
                        sortable: false
                    },
                    {
                        field: 'venueGroupName',
                        name: 'Venue Group',
                        sortable: false,
                        filterType: 'selection',
                        filterChoices: this.venueGroupNames,
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: AdminVenueActionsDropdown,
                        wordWrap: true
                    }
                ];
            },            
        },
        methods: {
            ...mapActions([
                "getVenueGroups",
                "getVenues",
                "deleteVenue",
                "editVenue",
                "closeExecution",
                "suspendExecution",
                "changeVenueStatus",
                "setPending"
            ]),
            onCloseAddVenueModal: function(action) {
                this.showAddVenueModal = false;
                if (action === 'submit') {
                    this.getVenues({
                        limit: this.limit,
                        offset: this.offset,
                        venue_name: this.filters.name ? this.filters.name.value : null,
                        status: this.filters.status ? this.filters.status.value : null,
                        venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                        venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                    });
                }
            },
            onCloseDeleteVenueModal: function(action) {
                this.showDeleteVenueModal = false;
                if (action === 'submit') {
                    this.getVenues({
                        limit: this.limit,
                        offset: this.offset,
                        venue_name: this.filters.name ? this.filters.name.value : null,
                        status: this.filters.status ? this.filters.status.value : null,
                        venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                        venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                    });
                }
            },
            onCloseForceSuspendModal: function() {
                this.showForceSuspendModal = false;
            },
            onCloseStopExecutionModal: function() {
                this.showStopExecutionModal = false;
            },
            onCloseChangeStatusModal: function() {
                this.showChangeStatusModal = false;
            },
            onAddVenue: function(event) {
                // reset prepopulateData
                this.prepopulateData = {};
                this.showAddVenueModal=true;
            },
            tableEvent: async function(event) {
                switch(event.action) {
                    case "deleteVenue": {
                        this.deleteVenueData = event.data;
                        this.showDeleteVenueModal = true;

                        break;
                    }
                    case "stopExecution": {
                        this.confirmStopExecutionData = event.data;
                        this.showStopExecutionModal = true;

                        break;
                    }
                    case "forceSuspend": {
                        this.confirmForceSuspendData = event.data;
                        this.showForceSuspendModal = true;

                        break;
                    }
                    case "updateVenue": {
                        this.prepopulateData = {
                            name: event.data.name,
                            description: event.data.description,
                            ampcs_address: event.data.ampcsAddress,
                            type: event.data.type,
                            location: event.data.location,
                            venueId: event.data.venueId,
                            venueGroupId: event.data.venueGroupId,
                            venueGroupName: event.data.venueGroupName,
                        };
                        this.showAddVenueModal = true;

                        break;
                    }
                    case "changeStatus": {
                        this.changeStatusData = event.data;
                        this.showChangeStatusModal = true;
                        break;
                    }
                }
            },
            onDeleteVenueModal: async function(event) {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);

                this.showDeleteVenueModal = false;

                await this.deleteVenue(event.venueId);
                // reload venues so that we can show the venues according to the
                // current pagination of the venues table.
                await this.getVenues({
                    limit: this.limit,
                    offset: this.offset,
                    venue_name: this.filters.name ? this.filters.name.value : null,
                    status: this.filters.status ? this.filters.status.value : null,
                    venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                    venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                });
                this.setPending(false);
            },
            onConfirmForceSuspendModal: async function(event) {
                this.showForceSuspendModal = false;

                const success = await this.suspendExecution({
                    executionId: event.executionId
                });

                await this.getVenues({
                    limit: this.limit,
                    offset: this.offset,
                    venue_name: this.filters.name ? this.filters.name.value : null,
                    status: this.filters.status ? this.filters.status.value : null,
                    venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                    venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                });
            },
            onConfirmStopExecutionModal: async function(event) {
                this.showStopExecutionModal = false;

                await this.closeExecution({
                    executionId: event.executionId
                });

                await this.getVenues({
                    limit: this.limit,
                    offset: this.offset,
                    venue_name: this.filters.name ? this.filters.name.value : null,
                    status: this.filters.status ? this.filters.status.value : null,
                    venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                    venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                });
            },
            onConfirmChangeStatusModal: async function(event) {
                this.showChangeStatusModal = false;

                const venueId = this.changeStatusData.venueId;
                const statusInfo = {
                    status: event.status
                };
                await this.changeVenueStatus({venueId, statusInfo});

                await this.getVenues({
                    limit: this.limit,
                    offset: this.offset,
                    venue_name: this.filters.name ? this.filters.name.value : null,
                    status: this.filters.status ? this.filters.status.value : null,
                    venue_type: this.filters.venueType ? this.filters.venueType.value : null,
                    venue_group_name: this.filters.venueGroupName ? this.filters.venueGroupName.value : null,
                });
            },
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                // note that filters may be an empty object when no filter is set
                this.filters = filters;

                let name = filters.name ? filters.name.value : null;
                let status = filters.status ? filters.status.value : null;
                let type = filters.type ? filters.type.value : null;
                let venue_group_name = filters.venueGroupName ? filters.venueGroupName.value : null;

                this.getVenues({
                    limit,
                    offset,
                    venue_name: name,
                    venue_group_name: venue_group_name,
                    status,
                    venue_type: type,
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
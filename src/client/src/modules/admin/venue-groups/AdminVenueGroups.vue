<template>
    <div id="admin-spa">
        <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-md-10">
            
                    <button
                        type="button"
                        class="btn btn-default right-toolbar"
                        @click="onAddVenueGroup">
                        <i class="glyphicon glyphicon-plus"></i>&nbsp;Add Venue Group
                    </button>

                    <h2>
                        <span class="glyphicon glyphicon-oil"></span>
                        Manage Venue Groups
                    </h2>

                    <ing-table
                        tableId="venueGroups"
                        tableTitle=""
                        empty-message="No venue groups to display."
                        :data="venueGroups"
                        :total="totalVenueGroups"
                        :limit="limit"
                        initialSortField="name"
                        initialSortDirection="ASC"
                        :columns="tableColumns"
                        :callback="tableCallback"
                        @handleEvent="tableEvent"
                    ></ing-table>

                    <!-- Add Modal -->
                    <add-modal
                        :show-modal="showAddVenueGroupModal"
                        @close="onCloseAddVenueGroupModal"
                        :prepopulateData="prepopulateData"
                    ></add-modal>
                    
                    <feedback-modal></feedback-modal>
                    <spinner-modal v-if="isPending"></spinner-modal>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import FeedbackModal from '../../common/FeedbackModal.vue';
    import SpinnerModal from '../../common/SpinnerModal.vue';
    import Sidebar from '../Sidebar.vue';
    import AddVenueGroupModal from './AddVenueGroupModal.vue';
    import AdminVenueGroupActionsDropdown from './AdminVenueGroupActionsDropdown.vue';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "AdminVenueGroups",
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
                },
                showAddVenueGroupModal: false,
                showChangeStatusModal: false,
                changeStatusData: {},
                prepopulateData: {}
            };
        },
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable,
            'add-modal': AddVenueGroupModal,
            'feedback-modal': FeedbackModal,
            'spinner-modal': SpinnerModal,
        },
        mounted() {
        },
        computed: {
            ...mapGetters([
                'venueGroups',
                'totalVenueGroups',
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
                        field: 'status',
                        name: 'Status',
                        sortable: false,
                        filterType: 'selection',
                        filterChoices: ['ACTIVE', 'INACTIVE']
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: AdminVenueGroupActionsDropdown,
                        wordWrap: true
                    }
                ];
            },            
        },
        methods: {
            ...mapActions([
                "getVenueGroups",
                "editVenueGroup",
                "setPending"
            ]),
            onCloseAddVenueGroupModal: function(action) {
                this.showAddVenueGroupModal = false;
                if (action === 'submit') {
                    this.getVenueGroups({
                        limit: this.limit,
                        offset: this.offset,
                        venue_name: this.filters.name ? this.filters.name.value : null,
                        status: this.filters.status ? this.filters.status.value : null,
                    });
                }
            },
            onCloseChangeStatusModal: function() {
                this.showChangeStatusModal = false;
            },
            onAddVenueGroup: function(event) {
                // reset prepopulateData
                this.prepopulateData = {};
                this.showAddVenueGroupModal=true;
            },
            tableEvent: async function(event) {
                switch(event.action) {
                    case "updateVenueGroup": {
                        this.prepopulateData = {
                            venueGroupId: event.data.venueGroupId,
                            name: event.data.name,
                            description: event.data.description,
                            status: event.data.status,
                        };
                        this.showAddVenueGroupModal = true;

                        break;
                    }
                    case "changeStatus": {
                        this.changeStatusData = event.data;
                        this.showChangeStatusModal = true;
                        break;
                    }
                }
            },
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                // note that filters may be an empty object when no filter is set
                this.filters = filters;

                let name = filters.name ? filters.name.value : null;
                let status = filters.status ? filters.status.value : null;

                this.getVenueGroups({
                    limit,
                    offset,
                    venue_group_name: name,
                    status,
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
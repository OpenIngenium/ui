<template>
   <div id="admin-spa">
       <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-sm-10">
                    <button
                        type="button"
                        class="btn btn-default right-toolbar"
                        @click="onShowAddRoleModal">
                        <i class="glyphicon glyphicon-plus"></i>&nbsp;Add Role
                    </button>

                    <h2>
                        <span class="glyphicon glyphicon-eye-open"></span>
                        Manage Roles
                    </h2>

                    <ing-table
                        tableId="roles"
                        tableTitle=""
                        empty-message="No roles to display."
                        :data="roles"
                        :columns="tableColumns"
                        :total="rolesCount"
                        :limit="limit"
                        initialSortField="name"
                        initialSortDirection="ASC"
                        :callback="tableCallback"
                        @handleEvent="tableEvent"
                    >
                    </ing-table>

                    <!-- Add Role Modal -->
                    <add-role-modal
                        v-if="showAddRoleModal"
                        @close="showAddRoleModal=false"
                        :prepopulateData="prepopulateData"
                        @refreshRoles="refreshRoles"
                    >
                    </add-role-modal>

                </div>
            </div>
        </div>
   </div> 
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import Sidebar from '../Sidebar.vue';
    import AddRoleModal from './AddRoleModal.vue';
    import RoleActionsDropdown from './RoleActionsDropdown.vue';
    import { mapGetters, mapActions } from 'vuex';

    import adminApi from '../../../api/admin';

    export default {
        name: "AdminRoles",
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable,
            'add-role-modal': AddRoleModal
        },
        data() {
            return {
                offset: 0,
                limit: 10,
                filters: {},
                sortDirection: 'ASC',
                showAddRoleModal: false,
                prepopulateData: {}
            };
        },
        async mounted() {
            await this.fetchPermissions();
            await this.getVenueGroups({limit: 1000});
        },
        computed: {
            ...mapGetters([
                'permissionIdToName',
                'roles',
                'rolesCount',
                'venueGroupNames',
                'venueGroupIdMap'
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
                    },
                    {
                        field: 'venueGroupName',
                        name: 'Venue Group',
                        filterType: 'selection',
                        filterChoices: this.venueGroupNames,
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: RoleActionsDropdown,
                        wordWrap: true
                    }
                ];
            },
        },
        methods: {
            ...mapActions([
                "deleteRole",
                "fetchRoles",
                "fetchRole",
                "fetchPermissions",
                "getVenueGroups"
            ]),
            onShowAddRoleModal: function() {
                // always reset state before adding a new role
                this.prepopulateData = {};
                this.showAddRoleModal = true;
            },
            getRolePermissionNames: function(permissions) {
                const permissionNames = [];
                for (const permission of permissions) {
                    const permissionName = this.permissionIdToName[`${permission}`];
                    if (permissionName) {
                        permissionNames.push(permissionName);
                    } else {
                        console.warn(`permission not found. id: ${permission}`);
                    }
                }
                return permissionNames;
            },
            tableEvent: async function(event) {
                switch(event.action) {
                    case "deleteRole": {
                        // console.log("deleteRole, roleId: ", event.data);
                        await this.deleteRole(event.data.id);
                        const queryParams = {
                            order: this.sortDirection,
                            limit: this.limit, 
                            offset: this.offset,
                        };
                        await this.fetchRoles(queryParams);
                        break;
                    }
                    case "updateRole": {
                        // fetch individual roles properties
                        const { data: role } = await adminApi.getRole(event.data.id);

                        this.prepopulateData = {
                            venueGroupId: role.venue_group_id,
                            name: role.name,
                            description: role.description,
                            checkedPermissions: this.getRolePermissionNames(role.permissions),
                            users: role.users.map(user => user.username),
                            groups: role.groups,
                            roleId: event.data.id
                        };

                        this.showAddRoleModal = true;

                        break;
                    }
                }
            },
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                this.sortDirection = sortDirection;
                this.filters = filters;

                // auth api supports sort by name only
                const queryParams = {
                    order: sortDirection,
                    limit, 
                    offset,
                };
                for (const [name, filter] of Object.entries(filters)) {
                    if (filter.value) {
                        if (name === 'name') {
                            // use the query parameter of auth API
                            queryParams['name'] = filter.value;
                        } else if (name === 'venueGroupName') {
                            const venue_group_id = this.venueGroupIdMap[filter.value];
                            if (venue_group_id) {
                                queryParams['venue_group_id'] = venue_group_id;
                            } else {
                                console.warn(`venue group was not found with name: ${filter.value}`);
                            }
                        }
                    }
                }
                this.fetchRoles(queryParams);
            },
            refreshRoles: function() {
                this.tableCallback({
                    sortDirection: this.sortDirection,
                    offset: this.offset,
                    limit: this.limit,
                    filters: this.filters
                });
            }
        }
    };
</script>

<style scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
</style>

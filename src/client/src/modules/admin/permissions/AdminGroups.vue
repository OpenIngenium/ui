<template>
   <div id="admin-spa">
       <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-md-10">

                    <h2>
                        <span class="glyphicon glyphicon-folder-close"></span>
                        Manage Groups
                    </h2>

                    <ing-table
                        tableId="groups"
                        tableTitle=""
                        empty-message="No groups to display."
                        :data="groups"
                        :total="groupsCount"
                        :limit="limit"
                        initialSortField="name"
                        initialSortDirection="DESC"
                        :columns="tableColumns"
                        @handleEvent="tableEvent"
                    >
                    </ing-table>

                </div>
            </div>
       </div>
   </div> 
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import Sidebar from '../Sidebar.vue';

    export default {
        name: "AdminGroups",
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable
        },
        data() {
            return {
                groups: [
                    {
                        name: 'Admin',
                        roles: 'Sys Eng',
                        scopes: 'basic',
                        users: 'View Users',
                        created_at: '2020-04-20T16:46:33Z',
                        updated_at: '2020-04-20T16:46:33Z'
                    }
                ],
                groupsCount: 1,
                offset: 0,
                limit: 10,
                tableColumns: [
                    {
                        field: 'name',
                        name: 'Name',
                        sortable: true
                    },
                    {
                        field: 'roles',
                        name: 'Role(s)',
                        sortable: true
                    },
                    {
                        field: 'scopes',
                        name: 'Scope(s)',
                        sortable: true
                    },
                    {
                        field: 'users',
                        name: 'User(s)',
                        sortable: true
                    },
                    {
                        field: 'created_at',
                        name: 'Created At',
                        sortable: true
                    },
                    {
                        field: 'updated_at',
                        name: 'Updated At',
                        sortable: true
                    }
                ]
            };
        }
    };
</script>

<style scoped>

</style>

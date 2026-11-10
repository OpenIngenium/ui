<template>
   <div id="admin-spa">
       <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-sm-10">

                    <h2>
                        <span class="glyphicon glyphicon-user"></span>
                        Manage Users
                    </h2>

                    <ing-table
                        tableId="users"
                        tableTitle=""
                        empty-message="No users to display."
                        :data="users"
                        :total="usersCount"
                        :limit="limit"
                        initialSortField="username"
                        initialSortDirection="ASC"
                        :columns="tableColumns"
                        :callback="tableCallback"
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
    import { mapActions, mapGetters } from 'vuex';
    import _ from 'lodash';

    export default {
        name: "AdminUsers",
        components: {
            'sidebar': Sidebar,
            'ing-table': IngTable
        },
        data() {
            return {
                limit: 10,
                offset: 0,
                tableColumns: [
                    {
                        field: 'username',
                        name: 'Username',
                        sortable: true,
                        filterType: 'search',
                    },
                    {
                        field: 'display_name',
                        name: 'Display Name',
                    },
                    {
                        field: 'loggedin',
                        name: 'Logged In',
                        filterType: 'selection',
                        filterChoices: ['Any', 'Yes', 'No']
                    },
                    {
                        field: 'createdAt',
                        name: 'Created At',
                    },
                    {
                        field: 'updatedAt',
                        name: 'Updated At',
                    }
                ]
            };
        },
        computed: {
            ...mapGetters([
                "users",
                "usersCount"
            ])
        },
        methods: {
            ...mapActions([
                "fetchUsers"
            ]),
            tableEvent: function(event) {
                console.log("event:" , event);
            },
            tableCallback: function({sortDirection, sortField, filters, limit, offset}) {
                // filters is passed from IngTable. 
                // It should not be mutated in this component, since it is managed by IngTable
                this.limit = limit;
                this.offset = offset;

                // auth api supports sort by name only
                const queryParams = {
                    order: sortDirection,
                    limit, 
                    offset,
                };
                for (const [name, filter] of Object.entries(filters)) {
                    if (filter.value) {
                        if (name === 'loggedin') {
                            if (filter.value === 'Any') {
                                // do not include since 'Any' is not a supported value.
                                // simply do not pass it to get all users.
                            } else {
                                queryParams[name] = filter.value;
                            }                      
                        }
                        else if (name === 'username') {
                            // use the query parameter of auth API
                            queryParams['q'] = filter.value;
                        }
                    }
                }
                this.fetchUsers(queryParams);
            }
        }
    };
</script>

<style scoped>

</style>

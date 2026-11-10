<template>
    <div class="row">
        <h4><i class="glyphicon glyphicon-book"></i> Project Configuration &raquo; Custom Scripts</h4>
        <ing-table
            tableId="customScripts"
            tableTitle=""
            class="custom_scripts_table"
            :data="Object.values(_custom_scripts)"
            :columns="tableColumns"
            :total="customScriptsCount"
            empty-message="No Custom Scripts to display."
            :callback="fetchCallback"
            :limit="limit"
            @handleEvent="handleTableEvent">
        </ing-table>
        <feedback-modal></feedback-modal>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";
    import CustomScriptDetails from "../common/CustomScriptsDetails.vue";
    import { mapActions, mapGetters } from "vuex";
    import _ from 'lodash';
    import CustomScriptsActionsDropdown from "./CustomScriptsActionsDropdown.vue";
    import FeedbackModal from "../../common/FeedbackModal.vue";
    import IngFooter from "../../common/IngFooter.vue";

    export default {
        name: 'CustomScripts',
        components: {
            IngTable,
            FeedbackModal,
            'ing-footer': IngFooter
        },
        computed: {
            ...mapGetters([
                "customScripts",
                "customScriptsCount"
            ]),
            _custom_scripts: function() {
                return this.customScripts;
            },
        },
        created: function() {
            // This is empty since the script list is loaded by IngTable
        },
        methods: {
            ...mapActions([
                "fetchCustomScripts",
            ]),
            fetchCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.lastOptions = {
                    sortDirection,
                    sortField,
                    filters,
                    limit,
                    offset
                };
                this.offset = offset;
                this.limit = limit;
                this.fetchCustomScripts(this.lastOptions);
            },
            handleTableEvent: function(event) {
                // For now, treat any child action that updates/deletes data as a signal to refresh.
                // We only refresh if we have previous options (table has already loaded once).
                if (this.lastOptions) {
                    this.fetchCustomScripts(this.lastOptions);
                }
            }
        },
        data() {
            return {
                lastOptions: null,
                tableColumns: [
                    {
                        field: "script_path",
                        name: "Path",
                        filterType: "search",
                        sortable: true,
                        wordWrap: true
                    },
                    {
                        field: "description",
                        name: "Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "status",
                        name: "Status",
                        filterType: "search",
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: CustomScriptDetails,
                        wordWrap: null
                    },
                    {
                        field: "actions",
                        name: "Actions",
                        component: CustomScriptsActionsDropdown,
                    }
                ],
                limit: 10,
                offset: 0
            };
        }
    };
</script>

<style lang="scss" scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
</style>

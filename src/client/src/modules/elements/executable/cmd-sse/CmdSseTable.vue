<template>
    <div id="modal">
        <div class="alert alert-info">
            <span class="glyphicon glyphicon-random"></span>
                Currently searching Dictionary Version {{ getDictionaryVersion() }}
        </div>
        <ing-table
            tableId="cmdSseTable"
            table-title="CMDs"
            class="cmd_table"
            :data="generateRows()"
            :columns="tableColumns"
            :total="cmdCount"
            v-on:handleEvent="selectCmd"
            empty-message="No CMDs present."
            :callback="fetchCmdSseCallback"
            :limit="10">
        </ing-table>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import CmdSseChooseButton from './CmdSseChooseButton.vue';
    import CmdSseDetailsButton from './CmdSseDetailsButton.vue';
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "CmdSseTable",
        components: { IngTable, CmdSseChooseButton },
        props: {
            cmdType: {
                type: String
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "command_stem",
                        name: "Command Stem",
                        sortable: true,
                        filterType: "search"
                    },
                    {
                        field: "operations_category",
                        name: "Operational Category"
                    },
                    {
                        field: "cmd_description",
                        name: "Description",
                        sortable: false,
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: CmdSseDetailsButton,
                        wordWrap: null
                    },
                    {
                        field: "choose",
                        name: "Choose",
                        component: CmdSseChooseButton
                    }
                ],
                tableLimit: 5
            };
        },
        computed: {
            ...mapGetters([
                'cmds',
                'cmdCount',
                'selectedSseDictionaryVersion',
            ]),
        },

        created: function() {
            this.fetchCmds({
                dictionaryVersion: this.selectedSseDictionaryVersion,
                limit: 10
            });
        },

        methods: {
            ...mapActions([
                "fetchCmds"
            ]),

            generateRows: function() {
                return this.cmds.map(cmd => ({
                    command_stem: cmd.command_stem,
                    operations_category: cmd.operations_category,
                    cmd_description: cmd.cmd_description,
                    details: cmd.details,
                }));
            },

            fetchCmdSseCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.fetchCmds({
                    dictionaryVersion: this.selectedSseDictionaryVersion, 
                    sortDirection: sortDirection, 
                    sortField: sortField, 
                    filters: filters, 
                    limit: limit, 
                    offset: offset
                });
            },

            getDictionaryVersion: function() {
                return this.selectedSseDictionaryVersion ? this.selectedSseDictionaryVersion : 'None';
            },

            selectCmd: function(customEvent) {
                event.preventDefault();
                const selectedCmdString = customEvent.data.command_stem;
                this.$emit('selectCmd', selectedCmdString);
            }
        }
    };
</script>

<style scoped>

#modal {
    max-height: calc(100vh - 210px);
    overflow-y: auto;
}
</style>

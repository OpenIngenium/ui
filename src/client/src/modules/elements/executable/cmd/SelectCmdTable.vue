<template>
    <div>
        <div class="alert alert-info">
            <span class="glyphicon glyphicon-random"></span>
                Currently searching FLIGHT Dictionary Version {{this.selectedFlightDictionaryVersion}}
        </div>
        <ing-table
            tableId="selectCmdTable"
            tableTitle="CMDs"
            class="cmd_table"
            :data="generateRows()"
            :columns="tableColumns"
            :total="cmdBuilderCount"
            v-on:handleEvent="selectedCmd"
            empty-message="No CMDs to display."
            :callback="fetchCmdStringCallback"
            :limit="10">
        </ing-table>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import CmdSelectButton from "./CmdSelectButton.vue";
    import CmdDetailButton from "./CmdDetailButton.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "SelectCmdTable",
        components: { IngTable, CmdSelectButton },
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
                        name: "Operations Category",
                        sortable: false,
                        filterType: "search"
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
                        component: CmdDetailButton,
                        wordWrap: null,
                    },
                    {
                        field: "choose",
                        name: "Choose",
                        component: CmdSelectButton
                    }
                ]
            };
        },
        computed: {
            ...mapGetters([
                "builderCmds",
                "cmdBuilderCount",
                "selectedFlightDictionaryVersion"
            ])
        },
        created: function() {
            this.fetchFlightCmds({
                dictionaryVersion: this.selectedFlightDictionaryVersion,
                limit:10
            });
        },
        methods: {
            ...mapActions([
                "setCmd",
                "fetchFlightCmds"
            ]),
            generateRows: function() {
                return this.builderCmds;
            },
            fetchCmdStringCallback: function({ sortDirection, sortField, filters, limit, offset }){
                this.fetchFlightCmds({
                    dictionaryVersion: this.selectedFlightDictionaryVersion,
                    sortDirection: sortDirection,
                    sortField: sortField,
                    filters: filters,
                    limit: limit,
                    offset: offset,
                    wild: true
                });
            },
            selectedCmd: function(event) {
                this.setCmd({
                    dictionaryVersion: this.selectedFlightDictionaryVersion,
                    command_stem: event.data.command_stem
                });
            }
        }
    };
</script>

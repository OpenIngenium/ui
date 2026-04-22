<template>
    <div>
        <div class="alert alert-info">
            <span class="glyphicon glyphicon-random"></span>
                Currently searching {{evrType}} Dictionary Version {{ getDictionaryVersion() }}
        </div>
        <ing-table
            tableId="selectEvrTable"
            tableTitle="EVRs"
            class="evr_table"
            :data="generateRows()"
            :columns="tableColumns"
            :total="evrCount"
            v-on:handleEvent="selectEvr"
            empty-message="No EVRs to display."
            :callback="fetchEvrsCallback"
            :limit="10">
        </ing-table>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import EvrSelectButton from "./EvrSelectButton.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "SelectEvrTable",
        components: { IngTable, EvrSelectButton },
        props: {
            evrType: {
                type: String
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "evr_name",
                        sortable: true,
                        name: "Name",
                        filterType: "search"
                    },
                    {
                        field: "evr_level",
                        sortable: false,
                        name: "Level",
                        filterType: "search"
                    },
                    {
                        field: "operations_category",
                        sortable: false,
                        name: "Operational Category",
                        filterType: "search"
                    },
                    {
                        field: "evr_description",
                        sortable: false,
                        name: "Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "evr_message",
                        sortable: false,
                        name: "Message",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "choose",
                        name: "Choose",
                        component: EvrSelectButton
                    }
                ]
            };
        },
        computed: {
            ...mapGetters([
                "evrs",
                "evrCount",
                "selectedSseDictionaryVersion",
                "selectedFlightDictionaryVersion"
            ])
        },
        created: function() {
            switch(this.evrType) {
                case "SSE":
                    if (this.selectedSseDictionaryVersion) {
                        this.fetchSseEvrs({
                            dictionaryVersion: this.selectedSseDictionaryVersion,
                            limit:10
                        });
                    }

                    break;
                case "FLIGHT":
                    if (this.selectedFlightDictionaryVersion) {
                        this.fetchFlightEvrs({
                            dictionaryVersion: this.selectedFlightDictionaryVersion,
                            limit:10
                        });
                    }

                    break;
            }
        },
        methods: {
            ...mapActions([
                "fetchFlightEvrs",
                "fetchSseEvrs",
                "fetchEvrs"
            ]),
            generateRows: function() {
                return this.evrs.map(evr => ({
                    evr_name: evr.evr_name,
                    evr_level: evr.evr_level,
                    operations_category: evr.operations_category,
                    evr_description: evr.evr_description,
                    evr_message: evr.evr_message
                }));
            },
            fetchEvrsCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                switch(this.evrType) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEvrs({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                sortDirection: sortDirection,
                                sortField: sortField,
                                filters: filters,
                                limit: limit,
                                offset: offset,
                                wild: true,
                            });
                        }

                        break;
                    case "FLIGHT":
                        if (this.selectedFlightDictionaryVersion) {
                            this.fetchFlightEvrs({
                                dictionaryVersion: this.selectedFlightDictionaryVersion,
                                sortDirection: sortDirection,
                                sortField: sortField,
                                filters: filters,
                                limit: limit,
                                offset: offset,
                                wild: true,
                            });
                        }

                        break;
                }
            },
            getDictionaryVersion: function() {
                switch(this.evrType) {
                    case "SSE":
                        return this.selectedSseDictionaryVersion ? this.selectedSseDictionaryVersion : 'None';
                    case "FLIGHT":
                        return this.selectedFlightDictionaryVersion ? this.selectedFlightDictionaryVersion : 'None';
                    default:
                        return '';
                }
            },
            selectEvr: function(customEvent) {
                this.$emit('selectEvr', customEvent);
            }
        }
    };
</script>

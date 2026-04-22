<template>
    <div id="modal">
        <div class="alert alert-info">
            <span class="glyphicon glyphicon-random"></span>
                Currently searching Dictionary Version {{ getDictionaryVersion() }}
        </div>
        <ing-table
            tableId="waitEhaTable"
            table-title="EHAs"
            class="eha_table"
            :data="generateRows()"
            :columns="tableColumns"
            :total="ehaCount"
            v-on:handleEvent="selectEha"
            empty-message="No EHAs present."
            :callback="fetchEhaCallback"
            :limit="10">
        </ing-table>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import WaitEhaSelectButton from "./WaitEhaSelectButton.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "WaitEhaTable",
        components: { IngTable, WaitEhaSelectButton },
        props: {
            channelType: {
                type: String
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "channel_id",
                        name: "Channel ID",
                        sortable: false,
                        filterType: "search"
                    },
                    {
                        field: "channel_name",
                        name: "Name",
                        sortable: true,
                        filterType: "search"
                    },
                    {
                        field: "operations_category",
                        name: "Operation Category",
                        sortable: false,
                        filterType: "search",

                    },
                    {
                        field: "description",
                        name: "Description",
                        sortable: false,
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "derived",
                        name: "Derived",
                        sortable: false,
                        filterType: "selection",
                        filterChoices: ["no", "yes"]
                    },
                    {
                        field: "choose",
                        name: "Choose",
                        component: WaitEhaSelectButton
                    }
                ],
                tableLimit: 5
            };
        },
        computed: {
            ...mapGetters([
                'ehas',
                'ehaCount',
                'selectedSseDictionaryVersion',
                'selectedFlightDictionaryVersion'
            ]),
        },

        created: function() {
            switch(this.channelType) {
                case "SSE":
                    if (this.selectedSseDictionaryVersion) {
                        this.fetchSseEhas({
                            dictionaryVersion: this.selectedSseDictionaryVersion,
                            limit: 10
                        });
                    }

                    break;
                case "FLIGHT":
                    if (this.selectedFlightDictionaryVersion) {
                        this.fetchFlightEhas({
                            dictionaryVersion: this.selectedFlightDictionaryVersion,
                            limit: 10
                        });
                    }

                    break;
            }

        },

        methods: {
            ...mapActions([
                'fetchFlightEhas',
                'fetchSseEhas'
            ]),

            generateRows: function() {
                return this.ehas;
            },

            fetchEhaCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                switch(this.channelType) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEhas({
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
                            this.fetchFlightEhas({
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
                switch (this.channelType) {
                    case "SSE":
                        return this.selectedSseDictionaryVersion ? this.selectedSseDictionaryVersion : 'None';
                    case "FLIGHT":
                        return this.selectedFlightDictionaryVersion ? this.selectedFlightDictionaryVersion : 'None';
                    default:
                        return '';
                }
            },

            selectEha: function(customEvent) {
                event.preventDefault();
                const selectedEha = customEvent.data;
                this.$emit('selectEha', selectedEha);
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

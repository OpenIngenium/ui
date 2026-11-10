<template>
    <div class="row" >
        <h4><i class="glyphicon glyphicon-book"></i> Project Configuration &raquo; Flight Dictionary</h4>
        <ing-table
            tableId="flightDictionary"
            tableTitle=""
            class="flight_table"
            :data="flight"
            :columns="tableColumns"
            :total="count"
            v-on:handleEvent="handleTableEvent"
            empty-message="No Flight Dictionaries to display."
            :callback="fetchFlightDictCallback"
            :limit="10">
        </ing-table>
        <update-modal
            :showModal="showUpdateModal"
            :version="currVersion"
            @refreshDictionaries="refreshDictionaries"
            @close="showUpdateModal = false">
        </update-modal>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import VersionSelectButton from "../common/VersionSelectButton.vue";
    import { mapActions, mapGetters } from "vuex";
    import UpdateButton from "../common/UpdateButton.vue";
    import FlightDictionaryUpdateModal from "./FlightDictionaryUpdateModal.vue";
    import _ from 'lodash';
    import FlightDictionaryDeleteModal from "./FlightDictionaryDeleteModal.vue";
    import IngFooter from "../../common/IngFooter.vue";

    export default {
        name: 'FlightDictionary',
        components: {
            IngTable,
            "update-modal": FlightDictionaryUpdateModal,
            'ing-footer': IngFooter
        },
        computed: {
            ...mapGetters([
                "flightIndex",
                "flightTotalCount",
            ]),
            flight: function() {
                let formatedVersions = [];
                _.forEach(this.flightIndex, function(version, key) {
                    if(key != "total_count")
                        formatedVersions.push(version);
                });
                
                return formatedVersions;
            },
            count: function() { return this.flightTotalCount; },
        },
        created: function() {
            this.fetchFlightDicts({
                limit: 10
            });
        },
        methods: {
            ...mapActions([
                "fetchFlightDicts",
            ]),
            refreshDictionaries: function() {
                this.fetchFlightDictCallback({
                    sortDirection: this.sortDirection,
                    sortField: this.sortField,
                    filters: this.filters,
                    limit: this.limit,
                    offset: this.offset
                });
            },
            fetchFlightDictCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.sortDirection = sortDirection;
                this.sortField = sortField;
                this.filters = filters;
                this.limit = limit;
                this.offset = offset;

                this.fetchFlightDicts({
                    sortDirection: sortDirection, 
                    sortField: sortField, 
                    filters: filters, 
                    limit: limit, 
                    offset: offset
                });
            },
            handleTableEvent: function(event) {
                switch(event.action) {
                    case "selectVersion":
                        this.selectVersion(event.data);
                        break;
                    case "updateVersion":
                        this.updateVersion(event.data);
                        break;
                    default:
                        break;
                }
            },
            selectVersion: function(data) {
                this.$router.push({ path: `/project_configuration/flight/${data.version}`});
            },
            updateVersion: function(version) {
                this.currVersion = version;
                this.showUpdateModal = true;
            },
            handleUpdateModalClose: function() {
                this.showUpdateModal = false;
            },
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "version",
                        name: "Version",
                        component: VersionSelectButton,
                        sortable: true
                    },
                    {
                        field: "creation_date",
                        name: "Creation Date",
                        sortable: true
                    }, 
                    {
                        field: "state",
                        name: "State",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "dictionary_description",
                        filterType: "search",
                        name: "Description",
                        wordWrap: true
                    },
                    {
                        field: "edit",
                        name: "edit-icon",
                        component: UpdateButton
                    },
                    {
                        field: "delete",
                        name: "delete-icon",
                        component: FlightDictionaryDeleteModal
                    }
                ],
                currVersion: "",
                showUpdateModal: false,
                sortDirection: 'ASC',
                sortField: '',
                filters: {},
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

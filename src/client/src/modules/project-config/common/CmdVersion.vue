<template>
    <div class="row">
        <ing-table
            tableId="cmdVersion"
            v-if="componentLoaded"
            tableTitle="CMDs"
            class="cmd_table"
            :data="versions"
            :columns="tableColumns"
            :total="versionsCount"
            empty-message="No CMDs to display."
            :callback="fetchVersionsCallback"
            :limit="10">
        </ing-table>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";
    import IngModal from "../../common/IngModal.vue";

    import CmdDetails from './CmdDetails.vue';

    import { mapActions, mapGetters } from "vuex";

    import _ from 'lodash';

    export default {
        name: 'CmdVersion',
        components: {
            IngTable,
            IngModal,
            CmdDetails
        },
        computed: {
            ...mapGetters([
                "sseVersions",
                "flightVersions",
                "totalCount"
            ]),
            versions: function() {
                // default

                // if type == "-"
                // fetch indivual flight dict
                let versions = this.dict_type === "sse" ?
                    this.sseVersions(this.version, this.type) :
                    this.flightVersions(this.version, this.type);

                let formatedVersions = [];
                _.forEach(versions, function(version, key) {
                    if(key != "total_count")
                        formatedVersions.push(version);
                });

                return formatedVersions;
            },
            versionsCount: function() {
                let count = this.dict_type === "sse" ?
                    this.sseVersions(this.version, this.type).total_count :
                    this.flightVersions(this.version, this.type).total_count;
                return count;
            }
        },
        props: {
            dict_type: {
                type: String,
                required: true
            },
            version: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        },
        created: function() {
            if(this.dict_type === "flight") {
                this.fetchFlightDicts({
                    dictionaryVersion: this.version,
                    options: { limit: 1 }
                }).then(() => {
                    this.fetchVersion({
                        dict_type: this.dict_type,
                        version: this.version,
                        type: this.type,
                        options: {
                            limit: 10
                        }
                    }).then(() => {
                        this.componentLoaded = true;
                    });
                });
            } else {
                this.fetchSseDicts({
                    dictionaryVersion: this.version,
                    options: { limit: 1 }
                }).then(() => {
                    this.fetchVersion({
                        dict_type: this.dict_type,
                        version: this.version,
                        type: this.type,
                        options: {
                            limit: 10
                        }
                    }).then(() => {
                        this.componentLoaded = true;
                    });
                });
            }
        },
        methods: {
            ...mapActions([
                "fetchVersion",
                "fetchFlightDicts",
                "fetchSseDicts"
            ]),
            fetchVersionsCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.fetchVersion({
                    dict_type: this.dict_type,
                    version: this.version,
                    type: this.type,
                    options: {
                        sortDirection: sortDirection,
                        sortField: sortField,
                        filters: filters,
                        limit: limit,
                        offset: offset,
                        wild: true,
                    },
                });
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "command_stem",
                        name: "Command Stem",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "operations_category",
                        name: "Operations Category",
                        filterType: "search",
                    },
                    {
                        field: "cmd_description",
                        name: "Command Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: CmdDetails,
                        wordWrap: true
                    }
                ],
                componentLoaded: false,
                details: true
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

<template>
    <div class="row">
        <ing-table
            tableId="evrVersion"
            v-if="componentLoaded"
            tableTitle="EVRs"
            class="evr_table"
            :data="versions"
            :columns="tableColumns"
            :total="versionsCount"
            empty-message="No EVRs to display."
            :callback="fetchVersionsCallback"
            :limit="10">
        </ing-table>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";

    import EvrDetails from './EvrDetails.vue';

    import { mapActions, mapGetters } from "vuex";

    import _ from 'lodash';

    export default {
        name: 'EvrVersion',
        components: {
            IngTable
        },
        computed: {
            ...mapGetters([
                "sseVersions",
                "flightVersions",
                "totalCount"
            ]),
            versions: function() {
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
                default: "evrs",
                required: false
            }
        },
        created: function() {
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
        },
        methods: {
            ...mapActions([
                "fetchVersion"
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
                        wild: true
                    }
                });
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "evr_id",
                        name: "EVR ID",
                        filterType: "search",
                    },
                    {
                        field: "evr_name",
                        name: "EVR Name",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "evr_level",
                        name: "EVR Level",
                        filterType: "search",
                    },
                    {
                        field: "evr_message",
                        name: "EVR Message",
                        filterType: "search",
                    },
                    {
                        field: "evr_description",
                        name: "EVR Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "operations_category",
                        name: "Operations Category",
                        filterType: "search",
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: EvrDetails,
                        wordWrap: null
                    }
                ],
                componentLoaded: false
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

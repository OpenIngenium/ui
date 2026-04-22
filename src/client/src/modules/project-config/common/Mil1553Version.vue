<template>
    <div class="row">
        <ing-table
            v-if="componentLoaded && !show_select"
            tableId="mil1553Version"
            tableTitle="mil1553"
            class="mil1553_table"
            :data="versions"
            :columns="tableColumns"
            :total="versionsCount"
            empty-message="No mil1553s to display."
            :callback="fetchVersionsCallback"
            :limit="10">
        </ing-table>
        <ing-table
            v-if="componentLoaded && show_select"
            tableId="mil1553VersionSelect"
            tableTitle="mil1553"
            class="mil1553_table"
            :data="versions"
            :columns="tableColumnsWithSelect"
            :total="versionsCount"
            v-on:handleEvent="select1553"
            empty-message="No mil1553s to display."
            :callback="fetchVersionsCallback"
            :limit="10">
        </ing-table>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";
    import Select1553Button from "./Select1553Button.vue";
    import Mil1553Details from './Mil1553Details.vue';

    import { mapActions, mapGetters } from "vuex";

    import _ from 'lodash';

    export default {
        name: 'Mil1553Version',
        components: {
            IngTable,
            Mil1553Details,
            Select1553Button
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
                default: "mil1553",
                required: false
            },
            show_select: {
                type: Boolean,
                required: false,
                default: false
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
                        wild: true,
                    }
                });
            },
            select1553: function(customEvent) {
                event.preventDefault();
                const selected1553 = customEvent.data.mil1553_name;
                this.$emit('select1553', selected1553);
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "mil1553_name",
                        name: "Mil1553 Name",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "operations_category",
                        name: "Operations Category",
                        filterType: "search",
                    },
                    {
                        field: "output_type",
                        name: "Output Type",
                        filterType: "search",
                    },
                    {
                        field: "description",
                        name: "Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "remote_terminal",
                        name: "Remote Terminal",
                        filterType: "search",
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: Mil1553Details,
                        wordWrap: null
                    }
                ],
                tableColumnsWithSelect: [
                    {
                        field: "mil1553_name",
                        name: "Mil1553 Name",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "operations_category",
                        name: "Operations Category",
                        filterType: "search",
                    },
                    {
                        field: "output_type",
                        name: "Output Type",
                        filterType: "search",
                    },
                    {
                        field: "description",
                        name: "Description",
                        filterType: "search",
                        wordWrap: true
                    },
                    {
                        field: "remote_terminal",
                        name: "Remote Terminal",
                        filterType: "search",
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: Mil1553Details,
                        wordWrap: null
                    },
                    {
                        field: "select",
                        name: "Select",
                        component: Select1553Button
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

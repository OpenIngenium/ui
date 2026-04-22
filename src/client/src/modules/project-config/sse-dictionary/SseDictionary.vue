<template>
    <div class="row">
        <h4><i class="glyphicon glyphicon-book"></i> Project Configuration &raquo; SSE Dictionary</h4> 
        <ing-table
            tableId="sseDictionary"
            tableTitle=""
            class="sse_table"
            :data="sse"
            :columns="tableColumns"
            :total="count"
            v-on:handleEvent="handleTableEvent"
            empty-message="No SSE Dictionaries to display."
            :callback="fetchSseDictCallback"
            :limit="10">
        </ing-table>
        <update-modal 
            :showModal="showUpdateModal" 
            :version="currVersion"
            @refreshDictionaries="refreshDictionaries"
            @close="handleUpdateModalClose()">
        </update-modal>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";
    import VersionSelectButton from "../common/VersionSelectButton.vue";
    import SseDictionaryDeleteModal from "./SseDictionaryDeleteModal.vue";
    import UpdateButton from "../common/UpdateButton.vue";
    import SseDictionaryUpdateModal from "./SseDictionaryUpdateModal.vue";
    import { mapActions, mapGetters } from "vuex";
    import IngFooter from "../../common/IngFooter.vue";
    import _ from 'lodash';

    export default {
        name: 'SseDictionary',
        components: {
            IngTable,
            "update-modal": SseDictionaryUpdateModal,
            'ing-footer': IngFooter
        },
        computed: {
            ...mapGetters([
                "sseIndex",
                "sseTotalCount",
            ]),
            sse: function() {
                let formatedVersions = [];
                _.forEach(this.sseIndex, function(version, key) {
                    if(key != "total_count")
                        formatedVersions.push(version);
                });
                
                return formatedVersions;
            },
            count: function() { return this.sseTotalCount; },
        },
        created: function() {
            this.fetchSseDicts({
                limit: 10
            });
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
                        component: SseDictionaryDeleteModal
                    }
                ],
                showUpdateModal: false,
                currVersion: "",
                sortDirection: 'ASC',
                sortField: '',
                filters: {},
                limit: 10,
                offset: 0
            };
        },
        methods: {
            ...mapActions([
                "fetchSseDicts",
            ]),
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
                this.$router.push({ path: `/project_configuration/sse/${data.version}`});
            },
            updateVersion: function(version) {
                this.currVersion = version;
                this.showUpdateModal = true;
            },
            handleUpdateModalClose: function() {
                this.showUpdateModal = false;
            },
            refreshDictionaries: function() {
                this.fetchSseDictCallback({
                    sortDirection: this.sortDirection,
                    sortField: this.sortField,
                    filters: this.filters,
                    limit: this.limit,
                    offset: this.offset
                });
            },
            fetchSseDictCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.sortDirection = sortDirection;
                this.sortField = sortField;
                this.filters = filters;
                this.limit = limit;
                this.offset = offset;

                this.fetchSseDicts({
                    sortDirection: sortDirection, 
                    sortField: sortField, 
                    filters: filters, 
                    limit: limit, 
                    offset: offset
                });
            }
        }
    };
</script>

<style lang="scss" scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
</style>

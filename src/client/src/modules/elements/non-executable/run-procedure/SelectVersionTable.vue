<template>
    <div>
        <div v-if="procedureId">
            <ing-table
                tableId="selectVersionTable"
                tableTitle="Procedure Versions"
                glyphicon="glyphicon-dashboard"
                :data="generateRows()"
                :columns="tableColumns"
                :total="procedureVersionsTotal"
                v-on:handleEvent="setVersion"
                :include-footer="false"
                :limit="10">
            </ing-table>
            <div class="row" style="margin-top: 15px;">
                <div class="col-xs-3"></div>
                <div class="col-xs-6" style="text-align: center">
                    <i class="glyphicon glyphicon-triangle-left"
                       @click="paginationBackwardClick"
                       :style="{cursor: 'pointer', opacity: this.backwardOpacity}"></i>
                    <span style="margin-left: 5px; margin-right: 5px;">display <b>{{this.pagination.page*10-9}}</b> to <b>{{this.pagination.page*10-10+this.procedureVersionsByProcedureId.length}}</b> of <b>{{this.procedureVersionsTotal}}</b></span>
                    <i class="glyphicon glyphicon-triangle-right" @click="paginationForwardClick" :style="{cursor: 'pointer', opacity: this.forwardOpacity}"></i>
                </div>
                <div class="col-xs-3"></div>
            </div>
        </div>
        <h3 v-else>Please Select a Procedure First.</h3>
    </div>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import VersionSelectButton from "./VersionSelectButton.vue";
    import VersionDetailsButton from "./VersionDetailsButton.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "SelectVersionTable",
        components: { IngTable, VersionSelectButton, VersionDetailsButton },
        props: {
            procedureId: {
                type: String,
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "version",
                        name: "Version",
                    },
                    {
                        field: "status",
                        name: "Status",
                    },
                    {
                        field: 'time_versioned',
                        name: 'Versioned',
                    },
                    {
                        field: 'version_description',
                        name: 'Description',
                        wordWrap: true
                    },
                    {
                        field: 'details',
                        name: 'Details',
                        component: VersionDetailsButton,
                        normalWrap: true
                    },
                    {
                        field: 'choose',
                        name: 'Choose',
                        component: VersionSelectButton
                    },
                ],
                pagination: {
                    limit: 10,
                    page: 1 // offset = page * 10 - 10
                },
                backwardOpacity: 0.15,
                forwardOpacity: 0.15,
            };
        },
        computed: {
            ...mapGetters([
                "procedureVersions",
            ]),
            procedureVersionsByProcedureId: function() {
                let retVal = [];
                let procedureVersion = null;
                if (this.procedureId) {
                    procedureVersion = this.procedureVersions(this.procedureId);
                }
                if (procedureVersion) {
                    retVal = procedureVersion.versions;
                }
                return retVal;
            },
            procedureVersionsTotal: function() {
                let retVal = -1;
                let procedureVersion = null;
                if (this.procedureId) {
                    procedureVersion = this.procedureVersions(this.procedureId);
                }
                if (procedureVersion) {
                    retVal = procedureVersion.total;
                }
                return retVal;
            }
        },
        created: function() {
            this.fetchProcedureVersionsWithPagination();
        },
        watch: {
            procedureVersionsByProcedureId: function() {
                this.backwardOpacity = this.pagination.page === 1 ? 0.15 : 1;
                this.forwardOpacity = this.pagination.page * 10 < this.procedureVersionsTotal ? 1 : 0.15;
            },
        },
        methods: {
            ...mapActions([
                "fetchProcedureVersions"
            ]),
            generateRows: function() {
                return this.procedureVersionsByProcedureId.map(version => {
                    // console.log(version);
                    return {
                        version: version.version,
                        status: version.status,
                        time_versioned: version.time_versioned,
                        description: version.version_description,
                        // version details popover key, values
                        version_id: version.version_id,
                        api_version: version.api_version,
                        procedure_id: version.procedure_id,
                        version_author: version.version_author,
                        institutional_release_id: version.institutional_release_id,
                        time_saved: version.time_saved,
                        version_description: version.version_description
                    };
                });
            },
            setVersion: function(customEvent) {
                this.$emit('setVersion', customEvent);
            },
            paginationForwardClick: function() {
                this.paginationForward();
                this.fetchProcedureVersionsWithPagination();
            },
            paginationBackwardClick: function() {
                this.paginationBackward();
                this.fetchProcedureVersionsWithPagination();
            },
            fetchProcedureVersionsWithPagination: function() {
                this.fetchProcedureVersions({
                    procedureId: this.procedureId,
                    options: {
                        limit: this.pagination.limit,
                        offset: this.pagination.page * 10 - 10
                    }
                });
            },
            paginationForward: function() {
                if(this.pagination.page * 10 < this.procedureVersionsTotal) {
                    this.pagination.page++;
                }
            },
            paginationBackward: function() {
                if(this.pagination.page > 1) {
                    this.pagination.page--;
                }
            },
        }
    };
</script>

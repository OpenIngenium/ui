<template>
    <ing-modal v-if="showModal" @close="handleCancel()" size="large" fixed-height="90%" minHeight="calc(100vh - 210px)">

        <template slot="title">
            <i class="glyphicon glyphicon-search"></i>&nbsp;Select VIs
        </template>

        <template slot="body">
            <div style="float:right; margin-bottom: 5px;">
                <button class="btn btn-info" @click="selectAll()">Select All</button>
                <button class="btn btn-info" @click="unselectAll()">Unselect All</button>
            </div>
            <ing-table
                :tableId="tableId"
                tableTitle="Verification Items"
                :data="useVisFromParent ? tableData : viewVis"
                :columns="viewTableColumns"
                :total="useVisFromParent ? tableCount: _visCount"
                empty-message="No Verification Items to display."
                :callback="handleSearch"
                :includeFooter="includeFooter">
            </ing-table>
        </template>

        <template slot="footer">
            <button type="button" class="btn btn-link" @click="handleCancel()">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleSave()">Save</button>
        </template>

    </ing-modal>
</template>

<script>
    import IngModal from "../IngModal.vue";
    import {mapActions,mapGetters} from "vuex";
    import _ from 'lodash';
    import IngTable from "../IngTable.vue";

    export default {
        name: "SelectVisModal",
        components: {
            "ing-modal": IngModal,
            "ing-table": IngTable,
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "vi_id",
                        name: "VI ID",
                        sortable: false,
                        filterType: "search"
                    },
                    {
                        field: "vi_name",
                        name: "VI Name",
                        sortable: false,
                        wordWrap: true,
                        width: 10,
                        filterType: "search"
                    },
                    {
                        field: "vi_type",
                        name: "Type",
                        sortable: false,
                        filterType: "search"
                    },
                    {
                        field: "vi_owner",
                        name: "Owner",
                        sortable: false,
                        filterType: "search"
                    },
                    {
                        field: "vi_text",
                        name: "VI Text",
                        sortable: false,
                        wordWrap: true,
                        filterType: "search"
                    },
                    {
                        field: "va_name",
                        name: "VA Name",
                        sortable: false,
                        wordWrap: true,
                        width: 10,
                        filterType: "search"
                    },
                    {
                        field: "vac_name",
                        name: "VAC Name",
                        sortable: false,
                        wordWrap: true,
                        width: 10,
                        filterType: "search"
                    },
                    {
                        field: "Select",
                        name: "Select",
                        component: this.chooseViButton,
                    },
                ],
                limit: 10,
                tableData: [],
                tableCount: 0
            };
        },
        props: {
            elementId: {
                type: String,
                required: true
            },
            showModal: {
                type: Boolean,
                default: false
            },
            chooseViButton: {
                type: Object,
                required: true
            },
            visFromParent: {
                type: Array,
                default: () => []
            },
            useVisFromParent: {
                type: Boolean,
                default: false
            },
            tableId: {
                type: String,
                default: "selectVisModal"
            }
        },
        watch: {
            showModal: function() {
                if(this.showModal) {
                    this.fetchVIs({
                        limit: this.limit
                    });

                    // load selectedVis
                    const vis = this.getVisByElementId(this.elementId);
                    this.setSelectedViIds({vis});
                }
            }
        },
        mounted() {
            if(this.useVisFromParent) {
                this.tableData = this.viewVis;
                this.tableCount = this._visCount;
            }
        },
        computed: {
            ...mapGetters([
                "vis",
                "visCount",
                "getVisByElementId",
                "isSelectedViId"
            ]),
            viewTableColumns: function() {
                if(this.useVisFromParent) {
                    return [...this.tableColumns, {
                        field: "vi_selected",
                        name: "VI Selected",
                        visible: false,
                        filterType: 'selection',
                        filterChoices: ['Yes', 'No'],
                    }];
                } else {
                    return this.tableColumns;
                }
            },
            viewVis: function() {
                // Note that visFromParent is an array while vis is an object (id to vi map)
                const availableVis = this.useVisFromParent ? this.visFromParent : Object.values(this.vis);
                const vis = [];
                for (const availableVi of availableVis) {
                    let vi = _.cloneDeep(availableVi);
                    vi.vi_selected = this.isSelectedViId(vi.vi_id) ? 'Yes' : 'No';
                    vi.va_name = '';
                    vi.vac_name = '';
                    if (vi.vas && vi.vas.length > 0) {
                        // assume that VI belongs to only one VA
                        vi.va_name = vi.vas[0].va_name;
                        vi.va_name = vi.vas[0].vac_name;
                    }
                    vis.push(vi);
                }

                return vis;
            },
            _visCount: function() {
                return this.useVisFromParent ? this.visFromParent.length: this.visCount;
            },
            includeFooter: function() {
                return !this.useVisFromParent;
            },
        },
        methods: {
            ...mapActions([
                "fetchVIs",
                "deleteViFromDeclareStep",
                "setSelectedViIds",
                "removeViIds",
                "setVisDeclareStep",
                "addSelectedViIds",
                "setVisToStatusStep"
            ]),
            handleSave: function() {
                if (!this.useVisFromParent) {
                    this.setVisDeclareStep();
                } else {
                    this.setVisToStatusStep();
                }

                this.$emit("save");
            },
            handleCancel: function() {
                this.setSelectedViIds({vis: []});

                this.$emit("cancel");
            },
            handleSearch: function({filters, offset, limit}) {
                if(this.useVisFromParent) {
                    let filteredVis = this.viewVis;
                    for (const filter of Object.values(filters)) {
                        if (filter.value) {
                            filteredVis = this.filterVis(filteredVis, filter.field, filter.value); 
                        }
                    }
                    this.tableData = filteredVis;
                    this.tableCount = filteredVis.length;
                } else {
                    this.limit = limit;
                    this.fetchVIs({
                        filters: filters,
                        offset: offset,
                        limit: this.limit,
                    });
                }
            },
            filterVis: function(filteredVis, field, value) {
                return filteredVis.filter(vi => vi[field].toLowerCase().includes(value.toLowerCase()));
            },
            selectAll: function() {
                this.addSelectedViIds({ vis: this.viewVis });
            },
            unselectAll: function() {
                this.removeViIds({ vis: this.viewVis });
            }
        },
    };
</script>

<style scoped></style>

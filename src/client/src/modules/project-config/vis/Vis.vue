<template>
    <div class="row">
        <h4><i class="glyphicon glyphicon-book"></i> Project Configuration &raquo; VIs</h4>
        <ing-table
            tableId="vis"
            tableTitle=""
            class="vis_table"
            :data="_vis"
            :columns="tableColumns"
            :total="visCount"
            empty-message="No Verification Items to display."
            :callback="fetchCallback"
            :limit="10">
        </ing-table>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";
    import { mapActions, mapGetters } from "vuex";
    import _ from 'lodash';
    import IngFooter from "../../common/IngFooter.vue";

    export default {
        name: 'Vis',
        components: {
            IngTable,
            'ing-footer': IngFooter
        },
        computed: {
            ...mapGetters([
                "vis",
                "visCount",
            ]),
            _vis: function() {
                return _.map(this.vis, vi => { return {
                    vi_id: vi.vi_id,
                    vi_name: vi.vi_name,
                    vi_type: vi.vi_type,
                    vi_owner: vi.vi_owner,
                    vi_text: vi.vi_text,
                    va_name: vi.vas.join(', '),   // ['A', 'B'] → 'A, B'
                    vac_name: vi.vacs.join(', ')  // ['X', 'Y'] → 'X, Y'
                };});
            },
        },
        created: function() {
            this.fetchVIs({
                limit: 10
            });
        },
        methods: {
            ...mapActions([
                "fetchVIs",
            ]),
            fetchCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.fetchVIs({
                    sortDirection: sortDirection, 
                    sortField: sortField, 
                    filters: filters, 
                    limit: limit, 
                    offset: offset
                });
            },
        },
        data() {
            return {
                tableColumns: [
                    {
                        field: "vi_id",
                        name: "VI ID",
                        filterType: "search",
                        sortable: true,
                    },
                    {
                        field: "vi_name",
                        name: "VI Name",
                        filterType: "search",
                        sortable: true,
                        wordWrap: true,
                        width: 10,
                    },
                    {
                        field: "vi_type",
                        name: "Type",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "vi_owner",
                        name: "Owner",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "vi_text",
                        name: "VI Text",
                        filterType: "search",
                        sortable: true,
                        wordWrap: true,
                    },
                    {
                        field: "va_name",
                        name: "VA Name",
                        filterType: "search",
                        sortable: false,
                        wordWrap: true,
                        width: 10,
                    },
                    {
                        field: "vac_name",
                        name: "VAC Name",
                        filterType: "search",
                        sortable: false,
                        wordWrap: true,
                        width: 10,
                    },
                ],
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

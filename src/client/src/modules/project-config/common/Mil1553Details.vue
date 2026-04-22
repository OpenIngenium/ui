<template>
    <div>
        <!-- this modal remains hidden until it's activated -->
        <ing-modal v-if="visible && componentLoaded" @close="visible = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">{{ mil1553.mil1553_name }}</h4>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-12">
                        <b>Description</b><br> {{ mil1553.mil1553_name }}
                        <br><br><b>Operations Category</b><br> {{ mil1553.operations_category }}
                        <br>
                        <table>
                            <tr>
                                <th>Remote Terminal</th>
                                <th>Sub Address</th>
                                <th>Transmit Receive</th>
                            </tr>
                            <tr>
                                <td>{{ mil1553.remote_terminal }}</td>
                                <td>{{ mil1553.sub_address }}</td>
                                <td>{{ mil1553.transmit_receive }}</td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <th>EU Present?</th>
                                <th>Type</th>
                            </tr>
                            <tr>
                                <td>{{ mil1553.eu_present }}</td>
                                <td>{{ mil1553.output_type }}</td>
                            </tr>
                        </table>
                        <table v-if="mil1553.enumerations.length > 0">
                            <tr>
                                <th>Numeric</th>
                                <th>Symbolic</th>
                            </tr>
                            <tr v-for="m in mil1553.enumerations" :key="m.numeric">
                                <td>{{ m.numeric }}</td>
                                <td>{{ m.symbol }}</td>
                            </tr>
                        </table>
                        <span v-else>None</span>
                    </div>
                </div>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="visible = false">
                    Close
                </button>
            </template>
        </ing-modal>
        <button 
            type="button"
            class="btn btn-default"
            @click="visible = true">
            Details</button>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import IngModal from "../../common/IngModal.vue";

    import { mapActions, mapGetters } from "vuex";

    export default {
        name: 'Mil1553Details',
        components: {
            IngTable,
            IngModal
        },
        computed: {
            ...mapGetters([
                "details"
            ]),
            mil1553() {
                let details = this.details({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "mil1553",
                    id: this.data.mil1553_name
                });
                return details !== undefined ? details : {};
            }
        },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        watch: {
            visible: function() {
                this.fetchData();
            }
        },
        created: function() { },
        methods: {
            ...mapActions([
                "fetchDictItem"
            ]),
            fetchData() {
                this.fetchDictItem({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "mil1553", 
                    options: { limit: 1 },
                    id: this.data.mil1553_name
                }).then(() => {
                    this.componentLoaded = true;
                });
            }
        },
        data() {
            return {
                visible: false,
                componentLoaded: false
            };
        }
    };
</script>

<style lang="scss" scoped>
    table{
        width:100%;
    }
    th{
        border-bottom:1px solid gray;
    }
</style>

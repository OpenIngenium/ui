<template>
    <div>
        <!-- this modal remains hidden until it's activated -->
        <ing-modal v-if="visible" @close="visible = false" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">{{ cmd.command_stem }}</h4>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-12">
                        <p>
                            <b>Operations Category</b><br> {{ cmd.operations_category }}
                            <br><br><b>Command Type</b><br> {{ cmd.cmd_type }}
                            <br><br><b>Restricted Modes</b>
                            <ul v-if="cmd.restricted_modes !== undefined && cmd.restricted_modes.length > 0">
                                <li v-for="c in cmd.restricted_modes" :key="c">{{ c }}</li>
                            </ul>
                            <span v-else><br>None</span>
                            <br><br><b>Command Description</b><br > {{ cmd.cmd_description }}
                            <br><br><b>Arguments</b><br>
                            <table v-if="cmd.arguments !== undefined && cmd.arguments.length > 0">
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Repeat</th>
                                    <th>Default</th>
                                    <th>Ranges</th>
                                    <th>Enumerations</th>
                                    <th>Description</th>
                                </tr>
                                <tr v-for="(c, index) in cmd.arguments" :key="index">
                                    <td>{{ c.argument_name }}</td>
                                    <td>{{ c.argument_type }}</td>
                                    <td>{{ c.argument_size }}</td>
                                    <td>{{ c.repeat_arg }}</td>
                                    <td>{{ c.default_value }}</td>
                                    <td>
                                        <ul>
                                            <li v-for="(range, idx) in c.allowable_ranges" v-bind:key="idx">Max: {{ range.max_value }}, Min: {{ range.min_value }}</li>
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            <li v-for="(enumer, idx2) in c.enumerations" v-bind:key="idx2">Numeric: {{ enumer.numeric }}, Symbol: {{ enumer.symbol }}</li>
                                        </ul>
                                    </td>
                                    <td class="wrap">{{ c.argument_description }}</td>
                                </tr>
                            </table>
                            <span v-else>None</span>
                        </p>
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
            class="btn btn-default"
            @click="visible = true">
            Details</button>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import IngModal from "../../common/IngModal.vue";

    import { mapGetters, mapActions } from "vuex";

    // import _ from 'lodash';

    export default {
        name: 'Details',
        components: {
            IngTable,
            IngModal
        },
        computed: {
            ...mapGetters([
                "details"
            ]),
            cmd() {
                let details = this.details({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "cmds",
                    id: this.data.command_stem
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
            visible: function(oldVal) {
                if(oldVal)
                    this.fetchData();
            }
        },
        methods: {
            ...mapActions([
                "fetchDictItem"
            ]),
            fetchData() {
                this.fetchDictItem({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "cmds", 
                    options: { limit: 1 },
                    id: this.data.command_stem
                }).then(() => {
                    this.componentLoaded = true;
                });
            }
        },
        created: function() { },
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
    th, td {
        padding-left: 4px;
        padding-right: 4px;
    }
    ul {
        list-style-type: disc;
        padding-left: 0;
    }
    .wrap {
        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;

        /* Adds a hyphen where the word breaks, if supported (No Blink) */
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    }
</style>

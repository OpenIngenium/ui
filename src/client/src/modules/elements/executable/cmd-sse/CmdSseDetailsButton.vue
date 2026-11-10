<template>
    <div>
        <div style="position: relative">
            <button class="btn btn-primary" @click="callDetails">Details</button>
        </div>
        <div>
            <ing-modal v-if="showCmdStringDetailsModal" @close="showCmdStringDetailsModal = false" placement="left" size="large">
                <template slot="title">
                    <h4 class="modal-title">Command Stem Details</h4>
                </template>
                    <template slot="body">
                        <h5 class="cmd-sse-detail-title">Command Stem</h5>
                        <p>{{ cmdSseDetails.command_stem }}</p>
                        <h5 class="cmd-sse-detail-title">Operations Category</h5>
                        <p>{{ cmdSseDetails.operations_category }}</p>
                        <h5 class="cmd-sse-detail-title">Dictionary Version</h5>
                        <p>{{ cmdSseDetails.dictionary_version }}</p>
                        <h5 class="cmd-sse-detail-title">Command Description</h5>
                        <p>{{ cmdSseDetails.cmd_description }}</p>
                        <div id="table" v-if="cmdSseDetails.arguments && cmdSseDetails.arguments.length > 0">
                            <h5 class="cmd-sse-detail-title">Arguments</h5>
                            <table class="cmd-sse-arguments-table">
                                <thead>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Ranges</th>
                                    <th>Enumerations</th>
                                </thead>
                                <tbody>
                                    <template v-for="(argument, index) in cmdSseDetails.arguments" >
                                        <tr :key="index">
                                            <td>{{ argument.argument_name }}</td>
                                            <td>{{ argument.argument_description }}</td>
                                            <td>{{ argument.argument_type }}</td>
                                            <td>
                                                <template v-for="(range, index) in argument.allowable_ranges">
                                                    <ul :key="index">
                                                        <li class="range-item">Min: {{range.min_value}} - Max: {{range.max_value}}</li>
                                                    </ul>
                                                </template>
                                            </td>
                                            <td>
                                                <template v-for="(enumeration, index) in argument.enumerations">
                                                    <ul :key="index">
                                                        <li>{{ enumeration.symbol }}</li>
                                                    </ul>
                                                </template>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        </template>
                        <template slot="footer">
                            <div>
                                <button @click="showCmdStringDetailsModal = false" type="button" class="btn btn-default pull-left">Exit</button>
                            </div>
                        </template>
            </ing-modal>
        </div>
    </div>
</template>

<script>
    import IngPopover from "../../../common/IngPopover.vue";
    import { mapActions, mapGetters } from "vuex";
    export default {
        name: 'CmdSseDetailsButton',
        components: { IngPopover },
        props: {
            data: {
                type: Object
            }
        },
        data() {
            return {
                showCmdStringDetailsModal: false,
                cmd_id: this.data.cmd_id,
                title: this.data.title,
                command_stem: this.data.command_stem,
            };
        },
        computed: {
            ...mapGetters([
                'cmdSseDetails',
                'selectedSseDictionaryVersion',
            ])
        },

        methods: {
            ...mapActions([
                'fetchCmdSseDetails'
            ]),

            callDetails: function() {
                event.preventDefault();
                this.fetchCmdSseDetails({
                    dictionaryVersion: this.selectedSseDictionaryVersion,
                    cmdStem: this.data.command_stem  
                }).then(() => {
                    this.showCmdStringDetailsModal = true;
                });
            },
        },  
    };
</script>

<style scoped>

#table {
    max-height: calc(100vh - 210px);
    overflow-y: auto;
}

.cmd-sse-arguments-table {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}

td, th {
    border: 1px solid #ddd;
    padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2;}

tr:hover {background-color: #ddd;}

thead {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    color: black;
}

.range-item {
    list-style-type: none;
}

.cmd-sse-detail-title {
    font-weight: bold;
}

button {
    color: #333;
    background-color: #fff;
    border-color: #ccc;
}

button:hover {
    color: #333;
    background-color: #ccc;
    border-color: #ccc;
}

</style>

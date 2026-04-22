<template>
    <div>
    <div style="position: relative">
        <button class="btn btn-default" @click="callDetails">Details</button>
    </div>
        <ing-modal v-if="showCmdDetailsModal" @close="showCmdDetailsModal = false" placement="left" size="large">
            <template slot="title">
                <h4 class="modal-title">Command Stem Details</h4>
            </template>
            <template slot="body">
                <h5 class="cmd-sse-detail-title">Command Stem</h5>
                <p>{{ cmdDetails.command_stem }}</p>
                <h5 class="cmd-sse-detail-title">Operations Category</h5>
                <p>{{ cmdDetails.operations_category }}</p>
                <h5 class="cmd-sse-detail-title">Command Type</h5>
                <p>{{ cmdDetails.cmd_type }}</p>
                <h5 class="cmd-sse-detail-title">Repeat Min / Max</h5>
                <p>{{ cmdDetails.repeat_min }} / {{ cmdDetails.repeat_max }}</p>   
                <div>
                    <h5 v-if="cmdDetails.restricted_modes.length > 0" class="cmd-sse-detail-title">Restricted Modes</h5>
                    <template v-for="(mode, index) in cmdDetails.restricted_modes">
                        <ul :key="index">
                            <li>
                                {{ mode }}
                            </li>
                        </ul>
                    </template>
                </div>
                <h5 class="cmd-sse-detail-title">Command Description</h5>
                <p>{{ cmdDetails.cmd_description }}</p>
                <div id="table" v-if="cmdDetails.arguments.length > 0">
                            <h5 class="cmd-sse-detail-title">Arguments</h5>
                            <table class="cmd-sse-arguments-table">
                                <thead>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Repeat</th>
                                    <th>Ranges</th>
                                    <th>Enumerations</th>
                                    <th>Description</th>
                                </thead>
                                <tbody>
                                    <template v-for="(argument, index) in cmdDetails.arguments" >
                                        <tr :key="index">
                                            <td>{{ argument.argument_type }}</td>
                                            <td>{{ argument.argument_size }}</td>
                                            <td>{{ argument.repeat_arg }}</td>
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
                                                        <li>{{ enumeration.symbol }}: {{ enumeration.numeric }}</li>
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
                    <button @click="showCmdDetailsModal = false" type="button" class="btn btn-default pull-left">Exit</button>
                </div>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: 'CmdDetailButton',
        props: {
            data: {
                type: Object,
            }
        }, 

        data() {
            return {
                showCmdDetailsModal: false,
                cmd_id: this.data.cmd_id,
                title: this.data.title,
                command_stem: this.data.command_stem
            };
        },

        computed: {
            ...mapGetters([
                'cmdDetails',
                'selectedFlightDictionaryVersion'
            ]),

        },

        methods: {
            ...mapActions([
                'fetchCmdDetails'
            ]),

            callDetails: function() {
                event.preventDefault();
                this.fetchCmdDetails({
                    dictionaryVersion: this.selectedFlightDictionaryVersion,
                    command_stem: this.data.command_stem
                }).then(() => {
                    this.showCmdDetailsModal = true;
                });
            }
        },

        watch: {
            
        }
    };
</script>


<style lang="scss" scoped>

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
    background-color: #4CAF50;
    color: white;
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
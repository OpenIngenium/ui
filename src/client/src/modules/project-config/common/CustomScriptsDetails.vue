<template>
    <div>
        <!-- this modal remains hidden until it's activated -->
        <ing-modal v-if="visible" @close="visible = false" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Script Details</h4>
            </template>
            <template slot="body">
                <div class="row form-group">
                    <div class="col-xs-4"><b>Name</b></div>
                    <div class="col-xs-4">&nbsp;</div>
                    <div class="col-xs-4 text-right"><b>Script Status</b></div>

                    <div class="col-xs-4">{{custom_script.script_name}}</div>
                    <div class="col-xs-4">&nbsp;</div>
                    <div class="col-xs-4 text-right">{{custom_script.status}}</div>
                </div>

                <div class="row form-group">
                    <div class="col-xs-4"><b>Script Path</b></div>
                    <div class="col-xs-12 wrap">{{custom_script.script_path}}</div>
                </div>

                <div class="row form-group">
                    <div class="col-xs-4"><b>Script ID</b></div>
                    <div class="col-xs-12 wrap">{{custom_script.script_id}}</div>
                </div>

                <div class="row form-group">
                    <div class="col-xs-4"><b>Script Hash</b></div>
                    <div class="col-xs-12 wrap">{{custom_script.hash}}</div>
                </div>

                <div class="row form-group">
                    <div class="col-xs-4"><b>Script Description</b></div>
                    <div class="col-xs-12 wrap">{{custom_script.description}}</div>
                </div>

                <div class="form-group">
                    <div v-if="has_inputs">
                        <h3>Inputs</h3>
                        <table>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Phase</th>
                                <th>Description</th>
                                <th>Enumerations</th>
                            </tr>
                            <tr v-for="(c, idx1) in custom_script.inputs" :key="idx1">
                                <td>
                                    {{ c.name }} <span style="color:red;" v-if="c.required === 'YES'"><b>*</b></span>
                                </td>
                                <td>{{ c.type }}</td>
                                <td>{{ c.phase }}</td>
                                <td class="wrap">{{ c.description }}</td>
                                <td>
                                    <ul v-if="c.enumerations !== undefined && c.enumerations.length > 0">
                                        <li v-for="(i, idx2) in c.enumerations" :key="idx2">{{ i.symbol }}</li>
                                    </ul>
                                    <span v-else>None</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <div v-if="has_entries" class="form-group">
                    <h3>Entry</h3>
                    <div v-if="has_entry_inputs">
                        <p style="font-weight:bold; text-decoration:underline;">Entry Inputs</p>
                        <table>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Phase</th>
                                <th>Description</th>
                                <th>Enumerations</th>
                            </tr>
                            <tr v-for="(c, idx1) in custom_script.entries[0].entry_inputs" :key="idx1">
                                <td>
                                    {{ c.name }} <span v-if="c.required === 'YES'" style="color:red;"><b>*</b></span>
                                </td>
                                <td>{{ c.type }}</td>
                                <td>{{ c.phase }}</td>
                                <td class="wrap">{{ c.description }}</td>
                                <td>
                                    <ul v-if="c.enumerations !== undefined && c.enumerations.length > 0">
                                        <li v-for="(i, idx2) in c.enumerations" :key="idx2">{{ i.symbol }}</li>
                                    </ul>
                                    <span v-else>None</span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div v-if="has_entry_outputs">
                        <p style="font-weight:bold; text-decoration:underline;">Entry Outputs</p>
                        <table>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                            <tr v-for="(c, idx1) in custom_script.entries[0].entry_outputs" :key="idx1">
                                <td>{{ c.name }}</td>
                                <td>{{ c.type }}</td>
                                <td class="wrap">{{ c.description }}</td>
                            </tr>
                        </table>
                    </div>

                    <div v-if="has_entry_output_array_outputs">
                        <p style="font-weight:bold; text-decoration:underline;">Entry Output Array</p>
                        <table>
                            <tr>
                                <th>Name</th>
                                <th>Visible</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                            <tr v-for="(c, idx1) in custom_script.entries[0].entry_output_array.outputs" :key="idx1">
                                <td>{{ c.name }}</td>
                                <td>{{ c.visible }}</td>
                                <td>{{ c.type }}</td>
                                <td class="wrap">{{ c.description }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div class="form-group" v-if="has_outputs">
                    <h3>Outputs</h3>
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                        <tr v-for="(c, idx) in custom_script.outputs" :key="idx">
                            <td>{{ c.name }}</td>
                            <td>{{ c.type }}</td>
                            <td class="wrap">{{ c.description }}</td>
                        </tr>
                    </table>
                </div>

                <div class="form-group" v-if="has_entry_output_array_outputs">
                    <h3>Output Array</h3>
                    <table>
                        <tr>
                            <th>Name</th>
                            <th>Visible</th>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                        <tr v-for="(c, idx) in custom_script.output_array.outputs" :key="idx">
                            <td>{{ c.name }}</td>
                            <td>{{ c.visible }}</td>
                            <td>{{ c.type }}</td>
                            <td class="wrap">{{ c.description }}</td>
                        </tr>
                    </table>
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
            @click="clickDetails">
            Details</button>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import IngModal from "../../common/IngModal.vue";

    import { mapGetters, mapActions } from "vuex";

    // import _ from 'lodash';

    export default {
        name: 'CustomScriptsDetails',
        components: {
            IngTable,
            IngModal
        },
        computed: {
            ...mapGetters([
                "customScriptDetails"
            ]),
            custom_script() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                return cs;
            },
            has_inputs() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.inputs && cs.inputs.length > 0) {
                    return true;
                } else {
                    return false;
                }
            },
            has_entries() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.entries && cs.entries.length > 0) {
                    return true;
                } else {
                    return false;
                }
            },
            has_entry_inputs() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.entries && cs.entries.length > 0 && cs.entries[0].entry_inputs && cs.entries[0].entry_inputs.length > 0) {
                    return true;
                } else {
                    return false;
                }
            },                             
            has_entry_outputs() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.entries && cs.entries.length > 0 && cs.entries[0].entry_outputs && cs.entries[0].entry_outputs.length > 0) {
                    return true;
                } else {
                    return false;
                }
            },     
            has_entry_output_array() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.entries && cs.entries.length > 0 && cs.entries[0].entry_output_array) {
                    return true;
                } else {
                    return false;
                }
            },  
            has_entry_output_array_outputs() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
                if (cs && cs.entries && cs.entries.length > 0 && cs.entries[0].entry_output_array && 
                    cs.entries[0].entry_output_array.outputs && cs.entries[0].entry_output_array.outputs.length > 0) {
                        return true;
                } else {
                    return false;
                }
            },   
            has_outputs() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
            
                if (cs && cs.outputs && cs.outputs.length > 0) {
                    return true;
                } else {
                    return false;
                }
            },           
            has_output_array() {
                let cs = this.customScriptDetails({
                    scriptPath: this.data.script_path
                });
            
                if (cs && cs.output_array) {
                    return true;
                } else {
                    return false;
                }
            },
        },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        methods: {
            ...mapActions([
                "fetchDictItem"
            ]),
            clickDetails(e) {
                e.preventDefault();
                this.visible = true;
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
        white-space: normal;
    }
</style>

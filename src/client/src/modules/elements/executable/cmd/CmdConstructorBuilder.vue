<template>
    <div class="cmd-constructor-builder">
        <!-- <h2>Args: {{ numberOfArgs }} Repeat Args: {{ numberOfRepeatArgs}} Total: {{ numberOfTotalArgs }} </h2> -->
        <h4><span class="glyphicon glyphicon-wrench"></span> Construct Command</h4>
        <div v-if="selectedCmdObj !== undefined" class="form-group cmd-string-form">
            <div class="cmd_string_holder">
                <label for="command_string" class="control-label">Command String<span style="font-size:12px; font-weight:400; margin-left:10px;">(Use inputs in table below to populate arguments, if applicable)</span></label>
                <input type="text" class="form-control" name="command_string" :value="commandString" disabled="disabled" data-command-stem="dcs">
            </div>
            <div class="cmd_apply_defaults">
                <button
                    type="button"
                    class="btn btn-primary apply-default-values-btn"
                    :disabled="defaultsApplied || !hasDefaultValues"
                    @click="applyDefaults">
                    Apply Default Value
                </button>
            </div>
            <cmd-constructor-args></cmd-constructor-args>
            <div class="cmd_builder_data">
                <table class="cmd_builder_table">
                    <thead>
                        <tr>
                            <th>Operations</th>
                            <th>Command Type</th>
                            <th>Repeat Min/Max</th>
                            <th>Restricted Modes</th>
                            <th style="width:35%;">Command Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ selectedCmdObj.operations_category }}</td>
                            <td>{{ selectedCmdObj.cmd_type }}</td>
                            <td>{{ selectedCmdObj.repeat_min }} / {{ selectedCmdObj.repeat_max }}</td>
                            <td>
                                <ul>
                                    <li v-for="mode in selectedCmdObj.restricted_modes" :key="mode">
                                        {{ mode }}
                                    </li>
                                </ul>
                            </td>
                            <td>{{ selectedCmdObj.cmd_description }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="selectedCmdObj === undefined">
            <div class="cmd_builder_placeholder">
                <i class="glyphicon glyphicon-circle-arrow-up" style="font-size:96px; color:#CCCCCC;"></i>
                <span style="display: inline-block;">Choose command from table above to begin constructing</span>
            </div>
        </div>
    </div>
</template>

<script>
    import SelectCmdTable from "./SelectCmdTable.vue";
    import CmdConstructorArgs from "./CmdConstructorArgs.vue";
    import { mapGetters, mapActions } from "vuex";

    export default {
        name: "CmdConstructorBuilder",
        components: {
            SelectCmdTable,
            CmdConstructorArgs
        },
        data() {
            return {
                cmdPresent: true,
                defaultsApplied: false
            };
        }, 
        computed: {
            ...mapGetters([
                "selectedCmdObj",
                "commandString",
                "numberOfArgs",
                "numberOfRepeatArgs",
                "numberOfTotalArgs",
                "selectedCmdObjRepeatArgs",
                "selectedCmdObjArgs"
            ]),
            hasDefaultValues() {
                const hasDefault = argument => argument.hasOwnProperty('default_value') && argument.default_value !== "";

                return this.selectedCmdObjArgs.some(hasDefault)
                    || this.selectedCmdObjRepeatArgs.some(section => section.some(hasDefault));
            }
        },
        watch: {
            selectedCmdObj() {
                // a newly selected command has its own (unfilled) arguments, so let the
                // user apply defaults for it again
                this.defaultsApplied = false;
            }
        },
        methods: {
            ...mapActions([
                "applyDefaultValues"
            ]),
            applyDefaults() {
                this.applyDefaultValues();
                this.defaultsApplied = true;
            }
        }
    };
</script>

<style scoped>
    h4{
        font-weight:600;
        margin-top:10px;
        padding:0px 10px;
    }

    .cmd-constructor-builder{
        min-height:300px;
        background-color:#EEEEEE;
        border-radius:4px;
        border:1px solid #DDDDDD;
        margin-top:20px;
    }

    .cmd-string-form{
        margin-top:15px;
    }

    .form-control{
        background-color:#F7F7F7;
    }

    .cmd_builder_placeholder{
        display:block;
        width:300px;
        margin:20px auto 0 auto;
        font-size: 18px;
        font-weight:bold;
        text-align:center;
        color:#b3b3b3;
    }

    .cmd_string_holder{
        padding:0px 10px;
    }

    .cmd_apply_defaults{
        display:flex;
        justify-content:flex-end;
        margin:10px;
    }
    
    .apply-default-values-btn{
        margin-top:8px;
    }

    .cmd_builder_data{
        padding:10px;
    }
    
    .cmd_builder_table{
        border-collapse: collapse;
        background-color:inherit;
        border:none;
    }
</style>
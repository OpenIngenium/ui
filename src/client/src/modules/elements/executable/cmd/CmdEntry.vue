// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js
<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <ing-modal v-if="showCmdModal" @close="showCmdModal = false" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Lookup CMD</h4>
            </template>
            <template slot="body">
                <cmd-constructor></cmd-constructor>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="showCmdModal = false">
                    Cancel
                </button>
                <button 
                    type="button"
                    class="btn btn-primary pull-right"
                    @click="setCommandString">
                    Submit
                </button>
            </template>
        </ing-modal>

        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-1" :class="modStyle(elementId, `entries.${index}.hwFsw`)">{{ hwFsw ? hwFsw : "hwFsw" }}</div>
                <div class="col-xs-12" style="overflow-wrap: anywhere">
                    CMD: <span :class="modStyle(elementId, `entries.${index}.cmd_string`)">{{ cmdString }}</span>
                </div>
                <div class="col-xs-2" style="justify-content: right">
                    Verify: <span :class="modStyle(elementId, `entries.${index}.verify`)">{{ verify }}</span>
                </div>
                <div class="col-xs-2" style="justify-content: right">
                    String: <span :class="modStyle(elementId, `entries.${index}.string_selection`)">{{ stringSelection }}</span>
                </div>
                <div class="col-xs-5" style="justify-content: right">Radiated: {{ radiated }}</div>
                <div class="col-xs-3" style="justify-content: right">Verified: {{ verified }}</div>
            </div>
        </div>

        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-3">
                    <label>HW/FSW</label>
                    <select v-model="hwFsw"
                            @change="$emit('save')"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            :class="modStyle(elementId, `entries.${index}.hwFsw`)">
                        <option value="FSW">FSW</option>
                        <option value="HW">HW</option>
                    </select>
                </div>
                <div class="col-xs-3">
                    <label
                        class="ing-tooltip"
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_step_timeout">
                        <b>Timeout</b></label>
                    <input v-model.trim.number="timeout"
                           @change="saveCmdEntry"
                           :disabled="disableFields"
                           name="timeout"
                           type="text"
                           placeholder="sec"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.timeout`)">
                </div>
                <div class="col-xs-3">
                    <label
                        class="ing-tooltip"
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_step_verify_receipt"><b>Verify Receipt?</b></label>
                    <label><input type="checkbox"
                                  v-model="verify"
                                  @change="$emit('save')"
                                  :disabled="disableFields"
                                  class="execution-input"
                                  style="margin-right: 8px;"
                                  :class="modStyle(elementId, `entries.${index}.verify`)">
                        Yes</label>
                </div>
                <div class="col-xs-3">
                    <label>String Selection</label>
                    <select 
                        class="form-control execution-input" 
                        v-model="stringSelection"
                        :disabled="disableFields"
                        :class="modStyle(elementId, `entries.${index}.string_selection`)">
                        <option v-for="option in stringOptions" 
                            :value="option.value" 
                            :key="option.value">
                            {{option.text}}</option>
                    </select>
                </div>
            </div>
            <div class="row" style="margin-top: 10px; padding-bottom:10px;">
                <div class="col-xs-12">
                    <button 
                        type="button" 
                        class="btn btn-info pull-right cmd_button cmd_lookup_button ing-tooltip" 
                        style="width: 85px;" 
                        @click="editCommandString"
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_step_lookup"
                        :disabled="disableFields">
                        <span class="glyphicon glyphicon-search"></span> 
                        <b>Lookup</b>
                    </button>
                    <label
                        class="glyphicon ing-tooltip"
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_step_command_string"><b>Command String</b></label>
                    <ing-autocomplete
                        :value="cmdString"
                        v-on:handleEvent="handleInput"
                        :callback="fetchCmdAutoCompleteCallback"
                        :items="this.builderCmds"
                        nameField="command_stem"
                        categoryField="operations_category"
                        descriptionField="cmd_description"
                        enterByName="command_stem"
                        v-on:save="saveCmdEntry"
                        :disabled="disableFields"
                        :inputClasses="modStyle(elementId, `entries.${index}.cmd_string`)"
                    ></ing-autocomplete>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import CmdConstructor from "./CmdConstructor.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";

    import { mapGetters, mapActions } from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "CmdEntry",
        components: {
            CmdConstructor,
            IngAutocomplete
        },
        data() {
            return {
                showCmdModal: false,
                stringOptions: [
                    { text: 'DEFAULT', value: 'DEFAULT' },
                    { text: 'AB', value: 'AB' },
                    { text: 'A', value: 'A' },
                    { text: 'B', value: 'B' }
                ]
            };
        },
        computed: {
            ...mapGetters([
                "selectedCmdObj",
                "selectedCmdObjArgs",
                "selectedCmdObjRepeatArgs",
                "repeatArgsTemplate",
                "selectedFlightDictionaryVersion",
                "numberOfTotalArgs",
                "builderCmds",
                "modStyle"
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            executed() { 
                console.log(`executed: ${this.getBoolElementKey('executed')}`);
                return this.getBoolElementKey('executed'); 
            },
            hwFsw: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "hw_fsw");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "hw_fsw",
                        value
                    });
                }
            },
            cmdString: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "cmd_string");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "cmd_string",
                        value
                    });
                }
            },
            timeout: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "timeout");
                },
                set(value) {
                    value = value ? value : 0;
                    const valueNumber = parseInt(value, 10);
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "timeout",
                        value: valueNumber
                    });
                }
            },
            verify: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "verify");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verify",
                        value
                    });
                }
            },
            stringSelection: {
                get() { 
                    return this.executionInputEntryKey(this.elementId, this.index, "string_selection");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "string_selection",
                        value: value
                    });
                    this.save();
                }
            },
            radiated: function() {
                if (this.mode === 'authoring') {
                    return '';
                } else {
                    return this.executionResultsEntryKey(this.elementId, this.index, "radiated") ? 'Yes' : 'No';
                }
            },
            verified: function() {
                if (this.mode === 'authoring') {
                    return '';
                } else {
                    return this.executionResultsEntryKey(this.elementId, this.index, "verified") ? 'Yes' : 'No';
                }
            },
        },
        methods: {
            ...mapActions([
                "setCmd",
                "setCmdArguments",
                "fetchFlightCmds"
            ]),
            setCommandString() {
                this.showCmdModal = false;

                let argsString = "";
                
                for(let i = 0;i < this.selectedCmdObjArgs.length;i++) {
                    argsString += ","+this.selectedCmdObjArgs[i].argument_value;
                }

                let repeatArgsString = "";
  
                for(let i = 0;i < this.selectedCmdObjRepeatArgs.length;i++) {
                    for(let j = 0;j < this.selectedCmdObjRepeatArgs[i].length;j++) {
                        repeatArgsString += ","+this.selectedCmdObjRepeatArgs[i][j].argument_value;
                    }
                }
                this.cmdString = (this.selectedCmdObj.command_stem + argsString + repeatArgsString).trim();
                this.save();
            },
            editCommandString: async function() {
                this.showCmdModal = true;
                // if command string field has value, parse it out
                if (this.cmdString !== "") {
                    await this.setCmd({
                        dictionaryVersion: this.selectedFlightDictionaryVersion,
                        command_stem: this.cmdString.split(',')[0],
                        cmdArgs: this.cmdString.split(',').slice(1)
                    });
                }

                
            },
            
            saveCmdEntry() {
                try {
                    this.timeout = parseInt(this.timeout);
                } catch(err) {
                    //  ignore
                }

                try {
                    this.cmdString = this.cmdString.trim();
                } catch(err) {
                    //  ignore
                }

                this.save();
            },

            handleInput: function(customEvent) {
                this.cmdString = customEvent;
            },

            fetchCmdAutoCompleteCallback: function( command_stem ) {
                this.fetchFlightCmds({
                    dictionaryVersion: this.selectedFlightDictionaryVersion, 
                    limit: 7,
                    wild: true,
                    filters: {
                        command_stem: {
                            value: command_stem
                        }
                    }
                });
            }
        }
    };
</script>

<style scoped>

    .cmd_button {
        outline: none !important;
        position:relative;
        bottom:3px;
        padding: 0;
        border-radius: 5px;
        font-size: 14px;
        width: 28px;
        height: 25px;
    }

    .cmd_lookup_button {
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: inherit;
        padding-left: 5px;
        padding-right: 5px;
    }

    /* .cmd_lookup_button  p {
        display: inline;
        font-weight: bold;
    } */

</style>

// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-9" style="overflow-wrap: anywhere">
                    sse:
                    <span v-if="cmdString" :class="modStyle(elementId, `entries.${index}.cmdString`)">{{ cmdString }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.cmdString`)" v-text="'<SSE CMD String>'"></span>
                </div>
                <div class="col-xs-3" style="overflow-wrap: anywhere">
                    <span>Radiated: {{ radiated }}</span>
                </div>
            </div>
        </div>
        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row" style="padding-bottom:10px;">
                <div class="col-xs-10">
                    <div class="command-string-label">
                        <label
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_cmd_sse_sse_cmd_string"
                            class="required-field ing-tooltip"><b>SSE Command String</b></label>
                        <button
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_cmd_sse_lookup"
                            @click="showCMDSEEModal = true" 
                            type="button" 
                            :disabled="disableFields" 
                            class="btn btn-xs btn-info pull-right procedure-lookup ing-tooltip">
                            <span class="glyphicon glyphicon-search"></span>  Lookup
                        </button>
                    </div>
                    <ing-autocomplete
                        :value="cmdString"
                        v-on:handleEvent="handleInput"
                        :callback="fetchCmdSseAutoCompleteCallback"
                        :items="this.cmds"
                        nameField="command_stem"
                        categoryField="operations_category"
                        descriptionField="cmd_description"
                        enterByName="command_stem"
                        v-on:save="saveCMDSSEEntry"
                        :disabled="disableFields"
                        :inputClasses="modStyle(elementId, `entries.${index}.cmd_string`)"
                    ></ing-autocomplete>
                </div>
                <div class="col-xs-2">
                    <label class="required-field">Timeout</label>
                    <input v-model.trim.number="timeout"
                        @change="saveCMDSSEEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.timeout`)">
                </div>
                <ing-modal v-if="showCMDSEEModal" @close="showCMDSEEModal = false" size="large">
                    <template slot="title">
                        <h4 class="modal-title">Lookup CMD</h4>
                    </template>
                    <template slot="body">
                       <CmdSseTable @selectCmd="onSelectCmd"></CmdSseTable>
                    </template>
                    <template slot="footer">
                        <div>
                            <button @click="showCMDSEEModal = false" type="button" class="btn btn-default pull-left">Cancel</button>
                            <button @click="showCMDSEEModal = false" type="button" class="btn btn-primary pull-right cmd_builder_save_btn">Save</button>
                        </div>
                    </template>
                </ing-modal>
            </div>
        </div>
    </div>
</template>

<script>
    import CmdSseTable from "./CmdSseTable.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";
    let TOOLTIPS = require('../../../common/tooltip-config');

    export default {
        name: "CmdSseEntry",
        components: {
            CmdSseTable, 
            IngAutocomplete
        },
        data() {
            return {
                showCMDSEEModal: false
            };
        },
        computed: {
            ...mapGetters([
                'cmds',
                'cmdCount',
                'selectedSseDictionaryVersion',
                'modStyle'
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            timeout: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "timeout"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "timeout",
                        value: value
                    });
                }
            },

            cmdString: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "cmd_string"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "cmd_string",
                        value: value
                    });
                }
            },
            radiated: function() {
                if (this.mode === 'authoring') {
                    return '';
                } else {
                    return this.executionResultsEntryKey(this.elementId, this.index, "radiated") ? 'Yes' : 'No';
                }
            },
            verificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
            },
        },

        methods: {
            ...mapActions([
                "fetchCmds"
            ]),

            onSelectCmd: function(choosenCmdString) {
                this.cmdString = choosenCmdString; 
                this.showCMDSEEModal = !this.showCMDSEEModal;
                this.save();
            },

            handleInput: function(customEvent) {
                this.cmdString = customEvent;
            },

            fetchCmdSseAutoCompleteCallback: function( command_stem ) {
                this.fetchCmds({
                    dictionaryVersion: this.selectedSseDictionaryVersion, 
                    filters: { command_stem: { value: command_stem } },
                    limit: 7,
                    wild: true
                });
            },
            saveCMDSSEEntry() {
                try {
                    this.cmdString = this.cmdString.trim();
                } catch(err) {
                    //  ignore
                }
                
                try {
                    this.timeout = parseInt(this.timeout);
                } catch(err) {
                    //  ignore
                }

                this.save();
            }
        }
    };
</script>

<style scoped>
    .required-field {
        display: inline;
    }

    .command-string-label {
        margin-bottom: 5px;
    }

</style>


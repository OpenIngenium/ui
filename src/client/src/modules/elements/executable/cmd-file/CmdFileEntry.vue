// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-2">
                    File Path:
                </div>
                <div class="col-xs-1">
                </div>
                <div class="col-xs-6">
                    <span v-if="filePath" style="overflow-wrap: anywhere" :class="modStyle(elementId, `entries.${index}.file_path`)">{{ filePath }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.file_path`)" v-text="'<File Path>'"></span>
                </div>
                <div class="col-xs-3">
                    <span>
                        String: <span :class="modStyle(elementId, `entries.${index}.string_selection`)">{{ stringSelection }}</span>
                    </span>
                    <span style="margin-left:20px">
                        Verify: <span :class="modStyle(elementId, `entries.${index}.verify`)">{{ verify ? "Yes" : "No" }}</span>
                    </span>
                </div>

                <div class="col-xs-2">
                     Onboard Path:
                </div>
                <div class="col-xs-1">
                </div>
                <div class="col-xs-6">
                    <span v-if="onboardPath" style="overflow-wrap: anywhere" :class="modStyle(elementId, `entries.${index}.onboard_path`)">{{ onboardPath }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.onboard_path`)" v-text="'<Onboard Path>'"></span>
                </div>
                <div class="col-xs-3">
                    <span>Radiated: {{ radiated }}</span>
                    <span style="margin-left:20px">Verified: {{ verified }}</span>
                </div>
            </div>
        </div>
        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-3">
                    <label 
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_file_file_type"
                        class="required-field ing-tooltip"><b>File Type</b></label>
                    <input v-model.trim="fileType"
                        @change="saveCmdFileEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.file_type`)">
                </div>
                <div class="col-xs-3">
                    <label class="required-field">Timeout</label>
                    <input v-model.trim.number="timeout"
                        @change="saveCmdFileEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.timeout`)">
                </div>
                <div class="col-xs-2">
                    <label>Verify Receipt?</label>
                    <div :class="modStyle(elementId, `entries.${index}.verify`)">
                        <input type="checkbox"
                            v-model="verify"
                            @change="save"
                            :disabled="disableFields"
                            class="execution-input"
                            style="margin-right: 8px;"> Yes
                    </div>
                </div>
                <div class="col-xs-2">
                    <label>Overwrite?</label>
                    <div :class="modStyle(elementId, `entries.${index}.overwrite`)">
                        <input type="checkbox"
                            v-model="overwrite"
                            @change="saveCmdFileEntry"
                            :disabled="disableFields"
                            class="execution-input"
                            style="margin-right: 8px;"> Yes
                    </div>
                </div>
                <div class="col-xs-2">
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

            <div class="row" style="margin-top: 10px;">
                <div class="col-xs-12">
                    <label 
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_file_file_path"
                        class="required-field ing-tooltip"><b>File Path (on the venue system)</b></label>
                    <input v-model.trim="filePath"
                        @change="saveCmdFileEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.file_path`)">
                </div>
                <div class="col-xs-12">
                    <label 
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_file_onboard_path"
                        class="required-field ing-tooltip"><b>Onboard Path (on the vehicle)</b></label>
                    <input v-model.trim="onboardPath"
                        @change="saveCmdFileEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.onboard_path`)">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import {truncate} from "../../../common/filters";
    let TOOLTIPS = require('../../../common/tooltip-config');

    export default {
        name: "CmdFileEntry",
        data() {
            return {
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
                "modStyle"
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            fileType: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "file_type"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "file_type",
                        value: value
                    });
                }
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
            verify: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verify"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verify",
                        value: value
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
            overwrite: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "overwrite"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "overwrite",
                        value: value
                    });
                }
            },
            filePath: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "file_path"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "file_path",
                        value: value
                    });
                }
            },
            onboardPath: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "onboard_path"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "onboard_path",
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
            verified: function() {
                if (this.mode === 'authoring') {
                    return '';
                } else {
                    return this.executionResultsEntryKey(this.elementId, this.index, "verified") ? 'Yes' : 'No';
                }
            },
            verificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
            }
        },
        methods: {
            truncate: truncate,
            saveCmdFileEntry() {
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
</style>


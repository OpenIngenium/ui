// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-10" style="overflow-wrap: anywhere">
                    File Path:
                    <span v-if="filePath" :class="modStyle(elementId, `entries.${index}.file_path`)">{{ filePath }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.file_path`)" v-text="'<SCMF File Path>'"></span>
                    <span v-if="fileType" :class="modStyle(elementId, `entries.${index}.file_type`)">{{ fileType }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.file_type`)" v-text="'<File Type>'"></span>
                </div>
                <div class="col-xs-2">
                    Verify:
                    <span v-if="verify" :class="modStyle(elementId, `entries.${index}.verify`)">{{ verify }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.verify`)" v-text="'false'"></span>
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
                        :title="tooltips.auth_exec_cmd_scmf_file_type"
                        class="required-field ing-tooltip"><b>File Type</b></label>
                    <input v-model.trim="fileType"
                        @change="saveCmdSCMFEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.file_type`)">
                </div>
                <div class="col-xs-3">
                    <label class="required-field">Timeout</label>
                    <input v-model.trim.number="timeout"
                        @change="saveCmdSCMFEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.timeout`)">
                </div>
                <div class="col-xs-3">
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
                <div class="col-xs-3">
                    <label>Disable Checks?</label>
                    <div :class="modStyle(elementId, `entries.${index}.disable_checks`)">
                        <input type="checkbox"
                            v-model="disableChecks"
                            @change="saveCmdSCMFEntry"
                            :disabled="disableFields"
                            class="execution-input"
                            style="margin-right: 8px;"> Yes
                    </div>
                </div>
            </div>

            <div class="row" style="margin-top: 10px;">
                <div class="col-xs-12">
                    <label 
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_cmd_scmf_file_scmf_file_path"
                        class="required-field ing-tooltip"><b>SCMF File Path (on the venue system)</b></label>
                    <input v-model.trim="filePath"
                        @change="saveCmdSCMFEntry"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.file_path`)">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";
    import {truncate} from "../../../common/filters";
    let TOOLTIPS = require('../../../common/tooltip-config');

    export default {
        name: "CmdScmfEntry",
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
            disableChecks: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "disable_checks"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "disable_checks",
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
            verificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
            },
        },

        methods: {
            truncate: truncate,
            saveCmdSCMFEntry() {
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


// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail"  class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-1"></div>
                <div
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_exec_manual_gds_data_path"
                    class="col-xs-3 text-right">
                    Associate Data Path:
                </div>
                <div class="col-xs-2">
                    <input v-model.trim="dataPath"
                           @change="saveManualGDS"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input slim-input"
                           style="margin-bottom: 10px;"
                           :class="modStyle(elementId, `entries.${index}.data_path`)">
                </div>
                <div
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_exec_manual_gds_session_id"
                    class="col-xs-2 text-right">
                    with Session ID:
                </div>
                <div class="col-xs-2">
                    <input v-model.trim.number="sessionId"
                           @change="saveManualGDS"
                           :disabled="canDisableExecuteField"
                           type="text"
                           class="form-control execution-input slim-input"
                           style="margin-bottom: 10px;">
                </div>
                <div class="col-xs-2"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "ManualGdsEntry",
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            sessionId: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "session_id"); },
                set(value) {
                    value = value ? value : 0;
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "session_id",
                        value: value
                    });
                }
            },
            dataPath: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "data_path"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "data_path",
                        value: value
                    });
                }
            }
        },
        methods: {
            saveManualGDS() {
                try {
                    if (this.sessionId !== undefined) {
                        // Try to parse only when sessionId is not empty
                        this.sessionId = parseInt(this.sessionId);
                    }
                } catch(err) {
                    //  ignore
                }

                this.save();
            }
        }
    };
</script>

<style scoped>
    .slim-input {
        height: 20px !important;
        padding-top: 0px !important;
        padding-bottom: 0px !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
    }
</style>


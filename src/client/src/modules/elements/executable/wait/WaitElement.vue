// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">Wait 
                        <span :class="modStyle(elementId, 'wait_type')"> {{ waitTypeText }}</span>
                        <span :class="modStyle(elementId, 'time_value')"> {{ timeOrDurationText }}</span>
                        <execution-status-check
                            v-if="enableExecution"
                            :executed="executed"
                            :status="getExecutionMetaDataKey('status')">
                        </execution-status-check>
                    </div>
                </div>
                <div v-if="isLevelThreeDetail" class="edit-container">
                    <div class="row">
                        <div class="col-xs-6">
                            <label class="required-field">Wait Type</label>
                            <select v-model="waitType"
                                @change="save"
                                :disabled="disableFields"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'waitType')">
                                <option value="DURATION">DURATION</option>
                                <option value="UNTIL">UNTIL</option>
                            </select>
                        </div>
                        <div class="col-xs-6">
                            <label class="required-field">{{ timeOrDurationInputLabel }}</label>
                            <input v-model.trim="timeValue"
                                @change="saveWait"
                                v-on:keydown.enter.prevent="saveWait"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'timeValue')">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    import {mapGetters} from "vuex";
    import { isUndefinedOrNull } from "../../../common/utils.js";

    export default {
        name: "WaitElement",
        watch: {
            waitType: function() {
                this.$set(this, 'timeValue', '');
            }
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            waitTypeIsDuration: function() { return this.waitType === 'DURATION'; },
            waitTypeText: function() {
                return this.waitTypeIsDuration ? 'for' : 'until';
            },
            timeOrDurationInputLabel: function() {
                return this.waitTypeIsDuration ? 'Duration(sec)' : 'Time(UTC)';
            },
            timeValueExists: function() {
                return !isUndefinedOrNull(this.timeValue) && this.timeValue !== '';
            },
            timeOrDurationText: function() {
                if (this.timeValueExists) {
                    if (this.waitTypeIsDuration) {
                        return `${this.timeValue} seconds`;
                    } else {
                        return this.timeValue;
                    }
                } else {
                    return '_____';
                }
            },
            waitType: {
                get() { return this.getExecutionInputKey("wait_type"); },
                set(value) { this.setElementInput("wait_type", value); }
            },
            timeValue: {
                get() { return this.getExecutionInputKey("time_value"); },
                set(value) { this.setElementInput("time_value", value); }
            }
        },
        methods: {
            saveWait() {
                this.save();
            }
        }
    };
</script>

// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree" style="border-bottom: 1px solid #D8D6D6;">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-3">Venue Temperature (°C)</div>
                    <div class="col-xs-6" v-if="temperatureVerificationCondition === 'GREATER_THAN'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&gt;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'LESS_THAN'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'GREATER_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&ge;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'LESS_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'EQUAL'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">=</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'NOT_EQUAL'">
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&ne;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'RECORD'">
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">RECORD</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'INCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationToValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="temperatureVerificationCondition === 'EXCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationFromValue }}</span>
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'temperature.verify_on')">{{temperatureVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'temperature.verification_values')">{{ temperatureVerificationToValue }}</span>
                    </div>

                    <div class="col-xs-2">
                        <input v-model.number="temperatureActualValue"
                               @change="save"
                               :disabled="canDisableExecuteField"
                               type="text"
                               class="form-control execution-input slim-input">
					</div>
                    <div class="col-xs-1">
                        <execution-status-check
                            v-if="enableExecution"
                            :executed="executed"
                            :status="getExecutionMetaDataKey('status')">
                        </execution-status-check>
                    </div>
                </div>
            </div>
            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-2">
                        <label class="required-field">Verify On</label>
                        <select v-model="temperatureVerifyOn"
                            @change="save"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'temperature.verify_on')">
                            <option v-for="option in verifyOnOptions"
                                :key="option[0]"
                                :value="option[0]">
                                {{ option[1] }}
                            </option>
                        </select>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Verify Condition</label>
                        <select v-model="temperatureVerificationCondition"
                            @change="save"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            :class="modStyle(elementId, 'temperature.verification_condition')">
                            <option v-for="condition in verificationConditions"
                                :key="condition[0]"
                                :value="condition[0]">
                                {{ condition[1] }}
                            </option>
                        </select>
                    </div>
                    <div v-if="temperatureIsRangeCondition" class="col-xs-4">
                        <label class="required-field">Verify Value</label>
                        <div class="input-group">
                            <input v-model.number="temperatureVerificationFromValue"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'temperature.verification_values')"
                            >
                            <span class="input-group-addon range-option-group">to</span>
                            <input v-model.number="temperatureVerificationToValue"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'temperature.verification_values')"
                            >
                        </div>
                    </div>
                    <div v-else-if="!temperatureIsRecordCondition" class="col-xs-4">
                        <label class="required-field">Verify Value</label>
                        <input v-model.number="temperatureVerificationFromValue"
                            @change="save"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            :class="modStyle(elementId, 'temperature.verification_values')">
                    </div>
                </div>
            </div>
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-3">Venue Humidity (%)</div>
                    <div class="col-xs-6" v-if="humidityVerificationCondition === 'GREATER_THAN'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&gt;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'LESS_THAN'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'GREATER_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&ge;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'LESS_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'EQUAL'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">=</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'NOT_EQUAL'">
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&ne;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'RECORD'">
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">RECORD</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'INCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&le;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationToValue }}</span>
                    </div>
                    <div class="col-xs-6" v-else-if="humidityVerificationCondition === 'EXCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationFromValue }}</span>
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'humidity.verify_on')">{{humidityVerifyOn}}</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_condition')">&lt;</span> 
                        <span :class="modStyle(elementId, 'humidity.verification_values')">{{ humidityVerificationToValue }}</span>
                    </div>
                    <div class="col-xs-2">
                        <input v-model.number="humidityActualValue"
                               @change="save"
                               :disabled="canDisableExecuteField"
                               type="text"
                               class="form-control execution-input slim-input">
                    </div>
                </div>
            </div>
            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-2">
                        <label class="required-field">Verify On</label>
                        <select v-model="humidityVerifyOn"
                            @change="save"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'humidity.verify_on')">
                            <option v-for="option in verifyOnOptions"
                                :key="option[0]"
                                :value="option[0]">
                                {{ option[1] }}
                            </option>
                        </select>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Verify Condition</label>
                        <select v-model="humidityVerificationCondition"
                            @change="save"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            :class="modStyle(elementId, 'humidity.verification_condition')">
                            <option v-for="condition in verificationConditions"
                                :key="condition[0]"
                                :value="condition[0]">
                                {{ condition[1] }}
                            </option>
                        </select>
                    </div>
                    <div v-if="humidityIsRangeCondition" class="col-xs-4">
                        <label class="required-field">Verify Value</label>
                        <div class="input-group">
                            <input v-model.number="humidityVerificationFromValue"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'humidity.verification_values')"
                            >
                            <span class="input-group-addon range-option-group">to</span>
                            <input v-model.number="humidityVerificationToValue"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'humidity.verification_values')"
                            >
                        </div>
                    </div>
                    <div v-else-if="!humidityIsRecordCondition" class="col-xs-4">
                        <label class="required-field">Verify Value</label>
                        <input v-model.number="humidityVerificationFromValue"
                               @change="save"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'humidity.verification_values')">
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>

    import { mapGetters } from "vuex";

    export default {
        name: "EnvironmentElement",
        data() {
            return {
                verificationConditions: [
                    ["GREATER_THAN", "Greater Than"],
                    ["LESS_THAN", "Less Than"],
                    ["GREATER_THAN_OR_EQUAL", "Greater Than Or Equal"],
                    ["LESS_THAN_OR_EQUAL", "Less Than Or Equal"],
                    ["EQUAL", "Equal"],
                    ["NOT_EQUAL", "Not Equal"],
                    ["RECORD", "Record"],
                    ["INCLUSIVE_RANGE", "Inclusive Range"],
                    ["EXCLUSIVE_RANGE", "Exclusive Range"]
                ],
                verifyOnOptions: [
                    ["VALUE", "Value"],
                    ["CHANGE", "Change"]
                ],
                rangeConditions: ["INCLUSIVE_RANGE", "EXCLUSIVE_RANGE"]
            };
        },

        methods: {
            checkRangeConditionChange: function(newValue, oldValue, keyString) {
                const oldValueIsRange = this.rangeConditions.indexOf(oldValue) > -1;
                const newValueIsRange = this.rangeConditions.indexOf(newValue) > -1;
                if (!newValueIsRange && oldValueIsRange) {
                    this.editElementArray({
                        keyString: keyString,
                        position: 1,
                        value: null,
                        elementId: this.elementId
                    });
                }
            },
        },
        watch: {
            temperatureVerificationCondition: function(newValue, oldValue) {
                this.checkRangeConditionChange(newValue, oldValue, "temperature.verification_values");
            },
            humidityVerificationCondition: function(newValue, oldValue) {
                this.checkRangeConditionChange(newValue, oldValue, "humidity.verification_values");
            }
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            temperatureIsRangeCondition: function() {
                return this.rangeConditions.indexOf(this.temperatureVerificationCondition) > -1;
            },
            humidityIsRangeCondition: function() {
                return this.rangeConditions.indexOf(this.humidityVerificationCondition) > -1;
            },
            temperatureIsRecordCondition: function() {
                return this.temperatureVerificationCondition === 'RECORD';
            },
            humidityIsRecordCondition: function() {
                return this.humidityVerificationCondition === 'RECORD';
            },

            // Temperature Values
            temperatureVerifyOn: {
                get() { return this.getExecutionInputKey("temperature.verify_on"); },
                set(value) { this.setElementInput("temperature.verify_on", value); }
            },
            temperatureVerificationCondition: {
                get() { return this.getExecutionInputKey("temperature.verification_condition"); },
                set(value) { this.setElementInput("temperature.verification_condition", value); }
            },
            temperatureVerificationFromValue: {
                get() { return this.getExecutionInputKey("temperature.verification_values[0]"); },
                set(value) {
                    this.editElementArray({
                        keyString: "temperature.verification_values",
                        position: 0,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            temperatureVerificationToValue: {
                get() { return this.getExecutionInputKey("temperature.verification_values[1]"); },
                set(value) {
                    this.editElementArray({
                        keyString: "temperature.verification_values",
                        position: 1,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            temperatureActualValue: {
                get() { return this.getExecutionInputKey("temperature.actual_value"); },
                set(value) {
                    this.setElementInput("temperature.actual_value", value); }
            },
            temperatureVerificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "temperature.verification_status");
            },

            // Humidity Values
            humidityVerifyOn: {
                get() { return this.getExecutionInputKey("humidity.verify_on"); },
                set(value) { this.setElementInput("humidity.verify_on", value); }
            },
            humidityVerificationCondition: {
                get() { return this.getExecutionInputKey("humidity.verification_condition"); },
                set(value) {
                    this.setElementInput("humidity.verification_condition", value);
                }
            },
            humidityVerificationFromValue: {
                get() { return this.getExecutionInputKey("humidity.verification_values[0]"); },
                set(value) {
                    this.editElementArray({
                        keyString: "humidity.verification_values",
                        position: 0,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            humidityVerificationToValue: {
                get() { return this.getExecutionInputKey("humidity.verification_values[1]"); },
                set(value) {
                    this.editElementArray({
                        keyString: "humidity.verification_values",
                        position: 1,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            humidityActualValue: {
                get() { return this.getExecutionInputKey("humidity.actual_value"); },
                set(value) {
                    this.setElementInput("humidity.actual_value", value);
                }
            },
            humidityVerificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "humidity.verification_status");
            },
        }
    };
</script>

<style lang="scss" scoped>
    .slim-input {
        height: 20px !important;
        padding-top: 0px !important;
        padding-bottom: 0px !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
    }
</style>

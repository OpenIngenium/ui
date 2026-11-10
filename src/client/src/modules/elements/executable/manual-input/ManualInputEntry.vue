// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js
<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-2" 
                    style="text-overflow: ellipsis; overflow: hidden;"
                    :class="modStyle(elementId, `entries.${index}.name`)"
                >{{ name }}</div>
                <div class="col-xs-1"
                    :class="modStyle(elementId, `entries.${index}.type`)"
                >{{ type | titlecase }}</div>
                <div class="col-xs-3"
                    id="verificationMsg">
                    <span v-if="verificationCondition === 'EQUAL'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> = </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'NOT_EQUAL'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &ne; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'CONTAINS'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &ni; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'GREATER_THAN'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &gt; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'LESS_THAN'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &lt; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'GREATER_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &ge; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'LESS_THAN_OR_EQUAL'">
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &le; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'RECORD'">
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)">Record</span>
                    </span>
                    <span v-if="verificationCondition === 'INCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &le; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &le; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationToValue)"></span>
                    </span>
                    <span v-if="verificationCondition === 'EXCLUSIVE_RANGE'">
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationFromValue)"></span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &lt; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.verification_condition`)"> &lt; </span> 
                        <span :class="modStyle(elementId, `entries.${index}.verification_values`)" v-html="maskUndefined(verificationToValue)"></span>
                    </span>
                </div>
                <div class="col-xs-1">Actual:</div>
                <div class="col-xs-4" style="overflow-wrap: anywhere">
                    <div v-if="getBoolElementKey('executed')">
                        {{actualValue}}
                    </div>
                    <input v-else v-model.trim="actualValue"
                           @change="saveManualInputEntry"
                           :disabled="canDisableExecuteField"
                           class="form-control execution-input slim-input">
                </div>
                <div class="col-xs-1 pull-right-xs">
                    <ing-popover placement="left" v-if="enableExecution">
                        <template slot="title">Manual Input Results</template>
                        <execution-full-results
                            slot="body"
                            :element-id="elementId"
                            :entry-index="index">
                        </execution-full-results>
                        <execution-status-check
                            :executed="getBoolElementKey('executed')"
                            :status="getExecutionResultsEntryKey('verification_status', String)"
                            component-type="entry">
                        </execution-status-check>
                    </ing-popover>
                </div>
            </div>
        </div>
        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-3">
                    <label>Name</label>
                    <input v-model.trim="name"  :class="modStyle(elementId, `entries.${index}.name`)" @change="saveManualInputEntry" class="form-control execution-input" :disabled="disableFields">
                </div>

                <div class="col-xs-2">
                    <label>Type</label>
                    <select v-model="type"  :class="modStyle(elementId, `entries.${index}.type`)" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <option v-for="option in typeOptions"
                            :key="option[0]"
                            :value="option[0]">
                            {{ option[1] }}
                        </option>
                    </select>
                </div>
                <div v-if="isRangeCondition && verificationCondition !== 'RECORD'" class="col-xs-4">
                    <label class="">Verify Value</label>
                    <div class="input-group">
                        <input v-model.trim="verificationFromValue"
                            @change="saveManualInputEntry"
                            type="text"
                            :disabled="disableFields"
                            :class="modStyle(elementId, `entries.${index}.verification_values`)"
                            class="form-control execution-input">
                        <span class="input-group-addon range-option-group">to</span>
                        <input v-model.trim="verificationToValue"
                            @change="saveManualInputEntry"
                            type="text"
                            :disabled="disableFields"
                            :class="modStyle(elementId, `entries.${index}.verification_values`)"
                            class="form-control execution-input">
                    </div>
                </div>
                <div v-else class="col-xs-4">
                    <div v-if="verificationCondition !== 'RECORD'">
                        <label class="">Verify Value</label>
                        <input v-model.trim="verificationFromValue"
                            @change="saveManualInputEntry"
                            :disabled="disableFields"
                            :class="modStyle(elementId, `entries.${index}.verification_values`)"
                            class="form-control execution-input">
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: 10px; padding-bottom:10px;">
                <div class="col-xs-3">
                    <label>Verify On</label>
                    <select v-model="verifyOn" :class="modStyle(elementId, `entries.${index}.verify_on`)" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                            <option v-for="option in verifyOnOptions"
                                :key="option[0]"
                                :value="option[0]">
                                {{ option[1] }}
                            </option>
                    </select>
                </div>
                <div class="col-xs-3">
                    <label>Verify Condition</label>
                    <select v-model="verificationCondition"
                        @change="$emit('save')"
                        :disabled="disableFields"
                        :class="modStyle(elementId, `entries.${index}.verification_condition`)"
                        class="form-control execution-input">
                        <!-- STRING OPTIONS -->
                        <option v-if="isStringCondition" v-for="condition in stringVerificationConditions"
                            :selected="condition[0] === verificationCondition"
                            :key="condition[0]" :value="condition[0]">
                            {{ condition[1] }}
                        </option>
                        <!-- OTHER OPTIONS -->
                        <option v-if="!isStringCondition" v-for="condition in otherVerificationConditions"
                            :selected="condition[0] === verificationCondition"
                            :key="condition[0]" :value="condition[0]">
                            {{ condition[1] }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        name: "ManualInputEntry",
        data() {
            return {
                otherVerificationConditions: [
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
                typeOptions: [
                    ["STRING", "String"],
                    ["INTEGER", "Integer"],
                    ["FLOAT", "Float"]
                ],
                stringVerificationConditions: [
                    ["RECORD", "Record"],
                    ["CONTAINS", "Contains"],
                    ["EQUAL", "Equal"],
                    ["NOT_EQUAL", "Not Equal"]
                ],
                rangeConditions: ["INCLUSIVE_RANGE", "EXCLUSIVE_RANGE"],
            };
        },
        methods: {
            checkRangeConditionChange: function(newValue, oldValue, keyString) {
                const oldValueIsRange = this.rangeConditions.indexOf(oldValue) > -1;
                const newValueIsRange = this.rangeConditions.indexOf(newValue) > -1;
                if (!newValueIsRange && oldValueIsRange) {
                    this.editEntryArray({
                        keyString: keyString,
                        targetIndex: 1,
                        value: null,
                        entryIndex: this.index,
                        elementId: this.elementId
                    });
                }
            },
            maskUndefined: function(val) {
                let ret = "&lt;ARG&gt;";
                if(val) {
                    ret = val;
                }
                return ret;
            },
            saveManualInputEntry() {
                this.save();
            }
        },
        watch: {
            verificationCondition: function(newValue, oldValue) {
                this.checkRangeConditionChange(newValue, oldValue, "verification_values");
            },
            isStringCondition: function(isString) {
                let newValue;
                if (isString) {
                    newValue = this.stringVerificationConditions[0][0];
                } else {
                    newValue = this.otherVerificationConditions[0][0];
                }
                this.editEntryInput({
                    elementId: this.elementId,
                    index: this.index,
                    key: "verification_condition",
                    value: newValue
                });
            }
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            isStringCondition: function() {
                return this.type === 'STRING' ? true : false;
            },
            isRangeCondition: function() {
                return this.rangeConditions.indexOf(this.verificationCondition) > -1;
            },
            name: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "name"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "name",
                        value: value
                    });
                }
            },
            type: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "type"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "type",
                        value: value
                    });
                }
            },
            verifyOn: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verify_on"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verify_on",
                        value: value
                    });
                }
            },
            verificationCondition: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "verification_condition");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verification_condition",
                        value: value
                    });
                }
            },
            verificationFromValue: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verification_values[0]"); },
                set(value) {
                    this.editEntryArray({
                        keyString: "verification_values",
                        targetIndex: 0,
                        entryIndex: this.index,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            verificationToValue: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verification_values[1]"); },
                set(value) {
                    this.editEntryArray({
                        keyString: "verification_values",
                        targetIndex: 1,
                        entryIndex: this.index,
                        value: value,
                        elementId: this.elementId
                    });
                }
            },
            actualValue: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "actual_value"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "actual_value",
                        value: value
                    });
                }
            },
            verificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
            },
            resultActualValue: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "actual_value");
            },
        }
    };
</script>

<style scoped>
    #verificationMsg {
        text-align: center;
    }
    .slim-input {
        height: 20px !important;
        padding-top: 0px !important;
        padding-bottom: 0px !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
    }
</style>


<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-2" :class="modStyle(elementId, `entries.${index}.signal_name`)">{{signalName}}</div>
                <div class="col-xs-2" :class="modStyle(elementId, `entries.${index}.icds`)">{{icds}}</div>
                <div class="col-xs-1" :class="modStyle(elementId, `entries.${index}.from`)">{{from}}</div>
                <div class="col-xs-1" :class="modStyle(elementId, `entries.${index}.to`)">{{to}}</div>
                <div class="col-xs-3">
                    <span v-if="!minValue && !maxValue"
                        :class="modStyle(elementId, `entries.${index}.min_value`) || modStyle(elementId, `entries.${index}.max_value`)"
                        >Record</span>
                    <span v-else-if="minValue && maxValue">
                        <span :class="modStyle(elementId, `entries.${index}.min_value`)">{{ minValue }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.unit`)" v-html="unitShorthand(unit)"></span>
                        &le; Measured &le;
                        <span :class="modStyle(elementId, `entries.${index}.max_value`)">{{ maxValue }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.unit`)" v-html="unitShorthand(unit)"></span>
                    </span>
                    <span v-else-if="minValue">
                        <span :class="modStyle(elementId, `entries.${index}.min_value`)">{{ minValue }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.unit`)" v-html="unitShorthand(unit)"></span>
                        &le; Measured
                    </span>
                    <span v-else>
                        Measured &le;
                        <span :class="modStyle(elementId, `entries.${index}.max_value`)">{{ maxValue }}</span>
                        <span :class="modStyle(elementId, `entries.${index}.unit`)" v-html="unitShorthand(unit)"></span>
                    </span>
                </div>
                <div class="col-xs-2">
                    <span style="float:right; width:50%;" >
                        <select v-model="measuredUnit"
                            @change="save"
                            class="form-control execution-input slim-input"
                            style="margin-left:20px; width:90px"
                            :disabled="canDisableExecuteField"
                            :class="modStyle(elementId, `entries.${index}.measuredUnit`)">
                            <option v-for="u in allowedMeasuredUnit"
                                    :key="u"
                                    :value="u">
                                {{u}}
                            </option>
                        </select>
                    </span>
                    <input v-model.trim="actualValue"
                        @change="saveEipEntry"
                        type="text"
                        style="width:50%"
                        :disabled="canDisableExecuteField"
                        class="form-control execution-input slim-input"
                        :class="modStyle(elementId, `entries.${index}.actualValue`)">
                </div>
                <div class="col-xs-1">
                    <span v-if="getBoolElementKey('executed')" :class="verificationStatus" style="margin-left:30px"></span>
                </div>
            </div>
        </div>
        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-4">
                    <label>Signal Name</label>
                    <input v-model.trim="signalName"
                           @change="saveEipEntry"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.signal_name`)">
                </div>
                <div class="col-xs-4">
                    <label>Function Number (ECDS)</label>
                    <input v-model.trim="icds"
                           @change="saveEipEntry"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.icds`)">
                </div>
                <div class="col-xs-2">
                    <label>From</label>
                    <input v-model.trim="from"
                           @change="saveEipEntry"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.from`)">
                </div>
                <div class="col-xs-2">
                    <label>To</label>
                    <input v-model.trim="to"
                           @change="saveEipEntry"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.to`)">
                </div>
            </div>
            <div class="row padding-bottom-10">
                <div class="col-xs-6"></div>
                <div class="col-xs-2">
                    <label>Units</label>
                    <select v-model="unit"
                            @change="save"
                            class="form-control execution-input"
                            :disabled="disableFields"
                            :class="modStyle(elementId, `entries.${index}.unit`)">
                        <option v-for="u in units"
                                :key="u"
                                :value="u">
                            {{u}}
                        </option>
                    </select>
                </div>
                <div class="col-xs-2" :class="{ 'invalid-input': invalidMinInput }">
                    <label>Min</label>
                    <input v-model.trim="minValue"
                            id='minValue'
                           @change="validateMinValue"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.min_value`)">
                </div>
                <div class="col-xs-2" :class="{ 'invalid-input': invalidMaxInput }">
                    <label>Max</label>
                    <input v-model.trim="maxValue"
                            id='maxValue'
                           @change="validateMaxValue"
                           :disabled="disableFields"
                           type="text"
                           class="form-control execution-input"
                           :class="modStyle(elementId, `entries.${index}.max_value`)">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapGetters} from "vuex";

    export default {
        name: "EipEntry",
        data() {
            return {
                units: ["Volt", "miliVolt", "Ohm", "KiloOhm", "MegaOhm"],
                unitsToShorthand: {
                    "Volt": "V",
                    "miliVolt": "mV",
                    "Ohm": "&Omega;",
                    "KiloOhm": "k&Omega;",
                    "MegaOhm": "M&Omega;",
                },
                invalidMaxInput: false,
                invalidMinInput: false
            };
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            signalName: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "signal_name"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "signal_name",
                        value: value
                    });
                }
            },
            icds: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "icds"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "icds",
                        value: value
                    });
                }
            },
            from: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "from"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "from",
                        value: value
                    });
                }
            },
            to: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "to"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "to",
                        value: value
                    });
                }
            },
            unit: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "unit"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "unit",
                        value: value
                    });
                    this.measuredUnit = value;
                }
            },
            measuredUnit: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "measured_unit"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "measured_unit",
                        value: value
                    });
                }
            },
            allowedMeasuredUnit: function() {
                let allowedUnit = [];
                switch (this.executionInputEntryKey(this.elementId, this.index, "unit")) {
                    case 'Volt': 
                    case 'miliVolt':
                        allowedUnit = ['Volt', 'miliVolt'];
                        break;
                    case 'Ohm':
                    case 'KiloOhm':
                    case 'MegaOhm':
                        allowedUnit = ['Ohm', 'KiloOhm', 'MegaOhm'];
                        break;
                    default:
                        allowedUnit = [];
                        break;
                }
                return allowedUnit;
            },
            minValue: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "min_value"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "min_value",
                        value: value
                    });
                }
            },
            maxValue: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "max_value"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "max_value",
                        value: value
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
                const verification_status = this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
                if (verification_status === 'PASS') {
                    return ["pass", "glyphicon", "glyphicon-ok"];
                } else if (verification_status === 'FAIL') {
                    return ["fail", "glyphicon", "glyphicon-remove"];
                } else {
                    return ["fail", "glyphicon", "glyphicon-question-sign"];
                }
            },
        },
        methods: {
            saveEipEntry() {                                                                                      
                this.save();
            },
            validateMaxValue(event) {
                if(this.checkNumber(event)) {
                    this.saveEipEntry();
                    this.invalidMaxInput = false;
                } else {
                    this.invalidMaxInput = true;
                }
            },
            validateMinValue(event) {
                if(this.checkNumber(event)) {
                    this.saveEipEntry();
                    this.invalidMinInput = false;
                } else {
                    this.invalidMinInput = true;
                }
            },
            //Note: Firefox does not support input type - number
            //So we are manually checking it for all browsers
            //We are allowing 0-9 with decipal point and -/+ signs and exponential
            checkNumber: function(event) {
                const regex = /^-?(0|[1-9]\d*)\.?\d*?(?:e-?\d+)?$/;
                if(event.target.value == '' || regex.test(event.target.value)){
                    return true;
                }
                else {
                    return false;
                } 
                    
            },
            unitShorthand: function(unit) {
                return this.unitsToShorthand[unit];
            }
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
    .padding-bottom-10 {
        padding-bottom: 10px;
    }
    .pass {
        color: #A3DE5F;
        display: inline-block;
    }
    .fail {
        color: #FF585C;
        display: inline-block;
    }
    .data-bar-element {
        word-wrap: break-word;
    }
    .invalid-input {
        background: red;
    }
</style>

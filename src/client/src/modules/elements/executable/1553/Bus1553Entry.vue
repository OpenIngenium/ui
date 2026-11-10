// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <ing-modal v-if="show1553Modal" @close="show1553Modal = false" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Lookup Mil1553</h4>
            </template>
            <template slot="body">
                <mil-1553-version
                    style="margin:5px;"
                    dict_type="flight"
                    type="mil1553"
                    show_select
                    @select1553="onSelect1553"
                    :version="selectedFlightDictionaryVersion">
                </mil-1553-version>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-right"
                    @click="show1553Modal = false">
                    Cancel
                </button>
            </template>
        </ing-modal>

        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-9">
                    <span v-if="bus_1553_var"
                        :class="modStyle(elementId, `entries.${index}.bus_1553_var`)"
                    >{{ bus_1553_var }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.bus_1553_var`)" v-text="'<1553 Variable> '"></span>
                    <span v-if="verify_on"
                        :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verify_on }}</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.verify_on`)" v-text="'<Value/Change> '"></span>
                    <span v-if="raw_convert"
                        :class="modStyle(elementId, `entries.${index}.raw_convert`)">( {{ raw_convert }} )</span>
                    <span v-else :class="modStyle(elementId, `entries.${index}.raw_convert`)" v-text="' (<Raw/Converted>) '"></span>
                    <span v-if="verification_condition"
                        :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                        {{ verificationConditionIndicator }} 
                        <span v-if="showVerificationValue">
                        {{ verificationFromValue }} <span v-if="verification_condition == 'INCLUSIVE_RANGE' || verification_condition == 'EXCLUSIVE_RANGE'">to {{ verificationToValue }}</span>
                        </span>
                    </span>
                </div>
                <div v-if="enableExecution" class="col-xs-2" style="justify-content: right">
                    {{ actualValue == undefined || actualValue.length == 0 ? "___________" : `Actual: ${actualValue}` }}
                </div>
                <div class="col-xs-1 pull-right-xs">
                    <ing-popover placement="left" v-if="enableExecution">
                        <template slot="title">Bus 1553 Results</template>
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
                <div class="col-xs-4">
                    <div class="command-string-label">
                        <label class="required-field">1553 Variable</label>
                        <button @click="show1553Modal = true" type="button" :disabled="disableFields" class="btn btn-xs btn-info pull-right procedure-lookup">
                            <span class="glyphicon glyphicon-search"></span>  Lookup
                        </button>
                    </div>
                    <ing-autocomplete
                        :value="bus_1553_var"
                        v-on:handleEvent="handleInput"
                        :callback="fetch1553Callback"
                        :items="flight_versions"
                        nameField="mil1553_name"
                        categoryField="operations_category"
                        descriptionField="description"
                        enterByName="mil1553_name"
                        v-on:save="save1553Entry"
                        :disabled="disableFields"
                        :inputClasses="modStyle(elementId, `entries.${index}.bus_1553_var`)"
                    ></ing-autocomplete>
                </div>
                <div class="col-xs-3" :class="{'error': _enumerations.length == 0 && _euError}">
                    <!-- This is a hack to make dynamic tooltips work -->
                    <div v-if="_enumerations.length == 0 && _euError">
                        <label class="required-field" data-toggle="tooltip" 
                               :title="tooltips.eu_error">
							Raw or Converted
						</label>
                    </div>
                    <label v-else class="required-field">
                        Raw or Converted
                    </label>
                    <select v-model="raw_convert"
                        @change="save"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px; margin-top: 4px;"
                        :class="modStyle(elementId, `entries.${index}.raw_convert`)">
                        <option value="RAW">RAW</option>
                        <option value="CONVERT">CONVERT</option>
                    </select>
                </div>
                <div class="col-xs-5"></div>
            </div>
            <div class="row">
                <div class="col-xs-3">
                    <label
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_telemetry_verify_on"
                        class="required-field ing-tooltip"><b>Verify On</b></label>
                    <select v-model="verify_on"
                        @change="save"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.verify_on`)">
                        <option value="VALUE">VALUE</option>
                        <option value="CHANGE">CHANGE</option>
                    </select>
                </div>
                <div class="col-xs-3" :class="{'error': channelOutputTypeMismatch}">
                    <!-- XXX: This is a hack to make dynamic tooltips work -->
                    <div v-if="channelOutputTypeMismatch">
                        <label
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.channel_output_type_mismatch"
                            class="ing-tooltip">
                            Verification Condition
                        </label>
                    </div>
                    <span v-else>
                        <label>Verification Condition</label>
                    </span>
                    <select v-model="verification_condition"
                        @change="save"
                        :disabled="disableFields"
                        type="text"
                        class="form-control execution-input"
                        style="margin-bottom: 10px;"
                        :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                        <option value="GREATER_THAN">GREATER_THAN</option>
                        <option value="LESS_THAN">LESS_THAN</option>
                        <option value="GREATER_THAN_OR_EQUAL">GREATER_THAN_OR_EQUAL</option>
                        <option value="LESS_THAN_OR_EQUAL">LESS_THAN_OR_EQUAL</option>
                        <option value="EQUAL">EQUAL</option>
                        <option value="NOT_EQUAL">NOT_EQUAL</option>
                        <option value="RECORD">RECORD</option>
                        <option value="NOT_PRESENT">NOT_PRESENT</option>
                        <option value="CONTAINS">CONTAINS</option>
                        <option value="INCLUSIVE_RANGE">INCLUSIVE_RANGE</option>
                        <option value="EXCLUSIVE_RANGE">EXCLUSIVE_RANGE</option>
                    </select>
                </div>
                <div  v-if="showVerificationValue" class="col-xs-6">
                    <label class="required-field">Verification Values</label>
                    <div v-if="verification_condition == 'GREATER_THAN' ||
                              verification_condition == 'LESS_THAN' ||
                              verification_condition == 'GREATER_THAN_OR_EQUAL' ||
                              verification_condition == 'LESS_THAN_OR_EQUAL' ||
                              verification_condition == 'GREATER_THAN' ||
                              verification_condition == 'EQUAL' ||
                              verification_condition == 'NOT_EQUAL' ||
                              verification_condition == 'CONTAINS'"
                         class="row">
                        <div class="col-xs-5">
                            <select v-if="_enumerations.length > 0"
                                    v-model="verificationFromValue" @change="save"
                                    :disabled="disableFields" type="text"
                                    :class="modStyle(elementId, `entries.${index}.verification_values`)"
                                    class="form-control execution-input">
                                <option v-for="(item, index) in _enumerations"
                                        :key="index" :value="raw_convert == 'RAW' && item.numeric || item.symbol">
                                    {{raw_convert == 'RAW' && item.numeric || item.symbol}}
                                </option>
                            </select>
                            <input v-else
                                v-model.trim="verificationFromValue" @change="save1553Entry"
                                :disabled="disableFields" type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, `entries.${index}.verification_values`)">
                        </div>
                        <div class="col-xs-7"></div>
                    </div>
                    <div v-else-if="verification_condition == 'INCLUSIVE_RANGE' || verification_condition == 'EXCLUSIVE_RANGE'"
                         class="row">
                        <div class="col-xs-5">
                            <input
                                v-model.trim="verificationFromValue"
                                @change="save1553Entry"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, `entries.${index}.verification_values`)">
                        </div>
                        <div class="col-xs-2" style="text-align:center;">
                            to
                        </div>
                        <div class="col-xs-5">
                            <input
                                v-model.trim="verificationToValue"
                                @change="save1553Entry"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, `entries.${index}.verification_values`)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Mil1553Version from "../../../project-config/common/Mil1553Version.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";
    import _ from "lodash";

    let TOOLTIPS = require('../../../common/tooltip-config');
    let VERIFICATION_CONDITIONS = require('../../../common/verification-conditions');
    export default {
        name: "Bus1553Entry",
        components: {
            IngAutocomplete,
            Mil1553Version
        },
        data() {
            return {
                show1553Modal: false,
                componentLoaded: false,
                rangeConditions: ["INCLUSIVE_RANGE", "EXCLUSIVE_RANGE"],
                channelOutputTypeMismatch: false
            };
        },
        mounted: function() {
        },
        watch: {
            selectedFlightDictionaryVersion: function(dictionaryVersion) {
                if (dictionaryVersion) {
                    this.fetchFlight1553EuEn({
                        channelType: 'FLIGHT',
                        dictionaryVersion: dictionaryVersion,
                        channelName: this.bus_1553_var
                    });
                }
            },
        },
        computed: {
            ...mapGetters([
                "execution",
                "flightVersions",
                "selectedFlightDictionaryVersion",
                "euPresent",
                "executionInputEntryKey",
                "enumerations",
                "modStyle",
            ]),

            _euError: function() {
                if (this.raw_convert === 'CONVERT') {
                    let euPresentStatus = this.euPresent(
                        'FLIGHT',  // Assume 1553 only uses flight dictionary
                        this.selectedFlightDictionaryVersion,
                        this.bus_1553_var
                    );
                    return euPresentStatus === null ? false : !euPresentStatus;
                }

                return false;
            },
            
            _enumerations: function() {
                return _.get(
                    this.enumerations, 
                    `FLIGHT-${this.selectedFlightDictionaryVersion}-${this.bus_1553_var}`, 
                    []
                );
            },

            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },

            verificationConditions() {
                return VERIFICATION_CONDITIONS.default.VERIFICATION_CONDITIONS;
            },

            flight_versions: {
                get() {
                    let formatedVersions = [];
                    let versions = this.flightVersions(this.selectedFlightDictionaryVersion, "mil1553");
                    _.forEach(versions, function(version, key) {
                        if(key != "total_count")
                            formatedVersions.push(version);
                    });

                    return formatedVersions;
                }
            },

            bus_1553_var: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "bus_1553_var"); },
                set(value) {
                    // Set bus_1553_var value for this entry
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "bus_1553_var",
                        value: value
                    });

                    this.fetchFlight1553EuEn({
                        channelType: 'FLIGHT',
                        dictionaryVersion: this.selectedFlightDictionaryVersion,
                        channelName: this.bus_1553_var
                    });
                }
            },

            raw_convert: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "raw_convert"); },
                set(value) {
                    // Set raw_convert for this entry
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "raw_convert",
                        value: value
                    });

                    this.fetchFlight1553EuEn({
                        channelType: 'FLIGHT',
                        dictionaryVersion: this.selectedFlightDictionaryVersion,
                        channelName: this.bus_1553_var
                    });
                }
            },

            verify_on: {
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

            verification_condition: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verification_condition"); },
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
            showVerificationValue: function() {
                return this.verification_condition !== 'RECORD' && this.verification_condition !== 'NOT_PRESENT';
            },
            actualValue: function() {
                if(this.mode !== "authoring")
                    return this.executionResultsEntryKey(this.elementId, this.index, "actual_value");
                else return undefined;
            },

            verificationStatus: function() {
                if(this.mode !== "authoring")
                    return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
                else return undefined;
            },

            verificationConditionIndicator: function() {
                return this.verification_condition && this.verificationConditions ? this.verificationConditions[this.verification_condition].indicator : "";
            },
        },

        methods: {
            // modify this fetch 1553 elements
            ...mapActions([
                "fetchDictItem",
                "fetchFlightDicts",
                "fetchFlight1553EuEn",
            ]),

            onSelect1553: function(mil1553_name) {
                this.bus_1553_var = mil1553_name;
                this.show1553Modal = !this.show1553Modal;
                this.save();
            },

            handleInput: function(customEvent) {
                this.bus_1553_var = customEvent;
            },

            fetch1553Callback: function( mil_1553_stem ) {
                this.fetchDictItem({
                    type: "mil1553",
                    dict_type: "FLIGHT",
                    version: this.selectedFlightDictionaryVersion,
                    options: {
                        mil1553_name: mil_1553_stem,
                        limit: 7
                    }
                });
            },

            save1553Entry() {
                try {
                    this.bus_1553_var = this.bus_1553_var.trim();
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

    .error {
        background-color: orangered;
    }

</style>

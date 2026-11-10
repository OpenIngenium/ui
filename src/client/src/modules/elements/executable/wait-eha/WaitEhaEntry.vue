// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-9 level2container">
                    <div class="channel-id-column">
                        <span v-if="channelId" :class="modStyle(elementId, `entries.${index}.channel_id`)">{{ channelId }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.channel_id`)" v-text="'<Channel ID>'"></span>
                    </div>
                    <div class="channel-name-column">
                        <span v-if="channelName" :class="modStyle(elementId, `entries.${index}.channel_name`)">{{ channelName }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.channel_name`)" v-text="'<Channel Name>'"></span>
                    </div>
                    <div class="channel-value-column">
                        On
                        <span v-if="dataPath" :class="modStyle(elementId, `entries.${index}.data_path`)">{{ dataPath }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.data_path`)" v-text="'<Data Path>'"></span>
                        <span v-if="verifyOn" :class="modStyle(elementId, `entries.${index}.verify_on`)">{{ verifyOn }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.verify_on`)" v-text="'<Value/>Change>'"></span>
                        (<span v-if="dnEu" :class="modStyle(elementId, `entries.${index}.dn_eu`)">{{ dnEu }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.dn_eu`)" v-text="'<DN/>EU>'"></span>)
                        <span v-if="verificationCondition" :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                            {{ verificationConditionIndicator }}
                            <span v-if="showVerificationValue" :class="modStyle(elementId, `entries.${index}.verification_values`)">
                                {{ verificationFromValue }} <span v-if="isRangeCondition">to {{ verificationToValue }}</span>
                            </span>
                        </span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.verification_condition`)" v-text="'<Verification>'">)</span>
                    </div>
                </div>
                <div v-if="!isAuthoring" class="col-xs-2" style="justify-content: right">
                    {{ actualValueString }}
                </div>
                <div class="col-xs-1 pull-right-xs">
                    <ing-popover placement="left" v-if="enableExecution">
                        <template slot="title">Wait EHA Results</template>
                        <execution-full-results
                            slot="body"
                            :element-id="elementId"
                            :entry-index="index">
                        </execution-full-results>
                        <execution-status-check
                            v-if="enableExecution"
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
                <div class="col-xs-2">
                    <label class="required-field">Flight/SSE</label>
                    <select v-model="channelType" :class="modStyle(elementId, `entries.${index}.channel_type`)" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <option v-for="option in channelTypeOptions"
                            :key="option[0]"
                            :value="option[0]">
                            {{ option[1] }}
                        </option>
                    </select>
                </div>
                <div class="col-xs-3">
                    <label class="required-field">Data Path</label>
                    <div class="input-group">
                        <div class="input-group-btn">
                            <button 
                                :disabled="disableFields"
                                type="button"  
                                style="margin-bottom: 10px;" 
                                class="btn btn-default dropdown-toggle" 
                                data-toggle="dropdown" 
                                aria-haspopup="true" 
                                aria-expanded="false">
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li
                                    v-for="dataPath in dataPaths" 
                                    :key="dataPath" 
                                    data-toggle="dropdown"
                                    class="dropdown-item">
                                    <a 
                                        href=""
                                        @click.prevent="saveDataPath(dataPath)">{{ dataPath }}</a>
                                </li>
                            </ul>
                        </div>
                        <input v-model.trim="dataPath"
                            @change="saveDataPath(dataPath)"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.data_path`)">
                    </div>
                </div>
                <div class="col-xs-3">
                    <div class="channel-label">
                        <label
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_wait_verify_eha_channel_id"
                            class="required-field ing-tooltip"><b>Channel ID</b></label>
                        <button
                            @click="showChannelModal=true"
                            type="button"
                            class="btn btn-xs btn-info pull-right procedure-lookup ing-tooltip"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_wait_verify_eha_lookup"
                            :disabled="disableFields">
                            <span class="glyphicon glyphicon-search"></span>  Lookup
                        </button>
                    </div>
                    <ing-autocomplete
                        :value="channelId"
                        v-on:handleEvent="(result, secondResult) => handleChannelIdInput(result, secondResult)"
                        :callback="fetchChannelIdAutoCompleteCallback"
                        :items="this.ehas"
                        nameField="channel_id"
                        categoryField="operations_category"
                        descriptionField="description"
                        enterByName="channel_id"
                        enterByAdditionalField="channel_name"
                        v-on:save="saveWaitEhaEntry"
                        dynamicWidth="five-hundred-width"
                        :disabled="disableFields"
                        :inputClasses="modStyle(elementId, `entries.${index}.channel_id`)"
                    ></ing-autocomplete>
                </div>
                <ing-modal v-if="showChannelModal" @close="showChannelModal = false" size="large">
                    <template slot="title">Lookup EHA</template>
                    <template slot="body">
                        <WaitEhaTable
                            @selectEha="onSelectEha"
                            :channelType="channelType"
                        ></WaitEhaTable>
                    </template>
                    <template slot="footer">
                        <button @click="showChannelModal = false" type="button" class="btn btn-default pull-left">Cancel</button>
                        <button @click="showChannelModal = false" type="button" class="btn btn-primary pull-right cmd_builder_save_btn">Save</button>
                    </template>
                </ing-modal>
                <div class="col-xs-4">
                    <label
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_wait_verify_eha_channel_name"
                        class="required-field ing-tooltip"><b>Channel Name</b></label>
                    <ing-autocomplete
                        :value="channelName"
                        v-on:handleEvent="(result, secondResult) => handleChannelNameInput(result, secondResult)"
                        :callback="fetchChannelNameAutoCompleteCallback"
                        :items="this.ehas"
                        nameField="channel_name"
                        categoryField="operations_category"
                        descriptionField="description"
                        enterByName="channel_name"
                        enterByAdditionalField="channel_id"
                        dynamicWidth="three-hundred-width"
                        v-on:save="saveWaitEhaEntry"
                        :disabled="disableFields"
                        :inputClasses="modStyle(elementId, `entries.${index}.channel_name`)"
                    ></ing-autocomplete>
                </div>
            </div>
            <div class="row" style="margin-top: 10px;">
                <div class="col-xs-2" :class="{'error': invalidEU}">
                    <!-- This is a hack to make dynamic tooltips work -->
                    <div v-if="invalidEU">
                        <label class="required-field ing-tooltip"
                               data-toggle="tooltip"
                               data-placement="top"
                               data-trigger="hover"
                               onclick="$(this).tooltip('hide');"
                               :title="tooltips.eu_error"><b>DN/EU Path</b></label>
                    </div>
                    <span v-else>
                        <label class="required-field ing-tooltip"
                               data-toggle="tooltip"
                               data-placement="top"
                               data-trigger="hover"
                               onclick="$(this).tooltip('hide');"
                               :title="tooltips.auth_exec_wait_verify_eha_dn_eu"><b>DN/EU Path</b></label>
                    </span>
                    <select v-model="dnEu"
                            @change="save"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.dn_eu`)">
                        <option v-for="option in dnEuOptions"
                                :key="option[0]"
                                :value="option[0]">
                            {{ option[1] }}
                        </option>
                    </select>
                </div>
                <div class="col-xs-3">
                    <label
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_telemetry_verify_on"
                        class="required-field ing-tooltip"><b>Verify On</b></label>
                    <select v-model="verifyOn" :class="modStyle(elementId, `entries.${index}.verify_on`)" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                            <option v-for="option in verifyOnOptions"
                                :key="option[0]"
                                :value="option[0]">
                                {{ option[1] }}
                            </option>
                    </select>
                </div>
                <div class="col-xs-3" :class="{'error': invalidVerificationCondition}">
                    <!-- XXX: This is a hack to make dynamic tooltips work -->
                    <div v-if="invalidVerificationCondition">
                        <label
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.channel_output_type_mismatch"
                            class="ing-tooltip"><b>Verify Condition</b></label>
                    </div>
                    <span v-else>
                        <label
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_wait_verify_eha_verify_conditions"
                            class="ing-tooltip"><b>Verify Condition</b></label>
                    </span>
                    <select v-model="verificationCondition"
                        @change="$emit('save')"
                        :disabled="disableFields"
                        class="form-control execution-input"
                        :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                        <option v-for="(conditionObj, value) in verificationConditions"
                            :selected="value === verificationCondition"
                            :key="value" :value="value">
                            {{ conditionObj.label }}
                        </option>
                    </select>
                </div>
                <div v-if="showVerificationValue" class="col-xs-4">
                    <label
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        onclick="$(this).tooltip('hide');"
                        :title="tooltips.auth_exec_wait_verify_eha_verify_value"
                        class="required-field ing-tooltip"><b>Verify Value</b></label>
                    <div v-if="isRangeCondition" class="input-group">
                        <input v-model.trim="verificationFromValue"
                               @change="saveWaitEhaEntry"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, `entries.${index}.verification_values`)">
                        <span class="input-group-addon range-option-group">to</span>
                        <input v-model.trim="verificationToValue"
                               @change="saveWaitEhaEntry"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, `entries.${index}.verification_values`)">
                    </div>
                    <div v-else>
                        <input v-model.trim="verificationFromValue"
                               @change="saveWaitEhaEntry"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, `entries.${index}.verification_values`)">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import WaitEhaTable from "./WaitEhaTable.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";
    import _ from "lodash";

    let TOOLTIPS = require('../../../common/tooltip-config');
    let VERIFICATION_CONDITIONS = require("../../../common/verification-conditions");
    export default {
        name: "WaitEhaEntry",
        components: {
            WaitEhaTable,
            IngAutocomplete,
        },
        data() {
            return {
                showChannelModal: false,
                verifyOnOptions: [
                    ["VALUE", "Value"],
                    ["CHANGE", "Change"]
                ],
                channelTypeOptions: [
                    ["SSE", "SSE"],
                    ["FLIGHT", "Flight"]
                ],
                dnEuOptions: [
                    ["DN","DN"],
                    ["EU","EU"]
                ],
                rangeConditions: ["INCLUSIVE_RANGE", "EXCLUSIVE_RANGE"],
                invalidVerificationCondition: false,
                invalidEU: false
            };
        },
        mounted: function() {
        },
        methods: {
            ...mapActions([
                'fetchFlightEhas',
                'fetchSseEhas',
                'fetchFlightEhasEuPresentAndEhasType',
                'fetchSseEhasEuPresentAndEhasType',
                'displayFeedback',
            ]),
            handleChannelIdInput: function(channelId, channelName) {
                this.channelId = channelId;
                this.channelName = channelName;
            },
            handleChannelNameInput: function(channelName, channelId = "") {
                this.channelName = channelName;
                this.channelId = channelId;
            },
            fetchChannelIdAutoCompleteCallback: async function(channel_id) {
                switch(this.channelType) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            await this.fetchSseEhas({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                limit: 6,
                                filters: {
                                    channel_id: { value: channel_id }
                                },
                                wild: true,
                            });
                        }

                        break;
                    case "FLIGHT":
                        if (this.selectedFlightDictionaryVersion) {
                            await this.fetchFlightEhas({
                                dictionaryVersion: this.selectedFlightDictionaryVersion,
                                limit: 6,
                                filters: {
                                    channel_id: { value: channel_id }
                                },
                                wild: true,
                            });
                        }
                        break;
                }
            },
            fetchChannelNameAutoCompleteCallback: async function(eha_name) {
                switch(this.channelType) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            await this.fetchSseEhas({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                limit: 6,
                                filters: {
                                    eha_name: { value: eha_name }
                                },
                                wild: true,
                            });
                        }

                        break;
                    case "FLIGHT":
                        if (this.selectedFlightDictionaryVersion) {
                            await this.fetchFlightEhas({
                                dictionaryVersion: this.selectedFlightDictionaryVersion,
                                limit: 6,
                                filters: {
                                    eha_name: { value: eha_name }
                                },
                                wild: true,
                            });
                        }
                        break;
                }
            },
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
            onSelectEha: function(choosenEha) {
                this.channelId = choosenEha.channel_id;
                this.channelName = choosenEha.eha_name;
                this.showChannelModal = !this.showChannelModal;
                this.save();
            },
            checkEuPresent: async function() {
                switch (this.channelType) {
                    case 'SSE':
                        if (this.selectedSseDictionaryVersion) {
                            await this.fetchSseEhasEuPresentAndEhasType({
                                channelType: this.channelType,
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                channelName: this.channelName,
                            });
                        }
                        break;
                    case 'FLIGHT':
                        if (this.selectedFlightDictionaryVersion) {
                            await this.fetchFlightEhasEuPresentAndEhasType({
                                channelType: this.channelType,
                                dictionaryVersion: this.selectedFlightDictionaryVersion,
                                channelName: this.channelName,
                            });
                        }
                        break;
                    default:
                        break;
                }
            },
            ehaValueVerification: function(){
                if(this.isEuPresent || this.getEhaType == 'enum' || this.getEhaType == 'boolean' || this.dnEu =='DN') {
                    this.invalidEU = false;
                } else {
                    this.invalidEU = true;
                }
                if (this.verifyOn == 'CHANGE' && (this.verificationCondition == 'RECORD' || this.verificationCondition == 'CONTAINS' || this.verificationCondition == 'NOT_PRESENT' )) {
                    this.invalidVerificationCondition = true;
                }
                else if (this.verificationConditionAllowedTypes) {
                    this.invalidVerificationCondition = false;
                } else {
                    this.invalidVerificationCondition = true;
                }
            },
            saveWaitEhaEntry() {
                try {
                    if (this.channelId) {
                        this.channelId = this.channelId.trim();
                    } else {
                        this.channelId = '';
                    }
                } catch(err) {
                    console.error(err);
                }

                try {
                    if (this.channelName) {
                        this.channelName = this.channelName.trim();
                    } else {
                        this.channelName = '';                      
                    }
                } catch(err) {
                    console.error(err);
                }
                
                // Check if no channels found matching what user entered
                if ((this.channelId || this.channelName) && this.ehas.length === 0) {
                    const searchTerm = this.channelId || this.channelName;
                    const fieldType = this.channelId ? 'Channel ID' : 'Channel Name';
                    this.displayFeedback({
                        type: 'warning',
                        messageObj: {
                            message: `No channels found matching ${fieldType} "${searchTerm}" in the selected ${this.channelType} dictionary.`
                        }
                    });
                } else if (this.channelId && this.ehas.length > 0) {
                    // Check if the entered channel ID exists in the results
                    const found = this.ehas.find(eha => eha.channel_id === this.channelId);
                    if (!found) {
                        this.displayFeedback({
                            type: 'warning',
                            messageObj: {
                                message: `Channel ID "${this.channelId}" does not exist in the selected ${this.channelType} dictionary.`
                            }
                        });
                    }
                } else if (this.channelName && this.ehas.length > 0) {
                    // Check if the entered channel name exists in the results
                    const found = this.ehas.find(eha => eha.channel_name === this.channelName);
                    if (!found) {
                        this.displayFeedback({
                            type: 'warning',
                            messageObj: {
                                message: `Channel Name "${this.channelName}" does not exist in the selected ${this.channelType} dictionary.`
                            }
                        });
                    }
                }
                
                this.save();
            },
            saveDataPath(value) {
                this.dataPath = value;
                this.save();
            }
        },
        watch: {
            verificationCondition: function(newValue, oldValue) {
                this.checkRangeConditionChange(newValue, oldValue, "verification_values");
                this.ehaValueVerification();
            },
            selectedSseDictionaryVersion: {
                async handler(dictionaryVersion) {
                    if (this.channelType && this.channelName && this.channelType == 'SSE' && dictionaryVersion) {
                        await this.fetchSseEhasEuPresentAndEhasType({
                            channelType: this.channelType,
                            dictionaryVersion: dictionaryVersion,
                            channelName: this.channelName,
                        });
                    }
                }
            },
            selectedFlightDictionaryVersion: {
                async handler(dictionaryVersion) {
                    if (this.channelType && this.channelName && this.channelType == 'FLIGHT' && dictionaryVersion) {
                        await this.fetchFlightEhasEuPresentAndEhasType({
                            channelType: this.channelType,
                            dictionaryVersion: dictionaryVersion,
                            channelName: this.channelName,
                        });
                    }
                }
            },
            getEhaType: function() {
                this.ehaValueVerification();
            },
            isEuPresent: function() {
                this.ehaValueVerification();
            },
            dnEu: function() {
                this.ehaValueVerification();
            },
            verifyOn: function() {
                this.ehaValueVerification();
            },
        },
        computed: {
            ...mapGetters([
                'ehas',
                'selectedSseDictionaryVersion',
                'selectedFlightDictionaryVersion',
                'euPresent',
                'executionInputEntryKey',
                'ehaType',
                'dataPaths',
                'modStyle',
                'executionResultsEntry'
            ]),
            getEhaType: function() {
                let dictionaryVersion = null;
                if (this.channelType === 'SSE') {
                    if (this.selectedSseDictionaryVersion) {
                        dictionaryVersion = this.selectedSseDictionaryVersion;
                    }
                } else if (this.channelType === 'FLIGHT') {
                    if (this.selectedFlightDictionaryVersion) {
                        dictionaryVersion = this.selectedFlightDictionaryVersion;
                    }
                }
                let eha = this.ehaType(this.channelType, dictionaryVersion, this.channelName);
                return eha === null ? '' : eha;
            },
            isEuPresent: function() {
                if (this.dnEu === 'EU') {
                    let dictionaryVersion = null;
                    if (this.channelType === 'SSE') {
                        if (this.selectedSseDictionaryVersion) {
                            dictionaryVersion = this.selectedSseDictionaryVersion;
                        }
                    } else if (this.channelType === 'FLIGHT') {
                        if (this.selectedFlightDictionaryVersion) {
                            dictionaryVersion = this.selectedFlightDictionaryVersion;
                        }
                    }
                    let euPresentStatus = this.euPresent(this.channelType, dictionaryVersion, this.channelName);
                    return euPresentStatus === null ? false : euPresentStatus;
                }
                return false;
            },
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            verificationConditions() {
                return VERIFICATION_CONDITIONS.default.VERIFICATION_CONDITIONS;
            },
            isRangeCondition: function() {
                return this.rangeConditions.indexOf(this.verificationCondition) > -1;
            },
            channelType: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "channel_type"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "channel_type",
                        value: value
                    });
                }
            },
            channelId: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "channel_id"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "channel_id",
                        value: value ? value : ''
                    });
                }
            },
            channelName: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "channel_name"); },
                set(value) {
                    // Set dn_eu on this entry
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "channel_name",
                        value: value ? value : ''
                    });

                    this.checkEuPresent();
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
            },
            dnEu: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "dn_eu"); },
                set(value) {
                    // Set dn_eu on this entry
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "dn_eu",
                        value: value
                    });

                    
                    this.checkEuPresent();
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
            showVerificationValue: function() {
                return this.verificationCondition !== 'RECORD' && this.verificationCondition !== 'NOT_PRESENT';
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
            verificationStatus: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "verification_status");
            },
            actualValue: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "actual_value");
            },
            verificationConditionIndicator: function() {
                return this.verificationCondition ? this.verificationConditions[this.verificationCondition].indicator : "";
            },
            verificationConditionAllowedTypes: function() {
                if((this.dnEu == 'DN' && this.getEhaType =='boolean') || (this.dnEu == 'DN' && this.getEhaType =='enum')) {
                    return this.verificationCondition ? this.verificationConditions[this.verificationCondition].allowedType.includes('integer'): "";
                } else {
                    return this.verificationCondition ? this.verificationConditions[this.verificationCondition].allowedType.includes(this.getEhaType): "";
                }
            },
            executionResultsEntryCurrent: function() {
                return this.executionResultsEntry(this.elementId, this.index);
            },
            actualValueString: function() {
                if (this.actualValue) {
                    if (this.verifyOn === 'CHANGE') {
                        if (this.dnEu === 'DN') {
                            return `Change: ${this.actualValue} (Value: ${this.executionResultsEntryCurrent.dn})`;
                        } else if (this.dnEu === 'EU') {
                            return `Change: ${this.actualValue} (Value: ${this.executionResultsEntryCurrent.eu})`;
                        } else {
                            // this should not happen. Just in case.
                            return `Change: ${this.actualValue}`;
                        }
                    } else {
                        return `Value: ${this.actualValue}`;
                    }
                } else {
                    return '___________';
                }
            }
        }
    };
</script>

<style scoped>

    .required-field {
        display: inline;
    }

    .error {
        background-color: orangered;
    }
    
    .level2container {
        display: inline-grid;
        justify-items: stretch;
        grid-template-columns: 9ch 45ch auto;
    }
    
    .channel-id-column {
        overflow-wrap: anywhere;
    }
    
    .channel-name-column {
        margin-left: 10px;
        overflow-wrap: anywhere;
    }
    
    .channel-value-column {
        margin-left: 10px;
        overflow-wrap: anywhere;
    }
</style>

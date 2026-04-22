<template>
    <div>
        <!--CMD Look Up Modals-->
        <CommandLookupModals
          :show-flight-cmd-modal="showFlightCmdModal"
          :show-sim-cmd-modal="showSimCmdModal"
          :show-evr-modal="showEvrModal"
          :show-channel-modal="showChannelModal"
          :evr-type="evrType"
          :eha-type="ehaType"

          @close-flight-cmd="showFlightCmdModal = false"
          @close-sim-cmd="showSimCmdModal = false"
          @close-evr="showEvrModal = false"
          @close-channel="showChannelModal = false"

          @submit-flight-cmd="setCommandString"
          @select-cmd="selectedCmd"
          @select-evr="selectedEvr"
          @select-eha="selectedEha"
        ></CommandLookupModals>

        <!--NEW ADVANCED LAYOUT-->
        <div v-if="advancedLayout">    
             <!-- Label (TOP handled outside input) -->
            <label 
                v-if="['TOP'].includes(labelLoc)"
                :style="{ textAlign: labelAlign.toLowerCase(), display: 'block', marginBottom: '5px' }"
                :title="arg.description"
                class="ing-tooltip"
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');">
                <b>{{ argumentLabel || arg.name }}</b>
            </label>
            <!-- Input section (TOP/BOTTOM branch) -->
            <div  v-if="['TOP', 'BOTTOM'].includes(labelLoc)">
                <ArgInputCore
                    :arg="arg"
                    :input-classes="inputClasses"
                    :disable-input-field="disableInputField"
                    :disable-fields="disableFields"
                    :field-height="fieldHeight"

                    :time-references="timeReferences"
                    :data-paths="dataPaths"
                    :builder-cmds="builderCmds"
                    :cmds="cmds"
                    :evrs="evrs"
                    :ehas="ehas"
                    :tooltips="tooltips"

                    :flight-command="flightCommand"
                    :sim-command="simCommand"
                    :evr-name="evrName"
                    :eha-channel-id="ehaChannelId"
                    :eha-channel-name="ehaChannelName"

                    :verification-condition="verificationCondition"
                    :verification-value="verificationValue"
                    :verification-range-from="verificationRangeFrom"
                    :verification-range-to="verificationRangeTo"
                    :verification-conditions="verificationConditions"
                    :show-verification-value="showVerificationValue"
                    :is-range-condition="isRangeCondition"

                    :fetch-flight-cmd-auto-complete-callback="fetchFlightCmdAutoCompleteCallback"
                    :fetch-sim-cmd-auto-complete-callback="fetchSimCmdAutoCompleteCallback"
                    :fetch-evr-auto-complete-callback="fetchEvrAutoCompleteCallback"
                    :fetch-eha-channel-id-auto-complete-callback="fetchEhaChannelIdAutoCompleteCallback"
                    :fetch-eha-channel-name-auto-complete-callback="fetchEhaChannelNameAutoCompleteCallback"

                    :wrap-with-group="true"

                    @updateArg="updateArg"
                    @populateTimeReferences="populateTimeReferences"

                    @openFlightCmdModal="editCommandString"
                    @openSimCmdModal="showSimCmdModal = true"
                    @openEvrModal="showEvrModal = true"
                    @openChannelModal="showChannelModal = true"

                    @handleFlightCmdInput="handleFlightCmdInput"
                    @handleSimCmdInput="handleSimCmdInput"
                    @handleEvrInput="handleEvrInput"
                    @handleEhaChannelIdInput="handleEhaChannelIdInput"
                    @handleEhaChannelNameInput="handleEhaChannelNameInput"

                    @saveFlightCmd="saveFlightCmd"
                    @saveSimCmd="saveSimCmd"
                    @saveEvrEntry="saveEvrEntry"
                    @saveEhaEntry="saveEhaEntry"

                    @setVerificationCondition="setVerificationConfition"
                    @setVerificationValue="setVerificationValue"
                    @setVerificationRangeFrom="setVerificationRangeFrom"
                    @setVerificationRangeTo="setVerificationRangeTo"
                ></ArgInputCore>
            </div>
            <!-- Label (BOTTOM handled outside input) -->
            <label 
                v-if="['BOTTOM'].includes(labelLoc)"
                :style="{ textAlign: labelAlign.toLowerCase(), display: 'block',  marginTop: '5px'}"
                :title="arg.description"
                class="ing-tooltip"
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');">
                <b>{{ argumentLabel || arg.name }}</b>
            </label>

            <!-- LEFT/RIGHT layout in flex row -->
            <div v-if="['LEFT', 'RIGHT'].includes(labelLoc)" style="display: flex; align-items: center;">
                <!-- LEFT Label -->
                <label
                  v-if="labelLoc === 'LEFT'"
                  :style="{ textAlign: labelAlign.toLowerCase(), marginRight: '10px', whiteSpace: 'nowrap' }"
                  :title="arg.description"
                  class="ing-tooltip"
                  data-toggle="tooltip"
                  data-placement="top"
                  data-trigger="hover"
                  onclick="$(this).tooltip('hide');"
                >
                  <b>{{ argumentLabel || arg.name }}</b>
                </label>
                <!-- Input section (LEFT/RIGHT branch) -->
                <ArgInputCore
                    :arg="arg"
                    :input-classes="inputClasses"
                    :disable-input-field="disableInputField"
                    :disable-fields="disableFields"
                    :field-height="fieldHeight"

                    :time-references="timeReferences"
                    :data-paths="dataPaths"
                    :builder-cmds="builderCmds"
                    :cmds="cmds"
                    :evrs="evrs"
                    :ehas="ehas"
                    :tooltips="tooltips"

                    :flight-command="flightCommand"
                    :sim-command="simCommand"
                    :evr-name="evrName"
                    :eha-channel-id="ehaChannelId"
                    :eha-channel-name="ehaChannelName"

                    :verification-condition="verificationCondition"
                    :verification-value="verificationValue"
                    :verification-range-from="verificationRangeFrom"
                    :verification-range-to="verificationRangeTo"
                    :verification-conditions="verificationConditions"
                    :show-verification-value="showVerificationValue"
                    :is-range-condition="isRangeCondition"

                    :fetch-flight-cmd-auto-complete-callback="fetchFlightCmdAutoCompleteCallback"
                    :fetch-sim-cmd-auto-complete-callback="fetchSimCmdAutoCompleteCallback"
                    :fetch-evr-auto-complete-callback="fetchEvrAutoCompleteCallback"
                    :fetch-eha-channel-id-auto-complete-callback="fetchEhaChannelIdAutoCompleteCallback"
                    :fetch-eha-channel-name-auto-complete-callback="fetchEhaChannelNameAutoCompleteCallback"

                    :wrap-with-group="false"

                    @updateArg="updateArg"
                    @populateTimeReferences="populateTimeReferences"

                    @openFlightCmdModal="editCommandString"
                    @openSimCmdModal="showSimCmdModal = true"
                    @openEvrModal="showEvrModal = true"
                    @openChannelModal="showChannelModal = true"

                    @handleFlightCmdInput="handleFlightCmdInput"
                    @handleSimCmdInput="handleSimCmdInput"
                    @handleEvrInput="handleEvrInput"
                    @handleEhaChannelIdInput="handleEhaChannelIdInput"
                    @handleEhaChannelNameInput="handleEhaChannelNameInput"

                    @saveFlightCmd="saveFlightCmd"
                    @saveSimCmd="saveSimCmd"
                    @saveEvrEntry="saveEvrEntry"
                    @saveEhaEntry="saveEhaEntry"

                    @setVerificationCondition="setVerificationConfition"
                    @setVerificationValue="setVerificationValue"
                    @setVerificationRangeFrom="setVerificationRangeFrom"
                    @setVerificationRangeTo="setVerificationRangeTo"
                ></ArgInputCore>
                <!-- RIGHT Label -->
                <label
                    v-if="labelLoc === 'RIGHT'"
                    :style="{ textAlign: labelAlign.toLowerCase(), marginLeft: '10px', whiteSpace: 'nowrap' }"
                    :title="arg.description"
                    class="ing-tooltip"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                >
                    <b>{{ argumentLabel || arg.name }}</b>
                </label>
            </div>
        </div>
        <!--OLD BACKWARD COMPATIBLE-->
        <div v-else class="row" style="padding-top:10px;">
            <div class="col-xs-3" style="overflow-wrap: break-word; word-wrap: break-word; hyphens: auto;">
                <p>{{ arg.name }} <span style="color:red;" v-if="arg.required === 'YES'"><b>*</b></span></p>
            </div>
            <div class="col-xs-6" style="overflow-wrap: break-word; word-wrap: break-word; hyphens: auto;">
                <p>{{ arg.description }}</p>
            </div>
            <div class="col-xs-3" v-if="['INT','STRING','FLOAT','VARIABLE'].includes(arg.type)">
                <input 
                    type="text" 
                    class="form-control"
                    :class="inputClasses"
                    :placeholder="arg.type"
                    :value="arg.value"
                    @change="updateArg"
                    :disabled="disableInputField">
            </div>
            <div class="col-xs-3" v-else-if="['TIME'].includes(arg.type)">
                <div class="input-group">
                    <div class="input-group-btn">
                        <button 
                            @click="populateTimeReferences"
                            :disabled="disableInputField"
                            type="button"  
                            style="margin-bottom: 10px;" 
                            class="btn btn-default dropdown-toggle" 
                            data-toggle="dropdown"
                            aria-haspopup="true" 
                            aria-expanded="false">
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu ing-long-dropdown-menu">
                            <li
                                v-for="timeReference in timeReferences" 
                                :key="timeReference" 
                                class="dropdown-item"
                                data-toggle="dropdown"
                            >                                        
                                <a 
                                    href=""
                                    @click.prevent="updateArg(timeReference)"
                                >
                                {{ timeReference }}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <input 
                        type="text" 
                        class="form-control"
                        :class="inputClasses"
                        :placeholder="arg.type"
                        :value="arg.value"
                        @change="updateArg"
                        :disabled="disableInputField">
                </div>
            </div>
            <div class="col-xs-3" v-else-if="['DATA_PATH'].includes(arg.type)">
                <div class="input-group">
                    <div class="input-group-btn">
                        <button 
                            :disabled="disableInputField"
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
                                class="dropdown-item"
                                data-toggle="dropdown"
                            >                                        
                                <a 
                                    href=""
                                    @click.prevent="updateArg(dataPath)"
                                >
                                {{ dataPath }}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <input 
                        type="text" 
                        class="form-control"
                        :class="inputClasses"
                        :placeholder="arg.type"
                        :value="arg.value"
                        @change="updateArg"
                        :disabled="disableInputField">
                </div>
            </div>
            <div class="col-xs-3" v-else-if="['BOOL'].includes(arg.type)">
                <input 
                    type="checkbox"
                    :checked="arg.value == 'true'"
                    @change="updateArg"
                    :class="inputClasses"
                    :disabled="disableInputField">
            </div>
            <div class="col-xs-3" v-else>
                <select 
                    class="form-control"
                    :class="inputClasses"
                    :value="arg.value"
                    @change="updateArg"
                    :disabled="disableInputField">
                    <option 
                        v-for="(enumeration, index) in arg.enumerations" 
                        :key="index"
                        :value="enumeration.symbol">
                        {{ enumeration.symbol }}
                    </option>
                </select>
            </div>
        </div>
    </div>

</template>

<script>
    import { mapActions, mapGetters } from 'vuex';
    import CommandLookupModals from './CommandLookupModals.vue';
    import ArgInputCore from './ArgInputCore.vue';
    let TOOLTIPS = require('../../../common/tooltip-config');
    let VERIFICATION_CONDITIONS = require("../../../common/verification-conditions");
    // type could equal:

    // - INT
    // - STRING
    // - FLOAT
    // - ENUM
    // - DATA_PATH
    // - TIME
    // - VARIABLE
    // - BOOL
    // - FLIGHT_COMMAND
    // - SIM_COMMAND
    // - FLIGHT_EVR
    // - SIM_EVR
    // - FLIGHT_TELEM
    // - SIM_TELEM
    // - VERIFICATION_COND
    // - FILE
    // - IMAGE
    // - SERIES
    export default {
        name: 'CustomScriptInputArg',
        components: {
            CommandLookupModals,
            ArgInputCore
        },
        props: {
            arg: {
                type: Object,
                required: true
            },
            index: {
                type: Number,
                required: true
            },
            isEntry: {
                type: Boolean,
                required: false,
                default: false
            },
            mode: {
                type: String,
                required: true
            },
            r4s: {
                type: Boolean,
                required: true
            },
            disableFields: {
                type: Boolean,
                required: true
            },
            canDisableExecuteField: {
                type: Boolean,
                required: true
            },
            inputClasses: {
                type: String,
            },
            argumentLabel: {
                type: String,
            },
            labelAlign: {
                type: String,
                default: 'LEFT'
            },
            labelLoc: {
                type: String,
                default: 'TOP'
            },
            fieldHeight: {
                type: Number,
                default: 2
            },
            advancedLayout: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                flightCommand: this.arg.value,
                simCommand: this.arg.value,
                evrName: this.arg.value,
                ehaChannelId: '',
                ehaChannelName: '',
                verificationCondition: 'RECORD',
                verificationValue: '',
                verificationRangeFrom: '',
                verificationRangeTo: '',
                showFlightCmdModal: false,
                showSimCmdModal: false,
                showEvrModal: false,
                showChannelModal: false
            };
        },
        watch: {
            arg: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    const parts = newVal && newVal.value && newVal.value.includes(',') ? newVal.value.split(',') : [];
                    this.ehaChannelId = parts[0] || '';
                    this.ehaChannelName = parts[1] || '';
                    this.verificationCondition = parts[0] || 'RECORD';
                    this.verificationValue = parts[1] || '';
                    this.verificationRangeFrom = parts[2] || '';
                    this.verificationRangeTo = parts[3] || '';
                }
            }
        },
        computed: {
            ...mapGetters([
                "dataPaths",
                "timeReferences",
                "selectedFlightDictionaryVersion",
                "builderCmds",
                "selectedCmdObj",
                "selectedCmdObjArgs",
                "selectedCmdObjRepeatArgs",
                "selectedSseDictionaryVersion",
                "cmds",
                "evrs",
                "ehas"
            ]),
            disableInputField: {
                get() {
                    return this.arg.phase === 'AUTHORING' ? this.disableFields : this.canDisableExecuteField;
                }
            },
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            evrType() {
                if (['FLIGHT_EVR'].includes(this.arg.type))
                    return 'FLIGHT';
                else if (['SIM_EVR'].includes(this.arg.type))
                    return 'SSE';
                return '';
            },
            ehaType() {
                if (['FLIGHT_TELEM'].includes(this.arg.type))
                    return 'FLIGHT';
                else if (['SIM_TELEM'].includes(this.arg.type))
                    return 'SSE';
                return '';
            },
            showVerificationValue() {
                return this.verificationCondition !== 'RECORD' && this.verificationCondition !== 'NOT_PRESENT';
            },
            isRangeCondition() {
                return this.verificationCondition == 'INCLUSIVE_RANGE' || this.verificationCondition == 'EXCLUSIVE_RANGE';
            },
            verificationConditions() {
                return VERIFICATION_CONDITIONS.default.VERIFICATION_CONDITIONS;
            },
        },
        methods: {
            ...mapActions([
                "populateTimeReferences",
                "fetchFlightCmds",
                "setCmd",
                "fetchCmds",
                "fetchFlightEvrs",
                "fetchSseEvrs",
                "fetchFlightEhas",
                "fetchSseEhas"
            ]),
            updateArg(eventOrValue) {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: eventOrValue.target ? (
                            eventOrValue.target.type === 'checkbox' ? eventOrValue.target.checked.toString() : eventOrValue.target.value
                        ) : eventOrValue,
                        index: this.index
                    }
                });
            },
            fetchFlightCmdAutoCompleteCallback: function( command_stem ) {
                this.fetchFlightCmds({
                    dictionaryVersion: this.selectedFlightDictionaryVersion, 
                    limit: 7,
                    wild: true,
                    filters: {
                        command_stem: {
                            value: command_stem
                        }
                    }
                });
            },
            fetchSimCmdAutoCompleteCallback: function( command_stem ) {
                this.fetchCmds({
                    dictionaryVersion: this.selectedSseDictionaryVersion, 
                    filters: { command_stem: { value: command_stem } },
                    limit: 7,
                    wild: true,
                });
            },
            fetchEvrAutoCompleteCallback: function( evr_name ) {
                const evrCategory = this.evrType;

                switch (evrCategory) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEvrs({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                filters: {
                                    evr_name: {
                                        value: evr_name
                                    }
                                },
                                wild: true,
                                limit: 6,
                            });
                        }

                        break; 
                    default:
                        if (this.selectedFlightDictionaryVersion) {
                            this.fetchFlightEvrs({
                                dictionaryVersion: this.selectedFlightDictionaryVersion, 
                                filters: {
                                    evr_name: {
                                        value: evr_name
                                    }
                                },
                                wild: true,
                                limit: 6,
                            });
                        }
                } 
            },
            fetchEhaChannelIdAutoCompleteCallback: function( channel_id ) {
                const ehaCategory = this.ehaType;

                switch(ehaCategory) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEhas({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                limit: 6,
                                filters: {
                                    channel_id: { value: channel_id }
                                }
                            });
                        }

                        break;
                    case "FLIGHT":
                        if (this.selectedFlightDictionaryVersion) {
                            this.fetchFlightEhas({
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
            fetchEhaChannelNameAutoCompleteCallback: function(eha_name) {
                const ehaCategory = this.ehaType;

                switch(ehaCategory) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEhas({
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
                            this.fetchFlightEhas({
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
            handleFlightCmdInput: function(customEvent) {
                this.flightCommand = customEvent;
            },
            handleSimCmdInput:function(customEvent){
                this.simCommand = customEvent;
            },
            handleEvrInput:function(customEvent) {
                this.evrName = customEvent;
            },
            handleEhaChannelIdInput:function(channelId, channelName) {
                this.ehaChannelId = channelId;
                this.ehaChannelName = channelName;
            },
            handleEhaChannelNameInput:function(channelName, channelId = "") {
                this.ehaChannelId = channelId;
                this.ehaChannelName = channelName;
            },
            saveFlightCmd() {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: this.flightCommand,
                        index: this.index
                    }
                });
            },
            saveSimCmd() {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: this.simCommand,
                        index: this.index
                    }
                });
            },
            saveEvrEntry() {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: this.evrName,
                        index: this.index
                    }
                });
            },
            saveEhaEntry() {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: this.ehaChannelId + ',' + this.ehaChannelName, //MAY NEED TO REVISIT
                        index: this.index
                    }
                });
            },
            saveVerificationCondition() {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: this.verificationCondition + ',' + this.verificationValue + ',' + this.verificationRangeFrom + ',' + this.verificationRangeTo, //MAY NEED TO REVISIT
                        index: this.index
                    }
                });
            },
            editCommandString: async function() {
                this.showFlightCmdModal = true;
                // if command string field has value, parse it out
                if (this.flightCommand !== "") {
                    await this.setCmd({
                        dictionaryVersion: this.selectedFlightDictionaryVersion,
                        command_stem: this.flightCommand.split(',')[0],
                        cmdArgs: this.flightCommand.split(',').slice(1)
                    });
                }
            },
            setCommandString() {
                this.showFlightCmdModal = false;

                let argsString = "";
                
                for(let i = 0;i < this.selectedCmdObjArgs.length;i++) {
                    argsString += ","+this.selectedCmdObjArgs[i].argument_value;
                }

                let repeatArgsString = "";
  
                for(let i = 0;i < this.selectedCmdObjRepeatArgs.length;i++) {
                    for(let j = 0;j < this.selectedCmdObjRepeatArgs[i].length;j++) {
                        repeatArgsString += ","+this.selectedCmdObjRepeatArgs[i][j].argument_value;
                    }
                }
                this.flightCommand = (this.selectedCmdObj.command_stem + argsString + repeatArgsString).trim();
                this.saveFlightCmd();
            },
            setVerificationConfition: function(event){
                this.verificationCondition = event.target.value;
                this.verificationValue = '';
                this.verificationRangeFrom = '';
                this.verificationRangeTo = '';
                this.saveVerificationCondition();
            },
            setVerificationValue: function(event) {
                this.verificationValue = event.target.value;
                this.verificationRangeFrom = '';
                this.verificationRangeTo = '';
                this.saveVerificationCondition();
            },
            setVerificationRangeFrom: function(event) {
                this.verificationRangeFrom = event.target.value;
                this.verificationValue = '';
                this.saveVerificationCondition();
            },
            setVerificationRangeTo: function(event) {
                this.verificationRangeTo = event.target.value;
                this.verificationValue = '';
                this.saveVerificationCondition();
            },
            selectedCmd: function(choosenCmdString) {
                this.simCommand = choosenCmdString; 
                this.showSimCmdModal = !this.showSimCmdModal;
                this.saveSimCmd();
            },
            selectedEvr: function(event) {
                this.showEvrModal = false;
                this.evrName = event.data.evr_name;
                this.saveEvrEntry();
            },
            selectedEha: function(choosenEha) {
                this.showChannelModal = false;
                this.ehaChannelId = choosenEha.channel_id;
                this.ehaChannelName = choosenEha.eha_name;
                this.saveEhaEntry();
            },
        }
    };
</script>

<style lang="scss" scoped>
    .cmd_button {
        outline: none !important;
        position:relative;
        bottom:3px;
        padding: 0;
        border-radius: 5px;
        font-size: 14px;
        width: 28px;
        height: 25px;
    }

    .cmd_lookup_button {
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: inherit;
        padding-left: 5px;
        padding-right: 5px;
    }
    
    /* EVR select button */
    .evr_lookup_button {
        outline: none !important;
        position:relative;
        bottom:3px;
        border-radius: 5px;
        font-size: 14px;
        height: 25px;
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: 100px;
        padding: 0px 5px 0px 5px;
    }
    .evr_lookup_button  p {
        display: inline;
        font-weight: bold;
    }
    .grouped-row {
        border: 1px solid #c8c6c6;
        border-radius: 10px;
        padding: 10px;
        margin: 0px;
        width: 100%;
    }
</style>

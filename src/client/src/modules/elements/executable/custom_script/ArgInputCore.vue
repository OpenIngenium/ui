<template>
  <!-- Entire input section (shared between TOP/BOTTOM and LEFT/RIGHT label layouts) -->
    <div :class="{ 'grouped-row': ['FLIGHT_TELEM','SIM_TELEM','VERIFICATION_COND'].includes(arg.type) && wrapWithGroup }" style="width:100%">
        <!-- INT / STRING / FLOAT / VARIABLE -->
        <div v-if="['INT','STRING','FLOAT','VARIABLE'].includes(arg.type)">
            <input
              type="text"
              class="form-control"
              :class="inputClasses"
              :placeholder="arg.type"
              :value="arg.value"
              @change="$emit('updateArg', $event)"
              :disabled="disableInputField"
            >
        </div>

        <!-- TIME -->
        <div v-else-if="['TIME'].includes(arg.type)">
            <div class="input-group">
                <div class="input-group-btn">
                    <button
                      @click="$emit('populateTimeReferences')"
                      :disabled="disableInputField"
                      type="button"
                      style="margin-bottom: 10px;"
                      class="btn btn-default dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu ing-long-dropdown-menu">
                        <li
                          v-for="timeReference in timeReferences"
                          :key="timeReference"
                          class="dropdown-item"
                          data-toggle="dropdown"
                        >
                            <a href="" @click.prevent="$emit('updateArg', timeReference)">
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
                    @change="$emit('updateArg', $event)"
                    :disabled="disableInputField"
                >
            </div>
        </div>

        <!-- DATA_PATH -->
        <div v-else-if="['DATA_PATH'].includes(arg.type)">
            <div class="input-group">
                <div class="input-group-btn">
                    <button
                      :disabled="disableInputField"
                      type="button"
                      style="margin-bottom: 10px;"
                      class="btn btn-default dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu">
                      <li
                        v-for="dataPath in dataPaths"
                        :key="dataPath"
                        class="dropdown-item"
                        data-toggle="dropdown"
                      >
                        <a href="" @click.prevent="$emit('updateArg', dataPath)">
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
                  @change="$emit('updateArg', $event)"
                  :disabled="disableInputField"
                >
            </div>
        </div>

        <!-- BOOL -->
        <div v-else-if="['BOOL'].includes(arg.type)" :class="inputClasses">
            <input
              type="checkbox"
              :checked="arg.value == 'true'"
              @change="$emit('updateArg', $event)"
              :disabled="disableInputField"
            >
        </div>

        <!-- FILE -->
        <div v-else-if="['FILE'].includes(arg.type)">
            <div class="form-control-plaintext">
                <span class="glyphicon glyphicon-file" aria-hidden="true"></span>
                    <a
                      v-if="arg.value"
                      :href="`/file_server/${arg.value}`"
                      download
                      rel="noopener noreferrer"
                      style="margin-left: 5px;"
                    >
                        {{ arg.name }}
                    </a>
                <span v-else class="text-muted" style="margin-left: 5px;">
                    No file available
                </span>
            </div>
        </div>

        <!-- IMAGE -->
        <div v-else-if="['IMAGE'].includes(arg.type)">
            <div class="form-control-plaintext">
                <img
                  :src="`/file_server/${arg.value}` || '/static/images/default.png'"
                  alt="Preview"
                  :style="{maxWidth: '100%', height: `${fieldHeight*10}vh`, display: 'block', marginTop: '5px'}"
                >
            </div>
        </div>

        <!-- SERIES -->
        <div v-else-if="['SERIES'].includes(arg.type)">
            <SeriesChart :seriesName="arg.name" :seriesUrl="`/file_server/${arg.value}`" :styleHeight="fieldHeight" ></SeriesChart>
        </div>

        <!-- FLIGHT_COMMAND -->
        <div class="grouped-row" v-else-if="['FLIGHT_COMMAND'].includes(arg.type)">
            <button
              type="button"
              class="btn btn-info pull-right cmd_button cmd_lookup_button ing-tooltip"
              style="width: 85px;"
              @click="$emit('openFlightCmdModal')"
              data-toggle="tooltip"
              data-placement="top"
              data-trigger="hover"
              onclick="$(this).tooltip('hide');"
              :title="tooltips.auth_exec_cmd_step_lookup"
              :disabled="disableFields"
            >
                <span class="glyphicon glyphicon-search"></span>
                <b>Lookup</b>
            </button>
            <label
              data-toggle="tooltip"
              data-placement="top"
              data-trigger="hover"
              onclick="$(this).tooltip('hide');"
              :title="arg.description"
              class="required-field ing-tooltip"
            ><b>CMD</b></label>
        
            <ing-autocomplete
              :value="flightCommand"
              @handleEvent="$emit('handleFlightCmdInput', $event)"
              :callback="fetchFlightCmdAutoCompleteCallback"
              :items="builderCmds"
              nameField="command_stem"
              categoryField="operations_category"
              descriptionField="cmd_description"
              enterByName="command_stem"
              @save="$emit('saveFlightCmd')"
              :disabled="disableFields"
              :class="inputClasses"
            ></ing-autocomplete>
        </div>

        <!-- SIM_COMMAND -->
        <div class="grouped-row" v-else-if="['SIM_COMMAND'].includes(arg.type)">
            <button
              data-toggle="tooltip"
              data-placement="top"
              data-trigger="hover"
              onclick="$(this).tooltip('hide');"
              :title="tooltips.auth_exec_cmd_sse_lookup"
              @click="$emit('openSimCmdModal')"
              type="button"
              :disabled="disableFields"
              class="btn btn-xs btn-info pull-right procedure-lookup ing-tooltip"
            >
                <span class="glyphicon glyphicon-search"></span> Lookup
            </button>
            <label
              data-toggle="tooltip"
              data-placement="top"
              data-trigger="hover"
              onclick="$(this).tooltip('hide');"
              :title="arg.description"
              class="required-field ing-tooltip"
            ><b>CMD</b></label>
        
            <ing-autocomplete
              :value="simCommand"
              @handleEvent="$emit('handleSimCmdInput', $event)"
              :callback="fetchSimCmdAutoCompleteCallback"
              :items="cmds"
              nameField="command_stem"
              categoryField="operations_category"
              descriptionField="cmd_description"
              enterByName="command_stem"
              @save="$emit('saveSimCmd')"
              :disabled="disableFields"
              :class="inputClasses"
            ></ing-autocomplete>
        </div>

        <!-- FLIGHT_EVR / SIM_EVR -->
        <div class="grouped-row" v-else-if="['FLIGHT_EVR','SIM_EVR'].includes(arg.type)">
            <button type="button" class="btn btn-info pull-right evr_lookup_button" @click="$emit('openEvrModal')" :disabled="disableFields">
                <span class="glyphicon glyphicon-search"></span>
                <b>Lookup</b>
            </button>
            <label
              data-toggle="tooltip"
              data-placement="top"
              data-trigger="hover"
              onclick="$(this).tooltip('hide');"
              :title="arg.description"
              class="required-field ing-tooltip"
            ><b>EVR</b></label>
        
            <ing-autocomplete
              :value="evrName"
              @handleEvent="$emit('handleEvrInput', $event)"
              :callback="fetchEvrAutoCompleteCallback"
              :items="evrs"
              nameField="evr_name"
              categoryField="evr_level"
              descriptionField="evr_message"
              enterByName="evr_name"
              @save="$emit('saveEvrEntry')"
              dynamicWidth="five-hundred-width"
              :disabled="disableFields"
              :class="inputClasses"
            ></ing-autocomplete>
        </div>

        <!-- FLIGHT_TELEM / SIM_TELEM -->
        <div :class="wrapWithGroup ? 'row' : 'row grouped-row'"  v-else-if="['FLIGHT_TELEM','SIM_TELEM'].includes(arg.type)">
            <div class="col-xs-5">
              <button
                @click="$emit('openChannelModal')"
                type="button"
                class="btn btn-xs btn-info pull-right procedure-lookup ing-tooltip"
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');"
                :title="tooltips.auth_exec_wait_verify_eha_lookup"
                :disabled="disableFields"
              >
                <span class="glyphicon glyphicon-search"></span> Lookup
              </button>
              <label
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');"
                :title="arg.description"
                class="required-field ing-tooltip"
              ><b>ID</b></label>
          
              <ing-autocomplete
                :value="ehaChannelId"
                @handleEvent="(result, secondResult) => $emit('handleEhaChannelIdInput', result, secondResult)"
                :callback="fetchEhaChannelIdAutoCompleteCallback"
                :items="ehas"
                nameField="channel_id"
                categoryField="operations_category"
                descriptionField="description"
                enterByName="channel_id"
                enterByAdditionalField="channel_name"
                @save="$emit('saveEhaEntry')"
                dynamicWidth="five-hundred-width"
                :disabled="disableFields"
                :class="inputClasses"
              ></ing-autocomplete>
            </div>
            <div class="col-xs-7">
              <label
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');"
                :title="tooltips.auth_exec_wait_verify_eha_channel_name"
                class="required-field ing-tooltip"
              ><b>Name</b></label>
            
              <ing-autocomplete
                :value="ehaChannelName"
                @handleEvent="(result, secondResult) => $emit('handleEhaChannelNameInput', result, secondResult)"
                :callback="fetchEhaChannelNameAutoCompleteCallback"
                :items="ehas"
                nameField="channel_name"
                categoryField="operations_category"
                descriptionField="description"
                enterByName="channel_name"
                enterByAdditionalField="channel_id"
                dynamicWidth="three-hundred-width"
                @save="$emit('saveEhaEntry')"
                :disabled="disableFields"
                :class="inputClasses"
              ></ing-autocomplete>
            </div>
            <div v-if="ehaChannelWarning" class="col-xs-12">
              <span class="text-warning eha-inline-warning">
                <span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>
                {{ ehaChannelWarning }}
              </span>
            </div>
        </div>

        <!-- VERIFICATION_COND -->
        <div :class="wrapWithGroup ? 'row' : 'row grouped-row'" v-else-if="['VERIFICATION_COND'].includes(arg.type)">
            <div class="col-xs-5">
              <label
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');"
                :title="arg.description"
                class="required-field ing-tooltip"
              ><b>Verification Condition</b></label>
            
              <select
                class="form-control"
                :class="inputClasses"
                :value="verificationCondition"
                @change="$emit('setVerificationCondition', $event)"
                :disabled="disableInputField"
              >
                <option
                  v-for="(conditionObj, value) in verificationConditions"
                  :key="value"
                  :value="value"
                >
                  {{ conditionObj.label }}
                </option>
              </select>
            </div>
        
            <div v-if="showVerificationValue" class="col-xs-7">
              <label
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                onclick="$(this).tooltip('hide');"
                :title="arg.description"
                class="required-field ing-tooltip"
              ><b>Verify Value</b></label>
            
              <div v-if="isRangeCondition" class="input-group">
                <input
                  type="text"
                  :class="inputClasses"
                  :disabled="disableInputField"
                  :placeholder="arg.type"
                  :value="verificationRangeFrom"
                  class="form-control execution-input"
                  @change="$emit('setVerificationRangeFrom', $event)"
                >
                <span class="input-group-addon range-option-group">to</span>
                <input
                  type="text"
                  :class="inputClasses"
                  :disabled="disableInputField"
                  :placeholder="arg.type"
                  :value="verificationRangeTo"
                  class="form-control execution-input"
                  @change="$emit('setVerificationRangeTo', $event)"
                >
              </div>
          
              <div v-else>
                <input
                  type="text"
                  class="form-control"
                  :class="inputClasses"
                  :placeholder="arg.type"
                  :value="verificationValue"
                  @change="$emit('setVerificationValue', $event)"
                  :disabled="disableInputField"
                >
              </div>
            </div>
        </div>

        <!-- ENUM (fallback) -->
        <div v-else>
            <select
              class="form-control"
              :class="inputClasses"
              :value="arg.value"
              @change="$emit('updateArg', $event)"
              :disabled="disableInputField"
            >
              <option
                v-for="(enumeration, index) in arg.enumerations"
                :key="index"
                :value="enumeration.symbol"
              >
                {{ enumeration.symbol }}
              </option>
            </select>
        </div>
    </div>
</template>

<script>
    import SeriesChart from "./SeriesChart.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";

    export default {
        name: "ArgInputCore",
        components: { SeriesChart, IngAutocomplete },
        props: {
            arg: { 
                type: Object, 
                required: true 
            },
            inputClasses: { 
                type: String, 
                default: "" 
            },
            disableInputField: { 
                type: Boolean, 
                required: true 
            },
            disableFields: { 
                type: Boolean, 
                required: true 
            },
            fieldHeight: { 
                type: Number, 
                default: 2 
            },
            // data sources
            timeReferences: { 
                type: Array, 
                default: () => [] 
            },
            dataPaths: { 
                type: Array, 
                default: () => [] 
            },
            builderCmds: { 
                type: Array, default: () => [] 
            },
            cmds: { 
                type: Array, default: () => [] 
            },
            evrs: { 
                type: Array, default: () => [] 
            },
            ehas: { 
                type: Array, default: () => [] 
            },
            tooltips: { 
                type: Object, default: () => ({}) 
            },
            // values bound to inputs
            flightCommand: { 
                type: String, 
                default: "" 
            },
            simCommand: { 
                type: String, 
                default: "" 
            },
            evrName: { 
                type: String, 
                default: "" 
            },
            ehaChannelId: { 
                type: String, 
                default: "" 
            },
            ehaChannelName: { 
                type: String, 
                default: "" 
            },
            ehaChannelWarning: { 
                type: String, 
                default: "" 
            },
            verificationCondition: { 
                type: String, 
                default: "RECORD" 
            },
            verificationValue: { 
                type: String, 
                default: "" 
            },
            verificationRangeFrom: { 
                type: String, 
                default: "" 
            },
            verificationRangeTo: { 
                type: String, 
                default: "" 
            },
            verificationConditions: { 
                type: Object, 
                default: () => ({}) 
            },
            showVerificationValue: { 
                type: Boolean, 
                default: false 
            },
            isRangeCondition: { 
                type: Boolean, 
                default: false 
            },
            // autocomplete callbacks (passed from parent so this stays dumb)
            fetchFlightCmdAutoCompleteCallback: { 
                type: Function, 
                default: null 
            },
            fetchSimCmdAutoCompleteCallback: { 
                type: Function, 
                default: null 
            },
            fetchEvrAutoCompleteCallback: { 
                type: Function, 
                default: null 
            },
            fetchEhaChannelIdAutoCompleteCallback: { 
                type: Function, 
                default: null 
            },
            fetchEhaChannelNameAutoCompleteCallback: { 
                type: Function, 
                default: null 
            },
            // layout helper: whether to apply grouped-row wrapper for some types externally
            wrapWithGroup: { 
                type: Boolean, 
                default: true 
            }
        }
    };
</script>

<style scoped>
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
    .eha-inline-warning {
        display: block;
        font-size: 11px;
        margin-top: 2px;
    }
</style>

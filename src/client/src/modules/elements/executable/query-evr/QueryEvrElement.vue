// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <div>
        <form>
            <ing-modal v-if="showEvrModal" @close="showEvrModal = false" size="large">
                <template slot="title">
                    <h4 style="font-weight: bold; display: inline-block;">Lookup EVR</h4>
                </template>
                <template slot="body">
                    <select-evr-table v-on:selectEvr="selectedEvr" :evr-type="this.evrTypeCategoriesReverse[this.evrType]"></select-evr-table>
                </template>
                <template slot="footer">
                    <button
                        type="button"
                        class="btn btn-default pull-right"
                        @click="showEvrModal = false">
                        Cancel
                    </button>
                </template>
            </ing-modal>

            <div v-if="isLevelTwoDetail" class="container-element">
                <div @dblclick="toggleViewLevelTwoThree">
                    <div class="row data-bar-element condensed">
                        <div class="col-xs-12">
                            <ol class="data-bar-contents-flex">
                                <template v-if="startTime && duration">
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="queryTimeRange"
                                        class="ing-tooltip">Query</li>
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedStartTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'start_time')">starting: {{ startTime }}</li>
                                    <li :class="modStyle(elementId, 'duration')">Duration: {{ duration }} seconds</li>
                                </template>
                                <template v-else-if="endTime && duration">
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="queryTimeRange"
                                        class="ing-tooltip">Query</li>
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedEndTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'end_time')">ending at: {{ endTime }}</li>
                                    <li :class="modStyle(elementId, 'duration')">Duration: {{ duration }} seconds</li>
                                </template>
                                <template v-else>
                                    <li 
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="queryTimeRange"
                                        class="ing-tooltip">Query</li>
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover"
                                        :title="translatedStartTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'start_time')">starting: {{ startTime }}</li>
                                    <li
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedEndTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'end_time')">and ending: {{ endTime }}</li>
                                </template>
                                <li>
                                    Name: <span :class="modStyle(elementId, 'evr_name')">{{ evrName }}</span> on <span :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                                </li>
                                <li>
                                    Verification: <span :class="modStyle(elementId, 'verification_condition')">{{ verificationCondition }}</span> <span v-if="showVerificationValue" :class="modStyle(elementId, 'verification_value')">{{ verificationValue }}</span>
                                </li>
                                <li>
                                    Type: <span :class="modStyle(elementId, 'evr_type')">{{ evrType }}</span> 
                                    <div>
                                        Level:  <span v-if="evrLevel" :class="modStyle(elementId, 'evr_level')">{{ evrLevel }}</span> 
                                        Message Filter: <span v-if="messageFilter" :class="modStyle(elementId, 'message_filter')">{{ messageFilter }}</span>
                                    </div>
                                </li>
                                <li v-if="!isAuthoring">Total Count: {{ totalCount }}</li>
                            </ol>
                            <execution-status-check
                                v-if="enableExecution"
                                :executed="executed"
                                :status="getExecutionMetaDataKey('status')">
                            </execution-status-check>
                        </div>
                    </div>
                </div>

                <div v-if="isLevelThreeDetail" class="edit-container">
                    <div class="element-form-flex-row">
                        <div class="element-form-flex-item" style="flex-basis: 29%;">
                            <label 
                                data-toggle="tooltip" 
                                data-placement="top"
                                data-trigger="hover" 
                                onclick="$(this).tooltip('hide');"
                                :title="tooltips.auth_exec_telemetry_step_times_list_query"
                                class="required-field ing-tooltip"><b>Start Time</b></label>
                            <div class="input-group">
                                <div class="input-group-btn">
                                    <button 
                                        @click="populateTimeReferences"
                                        :disabled="disableFields"
                                        type="button"  
                                        style="margin-bottom: 10px;" 
                                        class="btn btn-default dropdown-toggle" 
                                        data-toggle="dropdown" 
                                        aria-haspopup="true" 
                                        aria-expanded="false"><span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu ing-long-dropdown-menu">
                                        <li
                                            v-for="timeReference in timeReferences" 
                                            :key="timeReference" 
                                            data-toggle="dropdown"
                                            class="dropdown-item"
                                        >
                                            <a 
                                                href=""
                                                @click.prevent="saveStartTime(timeReference)">
                                            {{ timeReference }}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <input v-model.trim="startTime"
                                    @change="saveEvrQuery"
                                    :disabled="disableFields"
                                    type="text"
                                    class="form-control execution-input"
                                    :class="modStyle(elementId, 'start_time')">
                            </div>
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 29%;">
                            <label 
                                data-toggle="tooltip" 
                                data-placement="top"
                                data-trigger="hover" 
                                onclick="$(this).tooltip('hide');"
                                :title="tooltips.auth_exec_telemetry_step_times_list_query"
                                class="required-field ing-tooltip"><b>End Time</b></label>
                            <div class="input-group">
                                <div class="input-group-btn">
                                    <button 
                                        @click="populateTimeReferences"
                                        :disabled="disableFields"
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
                                            data-toggle="dropdown"
                                            class="dropdown-item"
                                        >
                                            <a 
                                                href=""
                                                @click.prevent="saveEndTime(timeReference)">
                                            {{ timeReference }}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <input v-model.trim="endTime"
                                    @change="saveEvrQuery"
                                    :disabled="disableFields"
                                    type="text"
                                    class="form-control execution-input"
                                    :class="modStyle(elementId, 'end_time')">
                            </div>
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 14%;">
                            <label
                                data-toggle="tooltip" 
                                data-placement="top"
                                data-trigger="hover" 
                                onclick="$(this).tooltip('hide');"
                                :title="tooltips.auth_exec_telemetry_step_duration"
                                class="ing-tooltip"><b>Duration (sec)</b></label>
                            <input v-model.trim="duration"
                                @change="saveEvrQuery"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'duration')">
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 14%;">
                            <label>Timeout (sec)</label>
                            <input v-model.trim.number="timeout"
                                @change="saveEvrQuery"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'timeout')">
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 14%;">
                            <label class="required-field">Time Type</label>
                            <select v-model="timeType"
                                @change="save" 
                                class="form-control" 
                                :disabled="disableFields"
                                :class="modStyle(elementId, 'time_type')">
                                <option value="ERT">ERT</option>
                                <option value="SCLK">SCLK</option>
                                <option value="SCET">SCET</option>
                            </select>
                        </div>
                    </div>
                    <div class="element-form-flex-row">
                        <div class="element-form-flex-item" style="flex-basis: 14%;">
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
                                            class="dropdown-item"
                                        >
                                            <a 
                                                href=""
                                                @click.prevent="saveDataPath(dataPath)"
                                            >
                                            {{ dataPath }}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <input v-model.trim="dataPath"
                                    @change="saveDataPath(dataPath)"
                                    :disabled="disableFields"
                                    type="text"
                                    class="form-control execution-input"
                                    style="margin-bottom: 10px;"
                                    :class="modStyle(elementId, 'data_path')">
                            </div>
                        </div>
                        <!-- used for evr auto-complete lookup -->
                        <div class="element-form-flex-item" style="flex-basis: 21%;">
                            <label class="required-field">EVR Type</label>
                            <select v-model="evrType" 
                                    @change="save" 
                                    class="form-control" 
                                    :disabled="disableFields"
                                    :class="modStyle(elementId, 'evr_type')">
                                <option v-for="evrTypeOption in getEvrTypeOptions()"
                                        :key="evrTypeOption"
                                        :value="evrTypeOption">
                                        {{evrTypeOption}}
                                </option>
                            </select>
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 14%;">
                            <label>EVR Level</label>
                            <input v-model.trim="evrLevel"
                                @change="saveEvrQuery"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'evr_level')">
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 51%;">
                            <button type="button" class="btn btn-info pull-right evr_button evr_lookup_button" @click="showEvrModal = true" :disabled="disableFields">
                                <span class="glyphicon glyphicon-search"></span> 
                                <b>Lookup</b>
                            </button>
                            <label>EVR</label>
                            <ing-autocomplete
                                :value="evrName"
                                v-on:handleEvent="handleInput"
                                :callback="fetchEvrAutoCompleteCallback"
                                :items="this.evrs"
                                nameField="evr_name"
                                categoryField="evr_level"
                                descriptionField="evr_message"
                                enterByName="evr_name"
                                v-on:save="saveEvrQuery"
                                :disabled="disableFields"
                                :inputClasses="modStyle(elementId, 'evr_name')"
                            ></ing-autocomplete>
                        </div>
                    </div>
                    <div class="element-form-flex-row">
                        <div class="element-form-flex-item" style="flex-basis: 100%;">
                            <label>Message Filter</label>
                            <input v-model="messageFilter"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'message_filter')">
                        </div>
                    </div>
                    <div class="element-form-flex-row">
                        <div class="element-form-flex-item" style="flex-basis: 25%;">
                            <label class="required-field">Verification Condition</label>
                            <select v-model="verificationCondition" @change="save" class="form-control" :disabled="disableFields" :class="modStyle(elementId, 'verification_condition')">
                                <option value="GREATER_THAN">Greater Than</option>
                                <option value="LESS_THAN">Less Than</option>
                                <option value="GREATER_THAN_OR_EQUAL">Greater Than or Equal</option>
                                <option value="LESS_THAN_OR_EQUAL">Less Than or Equal</option>
                                <option value="EQUAL">Equal</option>
                                <option selected="" value="RECORD">Record</option>
                            </select>
                        </div>
                        <div class="element-form-flex-item" style="flex-basis: 25%;" v-if="showVerificationValue">
                            <label class="required-field">Verification Value</label>
                            <input v-model.trim.number="verificationValue"
                                @change="saveEvrQuery"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'verification_value')">
                        </div>
                    </div>
                </div>
            </div>
        </form>
            <div v-if="executed && isLevelTwoDetail && evrResultsData.length > 0">
                <div class="empty-divider"></div>
                <div class="text-center font-small">Displaying {{ evrResultsData.length }} EVRs of {{ totalCount }} EVRs found</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Name</th>
                            <th>ERT</th>
                            <th>EVR MESSAGE</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in evrResultsData" :key="data.event_id">
                            <td v-if="data.evr_level">{{data.evr_level}}</td>
                            <td v-else v-text="'<empty>'"></td>

                            <td v-if="data.evr_name">{{data.evr_name}}</td>
                            <td v-else v-text="'<empty>'"></td>

                            <td v-if="data.ert">{{data.ert}}</td>
                            <td v-else v-text="'<empty>'"></td>

                            <td v-if="data.evr_message" class="wrap">{{data.evr_message}}</td>
                            <td v-else v-text="'<empty>'"></td>

                            <td>
                                <ing-popover placement="bottom">
                                    <template slot="title">EVR Detail</template>
                                    <ul slot="body" style="width: 300px">
                                        <li v-for="(val, key, idx) in data" :key="idx" style="word-break: break-all;">
                                            <span class="result-key">{{key}}</span>:&nbsp;<span class="result-value">{{val}}</span>
                                        </li>
                                    </ul>
                                    <span :class="['glyphicon-eye-open', 'glyphicon']"></span>
                                </ing-popover>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
    </div>
</template>

<script>
    import SelectEvrTable from "./SelectEvrTable.vue";
    import { commonDateTime } from "../../../common/filters.js";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "QueryEvrElement",
        components: {
            SelectEvrTable, 
            IngAutocomplete,
        },
        data() {
            return {
                showEvrModal: false,
                evrTypeCategories: [
                    "SSE",
                    "FSW_REALTIME", 
                    "FSW_RECORDED"
                ],
                evrTypeCategorySelectedBackend: "FLIGHT",
                evrTypeCategoriesReverse: {
                    FSW_REALTIME: "FLIGHT",
                    FSW_RECORDED: "FLIGHT",
                    SSE: "SSE",
                }
            };
        },
        computed: {
            ...mapGetters([
                "evrs",
                'selectedSseDictionaryVersion',
                'selectedFlightDictionaryVersion',
                'dataPaths',
                'timeReferences',
                'modStyle'
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            translatedStartTime() {
                if (this.mode === 'execution' || this.mode === 'as-run') {
                    return this.executionResultsKey(this.elementId, 'translated_start_time');
                } else {
                    return '';
                }
            },
            translatedEndTime() {
                if (this.mode === 'execution' || this.mode === 'as-run') {
                    return this.executionResultsKey(this.elementId, 'translated_end_time');
                } else {
                    return '';
                }
            },
            queryTimeRange() {
                if (this.mode === 'execution' || this.mode === 'as-run') {
                    const queryStart = this.executionResultsKey(this.elementId, 'query_start_time');
                    const queryEnd = this.executionResultsKey(this.elementId, 'query_end_time');

                    return `Query Start: ${queryStart} Query End: ${queryEnd}`;
                } else {
                    return '';
                }
            },
            dataPath: {
                get() { return this.getExecutionInputKey("data_path"); },
                set(value) { this.setElementInput("data_path", value); }
            },
            duration: {
                get() { return this.getExecutionInputKey("duration"); },
                set(value) { this.setElementInput("duration", value); }
            },
            endTime: {
                get() { return this.getExecutionInputKey("end_time"); },
                set(value) { this.setElementInput("end_time", value); }
            },
            evrId: {
                get() { return this.getExecutionInputKey("evr_id"); },
                set(value) { this.setElementInput("evr_id", value); }
            },
            evrLevel: {
                get() { return this.getExecutionInputKey("evr_level"); },
                set(value) { this.setElementInput("evr_level", value); }
            },
            evrName: {
                get() { return this.getExecutionInputKey("evr_name"); },
                set(value) { this.setElementInput("evr_name", value); }
            },
            evrType: {
                get() { return this.getExecutionInputKey("evr_type"); },
                set(value) { this.setElementInput("evr_type", value); }
            },
            messageFilter: {
                get() { return this.getExecutionInputKey("message_filter"); },
                set(value) { this.setElementInput("message_filter", value); }
            },
            startTime: {
                get() { return this.getExecutionInputKey("start_time"); },
                set(value) { this.setElementInput("start_time", value); }
            },
            timeType: {
                get() { return this.getExecutionInputKey("time_type"); },
                set(value) { this.setElementInput("time_type", value); }
            },
            timeout: {
                get() { return this.getExecutionInputKey("timeout"); },
                set(value) { this.setElementInput("timeout", value); }
            },
            verificationCondition: {
                get() { return this.getExecutionInputKey("verification_condition"); },
                set(value) { this.setElementInput("verification_condition", value); }
            },
            verificationValue: {
                get() { return this.getExecutionInputKey("verification_value"); },
                set(value) { this.setElementInput("verification_value", value); }
            },
            showVerificationValue: function() {
                return this.verificationCondition !== 'RECORD';
            },
            totalCount: {
                get() {
                    return this.executionResultsKey(this.elementId, "total_count");
                }
            },
            evrTypeCategorySelected: {
                get() {
                    if (this.evrTypeCategorySelectedBackend === "") {
                        if (this.evrType === "") {
                            return "";
                        }
                        else if (this.evrType in this.evrTypeCategoriesReverse) {
                            return this.evrTypeCategoriesReverse[this.evrType];
                        }
                        else {
                            return "";
                        }
                    }
                    else {
                        return this.evrTypeCategorySelectedBackend;
                    }
                },
                set(value) {
                    this.evrTypeCategorySelectedBackend = value;
                }
            },

            evrResultsData: {
                get() {
                    return this.executionResultsKey(this.elementId, 'evr_data');
                }
            },

            evrData: function() {
                if (this.evrResultsData !== undefined && typeof(this.evrResultsData) === "object" && Array.isArray(this.evrResultsData.evr_data)) {
                    return this.evrResultsData.evr_data;
                }
                else {
                    return [];
                }
            }
        },
        methods: {
            ...mapActions([
                "fetchFlightEvrs",
                "fetchSseEvrs",
                "populateTimeReferences"
            ]),

            handleInput: function(customEvent) {
                this.evrName = customEvent; 
            },

            fetchEvrAutoCompleteCallback: function( evr_name ) {
                switch(this.evrType) {
                    case "SSE":
                        this.fetchSseEvrs({
                            dictionaryVersion: this.selectedSseDictionaryVersion,
                            filters: {
                                evr_name: {
                                    value: evr_name
                                }
                            },
                            wild: false,
                            limit: 6, 
                        });
                        break; 
                    default:
                        this.fetchFlightEvrs({
                            dictionaryVersion: this.selectedFlightDictionaryVersion, 
                            filters: {
                                evr_name: {
                                    value: evr_name
                                }
                            },
                            wild: false,
                            limit: 6, 
                        });
                } 
            },

            selectedEvr: function(event) {
                this.showEvrModal = false;
                this.evrName = event.data.evr_name;
                this.save();
            },
            getEvrTypeOptions: function() {
                return this.evrTypeCategories;
            },
            
            saveEvrQuery() {
                try {
                    this.timeout = parseInt(this.timeout);
                } catch (err) {
                    //  ignore
                }
                try {
                    this.evrId = this.evrId.trim();
                } catch (err) {
                    //  ignore
                }
                try {
                    this.evrName = this.evrName.trim();
                } catch (err) {
                    //  ignore
                }
                try {
                    this.verificationValue = parseInt(this.verificationValue);
                } catch (err) {
                    //  ignore
                }                                                                                                                                
                
                this.save();
            },
            saveDataPath(value) {
                this.dataPath = value;
                this.save();
            },
            saveStartTime(timeReference) {
                this.startTime = timeReference;
                this.saveEvrQuery();
            },
            saveEndTime(timeReference) {
                this.endTime = timeReference;
                this.saveEvrQuery();
            }
        },
        filters: {
            commonDateTime: commonDateTime
        }
    };
</script>

<style scoped>
    div.empty-divider {
        min-height: 5px;
    }

    .evr_button {
        outline: none !important;
        position:relative;
        bottom:3px;
        padding: 0;
        border-radius: 5px;
        font-size: 14px;
        width: 28px;
        height: 25px;
    }

    .evr_lookup_button {
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: inherit;
        padding-left: 5px;
        padding-right: 5px;
    }

    .evr_lookup_button  p {
        display: inline;
        font-weight: bold;
    }

    ul {
        padding: 20px;
        list-style: none;
        cursor: text;
        color: #000000;
    }
    .result-value {
        font-weight: bold;
    }

    .wrap {
        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;

        /* Adds a hyphen where the word breaks, if supported (No Blink) */
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
    }
</style>

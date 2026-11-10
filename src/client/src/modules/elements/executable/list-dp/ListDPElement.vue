// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        <div v-if="startTime != '' && endTime != ''">
                            Query on <span v-if="dataPath" :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                            <span v-else :class="modStyle(elementId, 'data_path')" v-text="' <data path>'"></span>
                            starting <span 
                                        v-if="startTime"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedStartTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'start_time')">{{ startTime }}</span>
                            <span v-else :class="modStyle(elementId, 'start_time')" v-text="' <Start Time>'"></span>
                            and ending: <span 
                                        v-if="endTime"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedEndTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'end_time')">{{ endTime }}</span>
                            <span v-else :class="modStyle(elementId, 'end_time')" v-text="' <End Time>'"></span> 
                            , Time Type: <span v-if="timeType" :class="modStyle(elementId, 'time_type')">{{ timeType }}</span>
                            <span v-else :class="modStyle(elementId, 'time_type')" v-text="' <Time Type>'"></span>
                        </div>
                        <div v-else-if="endTime != '' && duration != ''">
                            Query on <span v-if="dataPath" :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                            <span v-else :class="modStyle(elementId, 'data_path')" v-text="' <data path>'"></span>
                            ending at <span 
                                        v-if="endTime"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedEndTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'end_time')">{{ endTime }}</span>
                            <span v-else class="ing-tooltip" :class="modStyle(elementId, 'end_time')" v-text="' <End Time>'"></span>
                            , Duration: <span v-if="duration" :class="modStyle(elementId, 'duration')">{{ duration }}</span>
                            <span v-else class="ing-tooltip" :class="modStyle(elementId, 'duration')" v-text="' <Duration>'"></span> 
                            seconds, Time Type: <span v-if="timeType" :class="modStyle(elementId, 'time_type')">{{ timeType }}</span>
                            <span v-else class="ing-tooltip" :class="modStyle(elementId, 'time_type')" v-text="' <Time Type>'"></span>
                        </div>
                        <div v-else>
                            Query on <span v-if="dataPath" :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                            <span v-else :class="modStyle(elementId, 'data_path')" v-text="' <data path>'"></span>
                            starting <span 
                                        v-if="startTime"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedStartTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'start_time')">{{ startTime }}</span>
                            <span v-else :class="modStyle(elementId, 'start_time')" v-text="' <Start Time>'"></span>
                            , Duration: <span v-if="duration" :class="modStyle(elementId, 'duration')">{{ duration }}</span>
                            <span v-else :class="modStyle(elementId, 'duration')" v-text="' <Duration>'"></span> 
                            seconds, Time Type: <span v-if="timeType" :class="modStyle(elementId, 'time_type')">{{ timeType }}</span>
                            <span v-else :class="modStyle(elementId, 'time_type')" v-text="' <Time Type>'"></span>
                        </div>
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
                                            @click.prevent="saveDataPath(dataPath)">{{ dataPath }}</a>
                                    </li>
                                </ul>
                            </div>
                            <input v-model.trim="dataPath"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'data_path')">
                        </div>
                    </div>
                    <div class="col-xs-2">
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
                                            @click.prevent="saveStartTime(timeReference)">
                                        {{ timeReference }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <input v-model.trim="startTime"
                                @change="saveDP"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'start_time')">
                        </div>
                    </div>
                    <div class="col-xs-2">
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
                                    <span class="caret"></span></button>
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
                                @change="saveDP"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'end_time')">
                        </div>
                    </div>
                    <div class="col-xs-2">
                        <label
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_telemetry_step_duration"
                            class="ing-tooltip"><b>Duration (sec)</b></label>
                        <input v-model.trim="duration"
                            @change="saveDP"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'duration')">
                    </div>
                    <div class="col-xs-2">
                        <label>Timeout (sec)</label>
                        <input v-model.trim.number="timeout"
                            @change="saveDP"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'timeout')">
                    </div>
                    <div class="col-xs-2">
                        <label class="required-field">Time Type</label>
                        <select v-model="timeType"
                            @change="saveDP"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            style="margin-top:5px;"
                            :class="modStyle(elementId, 'time_type')">
                            <option v-for="value in timeTypeOptions"
                                :selected="value === timeType"
                                :key="value" :value="value">
                                {{ value }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="dynamic-elements">
            <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                v-on:save="save"
                :element-id="elementId"
                :index="idx"
                :mode="mode"
                :element-path="elementMap.path"
                entry="list-dp-entry"
                :class="modStyle(elementId, `entries.${idx}`)">
            </entries-wrapper>
        </div>

        <ing-data-entry
            :showModal="enableTableEntry"
            :entries-length="elementEntryCount"
            :element-id="elementId"
            :mode="mode"
            :level="detailLevel"
            :disableFields="disableFields"
            :canDisableExecuteField="canDisableExecuteField"
            :columnInfos="columnInfos"
            v-on:dataEntryEvent="handleDataEntryEvent"
            ></ing-data-entry>
    </form>
</template>

<script>
    import IngDataEntry from "../../../common/IngDataEntry.vue";
    import { mapGetters, mapActions } from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    
    export default {
        name: "ListDPElement",
        components: {
            'ing-data-entry': IngDataEntry,
        },
        created() {
            this.columnInfos = [
                {
                    name: 'apid',
                    header: 'APID',
                    type: 'integer',
                    defaultValue: 0,
                    executionOnly: false,
                    width: 175,
                    enumValues: [],
                },
                {
                    name: 'product_status_filter',
                    header: 'Product Status',
                    type: 'string',
                    defaultValue: 'ALL',
                    executionOnly: false,
                    width: 175,
                    enumValues: ['ALL', 'COMPLETE', 'PARTIAL'],
                },
                {
                    name: 'verification_condition',
                    header: 'Verification Condition',
                    type: 'string',
                    defaultValue: 'RECORD',
                    executionOnly: false,
                    width: 175,
                    enumValues: ['RECORD', 'GREATER_THAN', 'LESS_THAN', 'EQUAL', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL'],
                },
                {
                    name: 'verification_value',
                    header: 'Verification Value',
                    type: 'integer',
                    defaultValue: 0,
                    executionOnly: false,
                    width: 175,
                    enumValues: [],
                }
            ];
        },
        data() {
            return {
                timeTypeOptions: ["ERT", "SCLK", "SCET"]
            };
        },
        computed: { 
            ...mapGetters([
                "dataPaths",
                "timeReferences",
                "modStyle"
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
            dataPath: {
                get() { 
                    return this.executionInputKey(this.elementId, "data_path");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "data_path",
                        value: value
                    });
                }
            },
            startTime: {
                get() { 
                    return this.executionInputKey(this.elementId, "start_time");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "start_time",
                        value: value
                    });
                }
            },
            endTime: {
                get() {
                    return this.executionInputKey(this.elementId, "end_time");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "end_time",
                        value: value
                    });
                }
            },
            duration: {
                get() {
                    return this.executionInputKey(this.elementId, "duration");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "duration",
                        value: value
                    });
                }
            },
            timeout: {
                get() {
                    return this.executionInputKey(this.elementId, "timeout");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "timeout",
                        value: value
                    });
                }
            },
            timeType: {
                get() {
                    return this.executionInputKey(this.elementId, "time_type");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "time_type",
                        value: value
                    });
                }
            },
        },
        methods: {
            ...mapActions([
                "populateTimeReferences"
            ]),
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            },
            saveDP() {
                try {
                    this.timeout = parseInt(this.timeout);
                } catch(err) {
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
                this.saveDP();
            },
            saveEndTime(timeReference) {
                this.endTime = timeReference;
                this.saveDP();
            }
        }
    };
</script>

// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12">
                        <span v-if="verifyWait" :class="modStyle(elementId, 'verify_wait')">{{ verifyWait }}</span>
                        <span v-else :class="modStyle(elementId, 'verify_wait')" v-text="'<Verify data / Wait for data>'"></span>
                        <span v-if="startTime"
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            :title="translatedStartTime"
                            :class="modStyle(elementId, 'start_time')"
                            class="ing-tooltip"> {{ startTime }} </span>
                        <span v-else :class="modStyle(elementId, 'start_time')" v-text="' <Start Time> '"></span>
                        <span 
                            v-if="startTime"
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            :title="queryTimeRange"
                            class="ing-tooltip">
                            (Lookback:
                            <span v-if="lookback" :class="modStyle(elementId, 'lookback')"> {{ lookback }} </span>
                            <span v-else-if="lookback == 0" :class="modStyle(elementId, 'lookback')">0</span>
                            <span v-else :class="modStyle(elementId, 'lookback')" v-text="' <Lookback>' "></span>
                            seconds, Timeout:
                            <span v-if="timeout" :class="modStyle(elementId, 'timeout')"> {{ timeout }} </span>
                            <span v-else :class="modStyle(elementId, 'timeout')" v-text="' <Timeout> '"></span>
                            seconds, SCET)
                        </span>
                        <span v-else>
                            (Lookback:
                            <span v-if="lookback" :class="modStyle(elementId, 'lookback')"> {{ lookback }} </span>
                            <span v-else-if="lookback == 0" :class="modStyle(elementId, 'lookback')">0</span>
                            <span v-else :class="modStyle(elementId, 'lookback')" v-text="' <Lookback>' "></span>
                            seconds, Timeout:
                            <span v-if="timeout" :class="modStyle(elementId, 'timeout')"> {{ timeout }} </span>
                            <span v-else :class="modStyle(elementId, 'timeout')" v-text="' <Timeout> '"></span>
                            seconds, SCET)
                        </span>
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
                            :title="tooltips.auth_exec_telemetry_step_times"
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
                                @change="save1553"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'start_time')"
                                style="margin-bottom: 10px;">
                        </div>
                    </div>
                    <div class="element-form-flex-item" style="flex-basis: 29%;">
                        <label>Lookback (sec)</label>
                        <input v-model.trim.number="lookback"
                               @change="save1553"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'lookback')"
                               style="margin-bottom: 10px;">
                    </div>
                    <div class="element-form-flex-item" style="flex-basis: 21%;">
                        <label>Timeout (sec)</label>
                        <input v-model.trim.number="timeout"
                               @change="save1553"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'timeout')"
                               style="margin-bottom: 10px;">
                    </div>
                    <div class="element-form-flex-item" style="flex-basis: 21%;">
                        <label class="required-field">Verify or Wait</label>
                        <select v-model="verifyWait"
                               @change="save"
                               :disabled="disableFields"
                               class="form-control"
                               :class="modStyle(elementId, 'verify_wait')"
                               style="margin-bottom: 10px;">
                            <option value="VERIFY">VERIFY</option>
                            <option value="WAIT">WAIT</option>
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
                entry="bus-1553-entry"
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

    import { mapActions, mapGetters } from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "Bus1553Element",
        components: {
            'ing-data-entry': IngDataEntry
        },
        computed: {
            ...mapGetters([
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
            queryTimeRange() {
                if (this.mode === 'execution' || this.mode === 'as-run') {
                    const queryStart = this.executionResultsKey(this.elementId, 'query_start_time');
                    const queryEnd = this.executionResultsKey(this.elementId, 'query_end_time');

                    return `Query Start: ${queryStart} Query End: ${queryEnd}`;
                } else {
                    return '';
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
            lookback: {
                get() {
                    return this.executionInputKey(this.elementId, "lookback");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "lookback",
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
            verifyWait: {
                get() {
                    return this.executionInputKey(this.elementId, "verify_wait");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "verify_wait",
                        value: value
                    });
                }
            },
            timeType: {
                get() {
                    if(this.executionInputKey(this.elementId, "time_type"))
                        return this.executionInputKey(this.elementId, "time_type");
                    else 
                        return "SCET";
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "time_type",
                        value: value
                    });
                }
            }
        },
        created: function() {
            // fetch 10 results for the table modal
            this.fetchFlightDicts();

            this.columnInfos = [
                {
                    name: 'bus_1553_var',
                    header: '1553 Variable',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 140,
                    enumValues: [],
                },
                {
                    name: 'raw_convert',
                    header: 'Raw or Converted',
                    type: 'string',
                    defaultValue: 'RAW',
                    executionOnly: false,
                    width: 140,
                    enumValues: ['RAW', 'CONVERT'],
                },
                {
                    name: 'verify_on',
                    header: 'Verify On',
                    type: 'string',
                    defaultValue: 'VALUE',
                    executionOnly: false,
                    width: 140,
                    enumValues: ['CHANGE', 'VALUE'],
                },
                {
                    name: 'verification_condition',
                    header: 'Verification Condition',
                    type: 'string',
                    defaultValue: 'RECORD',
                    executionOnly: false,
                    width: 140,
                    enumValues: ['RECORD', 'INCLUSIVE_RANGE', 'EXCLUSIVE_RANGE', 'EQUAL', 'NOT_EQUAL', 'CONTAINS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'NOT_PRESENT'],
                },
                {
                    // split into two columns for display - IngDataEntry.vue joins them back into
                    // the [] / [v1] / [v1,v2] array verification_values is stored as, based on
                    // the verification_condition column above
                    name: 'verification_values',
                    header: 'Verify Value 1',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 70,
                    verificationValuePart: 'value1',
                    enumValues: []
                },
                {
                    name: 'verification_values',
                    header: 'Verify Value 2',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 70,
                    verificationValuePart: 'value2',
                    enumValues: []
                },
            ];
        },
        methods: {
            ...mapActions([
                "fetchFlightDicts",
                "populateTimeReferences"
            ]),
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            },
            save1553() {
                try {
                    this.lookback = parseInt(this.lookback);
                } catch(err) {
                    //  ignore
                }
                
                try {
                    this.timeout = parseInt(this.timeout);
                } catch(err) {
                    //  ignore
                }

                this.save();
            },
            saveStartTime(timeReference) {
                this.startTime = timeReference;
                this.save1553();
            }
        }
    };
</script>

// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12">
                        Query from <span v-if="startTime"
                                        data-toggle="tooltip" 
                                        data-placement="top"
                                        data-trigger="hover" 
                                        :title="translatedStartTime"
                                        class="ing-tooltip"
                                        :class="modStyle(elementId, 'start_time')"
                                        >{{ startTime }}</span>
                        <span v-else :class="modStyle(elementId, 'start_time')" v-text="'<Start Time>'"></span>
                        <span 
                            v-if="startTime"
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            :title="queryTimeRange"
                            class="ing-tooltip">
                            (Lookback: <span :class="modStyle(elementId, 'lookback')">{{ lookback }}</span> seconds,
                            Timeout: <span :class="modStyle(elementId, 'timeout')">{{ timeout }}</span> seconds)
                        </span>
                        <span v-else>
                            (Lookback: <span :class="modStyle(elementId, 'lookback')">{{ lookback }}</span> seconds,
                            Timeout: <span :class="modStyle(elementId, 'timeout')">{{ timeout }}</span> seconds)
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
                <div class="row">
                    <div class="col-xs-4">
                        <label 
                            class="required-field ing-tooltip"
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_telemetry_step_times"><b>Start Time</b></label>
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
                                        class="dropdown-item">
                                        <a 
                                            href=""
                                            @click.prevent="saveStartTime(timeReference)">
                                        {{ timeReference }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <input v-model.trim="startTime"
                                @change="saveVerifyEha"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'start_time')"
                                style="margin-bottom: 10px;">
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <label>Lookback</label>
                        <input v-model.trim.number="lookback"
                               @change="saveVerifyEha"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'lookback')"
                               style="margin-bottom: 10px;">
                    </div>
                    <div class="col-xs-4">
                        <label
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_wait_eha_timeout"
                            class="glyphicon ing-tooltip"><b>Timeout</b></label>
                        <input v-model.trim.number="timeout"
                               @change="saveVerifyEha"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'timeout')"
                               style="margin-bottom: 10px;">
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
                :class="modStyle(elementId, `entries.${idx}`)"
                entry="verify-eha-entry">
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
    import { mapActions, mapGetters } from "vuex";
    import IngDataEntry from "../../../common/IngDataEntry.vue";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "VerifyEhaElement",
        components: {
            'ing-data-entry': IngDataEntry
        },
        created() {
            this.columnInfos = [
                {
                    name: 'channel_type',
                    header: 'Channel Type',
                    type: 'string',
                    defaultValue: 'FLIGHT',
                    executionOnly: false,
                    width: 93,
                    enumValues: ['FLIGHT', 'SSE'],
                },
                {
                    name: 'data_path',
                    header: 'Data Path',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 93,
                    enumValues: [],
                },
                {
                    name: 'channel_id',
                    header: 'Channel ID',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 93,
                    enumValues: [],
                },
                {
                    name: 'channel_name',
                    header: 'Channel Name',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 93,
                    enumValues: []
                },
                {
                    name: 'dn_eu',
                    header: 'DN/EU Path',
                    type: 'string',
                    defaultValue: 'DN',
                    executionOnly: false,
                    width: 93,
                    enumValues: ['DN', 'EU'],
                },
                {
                    name: 'verify_on',
                    header: 'Verify On',
                    type: 'string',
                    defaultValue: 'VALUE',
                    executionOnly: false,
                    width: 93,
                    enumValues: ['VALUE', 'CHANGE'],
                },
                {
                    name: 'verification_condition',
                    header: 'Verification Condition',
                    type: 'string',
                    defaultValue: 'RECORD',
                    executionOnly: false,
                    width: 93,
                    enumValues: ['RECORD', 'INCLUSIVE_RANGE', 'EXCLUSIVE_RANGE', 'EQUAL', 'NOT_EQUAL', 'CONTAINS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'NOT_PRESENT'],
                },
                {
                    name: 'verification_values',
                    header: 'Verification Value',
                    type: 'string',
                    defaultValue: '',     // this is the string representation of verification values which is an array
                    executionOnly: false,
                    width: 93,
                    enumValues: []
                },
            ];
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
        },
        methods: {
            ...mapActions([
                "populateTimeReferences"
            ]),
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            },
            saveVerifyEha() {
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
                this.saveVerifyEha();
            }
        }
    };
</script>

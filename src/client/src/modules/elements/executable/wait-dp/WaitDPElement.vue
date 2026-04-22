// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
import WaitDPDataEntryVue from './WaitDPDataEntry.vue';
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        Waiting for Products on: <span v-if="dataPath" :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                        <span v-else :class="modStyle(elementId, 'data_path')" v-text="'<Data Path>'"></span>
                        starting <span v-if="startTime"
                                    data-toggle="tooltip" 
                                    data-placement="top"
                                    data-trigger="hover" 
                                    :title="translatedStartTime"
                                    class="ing-tooltip"
                                    :class="modStyle(elementId, 'start_time')">{{ startTime }}</span>
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
                                        class="dropdown-item">
                                        <a 
                                            href=""
                                            @click.prevent="saveDataPath(dataPath)">
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
                    <div class="col-xs-3">
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
                                @change="saveWaitDP"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'start_time')">
                        </div>
                    </div>
                    <div class="col-xs-2">
                        <label class="required-field">Lookback</label>
                        <input v-model.trim.number="lookback"
                            @change="saveWaitDP"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'lookback')">
                    </div>
                    <div class="col-xs-2">
                        <label>Timeout</label>
                        <input v-model.trim.number="timeout"
                            @change="saveWaitDP"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, 'timeout')">
                    </div>
                    <div class="col-xs-4"></div>
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
                entry="wait-dp-entry"
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
        name: "WaitDPElement",
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
                    defaultValue: '',
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
                    enumValues: ['RECORD', 'EQUAL', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'GREATER_THAN'],
                },
                {
                    name: 'verification_value',
                    header: 'Verification Value',
                    type: 'integer',
                    defaultValue: 0,
                    executionOnly: false,
                    width: 175,
                    enumValues: []
                }
            ];
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
                        value: value,
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
            saveWaitDP() {
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
            saveDataPath(value) {
                this.dataPath = value;
                this.save();
            },
            saveStartTime(timeReference) {
                this.startTime = timeReference;
                this.saveWaitDP();
            }
        }
    };
</script>

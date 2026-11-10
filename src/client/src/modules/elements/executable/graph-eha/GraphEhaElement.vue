// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <ol class="data-bar-contents-flex">
                        <li
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            :title="translatedStartTime"
                            class="ing-tooltip">Start: {{ startTime }}</li>
                        <li>Duration: {{ duration }} seconds</li>
                        <li
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            :title="translatedEndTime"
                            class="ing-tooltip">End: {{ endTime }}</li>
                        <li>Timeout: {{ timeout }} seconds {{ timeType }}</li>
                        <li>Channel: {{ channelName }} on {{ dataPath }}</li>
                    </ol>
                </div>
            </div>
            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-3">
                        <label class="required-field">Flight/SSE</label>
                        <select v-model="flightSse"
                                @change="save"
                                class="form-control execution-input"
                                :disabled="disableFields">
                                <option v-for="option in flightSseOptions"
                                    :key="option[0]"
                                    :selected="option[0] === flightSse"
                                    :value="option[0]">
                                    {{ option[1] }}
                                </option>
                        </select>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Channel Type</label>
                        <select v-model="channelType"
                                @change="save"
                                class="form-control execution-input"
                                :disabled="disableFields">
                                <option v-for="option in channelTypeOptions"
                                    :key="option[0]"
                                    :value="option[0]">
                                    {{ option[1] }}
                                </option>
                        </select>
                    </div>
                    <div class="col-xs-6">
                        <label class="required-field">Channel</label>
                        <input v-model="channelName"
                            @change="save"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;">
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-4">
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
                                            @click.prevent="saveDataPath(dataPath)">
                                        {{ dataPath }}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <input v-model.trim="dataPath"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                        </div>
                    </div>
                    <div class="col-xs-4">
                        <label class="required-field">DN/EU</label>
                        <select v-model="dnEu"
                                @change="save"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :disabled="disableFields">
                                <option v-for="option in dnEuOptions"
                                    :key="option[0]"
                                    :value="option[0]">
                                    {{ option[1] }}
                                </option>
                        </select>
                    </div>
                    <div class="col-xs-4">
                        <label class="required-field">Timeout (sec)</label>
                        <input v-model.trim.number="timeout"
                            @change="saveGraphEHA"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;">
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-3">
                        <label class="required-field">Start Time</label>
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
                            <input v-model="startTime"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                        </div>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">End Time</label>
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
                            <input v-model="endTime"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                        </div>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Duration (sec)</label>
                        <input v-model="duration"
                            @change="save"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;">
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Time Type</label>
                        <select v-model="timeType"
                                @change="save"
                                class="form-control execution-input"
                                :disabled="disableFields">
                                <option v-for="option in timeTypeOptions"
                                    :selected="option[0] === timeType"
                                    :key="option[0]"
                                    :value="option[0]">
                                    {{ option[1] }}
                                </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "GraphEhaElement",
        components: {
        },
        data() {
            return {
                flightSse: "SSE",
                timeTypeOptions : [
                    ["ERT", "ERT"],
                    ["SCLK", "SCLK"],
                    ["SCET", "SCET"]
                ],
                flightSseOptions: [
                    ["SSE", "SSE"],
                    ["FLIGHT", "Flight"]
                ],
                channelTypeOptions: [
                    ["SSE", "SSE"],
                    ["FSW_RECORDED", "FSW Recorded"],
                    ["FSW_REALTIME", "FSW Realtime"]
                ],
                dnEuOptions: [
                    ["DN","DN"],
                    ["EU","EU"]
                ]
            };
        },
        watch: {
            flightSse: function(newVal) {
                this.channelType = newVal === "SSE" ? this.channelTypeOptions[0][0] : this.channelTypeOptions[1][0];
            },
            channelType: function(newVal) {
                this.flightSse = newVal === "SSE" ? this.flightSseOptions[0][0] : this.flightSseOptions[1][0];
            }
        },
        created: function() {
            // set flight/sse from channelType
            this.flightSse = this.channelType === "SSE" ? this.flightSseOptions[0][0] : this.flightSseOptions[1][0];
        },
        computed: {
            ...mapGetters([
                "dataPaths",
                "timeReferences"
            ]),
            channelId: {
                get() { return this.getExecutionInputKey("channel_id"); },
                set(value) { this.setElementInput("channel_id", value); }
            },
            channelName: {
                get() { return this.getExecutionInputKey("channel_name"); },
                set(value) { this.setElementInput("channel_name", value); }
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
            startTime: {
                get() { return this.getExecutionInputKey("start_time"); },
                set(value) { this.setElementInput("start_time", value); }
            },
            endTime: {
                get() { return this.getExecutionInputKey("end_time"); },
                set(value) { this.setElementInput("end_time", value); }
            },
            duration: {
                get() { return this.getExecutionInputKey("duration"); },
                set(value) { this.setElementInput("duration", value); }
            },
            timeType: {
                get() { return this.getExecutionInputKey("time_type"); },
                set(value) { this.setElementInput("time_type", value); }
            },
            timeout: {
                get() { return this.getExecutionInputKey("timeout"); },
                set(value) { this.setElementInput("timeout", value); }
            },
            channelType: {
                get() { return this.getExecutionInputKey("channel_type"); },
                set(value) { this.setElementInput("channel_type", value); }
            },
            dnEu: {
                get() { return this.getExecutionInputKey("dn_eu"); },
                set(value) { this.setElementInput("dn_eu", value); }
            },
            dataPath: {
                get() { return this.getExecutionInputKey("data_path"); },
                set(value) { this.setElementInput("data_path", value); }
            }
        },
        methods: {
            ...mapActions([
                "populateTimeReferences"
            ]),
            saveDataPath(value) {
                this.dataPath = value;
                this.save();
            },
            saveGraphEHA() {                
                // HK: this needs to be revisited.
                try {
                    this.timeout = parseInt(this.timeout);
                } catch(err) {
                    //  ignore
                }

                this.save();
            },
            saveStartTime(timeReference) {
                this.startTime = timeReference;
                this.saveGraphEHA();
            },
            saveEndTime(timeReference) {
                this.endTime = timeReference;
                this.saveGraphEHA();
            }
        }        
    };
</script>

// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        Send Files To: <span v-if="dataPath" :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
                        <span v-else v-text="'<Data Path>'"></span>
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
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, 'data_path')">
                        </div>
                    </div>
                    <div class="col-xs-8"></div>
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
                entry="cmd-file-entry"
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
    import { mapGetters } from "vuex";

    let TOOLTIPS = require('../../../common/tooltip-config');
    
    export default {
        name: "CmdFileElement",
        components: {
            'ing-data-entry': IngDataEntry,
        },
        created() {
            this.columnInfos = [
                {
                    name: 'file_type',
                    header: 'File Type',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 100,
                    enumValues: [],
                },
                {
                    name: 'timeout',
                    header: 'Timeout',
                    type: 'integer',
                    defaultValue: 120,
                    executionOnly: false,
                    width: 70,
                    enumValues: [],
                },
                {
                    name: 'verify',
                    header: 'Verify Receipt?',
                    type: 'boolean',
                    defaultValue: false,
                    executionOnly: false,
                    width: 70,
                    enumValues: [true, false],
                },
                {
                    name: 'overwrite',
                    header: 'Overwrite?',
                    type: 'boolean',
                    defaultValue: false,
                    executionOnly: false,
                    width: 80,
                    enumValues: [true, false],
                },
                {
                    name: 'file_path',
                    header: 'File Path (on the venue system)',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 150,
                    enumValues: [],
                },
                {
                    name: 'onboard_path',
                    header: 'Onboard Path (on the vehicle)',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 150,
                    enumValues: [],
                },
                {
                    name: 'string_selection',
                    header: 'String Selection',
                    type: 'string',
                    defaultValue: 'DEFAULT',
                    executionOnly: false,
                    width: 76,
                    enumValues: ['DEFAULT', 'A', 'B', 'AB'],
                },                
            ];
        },
        computed: {
            ...mapGetters([
                "dataPaths",
                "modStyle"
            ]),
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
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            }
        },
        methods: {
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            },
            saveDataPath(value) {
                this.dataPath = value;
                this.save();
            }
        }
    };
</script>

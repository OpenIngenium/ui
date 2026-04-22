// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" 
                        style="overflow-wrap: anywhere">
                        Send Commands: <span :class="modStyle(elementId, 'data_path')">{{ dataPath }}</span>
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
                        <label>Data Path</label>

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
                                :class="modStyle(elementId, 'data_path')"
                                @change="save"
                                :disabled="disableFields"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
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
                entry="cmd-entry"
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
    import IngDataEntry from '../../../common/IngDataEntry.vue';
    import { mapGetters } from "vuex";

    export default {
        name: "CmdElement",
        components: {
            'ing-data-entry': IngDataEntry,
        },
        created() {
            this.columnInfos = [
                {
                    name: 'hw_fsw',
                    header: 'HW/FSW',
                    type: 'string',                    
                    defaultValue: 'FSW',
                    executionOnly: false,
                    width: 175,
                    enumValues: ['HW', 'FSW'],
                },
                {
                    name: 'timeout',
                    header: 'Timeout',
                    type: 'integer',
                    defaultValue: 60,
                    executionOnly: false,
                    width: 175,
                    enumValues: [],
                },
                {
                    name: 'verify',
                    header: 'Verify Receipt?',
                    type: 'boolean',                    
                    defaultValue: false,
                    executionOnly: false,
                    width: 75,
                    enumValues: [true, false],
                },
                {
                    name: 'cmd_string',
                    header: 'Command String',
                    type: 'string',
                    defaultValue: '',
                    executionOnly: false,
                    width: 175,
                    enumValues: [],
                },
                {
                    name: 'string_selection',
                    header: 'String Selection',
                    type: 'string',
                    defaultValue: 'DEFAULT',
                    executionOnly: false,
                    width: 100,
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

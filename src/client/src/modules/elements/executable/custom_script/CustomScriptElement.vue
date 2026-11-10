// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <p style="text-align: center;">
            <a v-if="logsLink.length > 0" :href="clickLogsLink(logsLink)">
                <span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span> Download custom script logs
            </a>
        </p>
        <div v-if="isLevelTwoDetail" class="container-element">
            <ing-modal v-if="showCustomScriptModal" @close="showCustomScriptModal = false" size="large">
                <template slot="title">
                    <h4 style="font-weight: bold; display: inline-block;">Lookup Custom Script</h4>
                </template>
                <template slot="body">
                    <ing-table
                        tableId="customScriptElement"
                        tableTitle="Scripts"
                        class="custom_scripts_table"
                        :data="activeCustomScripts"
                        :columns="tableColumns"
                        :total="customScriptsCount"
                        v-on:handleEvent="handleScriptPathSelectionFromTable"
                        empty-message="No Custom Scripts to display."
                        :callback="tableCallback"
                        :includeFooter="true"
                        :limit="limit">
                    </ing-table>
                </template>
                <template slot="footer">
                    <button
                        type="button"
                        class="btn btn-default pull-right"
                        @click="showCustomScriptModal = false">
                        Cancel
                    </button>
                </template>
            </ing-modal>

            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        Execute Script: <span v-if="scriptPath" :class="modStyle(elementId, 'script_path')">{{ scriptPath }}</span>
                        <span v-else v-text="'<Script Path>'" :class="modStyle(elementId, 'script_path')"></span>,
                        Timeout: <span v-if="timeout" :class="modStyle(elementId, 'timeout')">{{ timeout }}</span>
                        <span v-else v-text="'<Timeout>'" :class="modStyle(elementId, 'timeout')"></span>
                        <execution-status-check
                            v-if="enableExecution"
                            :executed="executed"
                            :status="getExecutionMetaDataKey('status')">
                        </execution-status-check>
                    </div>
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        Script Hash: <span v-if="scriptHash" :class="modStyle(elementId, 'hash')">{{ scriptHash }}</span>
                        <span v-else v-text="'<Script Hash>'" :class="modStyle(elementId, 'hash')"></span>
                    </div>
                </div>
            </div>

            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-6" v-if="!isCustomScriptDynamic">
                        <button 
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_custom_script_lookup"
                            @click="showCustomScriptModal = true" 
                            type="button" 
                            class="btn btn-xs btn-info pull-right procedure-lookup ing-tooltip" 
                            :disabled="disableFields">
                            <span class="glyphicon glyphicon-search"></span>  Lookup
                        </button>
                        <label 
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_custom_script_script_name"
                            class="required-field ing-tooltip"><b>Script Path</b></label>
                        <ing-autocomplete
                            :value="scriptPath"
                            v-on:handleEvent="handleScriptPathInput"
                            :callback="fetchScriptPathAutoCompleteCallback"
                            :items="activeCustomScripts"
                            nameField="script_path"
                            descriptionField="description"
                            enterByName="script_path"
                            dynamicWidth="three-hundred-width"
                            v-on:save="saveCustomScript"
                            :disabled="disableFields"
                            :inputClasses="modStyle(elementId, 'script_path')"
                        ></ing-autocomplete>
                    </div>
                    <div :class="isCustomScriptDynamic ? 'col-xs-10' : 'col-xs-4'"></div>
                    <div class="col-xs-2">
                        <label 
                            data-toggle="tooltip" 
                            data-placement="top"
                            data-trigger="hover" 
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_custom_script_timeout"
                            class="required-field ing-tooltip"><b>Timeout (sec)</b></label>
                        <input v-model.trim.number="timeout"
                               @change="save"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               :class="modStyle(elementId, 'timeout')"
                               style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
        </div>

        <!-- BACKWARD COMPATIBILITY OLD STYLE-->
        <div v-if="!isAdvancedLayout && !isCustomScriptDynamic">
            <!--INPUT SECTION SINGLE ENTRY-->
            <div v-if="isLevelTwoDetail && inputs.length && scriptPath !== ''">
                <p style="text-align: center; font-weight: bold; margin-top:10px;">Inputs</p>
                <div class="container-element">
                    <div @dblclick="toggleViewLevelTwoThree">
                        <div class="row data-bar-element condensed">
                            <div class="col-xs-12">
                                <span v-for="(input, index) in inputs"
                                    :key="index">
                                    - {{ input.name }}: <span :class="modStyle(elementId, `inputs.${input.name}`)">{{ input.value }}</span><br>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- OLD STYLE-->
                    <div v-if="isLevelThreeDetail" class="edit-container">
                        <div class="row">
                            <div class="col-xs-3">
                                <b>Name</b>
                            </div>
                            <div class="col-xs-6">
                                <b>Description</b>
                            </div>
                            <div class="col-xs-3">
                                <b>Value</b>
                            </div>
                        </div>
                        <CustomScriptInputArg
                            v-for="(input, index) in inputs"
                            v-on:updateArgEvent="updateArgEvent"
                            :disableFields="disableFields"
                            :canDisableExecuteField="canDisableExecuteField"
                            :key="index"
                            :index="index"
                            :mode="pageMode"
                            :r4s="isRunForScore"
                            :arg="input"
                            :inputClasses="modStyle(elementId, `inputs.${input.name}`)"
                        >
                        </CustomScriptInputArg>
                    </div>
                    <!---->              
                </div>
            </div>
            <!---->
            <!--INPUT MULTY ENTRY-->
            <div v-if="isLevelTwoDetail && elementEntryCount && scriptPath !== ''" class="dynamic-elements">
                <p style="text-align: center; font-weight: bold; margin-top:10px;">Entries</p>

                <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                    v-on:save="save"
                    :element-id="elementId"
                    :index="idx"
                    :mode="mode"
                    :element-path="elementMap.path"
                    :class="modStyle(elementId, `entries.${idx}`)"
                    entry="custom-script-entry">
                </entries-wrapper>
            </div>
            <!---->
            <!-- OUTPUT-->
            <div v-if="isLevelTwoDetail && outputs.length && scriptPath !== '' && executed">
                <p style="text-align: center; font-weight: bold; margin-top:10px;">Outputs</p>
                <div class="container-element">
                    <div @dblclick="toggleViewLevelTwoThree">
                        <div class="row data-bar-element condensed">
                            <div class="col-xs-12">
                                <span v-for="(output, index) in outputs"
                                    :key="index">
                                    - {{ output.name }}: {{ output.value }}<br>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!--OLD STYLE OUTPUT-->
                    <div v-if="mode != 'authoring' && isLevelThreeDetail">
                        <div class="row data-bar-element condensed">
                            <div class="col-xs-12">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <td style="width:33%;">Name</td>
                                            <td>Value</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="output in outputs" :key="output.name">
                                            <td>{{ output.name }}</td>
                                            <td>{{ output.value }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!---->
                </div>
            </div>
            <!-- OUTPUT ARRAY-->
            <div v-if="isLevelThreeDetail && scriptPath !== '' && executed">
                <p style="text-align: center; font-weight: bold; margin-top:10px;">Output Array</p>
                <custom-script-output-array
                    :element-id="elementId"
                    :mode="mode">
                </custom-script-output-array>
            </div>
        </div>

        <!-- NEW STYLE-->
        <div v-for="(layoutItem, layoutIndex) in advancedLayout" :key="layoutIndex">
            <!--SINGLE ENTRY-->
            <div v-if="isLevelTwoDetail && scriptPath !== '' && layoutItem.entry === 'FALSE'" style="margin-top:10px">
                <div class="container-element" v-if="layoutItem.header || layoutItem.content">
                    <!--ADVANCED HEADER-->
                    <div v-if="layoutItem.header" @dblclick="toggleViewLevelTwoThree" >
                        <div class="row data-bar-element condensed">
                            <div class="col-xs-12">
                                <div
                                    v-for="(fields, rowNum) in getGroupedHeaderLayout(layoutItem.header.headerlayout)"
                                    :key="`row-${layoutIndex}-${rowNum}`"
                                    class="row"
                                    >
                                    <!-- If row has no fields, render placeholder -->
                                    <div v-if="fields.length === 0" class="col-xs-12" style="height: 15px;"></div>
                                    <!-- Otherwise, render the fields -->
                                    <AdvancedLayoutField
                                      v-for="(field, fieldIndex) in fields"
                                      :key="`field-${layoutIndex}-${rowNum}-${fieldIndex}`"
                                      :field="field"
                                      :element-id="elementId"

                                      :disableFields="disableFields"
                                      :canDisableExecuteField="canDisableExecuteField"
                                      :pageMode="pageMode"
                                      :isRunForScore="isRunForScore"
                                      :executed="executed"
                                      :enableExecution="enableExecution"
                                      :outputs="outputs"
                                      :isEntry="false"

                                      :modStyle="modStyle"
                                      :getInputByName="getInputByName"
                                      :getInputIndexByName="getInputIndexByName"
                                      :isOutputField="isOutputField"
                                      :renderTemplate="renderTemplate"
                                      :generateIconTooltip="generateIconTooltip"
                                      :getExecutionMetaDataKey="getExecutionMetaDataKey"

                                      @updateArgEvent="updateArgEvent"
                                    ></AdvancedLayoutField>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--ADVANCED CONTENT SINGLE ENTRY-->
                    <div v-if="isLevelThreeDetail && layoutItem.content" class="edit-container">
                        <div class="row">
                            <div class="col-xs-12">
                                <div
                                    v-for="(fields, rowNum) in getGroupedHeaderLayout(layoutItem.content.contentlayout)"
                                    :key="`row-${layoutIndex}-${rowNum}`"
                                    class="row"
                                    >
                                     <!-- If row has no fields, render placeholder -->
                                    <div v-if="fields.length === 0" class="col-xs-12" style="height: 15px;"></div>
                                    <!-- Otherwise, render the fields -->
                                    <AdvancedLayoutField
                                      v-for="(field, fieldIndex) in fields"
                                      :key="`field-${layoutIndex}-${rowNum}-${fieldIndex}`"
                                      :field="field"
                                      :element-id="elementId"

                                      :disableFields="disableFields"
                                      :canDisableExecuteField="canDisableExecuteField"
                                      :pageMode="pageMode"
                                      :isRunForScore="isRunForScore"
                                      :executed="executed"
                                      :enableExecution="enableExecution"
                                      :outputs="outputs"
                                      :isEntry="false"

                                      :modStyle="modStyle"
                                      :getInputByName="getInputByName"
                                      :getInputIndexByName="getInputIndexByName"
                                      :isOutputField="isOutputField"
                                      :renderTemplate="renderTemplate"
                                      :generateIconTooltip="generateIconTooltip"
                                      :getExecutionMetaDataKey="getExecutionMetaDataKey"

                                      @updateArgEvent="updateArgEvent"
                                    ></AdvancedLayoutField>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>
                <!-- ADVANCED RESULT -->
                <div
                    v-if="isLevelThreeDetail && scriptPath !== '' && layoutItem.results && executed && !isStepPending"
                    style="margin-top:10px;"
                    >
                    <div
                        v-for="(seg, sIdx) in resultSegments(layoutItem)"
                        :key="`seg-${layoutIndex}-${sIdx}`"
                        class="row data-bar-element condensed"
                        >
                    <!-- TABLE segment -->
                    <template v-if="seg.type === 'TABLE'">
                        <div style="width:100%;">
                            <!-- Label TOP -->
                            <div
                                v-if="seg.item.label && seg.item.label.label_loc === 'TOP'"
                                :style="{
                                  textAlign: seg.item.label.label_align ? seg.item.label.label_align.toLowerCase() : 'left',
                                  fontWeight: 'bold',
                                  marginBottom: '5px'
                                }"
                                >
                                {{ seg.item.label.label_content }}
                            </div>
                            <table class="table" style="margin-bottom:15px; word-break: break-all; width: inherit;">
                                <thead>
                                    <tr>
                                        <th
                                          v-for="(column, cIdx) in seg.item.table_column"
                                          :key="cIdx"
                                          :style="{ width: getColumnWidthStyle(seg.item, column.width) }"
                                        >
                                            {{ column.column_label }}
                                      </th>
                                      <th
                                            v-if="seg.item.mouseover && seg.item.mouseover.mouseover_elements && seg.item.mouseover.mouseover_elements.length > 0"
                                            style="width: 5%;"
                                        ></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rIdx) in outputArrayRows" :key="rIdx">
                                        <td v-for="(column, cIdx) in seg.item.table_column" :key="cIdx">
                                            {{ renderRowTemplate(column.template.template, row) }}
                                        </td>
                                        <td
                                            v-if="seg.item.mouseover && seg.item.mouseover.mouseover_elements && seg.item.mouseover.mouseover_elements.length > 0"
                                        >
                                        <ing-popover placement="bottom">
                                            <template slot="title">Details</template>
                                            <ul slot="body" style="width: 300px">
                                                <li
                                                    v-for="(el, idx) in getMouseoverData(row, seg.item)"
                                                    :key="idx"
                                                    style="word-break: break-all;"
                                                >
                                                <span class="result-key">{{ el.label }}</span>:&nbsp;
                                                <span class="result-value">{{ el.value }}</span>
                                                </li>
                                            </ul>
                                            <span :class="['glyphicon-eye-open', 'glyphicon']"></span>
                                        </ing-popover>
                                      </td>
                                    </tr>
                                </tbody>
                            </table>
                            <!-- Label BOTTOM -->
                            <div
                                v-if="seg.item.label && seg.item.label.label_loc === 'BOTTOM'"
                                :style="{
                                  textAlign: seg.item.label.label_align ? seg.item.label.label_align.toLowerCase() : 'left',
                                  fontWeight: 'bold',
                                  marginBottom: '5px'
                                }"
                                >
                                {{ seg.item.label.label_content }}
                            </div>
                        </div>
                    </template>
                
                        <!-- NON_TABLE segment rendered as rows in a single group -->
                        <template v-else>
                            <div class="row"
                                    v-for="(fields, rowNum) in getGroupedHeaderLayout(seg.items)"
                                    :key="`resrow-${layoutIndex}-${sIdx}-${rowNum}`">
                                <div v-if="fields.length === 0" class="col-xs-12" style="height: 15px;"></div>
                                <!-- Otherwise, render the fields -->
                                <AdvancedLayoutField
                                  v-for="(field, fieldIndex) in fields"
                                  :key="`field-${layoutIndex}-${rowNum}-${fieldIndex}`"
                                  :field="field"
                                  :element-id="elementId"
                                                        
                                  :disableFields="disableFields"
                                  :canDisableExecuteField="canDisableExecuteField"
                                  :pageMode="pageMode"
                                  :isRunForScore="isRunForScore"
                                  :executed="executed"
                                  :enableExecution="enableExecution"
                                  :outputs="outputs"
                                  :isEntry="false"
                                                        
                                  :modStyle="modStyle"
                                  :getInputByName="getInputByName"
                                  :getInputIndexByName="getInputIndexByName"
                                  :isOutputField="isOutputField"
                                  :renderTemplate="renderTemplate"
                                  :generateIconTooltip="generateIconTooltip"
                                  :getExecutionMetaDataKey="getExecutionMetaDataKey"
                                                        
                                  @updateArgEvent="updateArgEvent"
                                ></AdvancedLayoutField>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <!--MULTI ENTRY-->
            <div v-if="isLevelTwoDetail && elementEntryCount && scriptPath !== '' && layoutItem.entry === 'TRUE'" class="dynamic-elements" style="margin-top:10px">
                <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                    v-on:save="save"
                    :element-id="elementId"
                    :index="idx"
                    :mode="mode"
                    :element-path="elementMap.path"
                    :class="modStyle(elementId, `entries.${idx}`)"
                    entry="custom-script-entry">
                </entries-wrapper> 
            </div>
        </div>

        <ing-data-entry
            v-if="columnInfos.filter(column => column.name == '').length == 0"
            :showModal="enableTableEntry"
            :tableTypeId="scriptHash"
            :entries-length="elementEntryCount"
            :element-id="elementId"
            :mode="mode"
            :level="detailLevel"
            :disableFields="disableFields"
            :canDisableExecuteField="canDisableExecuteField"
            :columnInfos="columnInfos"
            getterName="executionInputCustomScriptEntriesArrayFilter"
            methodName="editCustomScriptEntries"
            v-on:dataEntryEvent="handleDataEntryEvent"
            ></ing-data-entry>
    </form>
</template>

<script>
    import IngTable from "../../../common/IngTable.vue";
    import IngDataEntry from "../../../common/IngDataEntry.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";
    import _ from 'lodash';
    import CustomScriptDetails from "../../../project-config/common/CustomScriptsDetails.vue";
    import CustomScriptSelectButton from "./CustomScriptSelectButton.vue";
    import CustomScriptInputArg from "./CustomScriptInputArg.vue";
    import CustomScriptOutputArray from "./CustomScriptOutputArray.vue";
    import AdvancedLayoutField from "./AdvancedLayoutField.vue";

    let TOOLTIPS = require('../../../common/tooltip-config');
    let VERIFICATION_CONDITIONS = require("../../../common/verification-conditions");
    export default {
        name: "CustomScriptElement",
        components: {
            IngAutocomplete,
            IngTable,
            CustomScriptDetails,
            CustomScriptInputArg,
            CustomScriptOutputArray,
            'ing-data-entry': IngDataEntry,
            AdvancedLayoutField
        },
        created() { 
            if(!this.isAdvancedLayout && this.elementMap.scriptMeta) {
                this.autoSelectCustomScript();
            }
        },
        data() {
            return  {
                offset: 0,
                limit: 10,
                showCustomScriptModal: false,
                tableColumns: [
                    {
                        field: "script_path",
                        name: "Path",
                        filterType: "search",
                        sortable: true,
                        wordWrap: true
                    },
                    {
                        field: "description",
                        name: "Description",
                        filterType: "search",
                        sortable: true,
                        wordWrap: true
                    },
                    {
                        field: "status",
                        name: "Status",
                        filterType: "search",
                        sortable: true
                    },
                    {
                        field: "details",
                        name: "Details",
                        component: CustomScriptDetails,
                        wordWrap: null
                    },
                    {
                        field: "select",
                        name: "Select",
                        component: CustomScriptSelectButton,
                    }
                ],
            };
        },
        watch: {
            showCustomScriptModal: function() {
                this.fetchCustomScripts({
                    limit: 10
                });
            }
        },
        computed: {
            ...mapGetters([
                "customScripts",
                "customScriptsCount",
                "customScriptIdByPath",
                "executionInput",
                "modStyle",
                "execution"
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            elementEntryCount() {
                return this.numEntries(this.elementId);
            },
            allCustomScripts: {
                get() {
                    return Object.values(this.customScripts);
                }
            },                   
            activeCustomScripts: {
                get() {
                    let css = Object.values(this.customScripts);
                    return css.filter(s => {return s.status == 'ACTIVE';}); // display only the active custom scripts
                }
            },
            customScriptInput: {
                get() {
                    return this.executionInput(this.elementId);
                }
            },
            scriptPath: {
                get() {
                    return this.executionInputKey(this.elementId, "script_path");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "script_path",
                        value: value
                    });
                }
            },
            scriptHash: {
                get() {
                    return this.executionInputKey(this.elementId, "hash");
                }
            },            
            timeout: {
                get() {
                    return parseInt(this.executionInputKey(this.elementId, "timeout"));
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "timeout",
                        value: parseInt(value)
                    });
                }
            },
            inputs: {
                get() {
                    const inputs = this.executionInputKey(this.elementId, "inputs");
                    return inputs ? inputs: [];
                }
            },
            advancedLayout:{
                get() {
                    const layout = this.executionInputKey(this.elementId, "layout");
                    return Array.isArray(layout) ? layout : [];
                }
            },
            isAdvancedLayout() {
                return this.advancedLayout.length > 0;
            },
            columnInfos: {
                get() {
                    const entries = this.executionInputKey(this.elementId, 'entries');
                    const entry_inputs = (entries && entries.length > 0) ? entries[0].entry_inputs : [];

                    return entry_inputs.flatMap(column => {
                        const label = this.getEntryFieldLabel(column.name);
                        let returnData = {
                            name: column.name,
                            header: label,
                            type: 'string',      // values are stored as string regardless of type
                            defaultValue: column.default_value,
                            executionOnly: column.phase == 'EXECUTION',
                            width: 1200 / this.entryInputs.length,
                        };

                        switch(column.type) {
                            case "BOOL": return [{
                                ...returnData,
                                defaultValue: column.default_value === "" ? "false" : column.default_value, // set to false if default value is empty
                                enumValues: ["false", "true"]
                            }];
                            case "ENUM": return [{ ...returnData, enumValues: column.enumerations.map(enumeration => enumeration.symbol) }];
                            case "FLIGHT_TELEM":
                            case "SIM_TELEM": {
                                // stored as a single "channel_id,channel_name" value - shown as separate
                                // ID/Name columns in the grid (IngDataEntry splits/joins using telemPart)
                                const [defaultId = "", defaultName = ""] = (column.default_value || "").split(",");
                                return [
                                    {
                                        ...returnData,
                                        header: `${label} ID`,
                                        defaultValue: defaultId,
                                        width: returnData.width / 2,
                                        telemPart: 'id',
                                        enumValues: []
                                    },
                                    {
                                        ...returnData,
                                        header: `${label} Name`,
                                        defaultValue: defaultName,
                                        width: returnData.width / 2,
                                        telemPart: 'name',
                                        enumValues: []
                                    }
                                ];
                            }
                            case "VERIFICATION_COND": {
                                // stored as a single "condition,value,range1,range2" value - shown as separate
                                // Condition/Verify Value 1/Verify Value 2 columns (IngDataEntry splits/joins
                                // using verificationPart). Only INCLUSIVE_RANGE/EXCLUSIVE_RANGE use range1/range2,
                                // every other condition uses value; RECORD/NOT_PRESENT use neither.
                                const [defaultCondition = "RECORD", defaultValue = "", defaultRange1 = "", defaultRange2 = ""] = (column.default_value || "").split(",");
                                const defaultIsRange = defaultCondition === "INCLUSIVE_RANGE" || defaultCondition === "EXCLUSIVE_RANGE";
                                return [
                                    {
                                        ...returnData,
                                        header: `${label} Condition`,
                                        defaultValue: defaultCondition || "RECORD",
                                        width: returnData.width / 3,
                                        verificationPart: 'condition',
                                        enumValues: Object.keys(VERIFICATION_CONDITIONS.default.VERIFICATION_CONDITIONS)
                                    },
                                    {
                                        ...returnData,
                                        header: `${label} Verify Value 1`,
                                        defaultValue: defaultIsRange ? defaultRange1 : defaultValue,
                                        width: returnData.width / 3,
                                        verificationPart: 'value1',
                                        enumValues: []
                                    },
                                    {
                                        ...returnData,
                                        header: `${label} Verify Value 2`,
                                        defaultValue: defaultRange2,
                                        width: returnData.width / 3,
                                        verificationPart: 'value2',
                                        enumValues: []
                                    }
                                ];
                            }
                            case "STRING":
                            case "INT":
                            case "FLOAT":
                            case "DATA_PATH":
                            case "TIME":
                            case "VARIABLE": return [{ ...returnData, enumValues: [] }];
                            default: return [{ ...returnData, enumValues: [] }];
                        }
                    });
                }
            },
            outputs: {
                get() {
                    const outputs = this.getElementKey('executed') ? 
                        this.executionResultsKey(this.elementId, 'outputs') : this.executionInputKey(this.elementId, 'outputs');
                    return outputs ? outputs : [];
                }
            },
            output_array_outputs: {
                get() {
                    const executed = this.getElementKey('executed');
                    const output_array = this.getElementKey('executed') ? 
                        this.executionResultsKey(this.elementId, 'output_array') : this.executionInputKey(this.elementId, 'output_array');
                    return output_array && output_array.outputs ? output_array.outputs : [];
                }
            },            
            entries: {
                get() {
                    return this.executionInputKey(this.elementId, 'entries');
                }
            },
            entryInputs: {
                get() {
                    const entries = this.executionInputKey(this.elementId, 'entries');
                    return (entries && entries.length > 0) ? entries[0].entry_inputs : [];
                }
            },
            pageMode() {
                return this.mode;
            },
            isRunForScore: {
                get() { return this.getExecutionInputKey("run_for_score") || this.getElementKey('run_for_score'); },
                set(value) { this.setElementInput("run_for_score", value); }
            },
            logsLink: {
                get() {
                    return this.getElementKey('executed') ? this.executionResultsKey(this.elementId, 'log_file_url') : '';
                }
            },
            outputArrayRows() {
                const cols = this.output_array_outputs || []; // array of column descriptors
                if (!cols.length) return [];

                // number of rows = max length across column values arrays
                const rowCount = Math.max(...cols.map(c => (c.values && c.values.length) || 0), 0);

                // produce rows: [{ output_array_field_1: '0', output_array_field_2: 'a', ... }, ...]
                const rows = Array.from({ length: rowCount }, (_, rowIdx) => {
                    const rowObj = {};
                    cols.forEach(col => {
                        const key = col.name; // e.g. "output_array_field_1"
                        const val = (col.values && col.values[rowIdx] !== undefined) ? col.values[rowIdx] : '';
                        rowObj[key] = val;
                    });
                    return rowObj;
                });

                return rows;
            },
            isStepPending: function() {
                return this.execution.status === 'RUNNING' || this.execution.status === 'PAUSED';
            },
            isCustomScriptDynamic: function() {
                if (this.elementMap.scriptMeta) {
                    return this.customScriptInput.hasOwnProperty('script_display_name');
                }
                return false;
            }
        },
        methods: {
            ...mapActions([
                "fetchCustomScripts",
                "editCustomScriptInput",
                "saveElementInput",
                "updateElementConsistencyFlag"
            ]),
            clickLogsLink: function(logsLink) {
                return window.location.origin + '/file_server/' + logsLink;
            },
            handleScriptPathSelectionFromTable: function(customEvent) {
                this.selectCustomScript(customEvent, true);
            },
            handleScriptPathInput: function(scriptPath) {
                // pass false since save will be handled later by save event
                this.selectCustomScript({data: {script_path: scriptPath}}, false);
            },
            fetchScriptPathAutoCompleteCallback: function(scriptPath) {
                this.fetchCustomScripts({ scriptPath: scriptPath });
            },
            tableCallback: function({ sortDirection, sortField, filters, limit, offset }) {
                this.offset = offset;
                this.limit = limit;
                this.fetchCustomScripts({
                    sortDirection: sortDirection,
                    sortField: sortField,
                    filters: filters,
                    limit: limit,
                    offset: offset
                });
            },
            getScriptByPath: function(scriptPath) {
                const scriptInfo = this.allCustomScripts.find((script => script.script_path === scriptPath));
                return scriptInfo ? scriptInfo : null;
            },
            getScriptById: function(scriptId) {
                const scriptInfo = this.allCustomScripts.find((script => script.script_id === scriptId));
                return scriptInfo ? scriptInfo : null;
            },
            buildNameTypeFieldMap: function(fields) {
                const nameTypeMap = {};
                fields.forEach((field) => {
                    let typeMap = nameTypeMap[field.name];
                    if (!typeMap) {
                        typeMap = {};
                        nameTypeMap[field.name] = typeMap;
                    }
                    typeMap[field.type] = field;
                });
                return nameTypeMap;
            },
            getMatchingField(field, nameTypeMap) {
                const typeMap = nameTypeMap[field.name];
                if (typeMap) {
                    const matchingField = typeMap[field.type];
                    if (matchingField) {
                        return matchingField;
                    }
                }
                return null;
            },
            mergeInputs: function(step_inputs, catalog_inputs) {
                if (step_inputs && catalog_inputs) {
                    // catalog info has no value. Initialize with default value.
                    for (const catalog_input of catalog_inputs) {
                        catalog_input.value = catalog_input.hasOwnProperty('default_value') ? catalog_input.default_value : '';
                    }
                    const nameTypeMap = this.buildNameTypeFieldMap(catalog_inputs);
                    step_inputs.forEach((step_input) => {
                        const field = this.getMatchingField(step_input, nameTypeMap);
                        if (field) {
                            field.value = step_input.value;
                            // console.log(`copy input value. name: ${step_input.name} value: ${step_input.value}`);
                        }
                    });                    
                }
            },
            mergeEntryInputs: function(step_entries, catalog_entries) {
                let nameTypeMap = {};
                const matchingFields = [];
                // find matching fields to be copied over
                if (step_entries && catalog_entries) {
                    // catalog_entries have no value. Initialize with default value.
                    for (const catalog_entry of catalog_entries) {
                        if (catalog_entry.entry_inputs) {
                            for (const entry_input of catalog_entry.entry_inputs) {
                                entry_input.value = entry_input.hasOwnProperty('default_value') ? entry_input.default_value : '';
                            }
                        }
                    }                    
                    if (catalog_entries.length > 0 && catalog_entries[0].entry_inputs) {
                        nameTypeMap = this.buildNameTypeFieldMap(catalog_entries[0].entry_inputs);
                        
                        if (step_entries.length > 0) {
                            if (step_entries[0].entry_inputs) {
                                step_entries[0].entry_inputs.forEach((entry_input) => {
                                    const field = this.getMatchingField(entry_input, nameTypeMap);
                                    if (field) {
                                        matchingFields.push(field);
                                    }                                    
                                });
                            }                            
                        }
                    }
                }
                
                if (matchingFields.length > 0) {
                    // entries from catalog has only one element. 
                    // Copy it up to the length of entries of the current step
                    for (let i=1; i < step_entries.length; i++) {
                        catalog_entries.push(_.cloneDeep(catalog_entries[0]));
                    }
                    // copy values for matching fields
                    catalog_entries.forEach((catalog_entry, idx) => {
                        const step_entry = step_entries[idx];
                        
                        const catalogNameTypeMap = this.buildNameTypeFieldMap(catalog_entry.entry_inputs);
                        const stepNameTypeMap = this.buildNameTypeFieldMap(step_entry.entry_inputs);
                        
                        catalog_entry.entry_inputs.forEach((entry_input) => {
                            const catalogField = this.getMatchingField(entry_input, catalogNameTypeMap);
                            const stepField = this.getMatchingField(entry_input, stepNameTypeMap);
                            if (catalogField && stepField) {
                                catalogField.value = stepField.value;
                                // console.log(`copy entry input value. entry idx: ${idx} field: ${catalogField.name} value: ${stepField.value}`);
                            }
                        });
                    });
                }
            }, 
            autoSelectCustomScript: async function() {
                const scriptMeta = this.elementMap && this.elementMap.scriptMeta;
                const script_id = this.executionInputKey(this.elementId, 'script_id') || (scriptMeta && scriptMeta.script_id) || '';
                const script_path = this.executionInputKey(this.elementId, 'script_path') || (scriptMeta && scriptMeta.script_path) || '';
                
                await this.fetchCustomScripts({ scriptPath: script_path });
                
                // get the definition of the script, preferring ID lookup
                let scriptInfoFromCatalog = null;
                if (script_id) {
                    scriptInfoFromCatalog = this.getScriptById(script_id);
                }
                if (!scriptInfoFromCatalog && script_path) {
                    scriptInfoFromCatalog = this.getScriptByPath(script_path);
                }
                
                if (scriptInfoFromCatalog === null) {
                    console.error(`custom script was not found. script_id: ${script_id}, script_path: ${script_path}`);
                    return;
                }
                
                this.scriptPath = scriptInfoFromCatalog.script_path;
                const scriptInfo = _.cloneDeep(scriptInfoFromCatalog);
                const stepInput = this.customScriptInput;
                // These will update scriptInfo, which is a cloned data.
                // scriptInfo will be used to set inputs and entries below
                this.mergeInputs(stepInput.inputs, scriptInfo.inputs);
                this.mergeEntryInputs(stepInput.entries, scriptInfo.entries);

                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_path",
                    value: scriptInfo.script_path
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_id",
                    value: scriptInfo.script_id
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_name",
                    value: scriptInfo.script_name
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "hash",
                    value: scriptInfo.hash
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "description",
                    value: scriptInfo.description
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "inputs",
                    value: scriptInfo.inputs
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "entries",
                    value: scriptInfo.entries
                });                
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "outputs",
                    value: scriptInfo.outputs
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "output_array",
                    value: scriptInfo.output_array
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "layout",
                    value: scriptInfo.layout
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "spec_hash",
                    value: scriptInfo.spec_hash
                });

           
                // save input to the step
                await this.saveElementInput({ 
                    elementId: this.elementId,
                    elementPath: this.elementMap.path
                });
                
                // update consistency flag to CONSISTENT
                this.updateElementConsistencyFlag({
                    elementId: this.elementId,
                    consistencyFlag: 'CONSISTENT'
                });                
            },
            selectCustomScript: function(customEvent, save) {
                const script_id = customEvent.data.script_id;
                const script_path = customEvent.data.script_path;

                // get the definition of the newly selected script, preferring ID lookup
                let scriptInfoFromCatalog = null;
                if (script_id) {
                    scriptInfoFromCatalog = this.getScriptById(script_id);
                }
                if (!scriptInfoFromCatalog && script_path) {
                    scriptInfoFromCatalog = this.getScriptByPath(script_path);
                }

                if (scriptInfoFromCatalog === null) {
                    console.error(`custom script was not found. script_id: ${script_id}, script_path: ${script_path}`);
                    return;
                }

                this.scriptPath = scriptInfoFromCatalog.script_path;
                
                // make a copy not to change state of catalog outside mutator
                const scriptInfo = _.cloneDeep(scriptInfoFromCatalog);
                
                // current step input
                const stepInput = this.customScriptInput;
                
                // These will update scriptInfo, which is a cloned data.
                // scriptInfo will be used to set inputs and entries below
                this.mergeInputs(stepInput.inputs, scriptInfo.inputs);
                this.mergeEntryInputs(stepInput.entries, scriptInfo.entries);

                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_path",
                    value: scriptInfo.script_path
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_id",
                    value: scriptInfo.script_id
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "script_name",
                    value: scriptInfo.script_name
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "hash",
                    value: scriptInfo.hash
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "description",
                    value: scriptInfo.description
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "inputs",
                    value: scriptInfo.inputs
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "entries",
                    value: scriptInfo.entries
                });                
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "outputs",
                    value: scriptInfo.outputs
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "output_array",
                    value: scriptInfo.output_array
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "layout",
                    value: scriptInfo.layout
                });
                this.editElementInput({
                    elementId: this.elementId,
                    keyString: "spec_hash",
                    value: scriptInfo.spec_hash
                });

                this.showCustomScriptModal = false;

                if (save) {
                    // save input to the step
                    this.saveElementInput({ 
                        elementId: this.elementId,
                        elementPath: this.elementMap.path
                    });
                    
                    // update consistency flag to CONSISTENT
                    this.updateElementConsistencyFlag({
                        elementId: this.elementId,
                        consistencyFlag: 'CONSISTENT'
                    });
                }
            },
            // this method gets called when data is added into inputs fields,
            // saved into core
            updateArgEvent: function(payload) {
                if(payload.action == "updateArg") {
                    this.editCustomScriptInput({
                        elementId: this.elementId,
                        index: payload.data.index,
                        key: 'value',
                        value: payload.data.argumentValue
                    });
                    this.save();
                }
            },
            saveCustomScript() {
                try {
                    this.scriptPath = this.scriptPath.trim();
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
            handleDataEntryEvent: function(event) {
                this.$emit('dataEntryEvent', event);
            },
            // TODO: this function is very similar to the one in CustomScriptEntry.vue. Consider consolidation.
            // Many methods in the component can be consolidated with the ones in CustomScriptEntry.vue.
            getFieldValue(fieldName) {
                // First check inputs
                const input = this.inputs.find(i => i.name === fieldName);
                if (input) {
                    if (input.type === 'VERIFICATION_COND' && input.value) {
                        // Split the comma-separated value
                        const parts = input.value.split(',').map(s => s.trim());
                        const conditionKey = parts[0] || '';
                        const value = parts[1] || '';
                        const rangeFrom = parts[2] || '';
                        const rangeTo = parts[3] || '';

                        // Lookup indicator from VERIFICATION_CONDITIONS
                        const cond = VERIFICATION_CONDITIONS.default.VERIFICATION_CONDITIONS[conditionKey];
                        const indicator = cond ? cond.indicator : conditionKey;

                        // Return a formatted string to render
                        if (conditionKey === 'INCLUSIVE_RANGE' || conditionKey === 'EXCLUSIVE_RANGE') {
                            return `${rangeFrom} ${indicator} ${rangeTo}`;
                        } else if (conditionKey === 'RECORD' || conditionKey === 'NOT_PRESENT') {
                            return indicator; // no extra value
                        } else {
                            return `${indicator} ${value}`;
                        }
                    }

                    // Normal case
                    return input.value !== undefined ? input.value : '___________';
                }

                // Then check outputs
                const output = this.outputs.find(o => o.name === fieldName);
                if (output) {
                    if (output.type === 'FILE' && output.value) {
                        // return safe HTML link
                        return `<a href="${output.value}" target="_blank">${output.value}</a>`;
                    }
                    return output.value !== undefined ? output.value : '___________';
                }

                return '___________';
            },
            // TODO: this function is duplicated in CustomScriptEntry.vue. Consider consolidation.
            renderTemplate(template) {       
                return template.replace(/{([^}]+)}/g, (_, fieldExpr) => {
                    // Match: fieldName[index]
                    // eslint-disable-next-line no-useless-escape
                    const match = fieldExpr.match(/^([^\[\]]+)(?:\[(\d+)\])?$/);
                    if (!match) return '___________'; // fallback if pattern unexpected

                    const fieldName = match[1];             // e.g. "name"
                    const indexStr = match[2];              // e.g. "0" or undefined
                    const value = this.getFieldValue(fieldName);
                    
                    // If index provided and value is iterable/array-like
                    if (indexStr !== undefined) {
                        const index = parseInt(indexStr, 10);
                        if (typeof value === 'string') {
                            const parts = value.split(',').map(s => s.trim()); // split by comma and trim spaces
                            return parts[index] !== undefined ? parts[index] : '___________';
                        } else if (Array.isArray(value)) {
                            return value[index] !== undefined ? value[index] : '___________';
                        } else {
                            return '___________';
                        }
                    }
                    return value;
                });
            },
            getInputByName(fieldName) {
                // First try to find a matching input
                const input = this.inputs.find(i => i.name === fieldName);
                if (input) return input;

                // If not found, look for a matching output
                return this.outputs.find(o => o.name === fieldName);
            },
            getEntryFieldLabel(fieldName) {
                // Look up the display label configured on the advanced layout for entry
                // fields (same label used by AdvancedLayoutField/CustomScriptInputArg),
                // falling back to the raw field name if no label is configured.
                for (const layoutItem of this.advancedLayout) {
                    if (layoutItem.entry !== 'TRUE') continue;
                    const headerFields = (layoutItem.header && layoutItem.header.headerlayout) || [];
                    const contentFields = (layoutItem.content && layoutItem.content.contentlayout) || [];
                    const field = [...headerFields, ...contentFields].find(f => f.field_name === fieldName);
                    if (field && field.label && field.label.label_content) {
                        return field.label.label_content;
                    }
                }
                return fieldName;
            },
            getInputIndexByName(fieldName) {
                // First look in the inputs collection
                const inputIdx = this.inputs.findIndex(i => i.name === fieldName);
                if (inputIdx !== -1) {
                    return inputIdx;
                }

                // If not found, also look in the outputs collection
                const outputIdx = this.outputs.findIndex(o => o.name === fieldName);
                // Return the output index (or -1 if still not found)
                return outputIdx;
            },
            isOutputField(fieldName) {
                return this.outputs.some(o => o.name === fieldName);
            },
            generateIconTooltip(elements) {
                if (!Array.isArray(elements)) return '';
                return elements.map(el => {
                    const label = el.display_name || el.field_name;
                    const value = this.getFieldValue(el.field_name);
                    return `${label}: ${value}`;
                }).join('<br>');
            },
            getGroupedHeaderLayout(headerlayout) {
                const groups = {};
                const items = Array.isArray(headerlayout) ? headerlayout : [];

                // Attach default values
                const normalized = items.map(item => {
                    const layout = (item && item.layout) || {};
                    return {
                        ...item,
                        layout: {
                            row: layout.row || 1,
                            column: layout.column || 1,
                            width: layout.width || 12,
                            height: layout.height || 1,
                            align: layout.align || 'LEFT',
                        }
                    };
                });

                // Group by row
                normalized.forEach(item => {
                    const row = item.layout.row;
                    if (!groups[row]) groups[row] = [];
                    groups[row].push(item);
                });

                // Determine full row range
                const allRows = normalized.map(item => item.layout.row);
                const minRow = Math.min(...allRows);
                const maxRow = Math.max(...allRows);

                // Fill in missing/empty rows
                for (let row = minRow; row <= maxRow; row++) {
                    if (!groups[row]) groups[row] = [];
                }

                // Sort and compute offset per row
                Object.keys(groups).forEach(rowKey => {
                    const row = groups[rowKey];
                    row.sort((a, b) => a.layout.column - b.layout.column);

                    let lastEnd = 0;
                    row.forEach(item => {
                        const offset = Math.max(item.layout.column - (lastEnd + 1), 0);
                        item._offset = offset;
                        lastEnd = item.layout.column + item.layout.width - 1;
                    });
                });

                // Return ordered array of rows
                return Array.from({ length: maxRow - minRow + 1 }, (_, i) => {
                    const row = i + minRow;
                    return groups[row];
                });
            },
            getColumnWidthStyle(resultItem, columnWeight) {
                const hasMouseover = resultItem.mouseover && resultItem.mouseover.mouseover_elements.length > 0;
                const scale = hasMouseover ? 95 : 100; 
                const percentWidth = (columnWeight / 12) * scale;
                return `${percentWidth.toFixed(2)}%`;
            },
            renderRowTemplate(template, row) {
                if (!template) return '';
                return String(template).replace(/{([^}]+)}/g, (_, fieldName) => {
                    // if field not found, fallback to underline as you used before
                    return (row && row[fieldName] !== undefined && row[fieldName] !== null) ? row[fieldName] : '___________';
                });
            },
            getMouseoverData(row, resultItem) {
                if (!resultItem || !resultItem.mouseover || !resultItem.mouseover.mouseover_elements) {
                    return [];
                }

                return resultItem.mouseover.mouseover_elements.map(el => {
                    const label = el.display_name || el.field_name;
                    const value = (row && row[el.field_name] !== undefined && row[el.field_name] !== null)
                        ? row[el.field_name]
                        : '___________';
                    return { label, value };
                });
            },
            resultSegments(layoutItem) {
                const items = (layoutItem.results && layoutItem.results.resultslayout) || [];
                const segs = [];
                let buffer = [];

                for (const it of items) {
                    if (it.layout_type === 'TABLE') {
                        if (buffer.length) {
                            segs.push({ type: 'NON_TABLE', items: buffer });
                            buffer = [];
                        }
                        segs.push({ type: 'TABLE', item: it });
                    } else {
                        buffer.push(it);
                    }
                }
                if (buffer.length) segs.push({ type: 'NON_TABLE', items: buffer });

                return segs;
            }

        }
    };
</script>

<style scoped>
    span.glyphicon {
        float: right;
        font-size: 18px;
        opacity: 0.7;
    }
</style>

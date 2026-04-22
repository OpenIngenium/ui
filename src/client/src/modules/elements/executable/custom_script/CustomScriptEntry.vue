// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// The extended component is registered as "custom-script-entry" in execution.js, etc.

<template>
    <div>
         <!-- BACKWARD COMPATIBILITY OLD STYLE-->
        <div v-if="isLevelTwoDetail && !isAdvancedLayout">
            <div class="dynamic-element">
                <div @dblclick="toggleViewLevelTwoThree" v-drag-and-drop="{ disabled: canEditElement, elemId: elementId, entryIndex: index, draggableType: 'entry' }" class="step-draggable">
                    <div class="row data-bar-element condensed">
                        <div class="col-xs-8">
                            <span v-for="(entry_input, idx) in entry_inputs"
                                :key="idx">
                                - {{ entry_input.name }}: <span :class="modStyle(elementId, `entries.${index}.${entry_input.name}`)">{{ entry_input.value }}</span><br>
                            </span>
                        </div>
                        <div v-if="!isAuthoring" class="col-xs-4" style="justify-content: right">
                           {{ actual_value ? `${display_field_name}: ${actual_value}` : "___________" }}
                        </div>
                        <div class="col-xs-4" style="justify-content: right">
                            <ing-popover placement="bottom" v-if="getBoolElementKey('executed')">
                                <template slot="title">Entry Outputs</template>
                                <ul slot="body" style="width: 300px">
                                    <li v-for="({name, value}, idx) in entry_outputs" :key="idx" style="word-break: break-all;">
                                        <span class="result-key">{{ name }}</span>:&nbsp;<span class="result-value">{{ value }}</span>
                                    </li>
                                </ul>
                                <execution-status-check
                                    :executed="getBoolElementKey('executed')"
                                    :status="getExecutionResultsEntryKey('verification_status', String)"
                                    component-type="entry">
                                </execution-status-check>
                            </ing-popover>
                        </div>
                    </div>
                </div>
                <!--OLD STYLE-->
                <div v-if="isLevelThreeDetail" class="edit-container">
                    <div class="row" style="padding-bottom:15px;">
                        <div class="col-xs-12">
                            <div class="row">
                                <div class="col-xs-3">
                                    <b>Name</b>
                                </div>
                                <div class="col-xs-6">
                                    <b>Description</b>
                                </div>
                                <div class="col-xs-3">
                                    <b>Input</b>
                                </div>
                            </div>
                            <CustomScriptInputArg
                                v-for="(entry_input, idx) in entry_inputs"
                                v-on:updateArgEvent="updateEntryArgEvent"
                                :disableFields="disableFields"
                                :canDisableExecuteField="canDisableExecuteField"
                                :key="idx"
                                :isEntry="true"
                                :index="idx"
                                :mode="pageMode"
                                :r4s="false"
                                :arg="entry_input"
                                :inputClasses="modStyle(elementId, `entries.${index}.${entry_input.name}`)"
                            >
                            </CustomScriptInputArg>
                        </div>
                    </div>

                    <custom-script-entry-outputs
                        v-if="!isAuthoring"
                        :element-id="elementId"
                        :index="index"
                        :mode="mode">
                    </custom-script-entry-outputs>
                </div>
                <!---->
            </div>
        </div>
        <!-- NEW STYLE-->
        
        <div v-for="(layoutItem, layoutIndex) in advancedLayout" :key="layoutIndex">
            <div v-if="isLevelTwoDetail &&  layoutItem.entry==='TRUE'">
                <div class="dynamic-element" v-if="layoutItem.header || layoutItem.content">
                    <!--ADVANCED HEADER-->
                    <div v-if="layoutItem.header" @dblclick="toggleViewLevelTwoThree" v-drag-and-drop="{ disabled: canEditElement, elemId: elementId, entryIndex: index, draggableType: 'entry' }" class="step-draggable">
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
                                        :isRunForScore="false"
                                        :executed="executed"
                                        :enableExecution="enableExecution"
                                        :outputs="entry_outputs"
                                        :isEntry="true"

                                        :modStyle="modStyle"
                                        :getInputByName="getInputByName"
                                        :getInputIndexByName="getInputIndexByName"
                                        :isOutputField="isOutputField"
                                        :renderTemplate="renderTemplate"
                                        :generateIconTooltip="generateIconTooltip"
                                        :getExecutionResultsEntryKey="getExecutionResultsEntryKey"

                                        @updateArgEvent="updateEntryArgEvent"
                                    ></AdvancedLayoutField>
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <!--ADVANCED CONTENT SINGLE ENTRY-->
                    <div v-if="isLevelThreeDetail && layoutItem.content" class="edit-container">
                        <div class="row" style="padding-bottom:15px;">
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
                                        :isRunForScore="false"
                                        :executed="executed"
                                        :enableExecution="enableExecution"
                                        :outputs="entry_outputs"
                                        :isEntry="true"

                                        :modStyle="modStyle"
                                        :getInputByName="getInputByName"
                                        :getInputIndexByName="getInputIndexByName"
                                        :isOutputField="isOutputField"
                                        :renderTemplate="renderTemplate"
                                        :generateIconTooltip="generateIconTooltip"
                                        :getExecutionResultsEntryKey="getExecutionResultsEntryKey"

                                        @updateArgEvent="updateEntryArgEvent"
                                    ></AdvancedLayoutField>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>  
                <!-- ADVANCED RESULT -->
                <div
                    v-if="isLevelThreeDetail && layoutItem.results && executed && !isStepPending"
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
                                        <tr v-for="(row, rIdx) in entryOutputArrayRows" :key="rIdx">
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
                                <AdvancedLayoutField
                                    v-for="(field, fieldIndex) in fields"
                                    :key="`field-${layoutIndex}-${sIdx}-${rowNum}-${fieldIndex}`"
                                    :field="field"
                                    :element-id="elementId"
                                          
                                    :disableFields="disableFields"
                                    :canDisableExecuteField="canDisableExecuteField"
                                    :pageMode="pageMode"
                                    :isRunForScore="false"
                                    :executed="executed"
                                    :enableExecution="enableExecution"
                                    :outputs="entry_outputs"
                                    :isEntry="false"
                                          
                                    :modStyle="modStyle"
                                    :getInputByName="getInputByName"
                                    :getInputIndexByName="getInputIndexByName"
                                    :isOutputField="isOutputField"
                                    :renderTemplate="renderTemplate"
                                    :generateIconTooltip="generateIconTooltip"
                                    :getExecutionMetaDataKey="getExecutionMetaDataKey"
                                          
                                    @updateArgEvent="updateEntryArgEvent"
                                ></AdvancedLayoutField>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</template>

<script>
    import CustomScriptInputArg from "./CustomScriptInputArg.vue";
    import { mapGetters, mapActions } from "vuex";
    import AdvancedLayoutField from "./AdvancedLayoutField.vue";
    let VERIFICATION_CONDITIONS = require("../../../common/verification-conditions");
    export default {
        name: "CustomScriptEntry",
        components: {
            CustomScriptInputArg,
            AdvancedLayoutField
        },
        data() {
            return {
                showChannelModal: false
            };
        },
        computed: { 
            ...mapGetters([
                "executionInputKey",
                "executionInputEntryKey",
                "modStyle",
                "execution"
            ]),
            display_field_name: {
                get() {
                    // Note: this is currently not used 
                    const display_field = this.executionInputEntryKey(this.elementId, this.index, "display_field");
                    return display_field ? display_field : '';
                }
            },            
            actual_value: {
                get() {
                    const executed = this.getBoolElementKey('executed');                 
                    const display_field = this.executionResultsEntryKey(this.elementId, this.index, "display_field");
                    
                    if (executed && display_field) {
                        const entry_outputs = this.executionResultsEntryKey(this.elementId, this.index, "entry_outputs");

                        if (entry_outputs) {
                            for (let i=0; i < entry_outputs.length; i++) {
                                if (entry_outputs[i].name === display_field) {
                                    return entry_outputs[i].value;
                                }
                            }
                        }                        
                    }
                    return '';
                }
            },
            entry_inputs: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "entry_inputs");
                }
            },
            entry_outputs: {
                get() {
                    return this.getBoolElementKey('executed')
                        ? this.executionResultsEntryKey(this.elementId, this.index, "entry_outputs") 
                        : this.executionInputEntryKey(this.elementId, this.index, "entry_outputs");
                }
            },
            entry_output_array: {
                get() {
                    return this.getBoolElementKey('executed')
                        ? this.executionResultsEntryKey(this.elementId, this.index, "entry_output_array") 
                        : this.executionInputEntryKey(this.elementId, this.index, "entry_output_array");
                }
            },
            pageMode() {
                return this.mode;
            },
            verificationStatus: {
                get() {
                    return this.executionResultsEntryKey(this.elementId, this.index, "verification_status") === "PASS"
                        ? ["pass", "glyphicon", "glyphicon-ok"]
                        : ["fail", "glyphicon", "glyphicon-remove"];
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
            entryOutputArrayRows() {
                const cols = (this.entry_output_array && this.entry_output_array.outputs) ? this.entry_output_array.outputs : []; // array of column descriptors
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
            verificationConditionIndicator: function() {
                return this.verificationCondition ? this.verificationConditions[this.verificationCondition].indicator : "";
            },
            isStepPending: function() {
                return this.execution.status === 'RUNNING' || this.execution.status === 'PAUSED';
            },
            executed: function() {
                return this.getBoolElementKey('executed'); 
            }
        },
        methods: { 
            ...mapActions([
                "editCustomScriptEntryInput"
            ]),
            updateEntryArgEvent: function(payload) {
                if(payload.action == "updateArg") {
                    this.editCustomScriptEntryInput({
                        elementId: this.elementId,
                        entry_index: this.index,
                        input_index: payload.data.index,
                        key: 'value',
                        value: payload.data.argumentValue
                    });
                    this.save();
                }
            },
            getFieldValue(fieldName) {
                // First check inputs
                const input = this.entry_inputs.find(i => i.name === fieldName);
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
                const output = this.entry_outputs.find(o => o.name === fieldName);
                if (output) {
                    if (output.type === 'FILE' && output.value) {
                        // return safe HTML link
                        return `<a href="${output.value}" target="_blank">${output.value}</a>`;
                    }
                    return output.value !== undefined ? output.value : '___________';
                }


                // Fallback to empty string
                return '___________';
            },
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
                const input = this.entry_inputs.find(i => i.name === fieldName);
                if (input) return input;

                // If not found, look for a matching output
                return this.entry_outputs.find(o => o.name === fieldName);
            },
            getInputIndexByName(fieldName) {
                // First look in the inputs collection
                const inputIdx = this.entry_inputs.findIndex(i => i.name === fieldName);
                if (inputIdx !== -1) {
                    return inputIdx;
                }

                // If not found, also look in the outputs collection
                const outputIdx = this.entry_outputs.findIndex(o => o.name === fieldName);
                // Return the output index (or -1 if still not found)
                return outputIdx;
            },
            isOutputField(fieldName) {
                return this.entry_outputs.some(o => o.name === fieldName);
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
        },

    };
</script>

<style scoped>

    .required-field {
        display: inline;
    }

    .error {
        background-color: orangered;
    }
    span.glyphicon {
        float: right;
        font-size: 18px;
        opacity: 0.7;
    }

</style>

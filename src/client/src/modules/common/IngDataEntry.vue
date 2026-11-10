<template>
    <ing-modal v-show="showModal" @close="handleClose()" size="large">
        <template slot="title">
            <ing-data-grid-info :elementId="elementId"></ing-data-grid-info>
        </template>
        <template slot="body">
            <ing-data-grid
                ref="grid"
                class="ing-data-entry-grid"
                :columns="gridColumns"
                :height="500"
                :word-wrap="true"
                :fill-handle="true"
                :context-menu-items="contextMenuItems"
                :default-row="columnDefaultValues()"
                @before-change="beforeChangeCallback"
                @after-change="afterChangeCallback"
                @after-create-row="afterCreateRowCallback"
                @after-remove-row="afterRemoveRowCallback"
                @context-menu-paste="handleContextMenuPaste"></ing-data-grid>
        </template>

        <template slot="footer">
            <button type="button" :disabled="!editMode" class="btn btn-primary pull-left" @click="handleSave()">Save</button>
            <button type="button" class="btn btn-secondary pull-left" @click="handleClose()">Cancel</button>
        </template>
    </ing-modal>
</template>

<script>
    import _ from "lodash";
    import IngModal from "./IngModal.vue";
    import IngDataGridInfo from "./IngDataGridInfo.vue";
    import IngDataGrid from "./IngDataGrid.vue";
    import { GridColumnType, GridSource, ContextMenuItem, INVALID_CELL_CLASS } from "./grid/grid-constants";
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "IngDataEntry",
        components: {
            'ing-data-grid': IngDataGrid,
            'ing-modal': IngModal,
            'ing-data-grid-info': IngDataGridInfo
        },
        watch: {
            showModal: function(newVal) {
                if (newVal) {
                    // prevent scroll
                    this.toggleBodyClass('addClass', 'modal-open');
                } else {
                    // allow scroll
                    this.toggleBodyClass('removeClass', 'modal-open');
                }
                
                if (newVal) {
                    this.gridRef = this.$refs.grid;

                    // clone data so as not to change state in step itself yet
                    let vals = _.cloneDeep(this.gridData);

                    //console.log('vals init');
                    //console.log(JSON.stringify(vals, 0, 2));
                    const orangeFields = [];
                    for (const [idx, val] of vals.entries()) {
                        let isEmptyRow = val.every(v => v === null || v === undefined);
                        if (isEmptyRow) {
                            for (let i=0; i < val.length; i++) {
                                // set to empty string to avoid highlighting cells in an empty row
                                val[i] = '';
                            }
                        }
                        for (const [i, v] of val.entries()) {
                            let columnInfo = this.columnInfos[i];

                            if (columnInfo.executionOnly === false || this.mode !== 'authoring') {
                                // telemPart/verificationPart/verificationValuePart are opt-in flags that a
                                // columnInfos source sets to split a single stored value across multiple grid
                                // columns. They're a no-op for every IngDataEntry consumer that doesn't set
                                // them, since columnInfo.telemPart etc. is simply undefined for those columns.
                                // - telemPart/verificationPart: custom script only (CustomScriptElement.vue)
                                // - verificationValuePart: WaitEha/VerifyEha/Bus1553/ManualInput only
                                let cellSource = v;
                                if (columnInfo.telemPart) {
                                    // FLIGHT_TELEM/SIM_TELEM entry_inputs store a single "id,name" value -
                                    // split it so the ID/Name columns each get their own half
                                    const [telemId = "", telemName = ""] = (v || "").split(",");
                                    cellSource = columnInfo.telemPart === 'id' ? telemId : telemName;
                                } else if (columnInfo.verificationPart) {
                                    // VERIFICATION_COND entry_inputs store a single "condition,value,range1,range2"
                                    // value - split it so the Condition/Verify Value 1/Verify Value 2 columns each
                                    // get their own piece
                                    const [condition = "RECORD", value = "", range1 = "", range2 = ""] = (v || "").split(",");
                                    const isRangeCondition = condition === "INCLUSIVE_RANGE" || condition === "EXCLUSIVE_RANGE";
                                    if (columnInfo.verificationPart === 'condition') {
                                        cellSource = condition;
                                    } else if (columnInfo.verificationPart === 'value1') {
                                        cellSource = isRangeCondition ? range1 : value;
                                    } else {
                                        cellSource = range2;
                                    }
                                } else if (columnInfo.verificationValuePart) {
                                    // verification_values is stored as an array, joined to a comma string by
                                    // executionInputEntriesArrayFilter ("" / "v1" / "v1,v2") - split it so Verify
                                    // Value 1/2 each get their own piece
                                    const [value1 = "", value2 = ""] = (v || "").split(",");
                                    cellSource = columnInfo.verificationValuePart === 'value1' ? value1 : value2;
                                }
                                const {validated, cellValue} = this.validateCell(columnInfo, cellSource, val);
                                let valueChanged = cellValue !== v;
                                //console.log(`init idx: ${idx} i: ${i} validated: ${validated} cellValue: ${cellValue} type: ${typeof cellValue} valueChanged: ${valueChanged}`);

                                if(!validated) {
                                    orangeFields.push(`${idx},${i}`);
                                }
                                val[i] = cellValue;
                            }
                        }                  
                    }
               
                    //console.log('vals init load');
                    //console.log(JSON.stringify(vals, 0, 2));
                    this.gridRef.loadData(vals);
                    this.$nextTick(function() {
                        for (const field of orangeFields) {
                            const indices = field.split(',');
                            this.gridRef.setCellClassName(parseInt(indices[0], 10), parseInt(indices[1], 10), INVALID_CELL_CLASS);
                        }                        
                        this.gridRef.refresh();
                        this.gridRef.selectCell(0,0);
                    });
                    
                    // initialize allowed values if column sync is defined
                    for (const [icol, columnInfo] of this.columnInfos.entries()) {
                        if (columnInfo.hasOwnProperty('sync')) {
                            const targetIndex = columnInfo.sync.index;
                            for (let irow = 0; irow < this.gridRef.countRows(); irow++) {
                                const cellValue = this.gridRef.getDataAtCell(irow, icol);
                                const allowedValues = columnInfo.sync.allowedValues[cellValue];
                                if (allowedValues) {
                                    this.gridRef.setCellSource(irow, targetIndex, allowedValues);
                                }
                            }
                        }
                    }
                }
            },
            disableFields: function(newVal)
            {
                // Toggling this prop locks every column, including the execution-only ones that
                // otherwise follow canDisableExecuteField.
                this.forcedReadOnly = newVal;
            }
        },
        props: {
            elementId: {
                required: true,
                type: String
            },
            showModal: {
                type: Boolean,
                default: false
            },
            // identifier of table type. Used to change columns when another script is selected for custom script
            tableTypeId: {       
                type: String,
                default: ''
            },            
            mode: {
                type: String,
                required: true
            },
            level: {
                type: Number,
                required: true
            },
            disableFields: {
                type: Boolean,
                required: true
            },
            canDisableExecuteField: {
                type: Boolean,
                required: true
            },
            columnInfos: {
                type: Array,
                required: true
            },
            getterName: {
                type: String,
                default: 'executionInputEntriesArrayFilter'
            },
            methodName: {
                type: String,
                default: 'editEntries'
            }
        },
        methods: {
            ...mapActions([
                "editEntries",
                "editCustomScriptEntries", // To handle entry_inputs of custom script that do not exist in other steps
            ]),
            getTableColumns: function() {
                const columns = [];
                for (const columnInfo of this.filterColumnInfos()) {
                    let column = {
                        header: columnInfo.header,
                        width: columnInfo.width,
                        type: GridColumnType.TEXT,
                        readOnly: columnInfo.executionOnly ?  this.canDisableExecuteField : this.disableFields
                    };
                    
                    if (columnInfo.type === 'integer') {
                        column.type = GridColumnType.NUMERIC;
                    }

                    if (columnInfo.enumValues && columnInfo.enumValues.length > 0) {
                        column.type = GridColumnType.DROPDOWN;
                        column.source = columnInfo.enumValues;
                    }
                    columns.push(column);
                }
                return columns;
            },
            filterColumnInfos: function() {
                const infos = [];
                for (const columnInfo of this.columnInfos) {
                    if (columnInfo.executionOnly === false || this.mode !== 'authoring') {
                        infos.push(columnInfo);
                    }
                }
                return infos;   
            },
            columnNames: function() {
                return this.filterColumnInfos().map(info => info.name);
            },
            columnHeaders: function() {
                return this.filterColumnInfos().map(info => info.header);
            }, 
            columnWidths: function() {
                return this.filterColumnInfos().map(info => info.width);
            },                       
            columnDefaultValues: function() {
                const values = [];
                for (const columnInfo of this.filterColumnInfos()) {
                    if (columnInfo.enumValues && columnInfo.enumValues.length) {
                        if (!columnInfo.enumValues.includes(columnInfo.defaultValue)) {
                            values.push(columnInfo.enumValues[0]);
                            continue;
                        }
                    }
                    // columns with no defaultValue (e.g. flight_channel, verification_cond)
                    // must still get "" here, not undefined - an undefined array element
                    // serializes to null via JSON.stringify, which is what was landing in
                    // entry_inputs values for newly-added rows
                    values.push(columnInfo.defaultValue === undefined ? '' : columnInfo.defaultValue);
                }
                return values;
            },
            columnSize: function() {
                return this.filterColumnInfos().length;
            },
            syncColumnValues: function(cellChangeInfos) {
                for (const cellChangeInfo of cellChangeInfos) {
                    const [irow, icol, oldVal, newVal] = cellChangeInfo;
                    if (this.hasSyncAtIndex(icol)) {
                        // cell value syncs another cell
                        const targetIndex = this.columnInfos[icol].sync.index;
                        const allowedValues = this.columnInfos[icol].sync.allowedValues[newVal];
                        const syncValue = this.gridRef.getDataAtCell(irow, targetIndex);

                        // If sync index value is not contained in sync values, sync it.
                        if (allowedValues && !allowedValues.includes(syncValue)) {
                            // modify the cell metadata & the value
                            this.gridRef.setCellSource(irow, targetIndex, allowedValues);

                            // If newVal is an allowed value, use it.
                            // Otherwise, set it to the first value (this should not happen).
                            if (allowedValues.includes(newVal)) {
                                // silent source keeps this write out of beforeChangeCallback
                                this.gridRef.setDataAtCell(irow, targetIndex, newVal, GridSource.SILENT);
                            } else {
                                this.gridRef.setDataAtCell(irow, targetIndex, allowedValues[0], GridSource.SILENT);
                            }
                        }
                    }
                }
            },
            setValue: function(props) {
                try {
                    // clone data so as not to change state in step itself yet
                    let vals = _.cloneDeep(this.gridRef.getData());
                    //console.log('setValue vals');
                    //console.log(JSON.stringify(vals, 0, 2));

                    let reloadTable = false;
                    let orangeFields = [];

                    if(props.source == GridSource.EDIT) {
                        let valsLengthBefore = vals.length;
                        vals = vals.filter(val => !val.every(element => element === null));
                        let valsLengthAfter = vals.length;
                        if(valsLengthBefore != valsLengthAfter) 
                            reloadTable = true;
                    }

                    // user deleted all rows, make a default row
                    if(vals.length == 0) {
                        vals = [this.columnDefaultValues()];
                        this.gridRef.loadData(vals);
                    } else {
                        for (const [idx, val] of vals.entries()) {
                            let isEmptyRow = val.every(v => v === null || v === undefined);

                            if (!isEmptyRow) {
                                for (const [i, v] of val.entries()) {
                                    // remove any previous orange highlights
                                    // console.log(`clear cell class idx: ${idx} i: ${i}`);
                                    // this.gridRef.setCellClassName(idx, i, '');

                                    let columnInfo = this.columnInfos[i];

                                    if (columnInfo.executionOnly === false || this.mode !== 'authoring') {
                                        const {validated, cellValue} = this.validateCell(columnInfo, v, val);
                                        let valueChanged = cellValue !== v;
                                        //console.log(`idx: ${idx} i: ${i} validated: ${validated} cellValue: ${cellValue} type: ${typeof cellValue} valueChanged: ${valueChanged}`);
                                        if (valueChanged) {
                                            reloadTable = true;
                                        }

                                        if(!validated) {
                                            reloadTable = true;
                                            orangeFields.push(`${idx},${i}`);
                                        }
                                        val[i] = cellValue;
                                    }
                                }
                            } else {
                                const insertRow = this.columnDefaultValues();
                                if(props.setData) {
                                    const selection = this.gridRef.getSelection();
                                    if (props.source === GridSource.ROW_ABOVE) {
                                        this.gridRef.insertRow(selection ? selection.startRow : 0, 'above', insertRow, GridSource.SILENT);
                                    } else if (props.source === GridSource.ROW_BELOW) {
                                        this.gridRef.insertRow(selection ? selection.endRow : 0, 'below', insertRow, GridSource.SILENT);
                                    }

                                }

                                reloadTable = true;
                            }
                        }

                        // load back up fixed data table                 
                        if(reloadTable && props.setData) {
                            this.gridRef.loadData(vals);
                        }
                        // highlights are recomputed on every pass so a cell stops being orange
                        // as soon as its value validates
                        this.$nextTick(function() {
                            this.gridRef.clearCellClassNames();
                            for (const field of orangeFields) {
                                const indices = field.split(',');
                                this.gridRef.setCellClassName(parseInt(indices[0], 10), parseInt(indices[1], 10), INVALID_CELL_CLASS);
                            }
                            this.gridRef.refresh();
                        });
                    }
                } catch(err) {
                    /* eslint-disable */
                    /* eslint-enable */
                }
            },
            toRowObj: function(val) {
                let rowObj = {};
                // telemPart/verificationPart/verificationValuePart are opt-in flags - see the note in
                // the showModal watcher above. The blocks below are no-ops for any IngDataEntry
                // consumer whose columnInfos don't set them.
                //
                // FLIGHT_TELEM/SIM_TELEM entries are split into ID/Name columns for display -
                // gather their halves here so they can be rejoined into the single stored value
                const telemValues = {};
                // VERIFICATION_COND entries are split into Condition/Verify Value 1/Verify Value 2
                // columns for display - gather their pieces here so they can be rejoined into the
                // single "condition,value,range1,range2" stored value
                const verificationValues = {};
                // verification_values (WaitEha/VerifyEha/Bus1553/ManualInput) is split into Verify
                // Value 1/2 columns for display - gather their pieces here so they can be rejoined
                // into the [] / [v1] / [v1,v2] array it's stored as
                const verificationValueParts = {};
                for (const [i, cellValue] of val.entries()) {
                    let columnInfo = this.columnInfos[i];
                    if (columnInfo.executionOnly === false || this.mode !== 'authoring') {

                        if (columnInfo.telemPart) {
                            telemValues[columnInfo.name] = telemValues[columnInfo.name] || {};
                            telemValues[columnInfo.name][columnInfo.telemPart] = cellValue;
                            continue;
                        }

                        if (columnInfo.verificationPart) {
                            verificationValues[columnInfo.name] = verificationValues[columnInfo.name] || {};
                            verificationValues[columnInfo.name][columnInfo.verificationPart] = cellValue;
                            continue;
                        }

                        if (columnInfo.verificationValuePart) {
                            verificationValueParts[columnInfo.name] = verificationValueParts[columnInfo.name] || {};
                            verificationValueParts[columnInfo.name][columnInfo.verificationValuePart] = cellValue;
                            continue;
                        }

                        if(columnInfo.type === 'integer') {
                            rowObj[columnInfo.name] = parseInt(cellValue);
                        } else {
                            rowObj[columnInfo.name] = cellValue;
                        }
                    }
                }
                for (const [name, parts] of Object.entries(telemValues)) {
                    rowObj[name] = `${parts.id || ""},${parts.name || ""}`;
                }
                for (const [name, parts] of Object.entries(verificationValueParts)) {
                    let colIndex = this.filterColumnInfos().findIndex(info => info.name === 'verification_condition');
                    let verificationCondition = colIndex > -1 ? val[colIndex] : '';
                    const value1 = parts.value1 || '';
                    const value2 = parts.value2 || '';

                    if (verificationCondition === 'INCLUSIVE_RANGE' || verificationCondition === 'EXCLUSIVE_RANGE') {
                        rowObj[name] = value2 ? [value1, value2] : [value1];
                    } else if (verificationCondition === 'RECORD' || verificationCondition === 'NOT_PRESENT') {
                        rowObj[name] = [];
                    } else {
                        rowObj[name] = [value1];
                    }
                }
                for (const [name, parts] of Object.entries(verificationValues)) {
                    const condition = parts.condition || "";
                    const isRangeCondition = condition === "INCLUSIVE_RANGE" || condition === "EXCLUSIVE_RANGE";
                    const value = isRangeCondition ? "" : (parts.value1 || "");
                    const range1 = isRangeCondition ? (parts.value1 || "") : "";
                    const range2 = isRangeCondition ? (parts.value2 || "") : "";
                    rowObj[name] = `${condition},${value},${range1},${range2}`;
                }
                return rowObj;
            },
            handleSave: function() {
                let vals = this.gridRef.getData();
                // console.log('handleClose vals');
                // console.log(JSON.stringify(vals, 0, 2));
                let parsedVals = [];
                
                for (const val of vals) {
                    let rowObj = this.toRowObj(val);
                    parsedVals.push(rowObj);
                }

                // console.log('handleClose parsedVals');
                // console.log(JSON.stringify(parsedVals, 0, 2)); 

                this[this.methodName]({elementId: this.elementId, value: parsedVals, level: this.level});
                
                // after updating state, send event to save data in backend
                this.$emit('dataEntryEvent', {
                    type: 'showModal',
                    val: false,
                    save: true
                });
            },            
            handleClose: function() {
                // after updating state, send event to save data in backend
                this.$emit('dataEntryEvent', {
                    type: 'showModal',
                    val: false,
                    save: false
                });
            },
            beforeChangeCallback: async function(cellChangeInfos, source) {
                // cellChangeInfos is an array of arrays. Example:  [[row, col, oldVal, newVal]]
                if (source == GridSource.EDIT || source == GridSource.PASTE || source == GridSource.FILL) {
                    await this.syncColumnValues(cellChangeInfos);
                }
            },
            afterChangeCallback: async function(a, source) {
                if (source == GridSource.EDIT || source == GridSource.PASTE || source == GridSource.FILL) {
                    await this.setValue({
                        setData: true,
                        source
                    });
                }
            },
            afterCreateRowCallback: async function(a, b, source) {
                if (source == GridSource.ROW_ABOVE || source == GridSource.ROW_BELOW) {
                    await this.setValue({
                        setData: true,
                        source
                    });
                }
            },
            afterRemoveRowCallback: async function(idx, amt, source) {
                if(source == GridSource.REMOVE_ROW) {
                    await this.setValue({
                        setData: false,
                        source
                    });
                }
            },
            handleContextMenuPaste: function() {
                // only reached when the browser refuses to hand the clipboard to the page
                alert('Your browser blocked clipboard access. To paste use: Ctrl+V');
            },
            toggleBodyClass(addRemoveClass, className) {
                const el = document.body;

                if (addRemoveClass === 'addClass') {
                    el.classList.add(className);
                } else {
                    el.classList.remove(className);
                }
            },
            validateCell(columnInfo, v, val) {
                let cellValue = columnInfo.defaultValue;
                let validated = true;

                if (v === null) {
                    validated = false;
                    return {validated, cellValue};
                }

                if (columnInfo.type === 'integer') {
                    cellValue = parseInt(v);
                    if (isNaN(cellValue)) {
                        validated = false;
                        console.warn(`cell value is not an integer. column: ${columnInfo.name} type: ${typeof v} value: ${v}`);
                        cellValue = columnInfo.defaultValue;
                    }
                } else if (columnInfo.type === 'float') {
                    cellValue = parseFloat(v);
                    if (isNaN(cellValue)) {
                        validated = false;
                        console.warn(`cell value is not a float. column: ${columnInfo.name} type: ${typeof v} value: ${v}`);
                        cellValue = columnInfo.defaultValue;
                    }
                } else if (columnInfo.type === 'boolean') {
                    let vStr = ('' + v).toLowerCase();
                    if (vStr === 'true') {
                        cellValue = true;
                    } else if (vStr === 'false') {
                        cellValue = false;
                    } else {
                        validated = false;
                        console.warn(`cell value is not a boolean. column: ${columnInfo.name} type: ${typeof v} value: ${v}`);
                        cellValue = columnInfo.defaultValue;
                    }
                } else {
                    if (typeof v === 'string' || v instanceof String) {
                        cellValue = v.trim();
                    } else {
                        validated = false;
                        console.warn(`cell value is not a string. column: ${columnInfo.name} type: ${typeof v} value: ${v}`);
                        cellValue = columnInfo.defaultValue;
                    }
                }

                if (columnInfo.enumValues && columnInfo.enumValues.length > 0) {
                    if (!columnInfo.enumValues.includes(cellValue)) {
                        validated = false;
                        cellValue = columnInfo.enumValues[0];
                    }
                }

                // verificationPart/verificationValuePart are opt-in flags (see the note in the
                // showModal watcher) - both blocks below are no-ops for any IngDataEntry consumer
                // whose columnInfos don't set them. VERIFICATION_COND/verification_values Verify
                // Value 1/2 columns only apply for certain conditions - flag/reset them (instead of
                // hard-disabling) so a cell entered when it's not applicable is highlighted orange.
                if (columnInfo.verificationPart === 'value1' || columnInfo.verificationPart === 'value2') {
                    let colIndex = this.filterColumnInfos().findIndex(info => info.name === columnInfo.name && info.verificationPart === 'condition');
                    let verificationCondition = colIndex > -1 ? val[colIndex] : '';
                    let isRangeCondition = verificationCondition === 'INCLUSIVE_RANGE' || verificationCondition === 'EXCLUSIVE_RANGE';
                    let isApplicable = columnInfo.verificationPart === 'value1'
                        ? (verificationCondition !== 'RECORD' && verificationCondition !== 'NOT_PRESENT')
                        : isRangeCondition;

                    if (!isApplicable && cellValue != columnInfo.defaultValue) {
                        validated = false;
                        cellValue = columnInfo.defaultValue;
                    }
                }

                if (columnInfo.verificationValuePart === 'value1' || columnInfo.verificationValuePart === 'value2') {
                    let colIndex = this.filterColumnInfos().findIndex(info => info.name === 'verification_condition');
                    let verificationCondition = colIndex > -1 ? val[colIndex] : '';
                    let isRangeCondition = verificationCondition === 'INCLUSIVE_RANGE' || verificationCondition === 'EXCLUSIVE_RANGE';
                    let isApplicable = columnInfo.verificationValuePart === 'value1'
                        ? (verificationCondition !== 'RECORD' && verificationCondition !== 'NOT_PRESENT')
                        : isRangeCondition;

                    if (!isApplicable && cellValue != columnInfo.defaultValue) {
                        validated = false;
                        cellValue = columnInfo.defaultValue;
                    }
                }

                return {validated, cellValue};
            },
            hasSyncAtIndex(idx) {
                return this.columnInfos[idx].hasOwnProperty('sync');
            }
        },
        data() {
            return {
                changedCells: [],
                forcedReadOnly: null
            };
        },
        computed: {
            ...mapGetters([
                "executionInputEntriesArrayFilter",
                "executionInputCustomScriptEntriesArrayFilter",
                "editMode",
            ]),
            gridColumns: function() {
                const columns = this.getTableColumns();
                if (this.forcedReadOnly !== null) {
                    columns.forEach(column => {
                        column.readOnly = this.forcedReadOnly;
                    });
                }
                return columns;
            },
            contextMenuItems: function() {
                if (this.disableFields) {
                    return [ContextMenuItem.COPY];
                }
                return [
                    ContextMenuItem.ROW_ABOVE,
                    ContextMenuItem.ROW_BELOW,
                    ContextMenuItem.REMOVE_ROW,
                    ContextMenuItem.COPY,
                    ContextMenuItem.PASTE,
                    ContextMenuItem.CUT
                ];
            },
            gridData: function() {
                return this[this.getterName](this.elementId, this.columnNames());
            }
        }
    };
</script>

<style>

    .orange-bg {
        background-color: orange !important;
    }

    body.modal-open {
        overflow: hidden;
    }
</style>

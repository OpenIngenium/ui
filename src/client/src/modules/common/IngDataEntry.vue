<template>
    <ing-modal v-show="showModal" @close="handleClose()" size="large">
        <template slot="title">
            <ing-data-grid-info :elementId="elementId"></ing-data-grid-info>
        </template>
        <template slot="body">
            <hot-table
                class="hot-table"
                :key="componentKey"
                :settings="hotSettings"
                ref="myTable"></hot-table>
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
    import { HotTable } from '@handsontable/vue';
    import Handsontable from 'handsontable';
    import { registerAllModules } from 'handsontable/registry';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: "IngDataEntry",
        components: {
            HotTable,
            'ing-modal': IngModal,
            'ing-data-grid-info': IngDataGridInfo
        },
        created() {
            registerAllModules();
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
                    this.hotRef = this.$refs.myTable.hotInstance;

                    this.hotRef.addHook('beforeChange', this.beforeChangeCallback);
                    this.hotRef.addHook('afterChange', this.afterChangeCallback);
                    this.hotRef.addHook('afterCreateRow', this.afterCreateRowCallback);
                    this.hotRef.addHook('afterRemoveRow', this.afterRemoveRowCallback);
                    
                    // clone data so as not to change state in step itself yet
                    let vals = _.cloneDeep(this.hotData);

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
                                const {validated, cellValue} = this.validateCell(columnInfo, v, val);
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
                    this.hotRef.loadData(vals);
                    this.$nextTick(function() {
                        for (const field of orangeFields) {
                            const indices = field.split(',');
                            this.hotRef.setCellMeta(indices[0], indices[1], 'className', 'orange-bg');
                        }                        
                        this.hotRef.render();
                        this.hotRef.selectCell(0,0);
                    });
                    
                    // initialize allowed values if column sync is defined
                    for (const [icol, columnInfo] of this.columnInfos.entries()) {
                        if (columnInfo.hasOwnProperty('sync')) {
                            const targetIndex = columnInfo.sync.index;
                            for (let irow = 0; irow < this.hotRef.countRows(); irow++) {
                                const cellValue = this.hotRef.getDataAtCell(irow, icol);
                                const allowedValues = columnInfo.sync.allowedValues[cellValue];
                                if (allowedValues) {
                                    this.hotRef.setCellMeta(irow, targetIndex, 'source', allowedValues);
                                }
                            }
                        }
                    }

                } else {
                    this.hotRef.removeHook('beforeChange', this.beforeChangeCallback);
                    this.hotRef.removeHook('afterChange', this.afterChangeCallback);
                    this.hotRef.removeHook('afterCreateRow', this.afterCreateRowCallback);
                    this.hotRef.removeHook('afterRemoveRow', this.afterRemoveRowCallback);
                }
            },
            tableTypeId: function(newVal) {
                const columns = this.getTableColumns();

                let updatedSettings = {
                    columns: columns, 
                    colHeaders: this.columnHeaders(), 
                    colWidths: this.columnWidths(), 
                    maxCols: this.columnSize()
                };
                this.hotSettings = { ...this.hotSettings, ...updatedSettings };
            },            
            disableFields: function(newVal)
            {
                // After investigation it appears that the data binding inside the hottable component
                // is not dynamic for readonly of columns. As a result we had to use this rerender trick for hottable
                // by changing the component key (see https://michaelnthiessen.com/force-re-render/)
                this.hotSettings.columns.forEach(column => {
                    column.readOnly = newVal;
                });
                this.hotSettings.contextMenu.items = !newVal ? {
                    'row_above': { },
                    'row_below': { },
                    'remove_row': { },
                    'copy': {},
                    'paste': { key: 'paste', name: 'Paste' },
                    'cut': {},
                } : { 'copy': {} };
                this.componentKey += 1;
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
                        readOnly: columnInfo.executionOnly ?  this.canDisableExecuteField : this.disableFields
                    };
                    
                    if (columnInfo.type === 'integer') {
                        column.type = Handsontable.cellTypes.numeric;
                    }

                    if (columnInfo.enumValues && columnInfo.enumValues.length > 0) {
                        column.type = Handsontable.cellTypes.dropdown;
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
                    values.push(columnInfo.defaultValue);
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
                        const syncValue = this.hotRef.getDataAtCell(irow, targetIndex);

                        // If sync index value is not contained in sync values, sync it.
                        if (allowedValues && !allowedValues.includes(syncValue)) {
                            // modify the cell metadata & the value
                            this.hotRef.setCellMeta(irow, targetIndex, 'source', allowedValues);

                            // If newVal is an allowed value, use it.
                            // Otherwise, set it to the first value (this should not happen).
                            if (allowedValues.includes(newVal)) {
                                // use 'ignore' to ignore this event inside beforeChangeCallback
                                this.hotRef.setDataAtCell(irow, targetIndex, newVal, 'ignore');
                            } else {
                                this.hotRef.setDataAtCell(irow, targetIndex, allowedValues[0], 'ignore');
                            }
                        }
                    }
                }
            },
            setValue: function(props) {
                try {
                    // clone data so as not to change state in step itself yet
                    let vals = _.cloneDeep(this.hotRef.getData());
                    //console.log('setValue vals');
                    //console.log(JSON.stringify(vals, 0, 2));

                    let reloadTable = false;
                    let orangeFields = [];

                    if(props.source == "edit") {
                        let valsLengthBefore = vals.length;
                        vals = vals.filter(val => !val.every(element => element === null));
                        let valsLengthAfter = vals.length;
                        if(valsLengthBefore != valsLengthAfter) 
                            reloadTable = true;
                    }

                    // user deleted all rows, make a default row
                    if(vals.length == 0) {
                        vals = [this.columnDefaultValues()];
                        this.hotRef.loadData(vals);
                    } else {
                        for (const [idx, val] of vals.entries()) {
                            let isEmptyRow = val.every(v => v === null || v === undefined);

                            if (!isEmptyRow) {
                                for (const [i, v] of val.entries()) {
                                    // remove any previous orange highlights
                                    // console.log(`removeCellMeta idx: ${idx} i: ${i}`);
                                    // this.hotRef.removeCellMeta(idx, i, 'className');

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
                                    if (props.source === 'ContextMenu.rowAbove') {
                                        const rowIndex = this.hotRef.getSelectedLast()[0];
                                        this.hotRef.alter('insert_row_above', rowIndex);
                                        this.hotRef.populateFromArray(rowIndex, 0, [insertRow]);
                                    } else if (props.source === 'ContextMenu.rowBelow') {
                                        const rowIndex = this.hotRef.getSelectedLast()[2];
                                        this.hotRef.alter('insert_row_below', rowIndex);
                                        this.hotRef.populateFromArray(rowIndex+1, 0, [insertRow]);
                                    }

                                }

                                reloadTable = true;
                            }
                        }

                        // load back up fixed data table                 
                        if(reloadTable) {
                            if(props.setData) {
                                this.hotRef.loadData(vals);
                            }
                            this.$nextTick(function() {
                                for (const field of orangeFields) {
                                    const indices = field.split(',');
                                    this.hotRef.setCellMeta(indices[0], indices[1], 'className', 'orange-bg');
                                }
                                this.hotRef.render();
                            });
                        }
                    }
                } catch(err) {
                    /* eslint-disable */
                    /* eslint-enable */
                }
            },
            toRowObj: function(val) {
                let rowObj = {};
                for (const [i, cellValue] of val.entries()) {
                    let columnInfo = this.columnInfos[i];
                    if (columnInfo.executionOnly === false || this.mode !== 'authoring') {

                        if (columnInfo.name === "verification_values") {
                            let colIndex = this.filterColumnInfos().findIndex(info => info.name === 'verification_condition');
                            let verificationCondition = colIndex > -1 ? val[colIndex] : '';
                            if (verificationCondition === 'INCLUSIVE_RANGE' || verificationCondition === 'EXCLUSIVE_RANGE') {
                                const segs = cellValue.split(',').map(seg => seg.trim());
                                if (segs.length == 1) {
                                    rowObj[columnInfo.name] = [
                                        segs[0]
                                    ];
                                } else {
                                    rowObj[columnInfo.name] = [
                                        segs[0], segs[1]
                                    ];
                                }
                            } else if (verificationCondition === 'RECORD' || verificationCondition === 'NOT_PRESENT') {
                                rowObj[columnInfo.name] = [];
                            } else {
                                rowObj[columnInfo.name] = [cellValue];
                            }
                        } else {
                            if(columnInfo.type === 'integer') {
                                rowObj[columnInfo.name] = parseInt(cellValue);
                            } else {
                                rowObj[columnInfo.name] = cellValue;
                            }
                        }
                    }
                }
                return rowObj;
            },
            handleSave: function() {
                let vals = this.hotRef.getData();
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
                // cellChangeInfos is an array of arrays. Example:  [[row, prop, oldVal, newVal]]
                // source = edit, etc...
                if (source == 'edit' || source == 'CopyPaste.paste' || source == 'Autofill.fill') {
                    await this.syncColumnValues(cellChangeInfos);
                }
            },
            afterChangeCallback: async function(a, source) {
                if (source == 'edit' || source == 'CopyPaste.paste' || source == 'Autofill.fill') {
                    await this.setValue({
                        setData: true,
                        source
                    });
                }
            },
            afterCreateRowCallback: async function(a, b, source) {
                if (source == 'ContextMenu.rowAbove' || source == 'ContextMenu.rowBelow') {
                    await this.setValue({
                        setData: true,
                        source
                    });
                }
            },
            afterRemoveRowCallback: async function(idx, amt, rows, source) {
                if(source == 'ContextMenu.removeRow') {
                    await this.setValue({
                        setData: false,
                        source
                    });
                }
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

                if (columnInfo.name === "verification_values") {
                    let colIndex = this.filterColumnInfos().findIndex(info => info.name === 'verification_condition');
                    let verificationCondition = colIndex > -1 ? val[colIndex] : '';
                    if (verificationCondition === 'RECORD' || verificationCondition === 'NOT_PRESENT') {
                        if (cellValue != columnInfo.defaultValue) {
                            validated = false;
                            cellValue = columnInfo.defaultValue;
                        }
                    }
                }

                return {validated, cellValue};
            },
            hasSyncAtIndex(idx) {
                return this.columnInfos[idx].hasOwnProperty('sync');
            }
        },
        data() {
            const columns = this.getTableColumns();

            const dataInit = {
                componentKey: 0,
                changedCells: [],
                hotSettings: {
                    data: [this.columDefaultValues],
                    colHeaders: this.columnHeaders(),
                    colWidths: this.columnWidths(),
                    rowHeaders: false,
                    copyPaste: true,
                    fillHandle: {
                        autoInsertRow: false
                    },
                    wordWrap: true,
                    columns: columns,
                    comments: false,
                    width: 1100,
                    height: 500,
                    contextMenu: {
                        callback: function(key, options, clickEvent) {
                            if(key == 'paste') {
                                alert('To paste use: Ctrl+V');
                            }
                        },
                        items: !this.disableFields ? {
                            'row_above': { },
                            'row_below': { },
                            'remove_row': { },
                            'copy': {},
                            'paste': { key: 'paste', name: 'Paste' },
                            'cut': {},
                        } : { 'copy': {} }
                    },
                    maxCols: this.columnSize(),
                    stretchH: 'all',
                    manualColumnResize: true,
                    licenseKey: '4a9e0-a0c70-d93d0-93230-14237'
                }
            };       
            return dataInit;
        },
        computed: {
            ...mapGetters([
                "executionInputEntriesArrayFilter",
                "executionInputCustomScriptEntriesArrayFilter",
                "editMode",
            ]),
            hotData: function() {
                return this[this.getterName](this.elementId, this.columnNames());
            }
        }
    };
</script>

<style>

    @import '~handsontable/dist/handsontable.full.css';

    .htMenu {
        z-index: 214748364 !important;
    }

    td.orange-bg {
        background-color: orange !important;
    }

    body.modal-open {
        overflow: hidden;
    }
</style>

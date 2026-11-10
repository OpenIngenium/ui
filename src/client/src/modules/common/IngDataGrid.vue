<template>
    <div class="ing-data-grid" :style="containerStyle">
        <div class="ing-data-grid-table" ref="table"></div>
        <div
            v-show="showFillPreview"
            class="ing-data-grid-fill-preview"
            :style="fillPreviewStyle"></div>
        <div
            v-show="showFillHandle"
            class="ing-data-grid-fill-handle"
            :style="fillHandleStyle"
            @mousedown.prevent="startFill"></div>
        <ul
            v-if="contextMenu.visible"
            ref="contextMenu"
            class="ing-data-grid-menu"
            :style="contextMenuStyle"
            @contextmenu.prevent>
            <li
                v-for="entry in contextMenuEntries"
                :key="entry.item"
                class="ing-data-grid-menu-item"
                @click="runContextMenuAction(entry.item)">{{ entry.label }}</li>
        </ul>
    </div>
</template>

<script>
    import { TabulatorFull as Tabulator } from "tabulator-tables";
    import { GridColumnType, GridSource, ContextMenuItem, CONTEXT_MENU_LABELS, INVALID_CELL_CLASS } from "./grid/grid-constants";
    import { serializeTsv, parseTsv } from "./grid/tsv";
    import GridModel from "./grid/grid-model";

    export default {
        name: "IngDataGrid",
        props: {
            columns: {
                type: Array,
                required: true
            },
            rows: {
                type: Array,
                default: () => []
            },
            width: {
                type: [Number, String],
                default: null
            },
            height: {
                type: [Number, String],
                default: null
            },
            wordWrap: {
                type: Boolean,
                default: false
            },
            stretchColumns: {
                type: Boolean,
                default: true
            },
            resizableColumns: {
                type: Boolean,
                default: true
            },
            fillHandle: {
                type: Boolean,
                default: false
            },
            clipboard: {
                type: Boolean,
                default: true
            },
            contextMenuItems: {
                type: Array,
                default: () => []
            },
            defaultRow: {
                type: Array,
                default: null
            }
        },
        data() {
            return {
                fillHandleStyle: {top: "0px", left: "0px"},
                showFillHandle: false,
                fillPreviewStyle: {top: "0px", left: "0px", width: "0px", height: "0px"},
                showFillPreview: false,
                contextMenu: {visible: false, row: 0, col: 0, top: 0, left: 0}
            };
        },
        created() {
            this.model = new GridModel({
                rows: this.rows,
                columnCount: this.columns.length,
                readOnlyColumns: this.readOnlyColumnIndexes()
            });
            this.table = null;
            this.tableReady = false;
            this.needsSync = false;
            this.pendingSync = null;
            this.hoveredCell = null;
            this.fillSource = null;
            this.filling = false;
            this.lastIntentionalSelection = null;
            this.lastIntentionalSelectionAt = 0;
        },
        mounted() {
            this.buildTable();
            this.attachClipboardListeners();
            this.attachTransitionEndListener();
        },
        beforeDestroy() {
            this.detachClipboardListeners();
            this.detachMenuDismissListeners();
            this.detachTransitionEndListener();
            if (this.pendingSync) {
                // let an in-flight redraw settle before tearing the table down
                this.pendingSync.then(() => this.destroyTable(), () => this.destroyTable());
            } else {
                this.destroyTable();
            }
        },
        watch: {
            columns: function() {
                this.model.setColumnCount(this.columns.length);
                this.model.setReadOnlyColumns(this.readOnlyColumnIndexes());
                this.rebuildTable();
            },
            rows: function(newRows) {
                this.loadData(newRows);
            }
        },
        computed: {
            containerStyle() {
                const style = {};
                if (this.width !== null) {
                    style.width = typeof this.width === "number" ? this.width + "px" : this.width;
                }
                if (this.height !== null) {
                    style.height = typeof this.height === "number" ? this.height + "px" : this.height;
                }
                return style;
            },
            contextMenuEntries() {
                return this.contextMenuItems
                    .filter(item => CONTEXT_MENU_LABELS[item])
                    .map(item => ({item, label: CONTEXT_MENU_LABELS[item]}));
            },
            contextMenuStyle() {
                return {top: this.contextMenu.top + "px", left: this.contextMenu.left + "px"};
            }
        },
        methods: {
            // ---------------------------------------------------------------
            // Ingenium grid API (the only surface consumers may depend on)
            // ---------------------------------------------------------------
            getData() {
                return this.model.getData();
            },
            loadData(rows) {
                this.model.loadData(rows);
                this.syncTable();
                return this.getData();
            },
            getDataAtCell(row, col) {
                return this.model.getDataAtCell(row, col);
            },
            setDataAtCell(row, col, value, source = GridSource.EDIT) {
                const change = this.model.setDataAtCell(row, col, value);
                if (!change) {
                    return null;
                }
                this.updateTableCell(row, col, value);
                if (source !== GridSource.SILENT) {
                    this.emitChanges([change], source);
                }
                return change;
            },
            setCellClassName(row, col, className) {
                this.model.setCellClassName(row, col, className);
            },
            clearCellClassNames() {
                this.model.clearCellClassNames();
            },
            setCellSource(row, col, source) {
                this.model.setCellSource(row, col, source);
            },
            selectCell(row, col) {
                this.model.selectCell(row, col);
                this.markIntentionalSelection(this.model.getSelection());
                const cell = this.tabulatorCell(row, col);
                if (cell && this.table) {
                    this.table.addRange(cell, cell);
                }
                this.updateFillHandle();
            },
            getSelection() {
                return this.model.getSelection();
            },
            insertRow(index, position = "below", values = null, source = null) {
                const seed = values || (this.defaultRow ? this.defaultRow.slice() : null);
                const insertedAt = this.model.insertRow(index, position, seed);
                this.syncTable();
                if (source !== GridSource.SILENT) {
                    this.$emit("after-create-row", insertedAt, 1,
                               source || (position === "above" ? GridSource.ROW_ABOVE : GridSource.ROW_BELOW));
                }
                return insertedAt;
            },
            removeRow(index, amount = 1, source = GridSource.REMOVE_ROW) {
                const removed = this.model.removeRow(index, amount);
                if (!removed.length) {
                    return removed;
                }
                this.syncTable();
                this.$emit("after-remove-row", index, removed.length, source);
                return removed;
            },
            countRows() {
                return this.model.countRows();
            },
            refresh() {
                this.syncTable();
            },

            // ---------------------------------------------------------------
            // Tabulator adapter (private - never exposed to consumers)
            // ---------------------------------------------------------------
            readOnlyColumnIndexes() {
                return this.columns.reduce((indexes, column, index) => {
                    if (column.readOnly) {
                        indexes.push(index);
                    }
                    return indexes;
                }, []);
            },
            fieldName(index) {
                return "c" + index;
            },
            columnIndexFromField(field) {
                return parseInt(String(field).substring(1), 10);
            },
            toTableRow(values, index) {
                const row = {__row: index};
                values.forEach((value, col) => {
                    row[this.fieldName(col)] = value;
                });
                return row;
            },
            tableData() {
                return this.model.getData().map((values, index) => this.toTableRow(values, index));
            },
            cellCoords(cell) {
                return {
                    row: cell.getData().__row,
                    col: this.columnIndexFromField(cell.getField())
                };
            },
            editorFor(column) {
                if (column.readOnly) {
                    return false;
                }
                if (column.type === GridColumnType.NUMERIC) {
                    return "number";
                }
                if (column.type === GridColumnType.DROPDOWN) {
                    return "list";
                }
                return "input";
            },
            tabulatorColumns() {
                return this.columns.map((column, index) => {
                    const definition = {
                        title: column.header === undefined || column.header === null ? "" : String(column.header),
                        field: this.fieldName(index),
                        headerSort: false,
                        headerHozAlign: "center",
                        resizable: this.resizableColumns,
                        editable: !column.readOnly,
                        editor: this.editorFor(column),
                        formatter: this.cellFormatter,
                        variableHeight: this.wordWrap
                    };

                    if (column.width) {
                        definition.width = column.width;
                    }

                    if (column.type === GridColumnType.DROPDOWN) {
                        definition.editorParams = cell => {
                            const {row, col} = this.cellCoords(cell);
                            const cellSource = this.model.getCellSource(row, col);
                            return {values: cellSource || column.source || [], autocomplete: false};
                        };
                    }

                    return definition;
                });
            },
            cellClassNames(column) {
                if (!column) {
                    return [];
                }
                if (column.readOnly) {
                    return ["ing-data-grid-readonly"];
                }
                if (column.type === GridColumnType.DROPDOWN) {
                    // Tabulator's list editor shows no affordance until it is opened, so the
                    // caret is drawn by CSS the way the previous grid marked dropdown cells.
                    return ["ing-data-grid-dropdown"];
                }
                return [];
            },
            cellFormatter(cell) {
                const {row, col} = this.cellCoords(cell);
                const element = cell.getElement();
                const className = this.model.getCellClassName(row, col);

                if (element) {
                    element.classList.remove(INVALID_CELL_CLASS);
                    if (className) {
                        element.classList.add(className);
                    }
                    // applied per cell rather than through the column definition, which would
                    // also decorate the column header
                    const cellClasses = this.cellClassNames(this.columns[col]);
                    element.classList.toggle("ing-data-grid-readonly",
                                             cellClasses.indexOf("ing-data-grid-readonly") > -1);
                    element.classList.toggle("ing-data-grid-dropdown",
                                             cellClasses.indexOf("ing-data-grid-dropdown") > -1);
                }

                const value = cell.getValue();
                const text = value === null || value === undefined ? "" : String(value);
                const column = this.columns[col];

                if (column && !column.readOnly && column.type === GridColumnType.DROPDOWN) {
                    const fragment = document.createDocumentFragment();
                    fragment.appendChild(document.createTextNode(text));
                    fragment.appendChild(this.buildDropdownCaret(cell));
                    return fragment;
                }

                return document.createTextNode(text);
            },
            buildDropdownCaret(cell) {
                const caret = document.createElement("span");
                caret.className = "ing-data-grid-dropdown-caret";
                // stop the caret's own mousedown/click from ever reaching Tabulator's
                // delegated range-selection handling - that handling refocuses the grid as
                // part of the same click, which otherwise fights with cell.edit()'s focus()
                // call and silently closes the editor it just opened
                caret.addEventListener("mousedown", event => event.stopPropagation());
                caret.addEventListener("click", event => {
                    event.stopPropagation();
                    const {row, col} = this.cellCoords(cell);
                    this.selectCell(row, col);
                    cell.edit(true);
                });
                return caret;
            },
            onCellContext(event, cell) {
                if (!this.contextMenuEntries.length) {
                    return;
                }
                event.preventDefault();

                const {row, col} = this.cellCoords(cell);
                // right-clicking outside the current range moves the selection to that cell,
                // right-clicking inside it keeps the range so range actions still apply
                if (!this.model.selectionContains(row, col)) {
                    this.selectCell(row, col);
                }
                this.openContextMenu(row, col, event.clientX, event.clientY);
            },
            openContextMenu(row, col, clientX, clientY) {
                this.contextMenu = {visible: true, row, col, top: clientY, left: clientX};
                this.attachMenuDismissListeners();
                this.$nextTick(this.keepContextMenuOnScreen);
            },
            keepContextMenuOnScreen() {
                const menu = this.$refs.contextMenu;
                if (!menu || !menu.getBoundingClientRect) {
                    return;
                }
                const rect = menu.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    this.contextMenu.left = Math.max(0, this.contextMenu.left - rect.width);
                }
                if (rect.bottom > window.innerHeight) {
                    this.contextMenu.top = Math.max(0, this.contextMenu.top - rect.height);
                }
            },
            closeContextMenu() {
                if (!this.contextMenu.visible) {
                    return;
                }
                this.contextMenu = Object.assign({}, this.contextMenu, {visible: false});
                this.detachMenuDismissListeners();
            },
            attachMenuDismissListeners() {
                if (this.menuDismissListener) {
                    return;
                }
                this.menuDismissListener = event => {
                    if (event.type === "keydown" && event.key !== "Escape") {
                        return;
                    }
                    const menu = this.$refs.contextMenu;
                    if (event.type === "mousedown" && menu && menu.contains(event.target)) {
                        return;
                    }
                    this.closeContextMenu();
                };
                document.addEventListener("mousedown", this.menuDismissListener, true);
                document.addEventListener("keydown", this.menuDismissListener, true);
                window.addEventListener("scroll", this.menuDismissListener, true);
            },
            detachMenuDismissListeners() {
                if (!this.menuDismissListener) {
                    return;
                }
                document.removeEventListener("mousedown", this.menuDismissListener, true);
                document.removeEventListener("keydown", this.menuDismissListener, true);
                window.removeEventListener("scroll", this.menuDismissListener, true);
                this.menuDismissListener = null;
            },
            runContextMenuAction(item) {
                const row = this.contextMenu.row;
                this.closeContextMenu();

                switch (item) {
                    case ContextMenuItem.ROW_ABOVE:
                        this.insertRow(row, "above", null, GridSource.ROW_ABOVE);
                        break;
                    case ContextMenuItem.ROW_BELOW:
                        this.insertRow(row, "below", null, GridSource.ROW_BELOW);
                        break;
                    case ContextMenuItem.REMOVE_ROW:
                        this.removeRow(row);
                        break;
                    case ContextMenuItem.COPY:
                        this.writeClipboard(this.selectionAsText());
                        break;
                    case ContextMenuItem.CUT:
                        this.writeClipboard(this.selectionAsText());
                        this.cutSelection();
                        break;
                    case ContextMenuItem.PASTE:
                        this.pasteFromClipboard();
                        break;
                }
            },
            buildTable() {
                if (!this.$refs.table) {
                    return;
                }

                this.table = new Tabulator(this.$refs.table, {
                    data: this.tableData(),
                    columns: this.tabulatorColumns(),
                    index: "__row",
                    layout: this.stretchColumns ? "fitColumns" : "fitData",
                    height: "100%",
                    reactiveData: false,
                    clipboard: false,
                    movableColumns: false,
                    selectableRange: 1,
                    selectableRangeColumns: false,
                    selectableRangeRows: false,
                    selectableRangeClearCells: false,
                    editTriggerEvent: "dblclick",
                    resizableColumnFit: this.stretchColumns,
                    // anchor editor popups to this component: the default appends them to
                    // document.body in page coordinates, which lands in the wrong place once
                    // the grid sits inside a fixed-position modal
                    popupContainer: this.$el
                });

                this.table.on("tableBuilt", this.onTableBuilt);
                this.table.on("cellEdited", this.onCellEdited);
                this.table.on("rangeChanged", this.onRangeChanged);
                this.table.on("cellMouseOver", this.onCellMouseOver);
                this.table.on("cellContext", this.onCellContext);
                this.table.on("headerClick", this.onHeaderClick);
            },
            onTableBuilt() {
                this.tableReady = true;
                if (this.needsSync) {
                    this.needsSync = false;
                    this.syncTable();
                }
            },
            destroyTable() {
                if (this.table) {
                    this.table.destroy();
                    this.table = null;
                }
                this.tableReady = false;
                this.needsSync = false;
            },
            rebuildTable() {
                this.destroyTable();
                this.$nextTick(() => {
                    this.buildTable();
                });
            },
            syncTable() {
                if (!this.table) {
                    return;
                }
                if (!this.tableReady) {
                    this.needsSync = true;
                    return;
                }
                // Tabulator resets its own selection to the default cell as soon as
                // replaceData reloads the rows (its SelectRange module reacts to the
                // "data-processed" event by picking a default range), which also clobbers
                // the model's selection via our own rangeChanged handler. Snapshot the
                // selection the caller actually wants before that happens, then restore it.
                //
                // replaceData() is async, and callers (e.g. IngDataEntry's initial load) may
                // call selectCell()/setSelection() synchronously right after loadData()/
                // refresh() but before this promise resolves - snapshotting here would restore
                // a stale pre-selectCell() selection and knock the fill handle out of place.
                // Read lastIntentionalSelection (kept live by markIntentionalSelection) instead
                // of a fixed local snapshot, so we always restore whatever selection was most
                // recently intended, even if it changed after this call was made.
                const selectionToRestore = this.model.getSelection();
                const sync = this.table.replaceData(this.tableData()).then(() => {
                    this.restoreSelection(this.lastIntentionalSelection || selectionToRestore);
                    this.updateFillHandle();
                }, () => {
                    // table was torn down while the update was in flight
                }).then(() => {
                    if (this.pendingSync === sync) {
                        this.pendingSync = null;
                    }
                });
                this.pendingSync = sync;
            },
            restoreSelection(selection) {
                if (!selection || !this.table) {
                    return;
                }
                this.model.setSelection(selection);
                this.markIntentionalSelection(selection);
                const start = this.tabulatorCell(selection.startRow, selection.startCol);
                const end = this.tabulatorCell(selection.endRow, selection.endCol);
                if (start && end) {
                    this.table.addRange(start, end);
                }
            },
            updateTableCell(row, col, value) {
                if (!this.table || !this.tableReady) {
                    return;
                }
                const tableRow = this.table.getRows()[row];
                if (tableRow) {
                    tableRow.update({[this.fieldName(col)]: value});
                }
            },
            tabulatorCell(row, col) {
                if (!this.table || !this.tableReady) {
                    return null;
                }
                const tableRow = this.table.getRows()[row];
                if (!tableRow) {
                    return null;
                }
                return tableRow.getCells()[col] || null;
            },
            onCellEdited(cell) {
                const {row, col} = this.cellCoords(cell);
                const value = cell.getValue();
                const change = this.model.setDataAtCell(row, col, value);
                this.emitChanges(change ? [change] : [[row, col, cell.getOldValue(), value]], GridSource.EDIT);
                this.selectCell(row, col);
            },
            onHeaderClick(event, column) {
                const col = this.columnIndexFromField(column.getField());
                const rowCount = this.model.countRows();
                if (rowCount === 0) {
                    return;
                }
                const columnSelection = {startRow: 0, startCol: col, endRow: rowCount - 1, endCol: col};
                this.model.setSelection(columnSelection);
                this.markIntentionalSelection(columnSelection);
                const start = this.tabulatorCell(0, col);
                const end = this.tabulatorCell(rowCount - 1, col);
                if (start && end && this.table) {
                    this.table.addRange(start, end);
                }
                this.$emit("selection-change", this.model.getSelection());
                this.updateFillHandle();
            },
            markIntentionalSelection(selection) {
                this.lastIntentionalSelection = selection;
                this.lastIntentionalSelectionAt = Date.now();
            },
            onRangeChanged(range) {
                const selection = {
                    startRow: range.getTopEdge(),
                    startCol: range.getLeftEdge(),
                    endRow: range.getBottomEdge(),
                    endCol: range.getRightEdge()
                };

                // Something inside Tabulator (still unidentified - not our own replaceData
                // calls) intermittently resets the active range to the default top-left cell a
                // short while after we've explicitly set it elsewhere. Treat a
                // reset to that exact default as suspicious - not a real user click - only if
                // it lands within a tight window of our own last explicit selection AND that
                // selection wasn't already (0,0); a genuine click on (0,0) still works normally
                // since there's nothing to suppress in that case.
                const isDefaultCell = selection.startRow === 0 && selection.startCol === 0 &&
                    selection.endRow === 0 && selection.endCol === 0;
                const lastWasElsewhere = this.lastIntentionalSelection &&
                (this.lastIntentionalSelection.startRow !== 0 || this.lastIntentionalSelection.startCol !== 0);
                const withinSuspiciousWindow = this.lastIntentionalSelectionAt &&
                (Date.now() - this.lastIntentionalSelectionAt) < 150;

                if (isDefaultCell && lastWasElsewhere && withinSuspiciousWindow) {
                    this.restoreSelection(this.lastIntentionalSelection);
                    return;
                }

                this.model.setSelection(selection);
                this.markIntentionalSelection(selection);
                this.$emit("selection-change", this.model.getSelection());
                this.updateFillHandle();
            },
            onCellMouseOver(event, cell) {
                this.hoveredCell = this.cellCoords(cell);
                if (this.filling) {
                    this.updateFillPreview();
                }
            },
            emitChanges(changes, source) {
                if (!changes.length) {
                    return;
                }
                this.$emit("before-change", changes, source);
                this.$emit("after-change", changes, source);
            },

            // ---------------------------------------------------------------
            // Clipboard
            // ---------------------------------------------------------------
            attachClipboardListeners() {
                if (!this.clipboard || !this.$el) {
                    return;
                }
                this.copyListener = this.onCopy;
                this.cutListener = this.onCut;
                this.pasteListener = this.onPaste;
                this.keydownListener = this.onKeydown;
                this.$el.addEventListener("copy", this.copyListener);
                this.$el.addEventListener("cut", this.cutListener);
                this.$el.addEventListener("paste", this.pasteListener);
                this.$el.addEventListener("keydown", this.keydownListener);
            },
            detachClipboardListeners() {
                if (!this.$el || !this.copyListener) {
                    return;
                }
                this.$el.removeEventListener("copy", this.copyListener);
                this.$el.removeEventListener("cut", this.cutListener);
                this.$el.removeEventListener("paste", this.pasteListener);
                this.$el.removeEventListener("keydown", this.keydownListener);
            },
            selectionAsText() {
                return serializeTsv(this.model.getRangeValues(this.model.getSelection()));
            },
            onCopy(event) {
                const text = this.selectionAsText();
                if (!text && text !== "") {
                    return;
                }
                event.preventDefault();
                event.clipboardData.setData("text/plain", text);
            },
            onCut(event) {
                this.onCopy(event);
                this.cutSelection();
            },
            cutSelection() {
                const changes = this.model.clearRange(this.model.getSelection());
                if (!changes.length) {
                    return;
                }
                this.syncTable();
                this.emitChanges(changes, GridSource.CUT);
            },
            onPaste(event) {
                const text = event.clipboardData ? event.clipboardData.getData("text/plain") : "";
                event.preventDefault();
                this.pasteText(text);
            },
            pasteFromClipboard() {
                if (!navigator.clipboard || !navigator.clipboard.readText) {
                    this.$emit("context-menu-paste");
                    return Promise.resolve(null);
                }
                return navigator.clipboard.readText().then(
                    text => this.pasteText(text),
                    () => {
                        // the browser refused a programmatic clipboard read (no permission,
                        // insecure origin, or unsupported); let the consumer explain Ctrl+V
                        this.$emit("context-menu-paste");
                        return null;
                });
            },
            pasteText(text) {
                const matrix = parseTsv(text);
                if (!matrix.length) {
                    return {changes: [], addedRows: 0};
                }

                const selection = this.model.getSelection() || {startRow: 0, startCol: 0};
                const result = this.model.applyPaste(selection.startRow, selection.startCol, matrix, {
                    defaultRow: this.defaultRow
                });

                this.syncTable();

                if (result.addedRows) {
                    this.$emit("after-create-row", this.model.countRows() - result.addedRows,
                               result.addedRows, GridSource.PASTE);
                }
                this.emitChanges(result.changes, GridSource.PASTE);
                return result;
            },
            onKeydown(event) {
                if (event.key !== "Delete" && event.key !== "Backspace") {
                    return;
                }
                if (event.target && (event.target.tagName === "INPUT" || event.target.tagName === "SELECT")) {
                    return;
                }
                const changes = this.model.clearRange(this.model.getSelection());
                if (!changes.length) {
                    return;
                }
                event.preventDefault();
                this.syncTable();
                this.emitChanges(changes, GridSource.EDIT);
            },
            writeClipboard(text) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text).catch(() => this.writeClipboardFallback(text));
                }
                return this.writeClipboardFallback(text);
            },
            writeClipboardFallback(text) {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            },

            // ---------------------------------------------------------------
            // Fill handle
            // ---------------------------------------------------------------
            attachTransitionEndListener() {
                // The fill handle's position is computed from getBoundingClientRect(), which
                // includes any in-flight CSS transform. The first time this grid appears inside
                // a modal, IngModal animates the container's scale/opacity on enter ("transition:
                // all .3s ease" on .modal-container) - a plain selectCell() right after mount can
                // land mid-transition and capture a transiently-scaled rect that never gets
                // corrected (a ResizeObserver would NOT catch this: transform never changes the
                // element's own content-box size). Listen for that (or any other ancestor)
                // transition finishing and recompute once the real layout has settled.
                this.transitionEndListener = () => {
                    this.updateFillHandle();
                    if (this.filling) {
                        this.updateFillPreview();
                    }
                };
                document.addEventListener("transitionend", this.transitionEndListener, true);
            },
            detachTransitionEndListener() {
                if (this.transitionEndListener) {
                    document.removeEventListener("transitionend", this.transitionEndListener, true);
                    this.transitionEndListener = null;
                }
            },
            updateFillHandle() {
                const selection = this.model.getSelection();
                if (!this.fillHandle || !selection || !this.$el) {
                    this.showFillHandle = false;
                    return;
                }

                const cell = this.tabulatorCell(selection.endRow, selection.endCol);
                const element = cell ? cell.getElement() : null;
                if (!element || !element.getBoundingClientRect) {
                    this.showFillHandle = false;
                    return;
                }

                const cellRect = element.getBoundingClientRect();
                const containerRect = this.$el.getBoundingClientRect();
                this.fillHandleStyle = {
                    top: (cellRect.bottom - containerRect.top - 3) + "px",
                    left: (cellRect.right - containerRect.left - 3) + "px"
                };
                this.showFillHandle = true;
            },
            fillTargetRange(source, hovered) {
                const target = {
                    startRow: source.startRow,
                    startCol: source.startCol,
                    endRow: Math.max(source.endRow, hovered.row),
                    endCol: source.endCol
                };

                if (hovered.row === source.endRow) {
                    target.endRow = source.endRow;
                    target.endCol = Math.max(source.endCol, hovered.col);
                }

                return target;
            },
            startFill() {
                this.fillSource = this.model.getSelection();
                if (!this.fillSource) {
                    return;
                }
                this.filling = true;
                // start the preview at exactly the current selection until the mouse moves
                this.hoveredCell = {row: this.fillSource.endRow, col: this.fillSource.endCol};
                this.updateFillPreview();
                this.endFillListener = this.endFill;
                document.addEventListener("mouseup", this.endFillListener);
            },
            updateFillPreview() {
                const source = this.fillSource;
                const hovered = this.hoveredCell;
                if (!this.filling || !source || !hovered || !this.$el) {
                    this.showFillPreview = false;
                    return;
                }

                const target = this.fillTargetRange(source, hovered);
                const topLeftCell = this.tabulatorCell(target.startRow, target.startCol);
                const bottomRightCell = this.tabulatorCell(target.endRow, target.endCol);
                const topLeftElement = topLeftCell ? topLeftCell.getElement() : null;
                const bottomRightElement = bottomRightCell ? bottomRightCell.getElement() : null;
                if (!topLeftElement || !bottomRightElement || !topLeftElement.getBoundingClientRect) {
                    this.showFillPreview = false;
                    return;
                }

                const topLeftRect = topLeftElement.getBoundingClientRect();
                const bottomRightRect = bottomRightElement.getBoundingClientRect();
                const containerRect = this.$el.getBoundingClientRect();
                this.fillPreviewStyle = {
                    top: (topLeftRect.top - containerRect.top) + "px",
                    left: (topLeftRect.left - containerRect.left) + "px",
                    width: (bottomRightRect.right - topLeftRect.left) + "px",
                    height: (bottomRightRect.bottom - topLeftRect.top) + "px"
                };
                this.showFillPreview = true;
            },
            endFill() {
                document.removeEventListener("mouseup", this.endFillListener);

                const source = this.fillSource;
                const hovered = this.hoveredCell;
                this.fillSource = null;
                this.filling = false;
                this.showFillPreview = false;

                if (!source || !hovered) {
                    return;
                }

                const target = this.fillTargetRange(source, hovered);
                const changes = this.model.applyFill(source, target);
                if (!changes.length) {
                    return;
                }

                this.syncTable();
                this.emitChanges(changes, GridSource.FILL);
            }
        }
    };
</script>

<style>
    @import "~tabulator-tables/dist/css/tabulator.css";

    .ing-data-grid {
        position: relative;
    }

    .ing-data-grid-table {
        height: 100%;
    }

    .ing-data-grid .tabulator-cell {
        white-space: pre-wrap;
    }

    .ing-data-grid .ing-data-grid-readonly {
        background-color: #f5f5f5;
    }

    .ing-data-grid .ing-data-grid-dropdown {
        padding-right: 16px;
    }

    .ing-data-grid .ing-data-grid-dropdown-caret {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 16px;
        cursor: pointer;
    }

    .ing-data-grid .ing-data-grid-dropdown-caret::after {
        content: "";
        position: absolute;
        right: 5px;
        top: 50%;
        margin-top: -2px;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid #777777;
        pointer-events: none;
    }

    /* the number editor's native spinner has no working up/down affordance in this grid
       (Tabulator's number editor does not step the value on click), so hide it */
    .ing-data-grid input[type="number"]::-webkit-inner-spin-button,
    .ing-data-grid input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .ing-data-grid input[type="number"] {
        -moz-appearance: textfield;
    }

    .ing-data-grid-menu {
        position: fixed;
        z-index: 10000;
        margin: 0;
        padding: 4px 0;
        min-width: 160px;
        list-style: none;
        background-color: #ffffff;
        border: 1px solid #aaaaaa;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        font-size: 13px;
        color: #000000;
    }

    .ing-data-grid-menu-item {
        padding: 5px 14px;
        white-space: nowrap;
        cursor: pointer;
    }

    .ing-data-grid-menu-item:hover {
        background-color: #f0f0f0;
    }

    .ing-data-grid-fill-handle {
        position: absolute;
        width: 6px;
        height: 6px;
        background-color: #2c6fbb;
        border: 1px solid #ffffff;
        cursor: crosshair;
        z-index: 20;
    }

    .ing-data-grid-fill-preview {
        position: absolute;
        box-sizing: border-box;
        border: 1px dashed #2c6fbb;
        background-color: rgba(44, 111, 187, 0.08);
        pointer-events: none;
        z-index: 19;
    }
</style>

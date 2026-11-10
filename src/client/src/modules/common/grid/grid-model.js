import { normalizeMatrix } from "./tsv";

function cellKey(row, col) {
    return row + "," + col;
}

function shiftKeyedMap(map, fromRow, delta) {
    const shifted = new Map();
    map.forEach((value, key) => {
        const [rowText, colText] = key.split(",");
        const row = parseInt(rowText, 10);
        const col = parseInt(colText, 10);
        if (row < fromRow) {
            shifted.set(key, value);
        } else if (delta < 0 && row < fromRow - delta) {
            // row was removed, drop its metadata
        } else {
            shifted.set(cellKey(row + delta, col), value);
        }
    });
    return shifted;
}

export default class GridModel {
    constructor({rows = [], columnCount = 0, readOnlyColumns = []} = {}) {
        this.columnCount = columnCount;
        this.readOnlyColumns = new Set(readOnlyColumns);
        this.cellClasses = new Map();
        this.cellSources = new Map();
        this.selection = null;
        this.rows = [];
        this.loadData(rows);
    }

    normalizeRow(row) {
        const values = Array.isArray(row) ? row.slice() : [];
        if (this.columnCount > 0) {
            values.length = this.columnCount;
            for (let i = 0; i < this.columnCount; i++) {
                if (values[i] === undefined) {
                    values[i] = null;
                }
            }
        }
        return values;
    }

    loadData(rows) {
        this.rows = (Array.isArray(rows) ? rows : []).map(row => this.normalizeRow(row));
        this.cellClasses = new Map();
        this.cellSources = new Map();
        return this.getData();
    }

    setColumnCount(columnCount) {
        this.columnCount = columnCount;
        this.rows = this.rows.map(row => this.normalizeRow(row));
    }

    setReadOnlyColumns(columns) {
        this.readOnlyColumns = new Set(Array.isArray(columns) ? columns : []);
    }

    isReadOnlyColumn(col) {
        return this.readOnlyColumns.has(col);
    }

    getData() {
        return this.rows.map(row => row.slice());
    }

    countRows() {
        return this.rows.length;
    }

    countColumns() {
        return this.columnCount > 0 ? this.columnCount : this.rows.reduce((max, row) => Math.max(max, row.length), 0);
    }

    isValidCell(row, col) {
        if (row < 0 || row >= this.rows.length || col < 0) {
            return false;
        }
        return this.columnCount === 0 || col < this.columnCount;
    }

    getDataAtCell(row, col) {
        if (!this.isValidCell(row, col)) {
            return null;
        }
        const value = this.rows[row][col];
        return value === undefined ? null : value;
    }

    setDataAtCell(row, col, value, {respectReadOnly = false} = {}) {
        if (!this.isValidCell(row, col)) {
            return null;
        }
        if (respectReadOnly && this.isReadOnlyColumn(col)) {
            return null;
        }
        const oldValue = this.getDataAtCell(row, col);
        if (oldValue === value) {
            return null;
        }
        this.rows[row][col] = value;
        return [row, col, oldValue, value];
    }

    setRowValues(row, values) {
        if (row < 0 || row >= this.rows.length) {
            return [];
        }
        const changes = [];
        (Array.isArray(values) ? values : []).forEach((value, col) => {
            const change = this.setDataAtCell(row, col, value);
            if (change) {
                changes.push(change);
            }
        });
        return changes;
    }

    insertRow(index, position = "below", values = null) {
        const insertAt = position === "above" ? index : index + 1;
        const boundedIndex = Math.max(0, Math.min(insertAt, this.rows.length));
        this.rows.splice(boundedIndex, 0, this.normalizeRow(values || []));
        this.cellClasses = shiftKeyedMap(this.cellClasses, boundedIndex, 1);
        this.cellSources = shiftKeyedMap(this.cellSources, boundedIndex, 1);
        return boundedIndex;
    }

    removeRow(index, amount = 1) {
        if (index < 0 || index >= this.rows.length) {
            return [];
        }
        const removed = this.rows.splice(index, amount);
        this.cellClasses = shiftKeyedMap(this.cellClasses, index, -amount);
        this.cellSources = shiftKeyedMap(this.cellSources, index, -amount);
        return removed;
    }

    normalizeSelection(selection) {
        if (!selection) {
            return null;
        }
        const {startRow, startCol, endRow, endCol} = selection;
        return {
            startRow: Math.min(startRow, endRow),
            startCol: Math.min(startCol, endCol),
            endRow: Math.max(startRow, endRow),
            endCol: Math.max(startCol, endCol)
        };
    }

    setSelection(selection) {
        this.selection = this.normalizeSelection(selection);
        return this.selection;
    }

    selectCell(row, col) {
        return this.setSelection({startRow: row, startCol: col, endRow: row, endCol: col});
    }

    getSelection() {
        return this.selection ? Object.assign({}, this.selection) : null;
    }

    selectionContains(row, col) {
        if (!this.selection) {
            return false;
        }
        return row >= this.selection.startRow && row <= this.selection.endRow &&
            col >= this.selection.startCol && col <= this.selection.endCol;
    }

    getRangeValues(selection) {
        const range = this.normalizeSelection(selection) || this.getSelection();
        if (!range) {
            return [];
        }
        const values = [];
        for (let row = range.startRow; row <= range.endRow; row++) {
            if (row < 0 || row >= this.rows.length) {
                continue;
            }
            const rowValues = [];
            for (let col = range.startCol; col <= range.endCol; col++) {
                rowValues.push(this.getDataAtCell(row, col));
            }
            values.push(rowValues);
        }
        return values;
    }

    clearRange(selection) {
        const range = this.normalizeSelection(selection) || this.getSelection();
        if (!range) {
            return [];
        }
        const changes = [];
        for (let row = range.startRow; row <= range.endRow; row++) {
            for (let col = range.startCol; col <= range.endCol; col++) {
                const change = this.setDataAtCell(row, col, "", {respectReadOnly: true});
                if (change) {
                    changes.push(change);
                }
            }
        }
        return changes;
    }

    applyPaste(anchorRow, anchorCol, matrix, {expandRows = true, defaultRow = null} = {}) {
        const values = normalizeMatrix(matrix);
        const changes = [];
        let addedRows = 0;

        if (values.length === 0) {
            return {changes, addedRows};
        }

        values.forEach((rowValues, rowOffset) => {
            const row = anchorRow + rowOffset;
            if (row >= this.rows.length) {
                if (!expandRows) {
                    return;
                }
                this.rows.push(this.normalizeRow(defaultRow ? defaultRow.slice() : []));
                addedRows += 1;
            }
            rowValues.forEach((value, colOffset) => {
                const col = anchorCol + colOffset;
                const change = this.setDataAtCell(row, col, value, {respectReadOnly: true});
                if (change) {
                    changes.push(change);
                }
            });
        });

        return {changes, addedRows};
    }

    applyFill(sourceSelection, targetSelection) {
        const source = this.normalizeSelection(sourceSelection);
        const target = this.normalizeSelection(targetSelection);
        if (!source || !target) {
            return [];
        }

        const sourceValues = this.getRangeValues(source);
        if (sourceValues.length === 0) {
            return [];
        }

        const sourceHeight = sourceValues.length;
        const sourceWidth = sourceValues[0].length;
        const changes = [];

        for (let row = target.startRow; row <= target.endRow; row++) {
            if (row >= this.rows.length) {
                break;
            }
            for (let col = target.startCol; col <= target.endCol; col++) {
                if (row >= source.startRow && row <= source.endRow && col >= source.startCol && col <= source.endCol) {
                    continue;
                }
                const value = sourceValues[(row - target.startRow) % sourceHeight][(col - target.startCol) % sourceWidth];
                const change = this.setDataAtCell(row, col, value, {respectReadOnly: true});
                if (change) {
                    changes.push(change);
                }
            }
        }

        return changes;
    }

    setCellClassName(row, col, className) {
        if (className) {
            this.cellClasses.set(cellKey(row, col), className);
        } else {
            this.cellClasses.delete(cellKey(row, col));
        }
    }

    getCellClassName(row, col) {
        return this.cellClasses.get(cellKey(row, col)) || "";
    }

    clearCellClassNames() {
        this.cellClasses = new Map();
    }

    setCellSource(row, col, source) {
        this.cellSources.set(cellKey(row, col), Array.isArray(source) ? source.slice() : []);
    }

    getCellSource(row, col) {
        return this.cellSources.get(cellKey(row, col)) || null;
    }
}

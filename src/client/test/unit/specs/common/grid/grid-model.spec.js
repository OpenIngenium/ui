import GridModel from "../../../../../src/modules/common/grid/grid-model";

function model(rows, columnCount = 3, readOnlyColumns = []) {
    return new GridModel({rows, columnCount, readOnlyColumns});
}

describe("grid/grid-model", () => {
    describe("data loading", () => {
        it("pads short rows with null up to the column count", () => {
            expect(model([["a"]]).getData()).toEqual([["a", null, null]]);
        });

        it("truncates rows longer than the column count", () => {
            expect(model([["a", "b", "c", "d"]]).getData()).toEqual([["a", "b", "c"]]);
        });

        it("preserves value types", () => {
            expect(model([[1, true, null]]).getData()).toEqual([[1, true, null]]);
        });

        it("returns copies so callers cannot mutate internal state", () => {
            const grid = model([["a", "b", "c"]]);
            grid.getData()[0][0] = "mutated";
            expect(grid.getDataAtCell(0, 0)).toBe("a");
        });

        it("clears cell metadata on load", () => {
            const grid = model([["a", "b", "c"]]);
            grid.setCellClassName(0, 0, "orange-bg");
            grid.loadData([["x", "y", "z"]]);
            expect(grid.getCellClassName(0, 0)).toBe("");
        });
    });

    describe("cell access", () => {
        it("returns null outside the grid bounds", () => {
            const grid = model([["a", "b", "c"]]);
            expect(grid.getDataAtCell(5, 0)).toBe(null);
            expect(grid.getDataAtCell(0, 9)).toBe(null);
        });

        it("reports a change tuple when the value changes", () => {
            const grid = model([["a", "b", "c"]]);
            expect(grid.setDataAtCell(0, 1, "z")).toEqual([0, 1, "b", "z"]);
        });

        it("reports no change when the value is identical", () => {
            const grid = model([["a", "b", "c"]]);
            expect(grid.setDataAtCell(0, 1, "b")).toBe(null);
        });

        it("skips read-only columns only when asked to respect them", () => {
            const grid = model([["a", "b", "c"]], 3, [1]);
            expect(grid.setDataAtCell(0, 1, "z", {respectReadOnly: true})).toBe(null);
            expect(grid.setDataAtCell(0, 1, "z")).toEqual([0, 1, "b", "z"]);
        });
    });

    describe("row operations", () => {
        it("inserts a row below the given index", () => {
            const grid = model([["a", "", ""], ["b", "", ""]]);
            expect(grid.insertRow(0, "below", ["new", "", ""])).toBe(1);
            expect(grid.getData()).toEqual([["a", "", ""], ["new", "", ""], ["b", "", ""]]);
        });

        it("inserts a row above the given index", () => {
            const grid = model([["a", "", ""], ["b", "", ""]]);
            expect(grid.insertRow(1, "above", ["new", "", ""])).toBe(1);
            expect(grid.getData()[1]).toEqual(["new", "", ""]);
        });

        it("pads inserted rows to the column count", () => {
            const grid = model([["a", "", ""]]);
            grid.insertRow(0, "below");
            expect(grid.getData()[1]).toEqual([null, null, null]);
        });

        it("shifts cell classes down when inserting", () => {
            const grid = model([["a", "", ""], ["b", "", ""]]);
            grid.setCellClassName(1, 0, "orange-bg");
            grid.insertRow(0, "below");
            expect(grid.getCellClassName(1, 0)).toBe("");
            expect(grid.getCellClassName(2, 0)).toBe("orange-bg");
        });

        it("removes rows and drops their metadata", () => {
            const grid = model([["a", "", ""], ["b", "", ""], ["c", "", ""]]);
            grid.setCellClassName(1, 0, "orange-bg");
            grid.setCellClassName(2, 0, "orange-bg");
            grid.removeRow(1);
            expect(grid.getData()).toEqual([["a", "", ""], ["c", "", ""]]);
            expect(grid.getCellClassName(1, 0)).toBe("orange-bg");
            expect(grid.countRows()).toBe(2);
        });

        it("ignores removal outside the row range", () => {
            const grid = model([["a", "", ""]]);
            expect(grid.removeRow(7)).toEqual([]);
            expect(grid.countRows()).toBe(1);
        });
    });

    describe("selection", () => {
        it("normalizes reversed ranges", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"]]);
            grid.setSelection({startRow: 1, startCol: 2, endRow: 0, endCol: 0});
            expect(grid.getSelection()).toEqual({startRow: 0, startCol: 0, endRow: 1, endCol: 2});
        });

        it("selects a single cell", () => {
            const grid = model([["a", "b", "c"]]);
            grid.selectCell(0, 2);
            expect(grid.getSelection()).toEqual({startRow: 0, startCol: 2, endRow: 0, endCol: 2});
        });

        it("extracts rectangular range values", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]);
            expect(grid.getRangeValues({startRow: 1, startCol: 0, endRow: 2, endCol: 1})).toEqual([["d", "e"], ["g", "h"]]);
        });
    });

    describe("paste", () => {
        it("writes a rectangular block at the anchor", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"]]);
            const {changes, addedRows} = grid.applyPaste(0, 1, [["1", "2"], ["3", "4"]]);
            expect(grid.getData()).toEqual([["a", "1", "2"], ["d", "3", "4"]]);
            expect(addedRows).toBe(0);
            expect(changes.length).toBe(4);
        });

        it("clips columns beyond the fixed column count", () => {
            const grid = model([["a", "b", "c"]]);
            grid.applyPaste(0, 2, [["1", "2", "3"]]);
            expect(grid.getData()).toEqual([["a", "b", "1"]]);
        });

        it("appends rows when the block is taller than the grid", () => {
            const grid = model([["a", "b", "c"]]);
            const {addedRows} = grid.applyPaste(0, 0, [["1", "2", "3"], ["4", "5", "6"]]);
            expect(addedRows).toBe(1);
            expect(grid.getData()).toEqual([["1", "2", "3"], ["4", "5", "6"]]);
        });

        it("seeds appended rows with the supplied default row", () => {
            const grid = model([["a", "b", "c"]]);
            grid.applyPaste(0, 0, [["1"], ["4"]], {defaultRow: ["", "D", "D"]});
            expect(grid.getData()).toEqual([["1", "b", "c"], ["4", "D", "D"]]);
        });

        it("does not append rows when expansion is disabled", () => {
            const grid = model([["a", "b", "c"]]);
            const {addedRows} = grid.applyPaste(0, 0, [["1", "2", "3"], ["4", "5", "6"]], {expandRows: false});
            expect(addedRows).toBe(0);
            expect(grid.countRows()).toBe(1);
        });

        it("skips read-only columns", () => {
            const grid = model([["a", "b", "c"]], 3, [1]);
            grid.applyPaste(0, 0, [["1", "2", "3"]]);
            expect(grid.getData()).toEqual([["1", "b", "3"]]);
        });

        it("pads ragged pasted rows with empty strings", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"]]);
            grid.applyPaste(0, 0, [["1", "2", "3"], ["4"]]);
            expect(grid.getData()).toEqual([["1", "2", "3"], ["4", "", ""]]);
        });
    });

    describe("fill", () => {
        it("fills a single source cell down a target range", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]]);
            const changes = grid.applyFill(
                {startRow: 0, startCol: 0, endRow: 0, endCol: 0},
                {startRow: 0, startCol: 0, endRow: 2, endCol: 0}
            );
            expect(grid.getData().map(row => row[0])).toEqual(["a", "a", "a"]);
            expect(changes.length).toBe(2);
        });

        it("repeats a multi-cell source pattern", () => {
            const grid = model([["1", "", ""], ["2", "", ""], ["", "", ""], ["", "", ""]]);
            grid.applyFill(
                {startRow: 0, startCol: 0, endRow: 1, endCol: 0},
                {startRow: 0, startCol: 0, endRow: 3, endCol: 0}
            );
            expect(grid.getData().map(row => row[0])).toEqual(["1", "2", "1", "2"]);
        });

        it("never grows the grid", () => {
            const grid = model([["a", "b", "c"]]);
            grid.applyFill(
                {startRow: 0, startCol: 0, endRow: 0, endCol: 0},
                {startRow: 0, startCol: 0, endRow: 5, endCol: 0}
            );
            expect(grid.countRows()).toBe(1);
        });

        it("skips read-only columns", () => {
            const grid = model([["a", "b", "c"], ["", "", ""]], 3, [0]);
            grid.applyFill(
                {startRow: 0, startCol: 0, endRow: 0, endCol: 1},
                {startRow: 0, startCol: 0, endRow: 1, endCol: 1}
            );
            expect(grid.getData()[1]).toEqual(["", "b", ""]);
        });
    });

    describe("selectionContains", () => {
        it("reports cells inside and outside the range", () => {
            const grid = model([["a", "b", "c"], ["d", "e", "f"]]);
            grid.setSelection({startRow: 0, startCol: 1, endRow: 1, endCol: 2});
            expect(grid.selectionContains(1, 2)).toBe(true);
            expect(grid.selectionContains(0, 0)).toBe(false);
            expect(grid.selectionContains(2, 1)).toBe(false);
        });

        it("is false when nothing is selected", () => {
            expect(model([["a", "b", "c"]]).selectionContains(0, 0)).toBe(false);
        });
    });

    describe("clearRange", () => {
        it("blanks the selected cells and skips read-only columns", () => {
            const grid = model([["a", "b", "c"]], 3, [2]);
            const changes = grid.clearRange({startRow: 0, startCol: 0, endRow: 0, endCol: 2});
            expect(grid.getData()).toEqual([["", "", "c"]]);
            expect(changes.length).toBe(2);
        });
    });

    describe("cell metadata", () => {
        it("stores and clears class names", () => {
            const grid = model([["a", "b", "c"]]);
            grid.setCellClassName(0, 1, "orange-bg");
            expect(grid.getCellClassName(0, 1)).toBe("orange-bg");
            grid.clearCellClassNames();
            expect(grid.getCellClassName(0, 1)).toBe("");
        });

        it("stores per-cell dropdown sources", () => {
            const grid = model([["a", "b", "c"]]);
            grid.setCellSource(0, 2, ["x", "y"]);
            expect(grid.getCellSource(0, 2)).toEqual(["x", "y"]);
            expect(grid.getCellSource(0, 0)).toBe(null);
        });
    });
});

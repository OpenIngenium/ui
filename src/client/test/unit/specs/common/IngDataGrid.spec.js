import { mount } from "@vue/test-utils";
import sinon from "sinon";
import IngDataGrid from "../../../../src/modules/common/IngDataGrid.vue";
import { GridColumnType, GridSource, ContextMenuItem } from "../../../../src/modules/common/grid/grid-constants";

function columns() {
    return [
        {header: "Name", width: 100, type: GridColumnType.TEXT},
        {header: "Count", width: 80, type: GridColumnType.NUMERIC},
        {header: "Unit", width: 80, type: GridColumnType.DROPDOWN, source: ["Volt", "Ohm"]},
        {header: "Measured", width: 80, type: GridColumnType.TEXT, readOnly: true}
    ];
}

function build(overrides = {}) {
    return mount(IngDataGrid, {
        attachToDocument: true,
        propsData: Object.assign({
            columns: columns(),
            rows: [
                ["alpha", 1, "Volt", "m1"],
                ["beta", 2, "Ohm", "m2"]
            ],
            contextMenuItems: [ContextMenuItem.ROW_ABOVE, ContextMenuItem.COPY],
            defaultRow: ["", 0, "Volt", ""]
        }, overrides)
    });
}

function tick() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function fakeCell(row, col) {
    return {
        getData: () => ({__row: row}),
        getField: () => "c" + col
    };
}

// the grid library finishes building on a timer, so DOM-level assertions have to wait for it
async function whenTableBuilt(wrapper) {
    for (let i = 0; i < 20 && !wrapper.vm.tableReady; i++) {
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    return wrapper.vm.tableReady;
}

function clipboardEvent(type, text) {
    const event = new Event(type, {bubbles: true, cancelable: true});
    event.clipboardData = {
        getData: () => text,
        setData: (mime, value) => {
            event.written = {mime, value};
        }
    };
    return event;
}

describe("IngDataGrid.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
            wrapper = null;
        }
    });

    describe("Ingenium data API", () => {
        it("exposes the loaded rows", () => {
            wrapper = build();
            expect(wrapper.vm.getData()).toEqual([
                ["alpha", 1, "Volt", "m1"],
                ["beta", 2, "Ohm", "m2"]
            ]);
        });

        it("replaces the data on loadData", () => {
            wrapper = build();
            wrapper.vm.loadData([["gamma", 3, "Volt", "m3"]]);
            expect(wrapper.vm.countRows()).toBe(1);
            expect(wrapper.vm.getDataAtCell(0, 0)).toBe("gamma");
        });

        it("reads and writes single cells", () => {
            wrapper = build();
            wrapper.vm.setDataAtCell(0, 0, "changed");
            expect(wrapper.vm.getDataAtCell(0, 0)).toBe("changed");
        });

        it("emits change events with Ingenium sources", () => {
            wrapper = build();
            wrapper.vm.setDataAtCell(0, 0, "changed", GridSource.EDIT);
            expect(wrapper.emitted("before-change")[0]).toEqual([[[0, 0, "alpha", "changed"]], GridSource.EDIT]);
            expect(wrapper.emitted("after-change")[0]).toEqual([[[0, 0, "alpha", "changed"]], GridSource.EDIT]);
        });

        it("stays silent for programmatic sync writes", () => {
            wrapper = build();
            wrapper.vm.setDataAtCell(0, 2, "Ohm", GridSource.SILENT);
            expect(wrapper.emitted("after-change")).toBeUndefined();
            expect(wrapper.vm.getDataAtCell(0, 2)).toBe("Ohm");
        });

        it("never leaks grid library objects through its events", () => {
            wrapper = build();
            wrapper.vm.setDataAtCell(0, 0, "changed", GridSource.EDIT);
            const payload = wrapper.emitted("after-change")[0][0];
            expect(Array.isArray(payload)).toBe(true);
            expect(Array.isArray(payload[0])).toBe(true);
            expect(payload[0].length).toBe(4);
        });
    });

    describe("cellEdited (real Tabulator edit completion)", () => {
        function fakeCell(row, col, value, oldValue) {
            return {
                getData: () => ({__row: row}),
                getField: () => "c" + col,
                getValue: () => value,
                getOldValue: () => oldValue
            };
        }

        it("emits the change synchronously", () => {
            wrapper = build();
            wrapper.vm.onCellEdited(fakeCell(0, 0, "changed", "alpha"));
            expect(wrapper.emitted("after-change")[0]).toEqual([[[0, 0, "alpha", "changed"]], GridSource.EDIT]);
        });

        it("updates the model", () => {
            wrapper = build();
            wrapper.vm.onCellEdited(fakeCell(0, 0, "changed", "alpha"));
            expect(wrapper.vm.getDataAtCell(0, 0)).toBe("changed");
        });

        it("moves the selection to the edited cell after the change is emitted", () => {
            wrapper = build({fillHandle: true});
            wrapper.vm.model.setSelection({startRow: 0, startCol: 1, endRow: 0, endCol: 1});

            wrapper.vm.onCellEdited(fakeCell(1, 3, "changed", "m2"));

            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 3, endRow: 1, endCol: 3});
        });

        it("repositions the fill handle onto the edited cell, after the change is emitted", async() => {
            wrapper = build({fillHandle: true});
            expect(await whenTableBuilt(wrapper)).toBe(true);
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 0});

            const calls = [];
            wrapper.vm.$on("after-change", () => calls.push("after-change"));
            sinon.stub(wrapper.vm, "updateFillHandle").callsFake(() => calls.push("updateFillHandle"));

            wrapper.vm.onCellEdited(fakeCell(1, 1, "changed", "2"));

            // the reposition that actually matters - the one reflecting the edited cell - must
            // happen after the change is emitted, not before, so a reload triggered by a
            // consumer's after-change handler can't leave it stranded
            expect(calls).toEqual(["after-change", "updateFillHandle"]);
            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 1, endRow: 1, endCol: 1});
        });
    });

    describe("resilience against Tabulator's own asynchronous range resets", () => {
        it("suppresses a reset to (0,0) that lands just after we explicitly selected a different cell", () => {
            wrapper = build();
            wrapper.vm.selectCell(1, 2);

            wrapper.vm.onRangeChanged({
                getTopEdge: () => 0, getLeftEdge: () => 0, getBottomEdge: () => 0, getRightEdge: () => 0
            });

            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 2, endRow: 1, endCol: 2});
        });

        it("does not suppress a genuine reset to (0,0) once the suspicious window has passed", async() => {
            wrapper = build();
            wrapper.vm.selectCell(1, 2);
            wrapper.vm.lastIntentionalSelectionAt = Date.now() - 1000;

            wrapper.vm.onRangeChanged({
                getTopEdge: () => 0, getLeftEdge: () => 0, getBottomEdge: () => 0, getRightEdge: () => 0
            });

            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 0, endRow: 0, endCol: 0});
        });

        it("never suppresses a genuine range change to a cell other than (0,0)", () => {
            wrapper = build();
            wrapper.vm.selectCell(1, 2);

            wrapper.vm.onRangeChanged({
                getTopEdge: () => 0, getLeftEdge: () => 3, getBottomEdge: () => 0, getRightEdge: () => 3
            });

            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 3, endRow: 0, endCol: 3});
        });

        it("never suppresses a genuine click on (0,0) itself", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);

            wrapper.vm.onRangeChanged({
                getTopEdge: () => 0, getLeftEdge: () => 0, getBottomEdge: () => 0, getRightEdge: () => 0
            });

            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 0, endRow: 0, endCol: 0});
        });
    });

    describe("headerClick", () => {
        function fakeColumn(col) {
            return {getField: () => "c" + col};
        }

        it("selects the entire column when its header is clicked", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            wrapper.vm.onHeaderClick(new MouseEvent("click"), fakeColumn(1));

            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 1, endRow: 1, endCol: 1});
        });

        it("emits a selection-change event for the whole column", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            wrapper.vm.onHeaderClick(new MouseEvent("click"), fakeColumn(0));

            expect(wrapper.emitted("selection-change")[0][0]).toEqual({startRow: 0, startCol: 0, endRow: 1, endCol: 0});
        });

        it("does nothing on an empty grid", () => {
            wrapper = build({rows: []});
            wrapper.vm.onHeaderClick(new MouseEvent("click"), fakeColumn(0));
            expect(wrapper.vm.getSelection()).toBeNull();
        });
    });

    describe("rows", () => {
        it("inserts a row below seeded with the default row", () => {
            wrapper = build();
            wrapper.vm.insertRow(0, "below");
            expect(wrapper.vm.getData()[1]).toEqual(["", 0, "Volt", ""]);
            expect(wrapper.emitted("after-create-row")[0]).toEqual([1, 1, GridSource.ROW_BELOW]);
        });

        it("inserts a row above", () => {
            wrapper = build();
            wrapper.vm.insertRow(1, "above", ["seed", 9, "Ohm", ""]);
            expect(wrapper.vm.getData()[1]).toEqual(["seed", 9, "Ohm", ""]);
            expect(wrapper.emitted("after-create-row")[0]).toEqual([1, 1, GridSource.ROW_ABOVE]);
        });

        it("suppresses the event for silent inserts", () => {
            wrapper = build();
            wrapper.vm.insertRow(0, "below", null, GridSource.SILENT);
            expect(wrapper.emitted("after-create-row")).toBeUndefined();
            expect(wrapper.vm.countRows()).toBe(3);
        });

        it("removes a row and reports it", () => {
            wrapper = build();
            wrapper.vm.removeRow(0);
            expect(wrapper.vm.countRows()).toBe(1);
            expect(wrapper.emitted("after-remove-row")[0]).toEqual([0, 1, GridSource.REMOVE_ROW]);
        });
    });

    describe("selection", () => {
        it("tracks the selected cell", () => {
            wrapper = build();
            wrapper.vm.selectCell(1, 2);
            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 2, endRow: 1, endCol: 2});
        });
    });

    describe("clipboard", () => {
        it("copies the selected range as spreadsheet TSV", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
            const event = clipboardEvent("copy");
            wrapper.element.dispatchEvent(event);
            expect(event.written.mime).toBe("text/plain");
            expect(event.written.value).toBe("alpha\t1\r\nbeta\t2");
        });

        it("copies values containing tabs, newlines and quotes in quoted form", () => {
            wrapper = build();
            wrapper.vm.loadData([["a\tb", "c\nd", "say \"hi\"", ""]]);
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 2});
            const event = clipboardEvent("copy");
            wrapper.element.dispatchEvent(event);
            expect(event.written.value).toBe("\"a\tb\"\t\"c\nd\"\t\"say \"\"hi\"\"\"");
        });

        it("pastes an Excel rectangular block at the selection anchor", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "x\t10\r\ny\t20"));
            expect(wrapper.vm.getData()).toEqual([
                ["x", "10", "Volt", "m1"],
                ["y", "20", "Ohm", "m2"]
            ]);
        });

        it("pastes a Google Sheets block using LF line endings", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "x\t10\ny\t20\n"));
            expect(wrapper.vm.getDataAtCell(1, 0)).toBe("y");
        });

        it("pastes quoted values containing tabs and newlines", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "\"a\tb\"\t\"c\nd\""));
            expect(wrapper.vm.getDataAtCell(0, 0)).toBe("a\tb");
            expect(wrapper.vm.getDataAtCell(0, 1)).toBe("c\nd");
        });

        it("keeps empty pasted cells empty", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "\t\t"));
            expect(wrapper.vm.getData()[0]).toEqual(["", "", "", "m1"]);
        });

        it("does not write into read-only columns", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "x\t1\tVolt\thacked"));
            expect(wrapper.vm.getDataAtCell(0, 3)).toBe("m1");
        });

        it("grows the grid when the pasted block is taller, seeding defaults", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "a\r\nb\r\nc"));
            expect(wrapper.vm.countRows()).toBe(3);
            expect(wrapper.vm.getData()[2]).toEqual(["c", 0, "Volt", ""]);
            expect(wrapper.emitted("after-create-row")[0][2]).toBe(GridSource.PASTE);
        });

        it("emits paste changes so validation can run", () => {
            wrapper = build();
            wrapper.vm.selectCell(0, 0);
            wrapper.element.dispatchEvent(clipboardEvent("paste", "x"));
            expect(wrapper.emitted("after-change")[0][1]).toBe(GridSource.PASTE);
        });

        it("clears the range on cut", () => {
            wrapper = build();
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 1});
            wrapper.element.dispatchEvent(clipboardEvent("cut"));
            expect(wrapper.vm.getData()[0]).toEqual(["", "", "Volt", "m1"]);
            expect(wrapper.emitted("after-change")[0][1]).toBe(GridSource.CUT);
        });
    });

    describe("fill", () => {
        it("fills the source value down to the hovered row", () => {
            wrapper = build({fillHandle: true});
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 0});
            wrapper.vm.startFill();
            wrapper.vm.hoveredCell = {row: 1, col: 0};
            wrapper.vm.endFill();
            expect(wrapper.vm.getDataAtCell(1, 0)).toBe("alpha");
            expect(wrapper.emitted("after-change")[0][1]).toBe(GridSource.FILL);
        });

        it("shows a preview rectangle for the duration of the drag and recomputes it on hover", async() => {
            wrapper = build({fillHandle: true});
            await whenTableBuilt(wrapper);
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 0});

            wrapper.vm.startFill();
            expect(wrapper.vm.showFillPreview).toBe(true);

            // jsdom has no layout engine (every getBoundingClientRect is zeroed), so this only
            // proves the preview is recomputed on hover, not real pixel geometry - see IngDataGrid.spec.js
            const recompute = sinon.spy(wrapper.vm, "updateFillPreview");
            wrapper.vm.onCellMouseOver(new MouseEvent("mouseover"), fakeCell(1, 0));
            expect(recompute.calledOnce).toBe(true);
            expect(wrapper.vm.showFillPreview).toBe(true);
        });

        it("hides the preview once the drag ends", () => {
            wrapper = build({fillHandle: true});
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 0});
            wrapper.vm.startFill();
            wrapper.vm.hoveredCell = {row: 1, col: 0};
            wrapper.vm.endFill();
            expect(wrapper.vm.showFillPreview).toBe(false);
            expect(wrapper.vm.filling).toBe(false);
        });

        it("does not update the preview for hovers outside of an active drag", () => {
            wrapper = build({fillHandle: true});
            wrapper.vm.onCellMouseOver(new MouseEvent("mouseover"), fakeCell(1, 0));
            expect(wrapper.vm.showFillPreview).toBe(false);
        });

        // A CSS transform on an ancestor (e.g. a modal's enter transition) does not fire
        // ResizeObserver, but it does change the fill handle's actual on-screen rect. Recompute
        // once that transition finishes, so a selectCell() made mid-transition (e.g. right when
        // a modal first opens) is not left with a stale/offset handle position.
        it("recomputes the fill handle once an ancestor's CSS transition finishes", () => {
            wrapper = build({fillHandle: true});
            const recompute = sinon.spy(wrapper.vm, "updateFillHandle");
            document.dispatchEvent(new Event("transitionend", {bubbles: true}));
            expect(recompute.called).toBe(true);
        });

        it("stops listening for transitionend once destroyed", () => {
            wrapper = build({fillHandle: true});
            const recompute = sinon.spy(wrapper.vm, "updateFillHandle");
            wrapper.destroy();
            wrapper = null;
            document.dispatchEvent(new Event("transitionend", {bubbles: true}));
            expect(recompute.called).toBe(false);
        });
    });

    describe("context menu", () => {
        function contextMenuEvent(clientX, clientY) {
            const event = new Event("contextmenu", {bubbles: true, cancelable: true});
            event.clientX = clientX;
            event.clientY = clientY;
            return event;
        }

        it("opens at the pointer instead of a library-positioned popup", () => {
            wrapper = build();
            wrapper.vm.onCellContext(contextMenuEvent(420, 310), fakeCell(1, 1));
            expect(wrapper.vm.contextMenu.visible).toBe(true);
            expect(wrapper.vm.contextMenuStyle).toEqual({left: "420px", top: "310px"});
        });

        it("renders one entry per requested item, in order", () => {
            wrapper = build({
                contextMenuItems: [ContextMenuItem.ROW_ABOVE, ContextMenuItem.REMOVE_ROW, ContextMenuItem.PASTE]
            });
            expect(wrapper.vm.contextMenuEntries.map(entry => entry.label))
                .toEqual(["Insert row above", "Remove row", "Paste"]);
        });

        it("stays closed when no items are configured", () => {
            wrapper = build({contextMenuItems: []});
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(0, 0));
            expect(wrapper.vm.contextMenu.visible).toBe(false);
        });

        it("moves the selection to a cell right-clicked outside the range", () => {
            wrapper = build();
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 0, endCol: 0});
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(1, 2));
            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 2, endRow: 1, endCol: 2});
        });

        it("keeps a multi-cell range when right-clicking inside it", () => {
            wrapper = build();
            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(1, 1));
            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
        });

        it("acts on the right-clicked row and closes", () => {
            wrapper = build();
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(1, 0));
            wrapper.vm.runContextMenuAction(ContextMenuItem.ROW_ABOVE);
            expect(wrapper.vm.countRows()).toBe(3);
            expect(wrapper.vm.getData()[1]).toEqual(["", 0, "Volt", ""]);
            expect(wrapper.vm.contextMenu.visible).toBe(false);
        });

        it("closes on Escape", () => {
            wrapper = build();
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(0, 0));
            document.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
            expect(wrapper.vm.contextMenu.visible).toBe(false);
        });

        it("closes when clicking away from the menu", () => {
            wrapper = build();
            wrapper.vm.onCellContext(contextMenuEvent(10, 10), fakeCell(0, 0));
            document.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
            expect(wrapper.vm.contextMenu.visible).toBe(false);
        });

        it("pastes the system clipboard when Paste is clicked", async() => {
            wrapper = build({contextMenuItems: [ContextMenuItem.PASTE]});
            const original = navigator.clipboard;
            Object.defineProperty(navigator, "clipboard", {
                value: {readText: () => Promise.resolve("pasted")},
                configurable: true
            });

            wrapper.vm.selectCell(0, 0);
            await wrapper.vm.pasteFromClipboard();

            expect(wrapper.vm.getDataAtCell(0, 0)).toBe("pasted");
            expect(wrapper.emitted("after-change")[0][1]).toBe(GridSource.PASTE);
            expect(wrapper.emitted("context-menu-paste")).toBeUndefined();
            Object.defineProperty(navigator, "clipboard", {value: original, configurable: true});
        });

        it("asks the consumer to explain Ctrl+V when the browser blocks clipboard reads", async() => {
            wrapper = build({contextMenuItems: [ContextMenuItem.PASTE]});
            const original = navigator.clipboard;
            Object.defineProperty(navigator, "clipboard", {
                value: {readText: () => Promise.reject(new Error("denied"))},
                configurable: true
            });

            await wrapper.vm.pasteFromClipboard();

            expect(wrapper.emitted("context-menu-paste").length).toBe(1);
            Object.defineProperty(navigator, "clipboard", {value: original, configurable: true});
        });
    });

    describe("columns", () => {
        it("marks editable dropdown cells so the caret is visible", () => {
            wrapper = build();
            expect(wrapper.vm.cellClassNames(columns()[2])).toEqual(["ing-data-grid-dropdown"]);
            expect(wrapper.vm.cellClassNames(columns()[0])).toEqual([]);
        });

        it("marks read-only cells and leaves them without a caret", () => {
            wrapper = build();
            expect(wrapper.vm.cellClassNames({type: GridColumnType.DROPDOWN, readOnly: true}))
                .toEqual(["ing-data-grid-readonly"]);
        });

        it("never decorates the column header, only its cells", () => {
            wrapper = build();
            wrapper.vm.tabulatorColumns().forEach(column => {
                expect(column.cssClass).toBeUndefined();
            });
            const headers = wrapper.element.querySelectorAll(".tabulator-col");
            headers.forEach(header => {
                expect(header.classList.contains("ing-data-grid-dropdown")).toBe(false);
                expect(header.classList.contains("ing-data-grid-readonly")).toBe(false);
            });
        });

        it("puts the caret on dropdown cells and the read-only shade on locked cells", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            const dropdownCell = wrapper.vm.tabulatorCell(0, 2);
            const readOnlyCell = wrapper.vm.tabulatorCell(0, 3);
            const textCell = wrapper.vm.tabulatorCell(0, 0);

            expect(dropdownCell.getElement().classList.contains("ing-data-grid-dropdown")).toBe(true);
            expect(readOnlyCell.getElement().classList.contains("ing-data-grid-readonly")).toBe(true);
            expect(textCell.getElement().classList.contains("ing-data-grid-dropdown")).toBe(false);
        });

        it("renders a real, independently-clickable caret element on editable dropdown cells", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            const dropdownCell = wrapper.vm.tabulatorCell(0, 2);
            expect(dropdownCell.getElement().querySelector(".ing-data-grid-dropdown-caret")).not.toBeNull();
        });

        it("never renders a caret on a read-only dropdown cell", async() => {
            wrapper = build({
                columns: [{header: "Unit", type: GridColumnType.DROPDOWN, source: ["Volt"], readOnly: true}],
                rows: [["Volt"]]
            });
            expect(await whenTableBuilt(wrapper)).toBe(true);

            const cell = wrapper.vm.tabulatorCell(0, 0);
            expect(cell.getElement().querySelector(".ing-data-grid-dropdown-caret")).toBeNull();
        });

        it("never renders a caret on plain text or numeric cells", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            expect(wrapper.vm.tabulatorCell(0, 0).getElement().querySelector(".ing-data-grid-dropdown-caret")).toBeNull();
            expect(wrapper.vm.tabulatorCell(0, 1).getElement().querySelector(".ing-data-grid-dropdown-caret")).toBeNull();
        });
    });

    describe("editing", () => {
        it("no longer exposes a whole-cell single-click handler - only the caret opens on click", () => {
            wrapper = build();
            expect(wrapper.vm.onCellClick).toBeUndefined();
        });

        it("opens a dropdown editor when its caret is clicked, selecting that cell first", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            const element = wrapper.vm.tabulatorCell(0, 2).getElement();
            const caret = element.querySelector(".ing-data-grid-dropdown-caret");

            caret.dispatchEvent(new MouseEvent("click", {bubbles: true}));

            expect(element.classList.contains("tabulator-editing")).toBe(true);
            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 2, endRow: 0, endCol: 2});
        });

        it("stops the caret's mousedown and click from reaching Tabulator's range-selection handling", async() => {
            wrapper = build();
            expect(await whenTableBuilt(wrapper)).toBe(true);

            const caret = wrapper.vm.tabulatorCell(0, 2).getElement().querySelector(".ing-data-grid-dropdown-caret");
            const tableMousedown = sinon.spy();
            const tableClick = sinon.spy();
            wrapper.vm.$refs.table.addEventListener("mousedown", tableMousedown);
            wrapper.vm.$refs.table.addEventListener("click", tableClick);

            caret.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
            caret.dispatchEvent(new MouseEvent("click", {bubbles: true}));

            expect(tableMousedown.called).toBe(false);
            expect(tableClick.called).toBe(false);
        });

        it("anchors editor popups to the grid instead of the document body", () => {
            wrapper = build();
            expect(wrapper.vm.table.options.popupContainer).toBe(wrapper.element);
        });

        it("keeps the selected cell after loadData reloads the table (e.g. a dropdown pick round-tripping through IngDataEntry)", async() => {
            wrapper = build();
            await whenTableBuilt(wrapper);

            wrapper.vm.selectCell(1, 2);
            wrapper.vm.loadData(wrapper.vm.getData());
            await tick();

            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 2, endRow: 1, endCol: 2});
        });

        it("keeps a multi-cell selection after a paste reloads the table", async() => {
            wrapper = build();
            await whenTableBuilt(wrapper);

            wrapper.vm.model.setSelection({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
            wrapper.vm.pasteText("x\ty\r\nz\tw");
            await tick();

            expect(wrapper.vm.getSelection()).toEqual({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
        });

        it("keeps the selected cell after a row is inserted", async() => {
            wrapper = build();
            await whenTableBuilt(wrapper);

            wrapper.vm.selectCell(1, 1);
            wrapper.vm.insertRow(0, "above");
            await tick();

            expect(wrapper.vm.getSelection()).toEqual({startRow: 1, startCol: 1, endRow: 1, endCol: 1});
        });
    });

    describe("cell metadata", () => {
        it("stores validation classes for cells", () => {
            wrapper = build();
            wrapper.vm.setCellClassName(0, 0, "orange-bg");
            expect(wrapper.vm.model.getCellClassName(0, 0)).toBe("orange-bg");
            wrapper.vm.clearCellClassNames();
            expect(wrapper.vm.model.getCellClassName(0, 0)).toBe("");
        });

        it("stores per-cell dropdown sources", () => {
            wrapper = build();
            wrapper.vm.setCellSource(0, 2, ["Ohm"]);
            expect(wrapper.vm.model.getCellSource(0, 2)).toEqual(["Ohm"]);
        });
    });
});

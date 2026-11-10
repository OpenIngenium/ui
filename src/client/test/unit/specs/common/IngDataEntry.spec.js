import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngDataEntry from "../../../../src/modules/common/IngDataEntry.vue";
import { GridColumnType, ContextMenuItem } from "../../../../src/modules/common/grid/grid-constants";

const localVue = createLocalVue();
localVue.use(Vuex);

function columnInfos() {
    return [
        {name: "a", header: "A", width: 100, type: "integer", defaultValue: 0, executionOnly: false},
        {name: "verification_condition", header: "Cond", width: 120, type: "string", defaultValue: "", executionOnly: false, enumValues: ["EQUAL", "INCLUSIVE_RANGE", "RECORD"]},
        // verification_values is split into two display columns - IngDataEntry.vue joins them
        // back into the [] / [v1] / [v1,v2] array verification_values is stored as
        {name: "verification_values", header: "Verify Value 1", width: 60, type: "string", defaultValue: "", executionOnly: false, verificationValuePart: "value1"},
        {name: "verification_values", header: "Verify Value 2", width: 60, type: "string", defaultValue: "", executionOnly: false, verificationValuePart: "value2"},
        {name: "execOnly", header: "E", width: 50, type: "string", defaultValue: "", executionOnly: true}
    ];
}

describe("IngDataEntry.vue", () => {
    function build({props = {}, mode = "authoring"} = {}) {
        const actions = {
            editEntries: sinon.spy(),
            editCustomScriptEntries: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                executionInputEntriesArrayFilter: () => () => [],
                executionInputCustomScriptEntriesArrayFilter: () => () => [],
                editMode: () => true
            },
            actions
        });
        const wrapper = shallowMount(IngDataEntry, {
            store,
            localVue,
            propsData: {
                elementId: "el1",
                mode,
                level: 2,
                disableFields: false,
                canDisableExecuteField: false,
                columnInfos: columnInfos(),
                ...props
            },
            stubs: {"ing-modal": {render: (h) => h("div")}, "ing-data-grid": {render: (h) => h("div")}, "ing-data-grid-info": {render: (h) => h("div")}}
        });
        return {wrapper, actions};
    }

    it("filterColumnInfos drops execution-only columns in authoring mode", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        expect(vm.columnNames()).toEqual(["a", "verification_condition", "verification_values", "verification_values"]);
    });

    it("filterColumnInfos keeps execution-only columns outside authoring mode", () => {
        const vm = build({mode: "execution"}).wrapper.vm;
        expect(vm.columnNames()).toContain("execOnly");
    });

    it("column header/width/size helpers derive from the filtered columns", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        expect(vm.columnHeaders()).toEqual(["A", "Cond", "Verify Value 1", "Verify Value 2"]);
        expect(vm.columnWidths()).toEqual([100, 120, 60, 60]);
        expect(vm.columnSize()).toBe(4);
    });

    it("columnDefaultValues falls back to the first enum value when default is invalid", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        expect(vm.columnDefaultValues()).toEqual([0, "EQUAL", "", ""]);
    });

    it("columnDefaultValues uses an empty string, not undefined, for columns with no defaultValue", () => {
        const noDefault = [{name: "flight_channel", header: "Channel", width: 100, type: "string", executionOnly: false}];
        const vm = build({props: {columnInfos: noDefault}, mode: "authoring"}).wrapper.vm;
        expect(vm.columnDefaultValues()).toEqual([""]);
    });

    it("getTableColumns maps types and readOnly flags", () => {
        const vm = build({mode: "authoring", props: {disableFields: true}}).wrapper.vm;
        const columns = vm.getTableColumns();
        expect(columns[0].type).toBe(GridColumnType.NUMERIC);
        expect(columns[1].type).toBe(GridColumnType.DROPDOWN);
        expect(columns[1].source).toEqual(["EQUAL", "INCLUSIVE_RANGE", "RECORD"]);
        expect(columns[0].readOnly).toBe(true);
    });

    it("getTableColumns carries headers and widths for the grid", () => {
        const columns = build({mode: "authoring"}).wrapper.vm.getTableColumns();
        expect(columns.map(column => column.header)).toEqual(["A", "Cond", "Verify Value 1", "Verify Value 2"]);
        expect(columns.map(column => column.width)).toEqual([100, 120, 60, 60]);
    });

    it("plain columns default to the text type", () => {
        const columns = build({mode: "authoring"}).wrapper.vm.getTableColumns();
        expect(columns[2].type).toBe(GridColumnType.TEXT);
    });

    it("execution-only columns follow canDisableExecuteField", () => {
        const vm = build({mode: "execution", props: {disableFields: false, canDisableExecuteField: true}}).wrapper.vm;
        const columns = vm.getTableColumns();
        expect(columns[0].readOnly).toBe(false);
        expect(columns[4].readOnly).toBe(true);
    });

    it("locks every column once disableFields is toggled on", async() => {
        const wrapper = build({mode: "execution", props: {disableFields: false, canDisableExecuteField: false}}).wrapper;
        wrapper.setProps({disableFields: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.gridColumns.every(column => column.readOnly)).toBe(true);
    });

    it("offers row and clipboard actions only while editing is allowed", async() => {
        const wrapper = build({mode: "execution"}).wrapper;
        expect(wrapper.vm.contextMenuItems).toEqual([
            ContextMenuItem.ROW_ABOVE,
            ContextMenuItem.ROW_BELOW,
            ContextMenuItem.REMOVE_ROW,
            ContextMenuItem.COPY,
            ContextMenuItem.PASTE,
            ContextMenuItem.CUT
        ]);
        wrapper.setProps({disableFields: true});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.contextMenuItems).toEqual([ContextMenuItem.COPY]);
    });

    it("validateCell parses integers and rejects non-numbers", () => {
        const vm = build().wrapper.vm;
        expect(vm.validateCell({type: "integer", defaultValue: 0}, "5", [])).toEqual({validated: true, cellValue: 5});
        expect(vm.validateCell({type: "integer", defaultValue: 0}, "abc", [])).toEqual({validated: false, cellValue: 0});
    });

    it("validateCell parses booleans and trims strings", () => {
        const vm = build().wrapper.vm;
        expect(vm.validateCell({type: "boolean", defaultValue: false}, "TRUE", []).cellValue).toBe(true);
        expect(vm.validateCell({type: "string", defaultValue: ""}, "  hi  ", []).cellValue).toBe("hi");
    });

    it("validateCell rejects null values", () => {
        const vm = build().wrapper.vm;
        expect(vm.validateCell({type: "string", defaultValue: "d"}, null, [])).toEqual({validated: false, cellValue: "d"});
    });

    it("validateCell enforces enum membership", () => {
        const vm = build().wrapper.vm;
        const result = vm.validateCell({type: "string", defaultValue: "EQUAL", enumValues: ["EQUAL", "RECORD"]}, "BOGUS", []);
        expect(result.validated).toBe(false);
        expect(result.cellValue).toBe("EQUAL");
    });

    it("toRowObj joins the split verify value columns for a range condition", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        const row = vm.toRowObj([5, "INCLUSIVE_RANGE", "1", "2"]);
        expect(row.a).toBe(5);
        expect(row.verification_values).toEqual(["1", "2"]);
    });

    it("toRowObj empties verification values for RECORD", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        const row = vm.toRowObj([5, "RECORD", "x", ""]);
        expect(row.verification_values).toEqual([]);
    });

    it("hasSyncAtIndex detects the sync property", () => {
        const infos = columnInfos();
        infos[0].sync = {index: 1, allowedValues: {}};
        const vm = build({props: {columnInfos: infos}}).wrapper.vm;
        expect(vm.hasSyncAtIndex(0)).toBe(true);
        expect(vm.hasSyncAtIndex(1)).toBe(false);
    });

    it("toggleBodyClass adds and removes the modal-open class", () => {
        const vm = build().wrapper.vm;
        vm.toggleBodyClass("addClass", "modal-open");
        expect(document.body.classList.contains("modal-open")).toBe(true);
        vm.toggleBodyClass("removeClass", "modal-open");
        expect(document.body.classList.contains("modal-open")).toBe(false);
    });

    it("handleClose emits a dataEntryEvent without saving", () => {
        const wrapper = build().wrapper;
        wrapper.vm.handleClose();
        expect(wrapper.emitted("dataEntryEvent")[0][0]).toEqual({type: "showModal", val: false, save: false});
    });

    it("handleSave dispatches the configured method and emits a save event", () => {
        const {wrapper, actions} = build({mode: "authoring"});
        wrapper.vm.gridRef = {getData: () => [[5, "EQUAL", "10", ""]]};
        wrapper.vm.handleSave();
        expect(actions.editEntries.called).toBe(true);
        const payload = actions.editEntries.lastCall.args[1];
        expect(payload.elementId).toBe("el1");
        expect(payload.level).toBe(2);
        expect(payload.value[0].verification_values).toEqual(["10"]);
        expect(wrapper.emitted("dataEntryEvent")[0][0]).toEqual({type: "showModal", val: false, save: true});
    });
});

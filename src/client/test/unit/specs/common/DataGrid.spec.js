import { mount, shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import Vue from "vue";
import Vuex from "vuex";
import * as faker from "faker";
import { createLocalVue } from "@vue/test-utils";
import { HotTable } from '@handsontable/vue';
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import IngDataEntry from "../../../../src/modules/common/IngDataEntry.vue";

const elementId = faker.random.uuid();

// State
const state = {
    elements: {
        [elementId]: {
            execution_user_input: {
                entries: [
                    {
                        signal_name: 'they\'re',
                        icds: 'great',
                        from: 2,
                        to: 3,
                        unit: 'Volt',
                        min_value: 0,
                        max_value: 100,
                        actual_value: 'real'
                    },
                    {
                        signal_name: 'quality you',
                        icds: 'can taste',
                        from: 3,
                        to: 4,
                        unit: 'Ohm',
                        min_value: 1,
                        max_value: 101,
                        actual_value: 'super real'
                    }
                ]
            }
        }
    }
};

// Column definitions are now supplied by the parent component via the `columnInfos`
// prop (the component was refactored from hardcoded EIP columns to a generic grid).
// The last column (actual_value) is execution-only, so it is filtered out in authoring mode.
const columnInfos = [
    { name: "signal_name", header: "Signal Name", width: 100, type: "string", executionOnly: false, defaultValue: "" },
    { name: "icds", header: "ICDS", width: 100, type: "string", executionOnly: false, defaultValue: "" },
    { name: "from", header: "From (red probe)", width: 100, type: "integer", executionOnly: false, defaultValue: 0 },
    { name: "to", header: "To (black probe)", width: 100, type: "integer", executionOnly: false, defaultValue: 0 },
    { name: "unit", header: "Units", width: 100, type: "string", executionOnly: false, defaultValue: "" },
    { name: "min_value", header: "Min", width: 100, type: "integer", executionOnly: false, defaultValue: 0 },
    { name: "max_value", header: "Max", width: 100, type: "integer", executionOnly: false, defaultValue: 0 },
    { name: "actual_value", header: "Measured", width: 100, type: "string", executionOnly: true, defaultValue: "" }
];

// Props
const propsData = {
    elementId,
    showModal: false,
    mode: 'execution',
    level: 1,
    disableFields: false,
    canDisableExecuteField: false,
    columnInfos
};

// Getters
const getters = {
    executionInputEntriesArrayFilter: ExecutionStore.getters.executionInputEntriesArrayFilter,
    executionInputCustomScriptEntriesArrayFilter: ExecutionStore.getters.executionInputCustomScriptEntriesArrayFilter,
    editMode: () => true
};

// Actions
const actions = {
    editEntries: () => {},
    editCustomScriptEntries: () => {}
};

// Stub ing-modal so its default slot (which contains <hot-table>) is not rendered.
// This avoids initializing Handsontable's DOM (unsupported under jsdom) while still
// giving us a real IngDataEntry instance to exercise its methods/computed props.
const stubs = {
    "ing-modal": { render: (h) => h("div") },
    "ing-data-grid-info": true
};

const localVue = createLocalVue();
localVue.use(Vuex);

// The component was refactored to a generic, columnInfos-driven grid; the grid-interaction
// tests (paste / add / remove rows / modal visibility) required a live Handsontable instance
// that does not render under jsdom, so they were retired. These tests exercise the component's
// own logic (column filtering by mode, data mapping, cell validation, row->object conversion)
// via shallowMount so they do not depend on the Handsontable DOM.
function makeWrapper(overrides = {}) {
    const store = new Vuex.Store({ state, getters, actions });
    return shallowMount(IngDataEntry, {
        store,
        localVue,
        propsData: { ...propsData, ...overrides },
        stubs
    });
}

describe("IngDataEntry (DataGrid)", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = makeWrapper();
    });

    afterEach(() => {
        if (wrapper) wrapper.destroy();
    });

    describe("column configuration", () => {
        it("[execution mode] includes all columns in order", () => {
            expect(wrapper.vm.mode).toBe("execution");
            expect(wrapper.vm.columnSize()).toBe(8);
            expect(wrapper.vm.columnHeaders()).toEqual([
                "Signal Name", "ICDS", "From (red probe)", "To (black probe)",
                "Units", "Min", "Max", "Measured"
            ]);
            expect(wrapper.vm.hotSettings.colHeaders.length).toBe(8);
            expect(wrapper.vm.hotSettings.maxCols).toBe(8);
        });

        it("[authoring mode] filters out execution-only columns", () => {
            const authoring = makeWrapper({ mode: "authoring" });
            expect(authoring.vm.columnSize()).toBe(7);
            expect(authoring.vm.columnHeaders()).toEqual([
                "Signal Name", "ICDS", "From (red probe)", "To (black probe)",
                "Units", "Min", "Max"
            ]);
            expect(authoring.vm.columnHeaders()).not.toContain("Measured");
            authoring.destroy();
        });

        it("columnNames reflect the filtered columns per mode", () => {
            expect(wrapper.vm.columnNames()).toEqual([
                "signal_name", "icds", "from", "to", "unit", "min_value", "max_value", "actual_value"
            ]);
            const authoring = makeWrapper({ mode: "authoring" });
            expect(authoring.vm.columnNames()).not.toContain("actual_value");
            authoring.destroy();
        });
    });

    describe("hotData (executionInputEntriesArrayFilter)", () => {
        it("[execution mode] maps entries to arrays for every column", () => {
            expect(wrapper.vm.hotData.length).toBe(2);
            expect(wrapper.vm.hotData[0].length).toBe(8);
            expect(wrapper.vm.hotData).toEqual([
                ["they're", "great", 2, 3, "Volt", 0, 100, "real"],
                ["quality you", "can taste", 3, 4, "Ohm", 1, 101, "super real"]
            ]);
        });

        it("[authoring mode] omits the execution-only column from each row", () => {
            const authoring = makeWrapper({ mode: "authoring" });
            expect(authoring.vm.hotData.length).toBe(2);
            expect(authoring.vm.hotData[0].length).toBe(7);
            expect(authoring.vm.hotData[0]).toEqual(["they're", "great", 2, 3, "Volt", 0, 100]);
            authoring.destroy();
        });
    });

    describe("validateCell", () => {
        it("parses valid integers", () => {
            const col = { type: "integer", name: "from", defaultValue: 0 };
            expect(wrapper.vm.validateCell(col, "5", [])).toEqual({ validated: true, cellValue: 5 });
        });

        it("falls back to the default for invalid integers", () => {
            const col = { type: "integer", name: "from", defaultValue: 0 };
            expect(wrapper.vm.validateCell(col, "abc", [])).toEqual({ validated: false, cellValue: 0 });
        });

        it("trims valid strings", () => {
            const col = { type: "string", name: "unit", defaultValue: "" };
            expect(wrapper.vm.validateCell(col, "  Volt  ", [])).toEqual({ validated: true, cellValue: "Volt" });
        });

        it("marks null values invalid", () => {
            const col = { type: "string", name: "unit", defaultValue: "" };
            expect(wrapper.vm.validateCell(col, null, []).validated).toBe(false);
        });

        it("coerces out-of-range enum values to the first allowed value", () => {
            const col = { type: "string", name: "unit", defaultValue: "A", enumValues: ["A", "B"] };
            expect(wrapper.vm.validateCell(col, "Z", [])).toEqual({ validated: false, cellValue: "A" });
        });
    });

    describe("toRowObj", () => {
        it("[execution mode] maps a value array back to a keyed object with typed integers", () => {
            const row = ["sig", "icd", "2", "3", "V", "0", "100", "meas"];
            expect(wrapper.vm.toRowObj(row)).toEqual({
                signal_name: "sig", icds: "icd", from: 2, to: 3,
                unit: "V", min_value: 0, max_value: 100, actual_value: "meas"
            });
        });
    });
});

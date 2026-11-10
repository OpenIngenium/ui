import { mount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import IngDataEntry from "../../../../src/modules/common/IngDataEntry.vue";
import { GridSource, INVALID_CELL_CLASS } from "../../../../src/modules/common/grid/grid-constants";

const localVue = createLocalVue();
localVue.use(Vuex);

const ELEMENT_ID = "element-1";

// Mirrors the VerifyEhaElement column configuration, including the execution-only
// column and the verification_values pair (split into two display columns - see the
// note in IngDataEntry.vue) handled specially by toRowObj/validateCell.
function columnInfos() {
    return [
        {name: "channel_type", header: "Channel Type", type: "string", defaultValue: "FLIGHT", executionOnly: false, width: 93, enumValues: ["FLIGHT", "SSE"]},
        {name: "channel_id", header: "Channel ID", type: "string", defaultValue: "", executionOnly: false, width: 93, enumValues: []},
        {name: "verification_condition", header: "Verification Condition", type: "string", defaultValue: "RECORD", executionOnly: false, width: 93, enumValues: ["RECORD", "INCLUSIVE_RANGE", "EQUAL", "NOT_PRESENT"]},
        {name: "verification_values", header: "Verify Value 1", type: "string", defaultValue: "", executionOnly: false, width: 47, verificationValuePart: "value1", enumValues: []},
        {name: "verification_values", header: "Verify Value 2", type: "string", defaultValue: "", executionOnly: false, width: 46, verificationValuePart: "value2", enumValues: []},
        {name: "measured", header: "Measured", type: "string", defaultValue: "", executionOnly: true, width: 93, enumValues: []}
    ];
}

// Data as it is persisted today (verification_values is an array on the wire).
function persistedEntries() {
    return [
        {channel_type: "FLIGHT", channel_id: "A-1", verification_condition: "EQUAL", verification_values: ["5"], measured: "m1"},
        {channel_type: "SSE", channel_id: "B-2", verification_condition: "INCLUSIVE_RANGE", verification_values: ["1", "2"], measured: ""},
        {channel_type: "FLIGHT", channel_id: "C-3", verification_condition: "RECORD", verification_values: [], measured: ""}
    ];
}

const IngModalStub = {
    render(h) {
        return h("div", [this.$slots.title, this.$slots.body, this.$slots.footer]);
    }
};

function build({entries = persistedEntries(), infos = columnInfos(), mode = "execution", props = {}} = {}) {
    const editEntries = sinon.spy();
    const store = new Vuex.Store({
        state: {
            elements: {
                [ELEMENT_ID]: {execution_user_input: {entries}}
            }
        },
        getters: {
            executionInputEntriesArrayFilter: ExecutionStore.getters.executionInputEntriesArrayFilter,
            executionInputCustomScriptEntriesArrayFilter: ExecutionStore.getters.executionInputCustomScriptEntriesArrayFilter,
            editMode: () => true
        },
        actions: {
            editEntries,
            editCustomScriptEntries: () => {}
        }
    });

    const wrapper = mount(IngDataEntry, {
        store,
        localVue,
        attachToDocument: true,
        propsData: Object.assign({
            elementId: ELEMENT_ID,
            showModal: false,
            mode,
            level: 2,
            disableFields: false,
            canDisableExecuteField: false,
            columnInfos: infos
        }, props),
        stubs: {
            "ing-modal": IngModalStub,
            "ing-data-grid-info": {render: (h) => h("div")}
        }
    });

    return {wrapper, editEntries};
}

async function openModal(wrapper) {
    wrapper.setProps({showModal: true});
    await flush(wrapper);
}

async function flush(wrapper) {
    for (let i = 0; i < 4; i++) {
        await wrapper.vm.$nextTick();
    }
}

function pasteInto(wrapper, text) {
    const event = new Event("paste", {bubbles: true, cancelable: true});
    event.clipboardData = {getData: () => text};
    wrapper.vm.$refs.grid.$el.dispatchEvent(event);
}

function copyFrom(wrapper) {
    const event = new Event("copy", {bubbles: true, cancelable: true});
    event.clipboardData = {
        getData: () => "",
        setData: (mime, value) => {
            event.written = value;
        }
    };
    wrapper.vm.$refs.grid.$el.dispatchEvent(event);
    return event.written;
}

function savedPayload(editEntries) {
    return editEntries.lastCall.args[1];
}

describe("IngDataEntry round trip (persisted data <-> grid)", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
            wrapper = null;
        }
    });

    describe("loading old persisted data", () => {
        it("loads every persisted entry into the grid", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            expect(wrapper.vm.$refs.grid.getData()).toEqual([
                ["FLIGHT", "A-1", "EQUAL", "5", "", "m1"],
                ["SSE", "B-2", "INCLUSIVE_RANGE", "1", "2", ""],
                ["FLIGHT", "C-3", "RECORD", "", "", ""]
            ]);
        });

        it("splits persisted verification_values arrays across the two verify value columns", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);
            expect(wrapper.vm.$refs.grid.getDataAtCell(1, 3)).toBe("1");
            expect(wrapper.vm.$refs.grid.getDataAtCell(1, 4)).toBe("2");
        });

        it("blanks a fully empty persisted row, keeping enum columns on their first allowed value", async() => {
            const built = build({entries: [{channel_type: null, channel_id: null, verification_condition: null, verification_values: null, measured: null}]});
            wrapper = built.wrapper;
            await openModal(wrapper);
            expect(wrapper.vm.$refs.grid.getData()).toEqual([["FLIGHT", "", "RECORD", "", "", ""]]);
        });

        it("saves an empty persisted row back with array-shaped verification values", async() => {
            const built = build({entries: [{channel_type: null, channel_id: null, verification_condition: null, verification_values: null, measured: null}]});
            wrapper = built.wrapper;
            await openModal(wrapper);
            wrapper.vm.handleSave();

            expect(savedPayload(built.editEntries).value).toEqual([{
                channel_type: "FLIGHT",
                channel_id: "",
                verification_condition: "RECORD",
                verification_values: [],
                measured: ""
            }]);
        });

        it("flags invalid persisted values and substitutes the column default", async() => {
            const entries = persistedEntries();
            entries[0].channel_type = "NOT_A_CHANNEL";
            const built = build({entries});
            wrapper = built.wrapper;
            await openModal(wrapper);

            expect(wrapper.vm.$refs.grid.getDataAtCell(0, 0)).toBe("FLIGHT");
            expect(wrapper.vm.$refs.grid.model.getCellClassName(0, 0)).toBe(INVALID_CELL_CLASS);
        });

        it("keeps execution-only columns out of the grid in authoring mode", async() => {
            const built = build({mode: "authoring"});
            wrapper = built.wrapper;
            await openModal(wrapper);
            expect(wrapper.vm.$refs.grid.getData()[0]).toEqual(["FLIGHT", "A-1", "EQUAL", "5", ""]);
        });
    });

    describe("saving without edits", () => {
        it("writes back exactly the persisted representation", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.handleSave();

            expect(savedPayload(built.editEntries).value).toEqual(persistedEntries());
        });

        it("keeps verification_values an array for every condition", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries[0].verification_values).toEqual(["5"]);
            expect(entries[1].verification_values).toEqual(["1", "2"]);
            expect(entries[2].verification_values).toEqual([]);
        });

        it("emits the save event expected by the element wrappers", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);
            wrapper.vm.handleSave();

            expect(wrapper.emitted("dataEntryEvent")[0][0]).toEqual({type: "showModal", val: false, save: true});
            expect(savedPayload(built.editEntries).level).toBe(2);
            expect(savedPayload(built.editEntries).elementId).toBe(ELEMENT_ID);
        });
    });

    describe("editing then saving", () => {
        it("persists a single cell edit without touching the other rows", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.setDataAtCell(0, 1, "A-9");
            await flush(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries[0].channel_id).toBe("A-9");
            expect(entries[1]).toEqual(persistedEntries()[1]);
        });

        it("re-validates a pasted enum value and falls back to the first allowed value", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(0, 0);
            pasteInto(wrapper, "BOGUS");
            await flush(wrapper);

            expect(wrapper.vm.$refs.grid.getDataAtCell(0, 0)).toBe("FLIGHT");
            expect(wrapper.vm.$refs.grid.model.getCellClassName(0, 0)).toBe(INVALID_CELL_CLASS);
        });

        it("drops the orange highlight once the value validates", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(0, 0);
            pasteInto(wrapper, "BOGUS");
            await flush(wrapper);
            expect(wrapper.vm.$refs.grid.model.getCellClassName(0, 0)).toBe(INVALID_CELL_CLASS);

            wrapper.vm.$refs.grid.setDataAtCell(0, 0, "SSE", GridSource.EDIT);
            await flush(wrapper);

            expect(wrapper.vm.$refs.grid.getDataAtCell(0, 0)).toBe("SSE");
            expect(wrapper.vm.$refs.grid.model.getCellClassName(0, 0)).toBe("");
        });

        it("accepts a rectangular Excel paste across rows and columns", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(0, 1);
            pasteInto(wrapper, "X-1\tEQUAL\r\nX-2\tEQUAL");
            await flush(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries[0].channel_id).toBe("X-1");
            expect(entries[1].channel_id).toBe("X-2");
            expect(entries[1].verification_condition).toBe("EQUAL");
        });

        it("keeps a pasted range value in the persisted array shape", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            // paste across both verify value columns (3 and 4)
            wrapper.vm.$refs.grid.selectCell(1, 3);
            pasteInto(wrapper, "7\t9");
            await flush(wrapper);
            wrapper.vm.handleSave();

            expect(savedPayload(built.editEntries).value[1].verification_values).toEqual(["7", "9"]);
        });

        it("clears verification values when the condition forbids them", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(0, 2);
            pasteInto(wrapper, "NOT_PRESENT");
            await flush(wrapper);
            wrapper.vm.handleSave();

            expect(savedPayload(built.editEntries).value[0].verification_values).toEqual([]);
        });

        it("grows the grid for a taller paste and saves the new rows", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(2, 1);
            pasteInto(wrapper, "D-4\r\nE-5");
            await flush(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries.length).toBe(4);
            expect(entries[3].channel_id).toBe("E-5");
            expect(entries[3].verification_values).toEqual([]);
        });

        it("never writes into a read-only execution column", async() => {
            const built = build({props: {canDisableExecuteField: true}});
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.selectCell(0, 5);
            pasteInto(wrapper, "tampered");
            await flush(wrapper);

            expect(wrapper.vm.$refs.grid.getDataAtCell(0, 5)).toBe("m1");
        });
    });

    describe("rows", () => {
        it("seeds an inserted row with the column defaults and saves it", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.insertRow(0, "below");
            await flush(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries.length).toBe(4);
            expect(entries[1]).toEqual({
                channel_type: "FLIGHT",
                channel_id: "",
                verification_condition: "RECORD",
                verification_values: [],
                measured: ""
            });
        });

        it("drops a removed row from the saved payload", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.removeRow(1);
            await flush(wrapper);
            wrapper.vm.handleSave();

            const entries = savedPayload(built.editEntries).value;
            expect(entries.length).toBe(2);
            expect(entries.map(entry => entry.channel_id)).toEqual(["A-1", "C-3"]);
        });
    });

    describe("clipboard export", () => {
        it("copies a selected block in a format Excel and Sheets can read", async() => {
            const built = build();
            wrapper = built.wrapper;
            await openModal(wrapper);

            wrapper.vm.$refs.grid.model.setSelection({startRow: 0, startCol: 0, endRow: 1, endCol: 1});
            expect(copyFrom(wrapper)).toBe("FLIGHT\tA-1\r\nSSE\tB-2");
        });
    });
});

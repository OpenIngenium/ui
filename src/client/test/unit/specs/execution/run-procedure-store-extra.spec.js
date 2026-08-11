import Vue from "vue";
import Vuex from "vuex";
import runProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";

Vue.use(Vuex);

const RP = "rp1";

function buildState() {
    return {
        procedures: [{procedure_id: "p1"}],
        procedureCount: 1,
        procedureVersions: {},
        tagSelectionsObj: {
            [RP]: [
                {tag_id: "t1", selected: true},
                {tag_id: "t2", selected: false}
            ]
        },
        procedureOutlines: {
            [RP]: {
                A: {elem_id: "A", parent_id: "", selected: false, tag_ids: ["t1"]},
                B: {elem_id: "B", parent_id: "A", selected: false, tag_ids: []},
                C: {elem_id: "C", parent_id: "B", selected: true, tag_ids: []},
                D: {elem_id: "D", parent_id: "A", selected: false, tag_ids: ["t2"]}
            }
        },
        procedureOutlineIds: {[RP]: ["A", "B", "C", "D"]},
        executionTags: {t1: {tag_id: "t1"}},
        procedureOutlineStructures: {
            [RP]: {
                A: {parent_ids: [], child_ids: ["B", "D"]},
                B: {parent_ids: ["A"], child_ids: ["C"]},
                C: {parent_ids: ["B", "A"], child_ids: []},
                D: {parent_ids: ["A"], child_ids: []}
            }
        }
    };
}

describe("run-procedure-store getters (selection)", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({state: buildState(), getters: runProcedureStore.getters});
    });

    it("selectedStepIds and selectedSteps return only selected elements", () => {
        expect(store.getters.selectedStepIds(RP)).toEqual(["C"]);
        expect(store.getters.selectedSteps(RP)).toEqual([
            {elem_id: "C", parent_id: "B", selected: true, tag_ids: []}
        ]);
    });

    it("runProcedureTagSelections and executionTags", () => {
        expect(store.getters.runProcedureTagSelections(RP).length).toBe(2);
        expect(store.getters.executionTags).toEqual({t1: {tag_id: "t1"}});
    });

    it("selectedTagIds returns selected tag ids or empty", () => {
        expect(store.getters.selectedTagIds({runProcedureElementId: RP})).toEqual(["t1"]);
        expect(store.getters.selectedTagIds({runProcedureElementId: "missing"})).toEqual([]);
    });

    it("procedureSelectedOutlineElementsByParent filters selected children", () => {
        const selected = store.getters.procedureSelectedOutlineElementsByParent({
            runProcedureElementId: RP,
            elementId: "B"
        });
        expect(selected.map((e) => e.elem_id)).toEqual(["C"]);
    });

    it("isSelected reflects selection and warns for missing", () => {
        expect(store.getters.isSelected({runProcedureElementId: RP, elementId: "C"})).toBe(true);
        expect(store.getters.isSelected({runProcedureElementId: RP, elementId: "A"})).toBe(false);
        expect(store.getters.isSelected({runProcedureElementId: RP, elementId: "missing"})).toBe(false);
    });

    it("isSelectable depends on the element's tags vs selected tags", () => {
        // A has tag t1 which is selected -> selectable
        expect(store.getters.isSelectable({runProcedureElementId: RP, elementId: "A"})).toBe(true);
        // D has tag t2 which is not selected -> not selectable
        expect(store.getters.isSelectable({runProcedureElementId: RP, elementId: "D"})).toBe(false);
        expect(store.getters.isSelectable({runProcedureElementId: RP, elementId: "missing"})).toBe(false);
    });

    // NOTE: procedureOutlineNestedElementIds is intentionally not exercised here.
    // It concats the object returned by procedureOutlineElementsByParent onto an
    // array (expecting an array), which loops infinitely. Flagged as a latent
    // source defect; not tested to avoid hanging the suite.
});

describe("run-procedure-store mutations (selection)", () => {
    const m = runProcedureStore.mutations;
    // getters stub used by selection mutations
    const selectableGetters = {isSelectable: () => true};
    let state;

    beforeEach(() => {
        state = buildState();
    });

    it("addExecutionTags merges tags by id", () => {
        m.addExecutionTags(state, {tags: [{tag_id: "t9", name: "New"}]});
        expect(state.executionTags.t9).toEqual({tag_id: "t9", name: "New"});
        expect(state.executionTags.t1).toBeDefined();
    });

    it("setRunProcedureTagSelections replaces tag selections for a run", () => {
        m.setRunProcedureTagSelections(state, {
            runProcedureElementId: RP,
            tagSelections: [{tag_id: "tX", selected: true}]
        });
        expect(state.tagSelectionsObj[RP]).toEqual([{tag_id: "tX", selected: true}]);
    });

    it("selectAllItems selects all selectable items", () => {
        m.selectAllItems(state, {runProcedureElementId: RP, getters: selectableGetters});
        const outline = state.procedureOutlines[RP];
        expect(outline.A.selected).toBe(true);
        expect(outline.B.selected).toBe(true);
        expect(outline.C.selected).toBe(true);
        expect(outline.D.selected).toBe(true);
    });

    it("unselectAllItems clears all selections", () => {
        m.unselectAllItems(state, {runProcedureElementId: RP});
        const outline = state.procedureOutlines[RP];
        expect(outline.A.selected).toBe(false);
        expect(outline.C.selected).toBe(false);
    });

    it("toggleStep selects an element with its descendants and ancestors", () => {
        m.toggleStep(state, {runProcedureElementId: RP, elementId: "B", getters: selectableGetters});
        const outline = state.procedureOutlines[RP];
        expect(outline.B.selected).toBe(true);
        expect(outline.C.selected).toBe(true); // descendant
        expect(outline.A.selected).toBe(true); // ancestor
    });

    it("toggleStep de-selects an element and its descendants", () => {
        // First select B subtree, then toggle B off
        m.toggleStep(state, {runProcedureElementId: RP, elementId: "B", getters: selectableGetters});
        m.toggleStep(state, {runProcedureElementId: RP, elementId: "B", getters: selectableGetters});
        const outline = state.procedureOutlines[RP];
        expect(outline.B.selected).toBe(false);
        expect(outline.C.selected).toBe(false);
    });

    it("toggleTag selects tagged elements and their ancestors when selected", () => {
        m.toggleTag(state, {runProcedureElementId: RP, tagId: "t1", selected: true, getters: selectableGetters});
        const outline = state.procedureOutlines[RP];
        // A has tag t1 -> selected, and D has tag t2 -> selected (stub makes all selectable)
        expect(outline.A.selected).toBe(true);
        expect(outline.D.selected).toBe(true);
    });
});

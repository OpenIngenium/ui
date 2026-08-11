import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import faker from "faker";
import RunProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import SelectProcedureSections from "../../../../src/modules/elements/non-executable/run-procedure/SelectProcedureSections.vue";

// State
const runProcedureElementId = faker.random.uuid();
const elementParentId01 = faker.random.uuid();
const elementParentId02 = faker.random.uuid();
const state = {
    procedureOutlines: {
        [runProcedureElementId]: {
            [elementParentId01]: {
                elem_id: elementParentId01,
                parent_id: "",
                child_ids: [elementParentId01]
            },
            [elementParentId02]: {
                elem_id: elementParentId02,
                parent_id: "",
                child_ids: [elementParentId02]
            },
            '': {
                elem_id: elementParentId02,
                parent_id: "",
                child_ids: [elementParentId02]
            },
        },
    },
    procedureOutlineStructures: {
        [runProcedureElementId]: {
            [elementParentId01]: {
                elem_id: elementParentId01,
                parent_id: "",
                child_ids: [elementParentId01]
            },
            [elementParentId02]: {
                elem_id: elementParentId02,
                parent_id: "",
                child_ids: [elementParentId02]
            },
            '': {
                elem_id: elementParentId02,
                parent_id: "",
                child_ids: [elementParentId02]
            },
        }
    },
    procedureOutlineIds: {
        [runProcedureElementId]: [ elementParentId01, elementParentId02 ],
    },
    elements: {
        [runProcedureElementId]: {
            elem_id: runProcedureElementId,
            execution_user_input: {
                elements: [],
            },
        },
    },
    tagSelectionsObj: {
        [runProcedureElementId]: [],
    }
};
for(let i = 0; i < 5; i++) {
    let newElementId01 = faker.random.uuid();
    state.procedureOutlines[runProcedureElementId][newElementId01] = {
        elem_id: newElementId01,
        parent_id: elementParentId01,
    };
    state.procedureOutlineIds[runProcedureElementId].push(newElementId01);

    let newElementId02 = faker.random.uuid();
    state.procedureOutlines[runProcedureElementId][newElementId02] = {
        elem_id: newElementId02,
        parent_id: elementParentId02,
    };
    state.procedureOutlineIds[runProcedureElementId].push(newElementId02);
}

// Props
const propsData = {
    runProcedureElementId: runProcedureElementId,
    elementId: runProcedureElementId,
};

// Getters
const getters = {
    procedureOutlineNestedElementIds: RunProcedureStore.getters.procedureOutlineNestedElementIds,
    procedureOutlineElementsByParent: RunProcedureStore.getters.procedureOutlineElementsByParent,
    isSelected: RunProcedureStore.getters.isSelected,
    elementsByParent: ExecutionStore.getters.elementsByParent,
    executionInputKey: ExecutionStore.getters.executionInputKey,
    runProcedureTagSelections: RunProcedureStore.getters.runProcedureTagSelections
};

// Stub components
const stubs = {
    PreviewOutline: true,
    "tags-procedure-select": true
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

describe("SelectProcedureSections.vue", () => {
    let store;
    let wrapper;
    let selectAll;
    let unselectAll;

    beforeEach(() => {
        selectAll = sinon.spy();
        unselectAll = sinon.spy();
        store = new Vuex.Store({
            state,
            getters,
            actions: {
                updateProcedureOutlineSelection: sinon.spy(),
                assembleProcedurePrecomputed: sinon.spy(),
                selectAll,
                unselectAll
            }
        });
        wrapper = shallow(SelectProcedureSections, {
            store,
            localVue,
            propsData,
            stubs,
        });
    });

    it("childElements returns the parent-level outline elements", () => {
        expect(wrapper.vm.childElements).toBeDefined();
        expect(typeof wrapper.vm.childElements).toBe("object");
    });

    it("populateSteps returns child elements while the cache is empty", () => {
        wrapper.vm.steps = [];
        expect(wrapper.vm.populateSteps()).toEqual(wrapper.vm.childElements);
    });

    it("isOpenForFirstTime is true when no elements are selected", () => {
        expect(wrapper.vm.isOpenForFirstTime).toBe(true);
    });

    it("selectAllSteps dispatches selectAll with the tag selections", () => {
        wrapper.vm.selectAllSteps();
        expect(selectAll.called).toBe(true);
        expect(selectAll.args[0][1].runProcedureElementId).toBe(runProcedureElementId);
    });

    it("unselectAllSteps dispatches unselectAll", () => {
        wrapper.vm.unselectAllSteps();
        expect(unselectAll.called).toBe(true);
        expect(unselectAll.args[0][1]).toEqual({runProcedureElementId});
    });

    it("handleSelectTag re-emits the selectTag event", () => {
        wrapper.vm.handleSelectTag({tag_id: "t1", selected: true});
        expect(wrapper.emitted("selectTag")[0][0]).toEqual({tag_id: "t1", selected: true});
    });
});

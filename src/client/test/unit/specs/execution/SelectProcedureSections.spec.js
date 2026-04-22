import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
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

// Actions
const actions = {
    updateProcedureOutlineSelection: () => {},
    assembleProcedurePrecomputed: () => {},
    selectAll: () => {},
    unselectAll: () => {},
};

// Stub components
const stubs = {
    PreviewOutline: true
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

// The test
xdescribe("SelectProcedureSections.vue", () => {
    let store;
    let wrapper;

    beforeEach(() => {
        store = new Vuex.Store({ state, getters, actions });
        wrapper = shallow(SelectProcedureSections, {
            store,
            localVue,
            propsData,
            stubs,
        });
    });

    xit("Child elements", () => {
        expect(wrapper.vm.childElements).toBeDefined();
    });
});

import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import faker from "faker";
import RunProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import PreviewOutline from "../../../../src/modules/elements/non-executable/run-procedure/PreviewOutline.vue";

// State
const parentElementId = faker.random.uuid();
const childElementId01 = faker.random.uuid();
const childElementId02 = faker.random.uuid();
const childElementId03 = faker.random.uuid();
const childElementId04 = faker.random.uuid();
const state = {
    elements: {
        [parentElementId]: {
            execution_user_input: {
                elements: [
                    {
                        elem_id: childElementId01,
                        parent_id: "",
                        selected: true
                    },
                    {
                        elem_id: childElementId02,
                        parent_id: childElementId01,
                        selected: true
                    },
                    {
                        elem_id: childElementId03,
                        parent_id: childElementId01,
                        selected: true
                    },
                    {
                        elem_id: childElementId04,
                        parent_id: "",
                        selected: false
                    }
                ]
            }
        }
    },
    procedureOutlineIds: {
        [parentElementId]: [
            childElementId01,
            childElementId02,
            childElementId03,
            childElementId04
        ]
    },
    procedureOutlines: {
        [parentElementId]: {
            [childElementId01]: {
                elem_id: childElementId01,
                parent_id: ""
            },
            [childElementId02]: {
                elem_id: childElementId02,
                parent_id: childElementId02
            },
            [childElementId03]: {
                elem_id: childElementId03,
                parent_id: childElementId03
            },
            [childElementId04]: {
                elem_id: childElementId04,
                parent_id: ""
            },
        }
    },
    procedureOutlineStructures: {
        [parentElementId]: {
            [childElementId01]: {
                elem_id: childElementId01,
                parent_id: "",
                child_ids: [childElementId01]
            },
            [childElementId02]: {
                elem_id: childElementId02,
                parent_id: "",
                child_ids: [childElementId02]
            },
            '': {
                elem_id: childElementId03,
                parent_id: "",
                child_ids: [childElementId03]
            },
        }
    },
    selectedStepIds: {
        [parentElementId]: [
            childElementId01,
            childElementId02,
            childElementId03,
        ]
    }
};

// Props
const title = faker.random.words();
const propsData = {
    runProcedureElementId: parentElementId,
    elementId: childElementId01,
    title: title,
    number: faker.random.uuid(),
    tag_ids: []
};

// Getters
const getters = {
    procedureOutlineElementsByParent: RunProcedureStore.getters.procedureOutlineElementsByParent,
    selectedElementIdsByParent: ExecutionStore.getters.selectedElementIdsByParent,
    selectedStepIds: RunProcedureStore.getters.selectedStepIds,
    isSelected: RunProcedureStore.getters.isSelected
};

// Actions
const actions = {
    updateProcedureOutlineSelection: () => {},
    assembleProcedurePrecomputed: () => {},
    toggleStep: () => {},
};

// Stub components
const stubs = {
    PreviewOutline: true,
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

// The tests
describe("PreviewOutline.vue", () => {
    let store;
    let wrapper;

    store = new Vuex.Store({ state, getters, actions });
    wrapper = shallow(PreviewOutline, {
        store,
        localVue,
        propsData,
        stubs,
    });

    it("Title display", () => {
        expect(wrapper.find("span").element.innerHTML.replace(/^\s+|\s+$/g, '')).toEqual(title);
    });

    it("childElements", () => {
        expect(wrapper.vm.childElements).toBeDefined();
    });
});

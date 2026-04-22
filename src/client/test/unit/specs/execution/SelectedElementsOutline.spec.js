import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import faker from "faker";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import RunProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";

import SelectedElementsOutline from "../../../../src/modules/elements/non-executable/run-procedure/SelectedElementsOutline.vue";

// State
const parentElementId = faker.random.uuid();
const childElementId01 = faker.random.uuid();
const childElementId02 = faker.random.uuid();
const childElementId03 = faker.random.uuid();
const childElementId04 = faker.random.uuid();
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
        [parentElementId]: {
            execution_user_input: {
                elements: [
                    {
                        elem_id: childElementId01,
                        parent_id: "",
                        selected: true,
                    },
                    {
                        elem_id: childElementId02,
                        parent_id: childElementId01,
                        selected: true,
                    },
                    {
                        elem_id: childElementId03,
                        parent_id: childElementId01,
                        selected: true,
                    },
                    {
                        elem_id: childElementId04,
                        parent_id: "",
                        selected: false,
                    },
                ]
            }
        }
    }
};

// Props
const propsData = {
    elementId: childElementId01,
    runProcedureElementId: parentElementId,
};

// Getters
const getters = {
    selectedElementsByParent: ExecutionStore.getters.selectedElementsByParent,
    procedureOutlineElementsByParent: RunProcedureStore.getters.procedureOutlineElementsByParent,
    procedureSelectedOutlineElementsByParent: RunProcedureStore.getters.procedureSelectedOutlineElementsByParent,
    isSelected: RunProcedureStore.getters.isSelected
};

// Stub components
const stubs = {
    SelectedElementsOutline: true,
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

// The test
describe("SelectElementsOutline.vue", () => {
    let store;
    let wrapper;

    beforeEach(() => {
        store = new Vuex.Store({ state, getters });
        wrapper = shallow(SelectedElementsOutline, {
            store,
            localVue,
            propsData,
            stubs,
        });
    });

    it("Title display", () => {
        expect(wrapper.find("span").element.innerHTML.replace(/^\s+|\s+$/g, '')).toEqual("No Title");
    });

    it("childElements", () => {
        expect(wrapper.vm.childElements).toBeDefined();
    });
});

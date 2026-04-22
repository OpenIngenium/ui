/*
import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import faker from "faker";
import ProjectConfigStore from "../../../../src/modules/project-config/project-config-store";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import CustomScriptElement from "../../../../src/modules/elements/executable/custom_script/CustomScriptElement.vue";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";

// State
const elementId = faker.random.uuid();
const scriptName = faker.random.uuid();
const timeout = 240;
const inputName01 = "test_input";
const inputValue01 = 1234;
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
        [elementId]: {
            elem_id: elementId,
            elem_type: "STEP",
            executed: false,
            execution: {meta_data: {status: undefined}},
            execution_user_input: {
                script_name: scriptName,
                script_path: "/abc",
                description: "Test description",
                hash: "",
                status: "ACTIVE",
                timeout: timeout,
                inputs: [
                    {
                        name: inputName01,
                        description: "",
                        phase: "EXECUTION",
                        required: "YES",
                        type: "INT",
                        enumerations: [],
                        value: inputValue01
                    }
                ],
                outputs: [
                    {
                        name: "",
                        description: "",
                        type: "INT"
                    }
                ]
            },
            number: "1",
            parent_id: "",
            specification: {},
            step_type: "CUSTOM_SCRIPT"
        }
    },
    elementIds: [
        elementId,
    ],
    elementsViewState: {
        [elementId]: {
            detailLevel: 3,
            loading: false
        }
    }
};

// Props
const propsData = {
    elementId: elementId,
    elementMap: {
        name: 'CUSTOM_SCRIPT',
        displayName: 'Custom Script',
        paletteGroup: 'Manual',
        comp: 'custom-script-element',
        category: 'executable',
        path: 'custom_script_steps',
        isNestable: false
    },
    mode: 'execution',
};

// Getters
const getters = {
    customScripts: ProjectConfigStore.getters.customScripts,
    executionInput: ExecutionStore.getters.executionInput,
    customScriptIdByPath: ProjectConfigStore.getters.customScriptIdByPath,
    selectedElementsByParent: ExecutionStore.getters.selectedElementsByParent,
    executionMetaDataKey: ExecutionStore.getters.executionMetaDataKey,
    elementsByParent: ExecutionStore.getters.elementsByParent,
    parentsByChild: ExecutionStore.getters.parentsByChild,
    elementViewState: ExecutionStore.getters.elementViewState,
    executionInputKey: ExecutionStore.getters.executionInputKey,
    elementKey: ExecutionStore.getters.elementKey,
    parentIdsByChild: ExecutionStore.getters.parentIdsByChild,
};

// Actions
const actions = {
    fetchCustomScripts: () => {},
    editCustomScriptInput: () => {},
    editElementSpecification: () => {},
    saveElementInput: () => {}
};

// Stub components
const stubs = {
    CustomScriptInputArg: true,
    CustomScriptSelectButton: true,
    ExecutionStatusCheck: true,
    IngModal: true
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

xdescribe("CustomScriptElement.vue", () => {
    let store;
    let wrapper;

    store = new Vuex.Store({ state, getters, actions });
    wrapper = shallow(Vue.extend(elementExecutionMixin).extend(CustomScriptElement), {
        store,
        localVue,
        propsData,
        stubs
    });

    xit("scriptName get", () => {
        expect(wrapper.vm.scriptName).toEqual(scriptName);
    });

    xit("timeout get", () => {
        expect(wrapper.vm.timeout).toEqual(timeout);
    });

    xit("input01 name get", () => {
        expect(wrapper.vm.inputs[0].name).toEqual(inputName01);
    });

    xit("input01 value get", () => {
        expect(wrapper.vm.inputs[0].value).toEqual(inputValue01);
    });
});
*/

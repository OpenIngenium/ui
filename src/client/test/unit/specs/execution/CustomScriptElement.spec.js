import {shallowMount} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import * as faker from "faker";
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
                ],
                entries: [
                    {
                        entry_inputs: [
                            {
                                name: "entry_field_01",
                                description: "",
                                phase: "EXECUTION",
                                required: "YES",
                                type: "STRING",
                                default_value: "",
                                enumerations: [],
                                value: ""
                            },
                            {
                                name: "entry_field_no_label",
                                description: "",
                                phase: "EXECUTION",
                                required: "NO",
                                type: "STRING",
                                default_value: "",
                                enumerations: [],
                                value: ""
                            }
                        ]
                    }
                ],
                layout: [
                    {
                        entry: "TRUE",
                        header: {
                            headerlayout: [
                                {
                                    field_name: "entry_field_01",
                                    layout_type: "FIELD",
                                    label: {
                                        label_content: "Entry Field Label",
                                        label_align: "LEFT",
                                        label_loc: "TOP"
                                    }
                                }
                            ]
                        },
                        content: {
                            contentlayout: []
                        }
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
    },
    elemModificationMap: {},
    customScripts: {},
    customScriptsCount: 0
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

// Getters (sourced from the real stores so computed props resolve correctly)
const getters = {
    customScripts: ProjectConfigStore.getters.customScripts,
    customScriptsCount: ProjectConfigStore.getters.customScriptsCount,
    customScriptIdByPath: ProjectConfigStore.getters.customScriptIdByPath,
    executionInput: ExecutionStore.getters.executionInput,
    executionInputKey: ExecutionStore.getters.executionInputKey,
    executionResultsKey: ExecutionStore.getters.executionResultsKey,
    executionRedlineInputKey: ExecutionStore.getters.executionRedlineInputKey,
    executionMetaDataKey: ExecutionStore.getters.executionMetaDataKey,
    execution: ExecutionStore.getters.execution,
    modStyle: ExecutionStore.getters.modStyle,
    numEntries: ExecutionStore.getters.numEntries,
    selectedElementsByParent: ExecutionStore.getters.selectedElementsByParent,
    elementsByParent: ExecutionStore.getters.elementsByParent,
    childIdsByParent: ExecutionStore.getters.childIdsByParent,
    parentsByChild: ExecutionStore.getters.parentsByChild,
    elementViewState: ExecutionStore.getters.elementViewState,
    elementKey: ExecutionStore.getters.elementKey,
    parentIdsByChild: ExecutionStore.getters.parentIdsByChild,
};

// Actions (no-op stubs; these tests only exercise computed props)
const actions = {
    fetchCustomScripts: () => {},
    editCustomScriptInput: () => {},
    editElementSpecification: () => {},
    editElementInput: () => {},
    editElementArray: () => {},
    saveElementInput: () => {},
    saveRedlineInput: () => {},
    setElementViewStateDetailLevel: () => {}
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

describe("CustomScriptElement.vue", () => {
    let wrapper;

    beforeEach(() => {
        const store = new Vuex.Store({ state, getters, actions });
        wrapper = shallowMount(Vue.extend(elementExecutionMixin).extend(CustomScriptElement), {
            store,
            localVue,
            propsData,
            stubs
        });
    });

    afterEach(() => {
        if (wrapper) wrapper.destroy();
    });

    // NOTE: the component exposes script_path via the `scriptPath` computed prop
    // (there is no `scriptName` computed), so this asserts against scriptPath.
    it("scriptPath resolves from execution_user_input", () => {
        expect(wrapper.vm.scriptPath).toEqual("/abc");
    });

    it("timeout resolves as a parsed integer", () => {
        expect(wrapper.vm.timeout).toEqual(timeout);
    });

    it("inputs[0] name resolves from execution_user_input", () => {
        expect(wrapper.vm.inputs[0].name).toEqual(inputName01);
    });

    it("inputs[0] value resolves from execution_user_input", () => {
        expect(wrapper.vm.inputs[0].value).toEqual(inputValue01);
    });

    describe("entry field labels", () => {
        it("getEntryFieldLabel resolves the label configured on the advanced layout", () => {
            expect(wrapper.vm.getEntryFieldLabel("entry_field_01")).toEqual("Entry Field Label");
        });

        it("getEntryFieldLabel falls back to the field name when no label is configured", () => {
            expect(wrapper.vm.getEntryFieldLabel("entry_field_no_label")).toEqual("entry_field_no_label");
        });

        it("columnInfos uses the resolved label as the header", () => {
            const columns = wrapper.vm.columnInfos;
            expect(columns.find(c => c.name === "entry_field_01").header).toEqual("Entry Field Label");
            expect(columns.find(c => c.name === "entry_field_no_label").header).toEqual("entry_field_no_label");
        });
    });
});

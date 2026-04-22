/*
import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import faker from "faker";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import RunProcedureElement from "../../../../src/modules/elements/non-executable/run-procedure/RunProcedureElement.vue";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import RunProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";

// State
const parentElementId = faker.random.uuid();
const referenceProcedureId = faker.random.uuid();
const referenceProcedureVersion = 1;
const childElementId01 = faker.random.uuid();
const childElementId02 = faker.random.uuid();
const childElementId03 = faker.random.uuid();
const childElementId04 = faker.random.uuid();
const referenceProcedureTitle = faker.random.words();
const isRunForScore = true;
const executed = true;
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
                ],
                reference_procedure_id: referenceProcedureId,
                reference_procedure_version: referenceProcedureVersion,
                reference_procedure_title: referenceProcedureTitle,
            },
            run_for_score: isRunForScore,
            executed: executed,
            imported: false
        }
    },
    elementIds: [
        parentElementId,
    ],
    elementsViewState: {
        [parentElementId]: {
            detailLevel: 3,
            loading: false
        }
    }
};

// Props
const propsData = {
    elementId: parentElementId,
    elementMap: {
        name: 'PROCEDURE_SECTION',
        displayName: 'Run Procedure',
        paletteGroup: 'Organization',
        comp: 'run-procedure-element',
        category: 'organization',
        path: 'procedure_sections',
        isNestable: true
    },
    mode: "execution",
};

// Getters
const getters = {
    selectedElementsByParent: ExecutionStore.getters.selectedElementsByParent,
    elementsByParent: ExecutionStore.getters.elementsByParent,
    parentsByChild: ExecutionStore.getters.parentsByChild,
    elementViewState: ExecutionStore.getters.elementViewState,
    executionInputKey: ExecutionStore.getters.executionInputKey,
    elementKey: ExecutionStore.getters.elementKey,
    parentIdsByChild: ExecutionStore.getters.parentIdsByChild,
    procedureTagSelections: ExecutionStore.getters.procedureTagSelections,
    runProcedureTagSelections: RunProcedureStore.getters.runProcedureTagSelections
};

// Actions
const actions = {
    fetchRunProcedureOutline: () => {},
    initializeProcedureState: () => {},
    importProcedure: () => {},
    resetRunProcedureInput: () => {},
    editElementInput: () => {},
    saveElementInput: () => {},
};

// Stub components
const stubs = {
    SelectProcedureTable: true,
    SelectVersionTable: true,
    SelectProcedureSections: true,
    SelectedElementsOutline: true,
    SwitchSlider: true,
    ProcedurePreview: true,
    IngModal: true,
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

// Todo The test
xdescribe("RunProcedureElement.vue", () => {
    let store;
    let wrapper;

    store = new Vuex.Store({ state, getters, actions });
    wrapper = shallow(Vue.extend(elementExecutionMixin).extend(RunProcedureElement), {
        store,
        localVue,
        propsData,
        stubs,
    });

    xit("referenceProcedureId get", () => {
        expect(wrapper.vm.referenceProcedureId).toEqual(referenceProcedureId);
    });

    xit("referenceProcedureVersion get", () => {
        expect(wrapper.vm.referenceProcedureVersion).toEqual(referenceProcedureVersion);
    });

    xit("referenceProcedureVersionDisplay get", () => {
        expect(wrapper.vm.referenceProcedureVersionDisplay).toEqual(referenceProcedureVersion);
    });

    xit("referenceProcedureTitle get", () => {
        expect(wrapper.vm.referenceProcedureTitle).toEqual(referenceProcedureTitle);
    });

    xit("isRunForScore", () => {
        expect(wrapper.vm.isRunForScore).toEqual(isRunForScore);
    });

    xit("disableRunForScore", () => {
        expect(wrapper.vm.disableRunForScore).toEqual(executed);
    });

    xit("selectedElements", () => {
        expect(wrapper.vm.selectedElements.length).toEqual(1);
    });

    xit("disableVersionsLookup", () => {
        expect(wrapper.vm.disableVersionsLookup).toEqual(true);
    });

    xit("onImportProcedure click", () => {
        spyOn(wrapper.vm, "importProcedure");
        wrapper.find("#importProcedureButton").trigger("click");
        expect(wrapper.vm.importProcedure).toHaveBeenCalled();
    });
});
*/

import {shallow} from "@vue/test-utils";
import {createLocalVue} from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import faker from "faker";
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import RunProcedureElement from "../../../../src/modules/elements/non-executable/run-procedure/RunProcedureElement.vue";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import procedureApi from "../../../../src/api/procedures";

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

// Stub components
const stubs = {
    SelectProcedureTable: true,
    SelectVersionTable: true,
    SelectProcedureSections: true,
    SelectedElementsOutline: true,
    SwitchSlider: true,
    ProcedurePreview: true,
    "tags-selected": true,
    "ing-modal": true,
    IngModal: true,
};

// Local vue
const localVue = createLocalVue();
localVue.use(Vuex);

const Composed = Vue.extend(elementExecutionMixin).extend(RunProcedureElement);

describe("RunProcedureElement.vue", () => {
    let actionSpies;

    function build() {
        actionSpies = {
            setPending: sinon.spy(),
            fetchRunProcedureOutline: sinon.spy(),
            initializeProcedureState: sinon.spy(),
            importProcedure: sinon.spy(),
            resetRunProcedureInput: sinon.spy(),
            setSelectedSteps: sinon.spy(),
            updateRunProcedureTagSelections: sinon.spy(),
            toggleTag: sinon.spy(),
            suspendResume: sinon.spy(),
            displayFeedback: sinon.spy(),
            editElementInput: sinon.spy(),
            saveElementInput: sinon.spy(),
            saveRedlineInput: sinon.spy(),
            editElementArray: sinon.spy(),
            setElementViewStateDetailLevel: sinon.spy()
        };
        const store = new Vuex.Store({
            state: JSON.parse(JSON.stringify(state)),
            getters: {
                selectedElementsByParent: ExecutionStore.getters.selectedElementsByParent,
                elementsByParent: ExecutionStore.getters.elementsByParent,
                childIdsByParent: ExecutionStore.getters.childIdsByParent,
                parentsByChild: ExecutionStore.getters.parentsByChild,
                parentIdsByChild: ExecutionStore.getters.parentIdsByChild,
                elementViewState: ExecutionStore.getters.elementViewState,
                executionInputKey: ExecutionStore.getters.executionInputKey,
                executionInput: ExecutionStore.getters.executionInput,
                elementKey: ExecutionStore.getters.elementKey,
                numEntries: ExecutionStore.getters.numEntries,
                executionResultsKey: () => () => undefined,
                executionMetaDataKey: () => () => undefined,
                executionRedlineInputKey: () => () => undefined,
                canParticipate: () => true,
                modStyle: () => () => "",
                selectedStepIds: () => () => [],
                element: () => () => ({}),
                procedureTagSelections: () => () => [],
                runProcedureTagSelections: () => () => [{tag_id: "t1", name: "Tag 1", selected: false}],
                reloadProcedureOutline: () => ({elementId: ""}),
                venue: () => ({venue_id: "v1", name: "WSTS-1"}),
                isTestConductor: () => true,
                execution: () => ({status: "IDLE"}),
                updatingElementInput: () => false,
                executionId: () => "exec1",
                isPending: () => false
            },
            actions: actionSpies
        });
        return shallow(Composed, {store, localVue, propsData, stubs});
    }

    beforeEach(() => {
        sinon.stub(procedureApi, "getProcedure").resolves({});
        sinon.stub(procedureApi, "getProcedureVersion").resolves({version: 1, tags: []});
    });

    afterEach(() => {
        procedureApi.getProcedure.restore();
        procedureApi.getProcedureVersion.restore();
    });

    it("reads reference procedure id/version/title from input", () => {
        const vm = build().vm;
        expect(vm.referenceProcedureId).toEqual(referenceProcedureId);
        expect(vm.referenceProcedureVersion).toEqual(referenceProcedureVersion);
        expect(vm.referenceProcedureVersionDisplay).toEqual(referenceProcedureVersion);
        expect(vm.referenceProcedureTitle).toEqual(referenceProcedureTitle);
    });

    it("referenceProcedureVersion normalizes -1 to 0", () => {
        const wrapper = build();
        wrapper.vm.$store.state.elements[parentElementId].execution_user_input.reference_procedure_version = -1;
        expect(wrapper.vm.referenceProcedureVersion).toBe(0);
    });

    it("disableRunForScore is true for an executed step", () => {
        expect(build().vm.disableRunForScore).toBe(true);
    });

    it("selectedElements returns only top-level selected children", () => {
        expect(build().vm.selectedElements.length).toBe(1);
    });

    it("childExecutionId and showSuspendResume reflect element state", () => {
        const vm = build().vm;
        expect(vm.childExecutionId).toBeFalsy();
        expect(vm.showSuspendResume).toBe(false);
    });

    it("venue-derived computeds read the venue getter", () => {
        const vm = build().vm;
        expect(vm.venueId).toBe("v1");
        expect(vm.venueName).toBe("WSTS-1");
        expect(vm.callProcedureChildExecutionUrl).toContain("/execute_spa/v1/");
    });

    it("getExecutionStatus reads the execution getter", () => {
        expect(build().vm.getExecutionStatus).toBe("IDLE");
    });

    it("procedureNotFound/versionNotFound reflect detail errors", () => {
        const wrapper = build();
        wrapper.vm.procedureDetails = {error: true};
        expect(wrapper.vm.procedureNotFound).toBe(true);
        wrapper.vm.procedureDetails = {};
        wrapper.vm.versionDetails = {error: true};
        expect(wrapper.vm.versionNotFound).toBe(true);
    });

    it("toggleCallProcedure flips callable and saves", () => {
        const wrapper = build();
        wrapper.vm.toggleCallProcedure();
        expect(actionSpies.editElementInput.called).toBe(true);
        expect(actionSpies.saveElementInput.called).toBe(true);
    });

    it("toggleRunForScore flips run_for_score and saves", () => {
        const wrapper = build();
        actionSpies.saveElementInput.resetHistory();
        wrapper.vm.toggleRunForScore();
        expect(actionSpies.editElementInput.called).toBe(true);
        expect(actionSpies.saveElementInput.called).toBe(true);
    });

    it("setSteps persists the section selection and closes the modal", () => {
        const wrapper = build();
        wrapper.vm.setSteps();
        expect(actionSpies.setSelectedSteps.lastCall.args[1]).toEqual({runProcedureElementId: parentElementId});
        expect(wrapper.vm.showSectionChooserModal).toBe(false);
    });

    it("handleSelectTag updates tag selections and toggles the tag", () => {
        const wrapper = build();
        wrapper.vm.handleSelectTag({tag_id: "t1", selected: true});
        expect(actionSpies.updateRunProcedureTagSelections.called).toBe(true);
        expect(actionSpies.toggleTag.lastCall.args[1]).toEqual({runProcedureElementId: parentElementId, tagId: "t1", selected: true});
    });

    it("onResumeChildExecution dispatches suspendResume", async() => {
        const wrapper = build();
        await wrapper.vm.onResumeChildExecution();
        expect(actionSpies.suspendResume.called).toBe(true);
    });

    it("onImportProcedure imports when not pending", async() => {
        const wrapper = build();
        await wrapper.vm.onImportProcedure();
        expect(actionSpies.importProcedure.lastCall.args[1]).toEqual({elementId: parentElementId, callable: wrapper.vm.callable});
    });

    it("isParentRPExecuted inspects parent procedure sections", () => {
        expect(build().vm.isParentRPExecuted(childElementId02)).toBe(false);
    });
});

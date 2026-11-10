import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import ExecutionStatusDot from "../../../../src/modules/execution/ExecutionStatusDot.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build(overrides = {}) {
    const opts = {
        isPending: false,
        execution: {status: "RUNNING", execution_id: "ex1"},
        isOneOfTestConductors: true,
        executionHasBeenClosed: false,
        overrideJustificationValue: "",
        stepStatus: "PASS",
        status: "PASS",
        justification: undefined,
        can: false,
        ...overrides
    };

    const actions = {
        setPending: sinon.spy(),
        overrideStepStatus: sinon.spy(),
        updateOverrideStepStatus: sinon.spy(),
        discardOverrideStepStatus: sinon.spy(),
        refreshExecution: sinon.spy()
    };

    const store = new Vuex.Store({
        getters: {
            isPending: () => opts.isPending,
            currentStepId: () => "e1",
            directionalUnExecutedElement: () => () => false,
            elementKey: () => () => undefined,
            execution: () => opts.execution,
            executionMetaDataKey: () => () => opts.overrideJustificationValue,
            updatingElementInput: () => false,
            isOneOfTestConductors: () => opts.isOneOfTestConductors,
            executionHasBeenClosed: () => opts.executionHasBeenClosed
        },
        actions
    });

    const wrapper = shallowMount(ExecutionStatusDot, {
        localVue,
        store,
        mocks: {$can: sinon.stub().returns(opts.can)},
        propsData: {
            elementId: "e1",
            element: {
                number: "1",
                title: "Step title",
                execution: {meta_data: {status: opts.stepStatus}}
            },
            status: opts.status,
            justification: opts.justification,
            isStepPending: false
        }
    });

    return {wrapper, actions};
}

describe("ExecutionStatusDot.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("computed styling", () => {
        it("statusColorClass maps status to color", () => {
            expect(build({status: "PASS"}).wrapper.vm.statusColorClass).toBe("green");
            expect(build({status: "OVERRIDE_FAIL"}).wrapper.vm.statusColorClass).toBe("orange");
            expect(build({status: "ERROR"}).wrapper.vm.statusColorClass).toBe("red");
            expect(build({status: "RUNNING"}).wrapper.vm.statusColorClass).toBe("");
        });

        it("dotWidthClass widens for override statuses", () => {
            expect(build({status: "OVERRIDE_PASS"}).wrapper.vm.dotWidthClass).toBe("override-width");
            expect(build({status: "PASS"}).wrapper.vm.dotWidthClass).toBe("default-width");
        });

        it("getTooltipText reflects justification", () => {
            expect(build({justification: "why"}).wrapper.vm.getTooltipText).toBe("Override Justification: why");
            expect(build({justification: undefined}).wrapper.vm.getTooltipText).toBe("");
        });
    });

    describe("override eligibility", () => {
        it("stepStatus reads from element meta_data", () => {
            expect(build({stepStatus: "FAIL"}).wrapper.vm.stepStatus).toBe("FAIL");
        });

        it("canOverride false when execution is FINALIZED", () => {
            const {wrapper: w} = build({execution: {status: "FINALIZED"}, stepStatus: "PASS", isOneOfTestConductors: true});
            expect(w.vm.canOverride).toBe(false);
        });

        it("canOverride false when not TC and lacking admin permission", () => {
            expect(build({isOneOfTestConductors: false, can: false, stepStatus: "PASS"}).wrapper.vm.canOverride).toBe(false);
        });

        it("canOverride true for TC on a finished step", () => {
            expect(build({isOneOfTestConductors: true, stepStatus: "PASS"}).wrapper.vm.canOverride).toBe(true);
        });

        it("canOverride true via admin permission", () => {
            expect(build({isOneOfTestConductors: false, can: true, stepStatus: "FAIL"}).wrapper.vm.canOverride).toBe(true);
        });

        it("canOverride false for a running step", () => {
            expect(build({isOneOfTestConductors: true, stepStatus: "RUNNING"}).wrapper.vm.canOverride).toBe(false);
        });

        it("isOverridden reflects override statuses", () => {
            expect(build({stepStatus: "OVERRIDE_PASS"}).wrapper.vm.isOverridden).toBe(true);
            expect(build({stepStatus: "PASS"}).wrapper.vm.isOverridden).toBe(false);
        });

        it("getOverrideStatus/IconClass depend on stepStatus", () => {
            expect(build({stepStatus: "PASS"}).wrapper.vm.getOverrideStatus).toBe("OVERRIDE FAIL");
            expect(build({stepStatus: "FAIL"}).wrapper.vm.getOverrideStatus).toBe("OVERRIDE PASS");
            expect(build({stepStatus: "PASS"}).wrapper.vm.getOverrideIconClass).toBe("glyphicon glyphicon-thumbs-down");
            expect(build({stepStatus: "FAIL"}).wrapper.vm.getOverrideIconClass).toBe("glyphicon glyphicon-thumbs-up");
        });

        it("invalidJustification is true for blank justification", () => {
            const {wrapper: w} = build();
            expect(w.vm.invalidJustification).toBe(true);
            w.setData({overrideJustification: "reason"});
            expect(w.vm.invalidJustification).toBe(false);
        });

        it("overrideModalMessage differs for overridden vs not", () => {
            expect(build({stepStatus: "OVERRIDE_PASS"}).wrapper.vm.overrideModalMessage)
                .toContain("has already been overridden");
            expect(build({stepStatus: "PASS"}).wrapper.vm.overrideModalMessage)
                .toContain("You are overriding the status");
        });
    });

    describe("methods", () => {
        it("toggleErrorButton toggles light only for ERROR status", () => {
            const {wrapper: w} = build({status: "ERROR"});
            expect(w.vm.lightRed).toBe("light");
            w.vm.toggleErrorButton();
            expect(w.vm.lightRed).toBe("");
            w.vm.toggleErrorButton();
            expect(w.vm.lightRed).toBe("light");

            const {wrapper: w2} = build({status: "PASS"});
            w2.vm.toggleErrorButton();
            expect(w2.vm.lightRed).toBe("light");
        });

        it("onOverrideResult opens the modal", () => {
            const {wrapper: w} = build({overrideJustificationValue: "prev"});
            w.vm.onOverrideResult();
            expect(w.vm.showOverrideModal).toBe(true);
            expect(w.vm.overrideJustification).toBe("prev");
        });

        it("applyOverride dispatches override and toggles pending", async() => {
            const {wrapper: w, actions} = build();
            w.setData({overrideJustification: "reason"});
            await w.vm.applyOverride();
            expect(actions.overrideStepStatus.called).toBe(true);
            expect(actions.setPending.callCount).toBe(2);
            expect(w.vm.showOverrideModal).toBe(false);
        });

        it("applyOverride refreshes execution when closed", async() => {
            const {wrapper: w, actions} = build({executionHasBeenClosed: true});
            await w.vm.applyOverride();
            expect(actions.refreshExecution.called).toBe(true);
        });

        it("applyOverride is a no-op while pending", async() => {
            const {wrapper: w, actions} = build({isPending: true});
            await w.vm.applyOverride();
            expect(actions.overrideStepStatus.called).toBe(false);
        });

        it("updateOverride dispatches update", async() => {
            const {wrapper: w, actions} = build();
            await w.vm.updateOverride();
            expect(actions.updateOverrideStepStatus.called).toBe(true);
        });

        it("discardOverride dispatches discard and refreshes when closed", async() => {
            const {wrapper: w, actions} = build({executionHasBeenClosed: true});
            await w.vm.discardOverride();
            expect(actions.discardOverrideStepStatus.called).toBe(true);
            expect(actions.refreshExecution.called).toBe(true);
        });
    });
});

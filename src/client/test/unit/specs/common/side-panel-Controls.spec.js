import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import Controls from "../../../../src/modules/common/side-panel/Controls.vue";
import reportApi from "../../../../src/api/report";

const localVue = createLocalVue();
localVue.use(Vuex);

function build(overrides = {}) {
    const opts = {
        isPending: false,
        isTestConductor: true,
        updatingElementInput: false,
        execution: {
            status: "IDLE",
            mode: "MANUAL",
            delay: 3,
            pause_conditions: {
                on_fail: true,
                on_error: false,
                on_section_end: true,
                on_procedure_end: false,
                on_break_point: true,
                on_command: false
            }
        },
        closeResult: true,
        suspendResult: {status: 200},
        ...overrides
    };

    const actions = {
        setPending: sinon.spy(),
        runExecution: sinon.spy(),
        setPauseExecution: sinon.spy(),
        closeExecution: sinon.stub().resolves(opts.closeResult),
        abortExecution: sinon.spy(),
        suspendExecution: sinon.stub().resolves(opts.suspendResult),
        resetState: sinon.spy(),
        switchExecutionMode: sinon.spy(),
        updateAutoExecutionParams: sinon.spy(),
        displayFeedback: sinon.spy()
    };

    const store = new Vuex.Store({
        getters: {
            isPending: () => opts.isPending,
            execution: () => opts.execution,
            isTestConductor: () => opts.isTestConductor,
            updatingElementInput: () => opts.updatingElementInput
        },
        actions
    });

    const $router = {push: sinon.spy(), go: sinon.spy()};
    const $route = {params: {executionId: "ex1"}};

    const wrapper = shallowMount(Controls, {
        localVue,
        store,
        mocks: {$route, $router}
    });

    return {wrapper, actions, $router};
}

describe("side-panel/Controls.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("computed guards", () => {
        it("status and isAuto reflect execution", () => {
            wrapper = build({execution: {status: "RUNNING", mode: "AUTO", pause_conditions: {}}}).wrapper;
            expect(wrapper.vm.status).toBe("RUNNING");
            expect(wrapper.vm.isAuto).toBe(true);
        });

        it("status defaults to IDLE without execution", () => {
            wrapper = build({execution: undefined}).wrapper;
            expect(wrapper.vm.status).toBe("IDLE");
            expect(wrapper.vm.isAuto).toBe(false);
        });

        it("canRunExecution requires TC + IDLE + not pending/updating", () => {
            expect(build().wrapper.vm.canRunExecution).toBe(true);
            expect(build({isTestConductor: false}).wrapper.vm.canRunExecution).toBe(false);
            expect(build({isPending: true}).wrapper.vm.canRunExecution).toBe(false);
        });

        it("canPauseExecution requires RUNNING", () => {
            const execRunning = {status: "RUNNING", mode: "MANUAL", pause_conditions: {}};
            expect(build({execution: execRunning}).wrapper.vm.canPauseExecution).toBe(true);
            expect(build().wrapper.vm.canPauseExecution).toBe(false);
        });

        it("canAbortExecution for RUNNING or PAUSED", () => {
            expect(build({execution: {status: "PAUSED", pause_conditions: {}}}).wrapper.vm.canAbortExecution).toBe(true);
            expect(build().wrapper.vm.canAbortExecution).toBe(false);
        });

        it("canSuspendExecution/canCloseExecution require IDLE", () => {
            expect(build().wrapper.vm.canSuspendExecution).toBe(true);
            expect(build().wrapper.vm.canCloseExecution).toBe(true);
            const running = {status: "RUNNING", pause_conditions: {}};
            expect(build({execution: running}).wrapper.vm.canCloseExecution).toBe(false);
        });
    });

    describe("computed getters for auto params", () => {
        it("delay and pause condition getters read from execution", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.delay).toBe(3);
            expect(wrapper.vm.pause_condition_fail).toBe(true);
            expect(wrapper.vm.pause_condition_error).toBe(false);
            expect(wrapper.vm.pause_condition_section_end).toBe(true);
            expect(wrapper.vm.pause_condition_procedure_end).toBe(false);
            expect(wrapper.vm.pause_condition_breakpoint).toBe(true);
            expect(wrapper.vm.pause_condition_command).toBe(false);
        });

        it("delay setter dispatches updateAutoExecutionParams", async() => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.vm.delay = 5;
            await wrapper.vm.$nextTick();
            expect(built.actions.updateAutoExecutionParams.called).toBe(true);
        });

        it("pause condition setters dispatch updateAutoExecutionParams", async() => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.vm.pause_condition_fail = false;
            wrapper.vm.pause_condition_command = true;
            await wrapper.vm.$nextTick();
            expect(built.actions.updateAutoExecutionParams.callCount).toBeGreaterThan(0);
        });
    });

    describe("methods", () => {
        it("toggleMode switches execution mode", async() => {
            const built = build();
            wrapper = built.wrapper;
            await wrapper.vm.toggleMode();
            expect(built.actions.switchExecutionMode.called).toBe(true);
        });

        it("onRunExecution runs and toggles pending", async() => {
            const built = build();
            wrapper = built.wrapper;
            await wrapper.vm.onRunExecution();
            expect(built.actions.runExecution.called).toBe(true);
            expect(built.actions.setPending.callCount).toBe(2);
        });

        it("onRunExecution is a no-op while pending", async() => {
            const built = build({isPending: true});
            wrapper = built.wrapper;
            await wrapper.vm.onRunExecution();
            expect(built.actions.runExecution.called).toBe(false);
        });

        it("onPauseExecution pauses", async() => {
            const built = build({execution: {status: "RUNNING", pause_conditions: {}}});
            wrapper = built.wrapper;
            await wrapper.vm.onPauseExecution();
            expect(built.actions.setPauseExecution.called).toBe(true);
        });

        it("close confirmation modal toggles", () => {
            wrapper = build().wrapper;
            wrapper.vm.closeExecutionConfirmation();
            expect(wrapper.vm.showModal).toBe(true);
            wrapper.vm.cancelExecutionConfirmation();
            expect(wrapper.vm.showModal).toBe(false);
        });

        it("closeExecutionAndRedirect closes and navigates on success", async() => {
            const built = build({closeResult: true});
            wrapper = built.wrapper;
            await wrapper.vm.closeExecutionAndRedirect();
            expect(built.actions.closeExecution.called).toBe(true);
            expect(built.$router.push.called).toBe(true);
            expect(built.$router.go.called).toBe(true);
        });

        it("closeExecutionAndRedirect does not navigate on failure", async() => {
            const built = build({closeResult: false});
            wrapper = built.wrapper;
            await wrapper.vm.closeExecutionAndRedirect();
            expect(built.$router.push.called).toBe(false);
        });

        it("handleSaveAsPdf shows the submitted modal on success", async() => {
            const stub = sinon.stub(reportApi, "getExecutionInPdf").resolves({data: {report_id: "r1", message: "queued"}});
            const built = build();
            wrapper = built.wrapper;
            await wrapper.vm.handleSaveAsPdf();
            expect(wrapper.vm.showReportSubmittedModal).toBe(true);
            expect(wrapper.vm.submittedReportId).toBe("r1");
            stub.restore();
        });

        it("handleSaveAsPdf reports feedback on error", async() => {
            const stub = sinon.stub(reportApi, "getExecutionInPdf").rejects(new Error("boom"));
            const built = build();
            wrapper = built.wrapper;
            await wrapper.vm.handleSaveAsPdf();
            expect(built.actions.displayFeedback.called).toBe(true);
            stub.restore();
        });

        it("onSuspendExecution suspends and navigates on 200", async() => {
            const built = build({suspendResult: {status: 200}});
            wrapper = built.wrapper;
            await wrapper.vm.onSuspendExecution();
            expect(built.actions.suspendExecution.called).toBe(true);
            expect(built.$router.push.called).toBe(true);
        });

        it("onSuspendExecution does not navigate on non-200", async() => {
            const built = build({suspendResult: {status: 500}});
            wrapper = built.wrapper;
            await wrapper.vm.onSuspendExecution();
            expect(built.$router.push.called).toBe(false);
        });
    });
});

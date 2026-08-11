import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import VenueDetails from "../../../../src/modules/execution/VenueDetails.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build(overrides = {}) {
    const opts = {
        execution: {
            status: "RUNNING",
            mode: "AUTO",
            execution_id: "ex1",
            venue_name: "FromExec",
            description: "desc",
            current_step_id: "e1"
        },
        venue: {name: "Venue1"},
        follow: false,
        outlineFollow: false,
        mode: "execution",
        pageTitle: "Execution (TC)",
        isTestConductor: true,
        parentExecutionId: "parent-1",
        dataInitialized: false,
        filters: {},
        ...overrides
    };

    const filterGetters = {
        commentFilter: () => !!opts.filters.comment,
        resolvedFilter: () => !!opts.filters.resolved,
        unresolvedFilter: () => !!opts.filters.unresolved,
        dataReviewFilter: () => !!opts.filters.dataReview,
        activityReportFilter: () => !!opts.filters.activityReport,
        redlineFilter: () => !!opts.filters.redline,
        bluelineFilter: () => !!opts.filters.blueline
    };

    const actions = {
        fetchVenue: sinon.spy(),
        toggleExecutionFollow: sinon.spy(),
        toggleElemFilter: sinon.spy(),
        setElemFilter: sinon.spy(),
        saveExecution: sinon.spy(),
        suspendResume: sinon.spy()
    };

    const store = new Vuex.Store({
        getters: {
            execution: () => opts.execution,
            venue: () => opts.venue,
            venueKey: () => () => "",
            follow: () => opts.follow,
            outlineFollow: () => opts.outlineFollow,
            mode: () => opts.mode,
            pageTitle: () => opts.pageTitle,
            isTestConductor: () => opts.isTestConductor,
            parentExecutionId: () => opts.parentExecutionId,
            dataInitialized: () => opts.dataInitialized,
            ...filterGetters
        },
        actions
    });

    const $router = {replace: sinon.spy(), push: sinon.spy()};
    const $route = {path: "/execute", query: {}};

    const wrapper = shallowMount(VenueDetails, {
        localVue,
        store,
        mocks: {$route, $router},
        propsData: {venueId: "v1", isAsRun: false}
    });

    return {wrapper, actions, $router};
}

describe("VenueDetails.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    describe("computed", () => {
        it("status/executionMode/isAuto reflect execution", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.status).toBe("RUNNING");
            expect(wrapper.vm.executionMode).toBe("AUTO");
            expect(wrapper.vm.isAuto).toBe(true);
        });

        it("venueName prefers venue name then execution venue_name", () => {
            expect(build().wrapper.vm.venueName).toBe("Venue1");
            wrapper && wrapper.destroy();
            wrapper = build({venue: null}).wrapper;
            expect(wrapper.vm.venueName).toBe("FromExec");
        });

        it("executionInfoStr combines id, title, and mode", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.executionInfoStr).toContain("ex1");
            expect(wrapper.vm.executionInfoStr).toContain("AUTO");
        });

        it("callProcedureParentExecutionUrl includes venue and parent ids", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.callProcedureParentExecutionUrl).toContain("/execute_spa/v1/parent-1");
        });

        it("showSuspendResume true when a parent exists", () => {
            expect(build().wrapper.vm.showSuspendResume).toBe(true);
            wrapper && wrapper.destroy();
            wrapper = build({parentExecutionId: ""}).wrapper;
            expect(wrapper.vm.showSuspendResume).toBe(false);
        });

        it("disableSuspendResume depends on TC and status", () => {
            expect(build({isTestConductor: false}).wrapper.vm.disableSuspendResume).toBe(true);
            wrapper && wrapper.destroy();
            wrapper = build({execution: {status: "IDLE", mode: "AUTO", description: "d"}}).wrapper;
            expect(wrapper.vm.disableSuspendResume).toBe(false);
        });

        it("filterNames + filterNamesQueryParamStr reflect active filters", () => {
            wrapper = build({filters: {comment: true, redline: true}}).wrapper;
            expect(wrapper.vm.filterNames).toContain("General Comments");
            expect(wrapper.vm.filterNames).toContain("Redline");
            expect(wrapper.vm.filterNamesQueryParamStr).toBe("comment,redline");
        });

        it("statusText/visualMode capitalize execution values", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.statusText).toBe("Running");
            expect(wrapper.vm.visualMode).toBe("Auto");
        });

        it("disableDescription true only in as-run mode", () => {
            expect(build().wrapper.vm.disableDescription).toBe(false);
            wrapper && wrapper.destroy();
            wrapper = build({mode: "as-run"}).wrapper;
            expect(wrapper.vm.disableDescription).toBe(true);
        });

        it("isExecutionDescriptionEmpty reflects trimmed description", () => {
            wrapper = build({execution: {status: "RUNNING", mode: "AUTO", description: "   ", execution_id: "ex1"}}).wrapper;
            expect(wrapper.vm.isExecutionDescriptionEmpty).toBe(true);
        });

        it("disableSubmit true when modal description blank", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.disableSubmit).toBe(true);
            wrapper.setData({modalDescriptionValue: "text"});
            expect(wrapper.vm.disableSubmit).toBe(false);
        });
    });

    describe("methods", () => {
        it("handleScroll records window scroll", () => {
            wrapper = build().wrapper;
            window.scrollY = 42;
            wrapper.vm.handleScroll();
            expect(wrapper.vm.scrollY).toBe(42);
        });

        it("toggleMute flips audioMuted and persists it", () => {
            wrapper = build().wrapper;
            const before = wrapper.vm.audioMuted;
            wrapper.vm.toggleMute();
            expect(wrapper.vm.audioMuted).toBe(!before);
        });

        it("toggleVenueDetails flips shown", () => {
            wrapper = build().wrapper;
            wrapper.vm.toggleVenueDetails();
            expect(wrapper.vm.shown).toBe(true);
        });

        it("toggleFollowExecution updates follow via action", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.vm.toggleFollowExecution();
            expect(built.actions.toggleExecutionFollow.called).toBe(true);
        });

        it("closeExecutionDescriptionModal hides the modal", () => {
            wrapper = build().wrapper;
            wrapper.vm.closeExecutionDescriptionModal();
            expect(wrapper.vm.showExecutionDescriptionModal).toBe(false);
        });

        it("updateDescription saves execution and resets modal value", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.setData({modalDescriptionValue: "new"});
            wrapper.vm.updateDescription("new desc");
            expect(built.actions.saveExecution.called).toBe(true);
            expect(wrapper.vm.modalDescriptionValue).toBe("");
        });

        it("filterTrigger toggles a filter and updates query params", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.vm.filterTrigger("Redline");
            // Vuex action spies receive (context, payload); assert the payload.
            expect(built.actions.toggleElemFilter.args[0][1]).toBe("redline");
            expect(built.$router.replace.called).toBe(true);
        });

        it("onResumeParentExecution dispatches suspendResume", async() => {
            const built = build();
            wrapper = built.wrapper;
            await wrapper.vm.onResumeParentExecution();
            expect(built.actions.suspendResume.called).toBe(true);
        });

        it("addAudioTrigger/removeAudioTrigger persist to localStorage", async() => {
            wrapper = build().wrapper;
            window.localStorage.setItem("ingeniumTriggerAudioOn", JSON.stringify([]));
            await wrapper.vm.addAudioTrigger("ON_FAIL");
            expect(JSON.parse(window.localStorage.getItem("ingeniumTriggerAudioOn"))).toContain("ON_FAIL");
            wrapper.vm.removeAudioTrigger("ON_FAIL");
            expect(JSON.parse(window.localStorage.getItem("ingeniumTriggerAudioOn"))).not.toContain("ON_FAIL");
        });

        it("updateQueryParams replaces the route with filter query", () => {
            const built = build({filters: {comment: true}});
            wrapper = built.wrapper;
            wrapper.vm.updateQueryParams();
            expect(built.$router.replace.called).toBe(true);
        });
    });
});

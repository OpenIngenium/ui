import { shallowMount, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import VenueActionLink from "../../../src/modules/common/VenueActionLink.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build({props = {}, canExecute = true, canJoin = true, isPending = false, createResult} = {}) {
    const actions = {
        createExecution: sinon.stub().resolves(createResult),
        setPending: sinon.spy()
    };
    const store = new Vuex.Store({
        getters: {
            isPending: () => isPending,
            canJoinExecution: () => () => canJoin
        },
        actions
    });
    const $router = {push: sinon.spy(), go: sinon.spy()};
    const wrapper = shallowMount(VenueActionLink, {
        store,
        localVue,
        mocks: {$can: () => canExecute, $router},
        propsData: {venueId: "v1", type: "WSTS", venueGroupId: "g1", ...props}
    });
    return {wrapper, actions, $router};
}

describe("VenueActionLink.vue", () => {
    it("created() hydrates props from data.actionProps", () => {
        const {wrapper} = build({props: {data: {actionProps: {status: "AVAILABLE", venueId: "vX", executionId: "eX", testConductor: "tc", currentUser: "cu", type: "WSTS"}}}});
        expect(wrapper.vm.status).toBe("AVAILABLE");
        expect(wrapper.vm.venueId).toBe("vX");
        expect(wrapper.vm.executionId).toBe("eX");
    });

    it("textAlign honors alignCenter", () => {
        expect(build({props: {alignCenter: true}}).wrapper.vm.textAlign).toBe("center");
        expect(build().wrapper.vm.textAlign).toBe("left");
    });

    it("status computeds classify availability and usage", () => {
        expect(build({props: {status: "AVAILABLE"}}).wrapper.vm.isAvailable).toBe(true);
        const inUseSame = build({props: {status: "IN_USE", testConductor: "u", currentUser: "u"}}).wrapper.vm;
        expect(inUseSame.isInUseByCurrentUser).toBe(true);
        expect(inUseSame.isInUseByOtherUser).toBe(false);
        const inUseOther = build({props: {status: "IN_USE", testConductor: "a", currentUser: "b"}}).wrapper.vm;
        expect(inUseOther.isInUseByOtherUser).toBe(true);
    });

    it("canExecute/canJoin delegate to $can and canJoinExecution", () => {
        expect(build({canExecute: true}).wrapper.vm.canExecute).toBe(true);
        expect(build({canExecute: false}).wrapper.vm.canExecute).toBe(false);
        expect(build({canJoin: false}).wrapper.vm.canJoin).toBe(false);
    });

    it("startExecution redirects on a 200 response", async() => {
        const {wrapper, actions, $router} = build({createResult: {status: 200, data: {execution_id: "e9"}}});
        await wrapper.vm.startExecution();
        expect(wrapper.emitted("saveRecentVenue")).toBeTruthy();
        expect(actions.createExecution.called).toBe(true);
        expect($router.push.calledWith({path: "/execute_spa/v1/e9"})).toBe(true);
        expect(wrapper.vm.createExecutionMsg).toBe("Execution Created.");
    });

    it("startExecution reports failure on a non-200 response", async() => {
        const {wrapper} = build({createResult: {status: 409}});
        await wrapper.vm.startExecution();
        expect(wrapper.vm.createExecutionMsg).toContain("Failed to start");
    });

    it("startExecution is a no-op while pending", async() => {
        const {wrapper, actions} = build({isPending: true});
        await wrapper.vm.startExecution();
        expect(actions.createExecution.called).toBe(false);
    });

    it("continueExecution emits and redirects to the execution page", () => {
        const {wrapper, $router} = build({props: {executionId: "e2"}});
        wrapper.vm.continueExecution();
        expect(wrapper.emitted("saveRecentVenue")).toBeTruthy();
        expect($router.push.calledWith({path: "/execute_spa/v1/e2"})).toBe(true);
    });

    it("watchExecution emits and redirects to the as-run page", async() => {
        const {wrapper, $router} = build({props: {executionId: "e2"}});
        await wrapper.vm.watchExecution();
        expect(wrapper.emitted("saveRecentVenue")).toBeTruthy();
        expect($router.push.calledWith({path: "/execute/as_run/e2"})).toBe(true);
    });
});

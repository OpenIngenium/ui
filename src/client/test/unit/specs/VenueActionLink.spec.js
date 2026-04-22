import { shallow, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import VueRouter from 'vue-router';
import VenueActionLink from "../../../src/modules/common/VenueActionLink.vue";
import Vuex from "vuex";

// import { abilitiesPlugin } from '@casl/vue';
// import defineAbilityFor from '../../../src/modules/common/abilities';

const localVue = createLocalVue();
localVue.use(VueRouter);
// localVue.use(abilitiesPlugin, defineAbilityFor(['admin']));

describe("VenueActionLink.vue", () => {
    let router;

    beforeEach(() => {
        const routes = [
            {
                path: '/',
                component: VenueActionLink
            }
        ];
        router = new VueRouter({
            routes
        });
    });
    xit("handles the case for an available venue", () => {
        const store = new Vuex();
        const wrapper = shallow(VenueActionLink, {
            store,
            localVue,
            propsData: {
                status: "AVAILABLE",
                venueId: "1",
                testConductor: "",
                currentUser: "test-user",
                type: "WSTS"
            },
            data: {
                createExecutionMsg: ""
            }
        });
        sinon.stub(wrapper.vm, "redirectToExecutionPage");
        sinon.stub(wrapper.vm, "createExecution").resolves({
            status: 200,
            data: {executionId: "fake-execution-id"}
        });

        const link = wrapper.find("a");
        expect(link.text()).toContain("Execute");
        expect(link.find("span").classes()).toContain("glyphicon-play-circle");

        link.trigger('click');
        expect(wrapper.vm.createExecution.calledOnce).toBeTruthy();
    });

    xit("handles the case for an in-use venue by same user", () => {
        const store = new Vuex();
        const wrapper = shallow(VenueActionLink, {
            store,
            localVue,
            router,
            propsData: {
                status: "IN_USE",
                venueId: "1",
                testConductor: "test-user",
                currentUser: "test-user",
                executionId: "2",
                type: "WSTS"
            }
        });

        wrapper.vm.$router.push = sinon.spy();
        wrapper.vm.$router.go = sinon.spy();

        const link = wrapper.find("a");
        expect(link.text()).toContain("Continue Executing");
        expect(link.find("span").classes()).toContain("glyphicon-play-circle");

        link.trigger('click');
        expect(wrapper.vm.$router.push.calledWith({ path: `/execute_spa/1/2`})).toBeTruthy();
        expect(wrapper.vm.$router.go.calledOnce).toBeTruthy();
    });

    xit("handles the case for an in-use by different user", () => {
        const store = new Vuex();
        const wrapper = shallow(VenueActionLink, {
            store,
            localVue,
            router,
            propsData: {
                status: "IN_USE",
                venueId: "1",
                testConductor: "test-user",
                currentUser: "not-test-user",
                executionId: "2",
                type: "WSTS"
            }
        });
        wrapper.vm.$router.push = sinon.spy();
        wrapper.vm.$router.go = sinon.spy();

        const link = wrapper.find("div");
        expect(link.is('div')).toBe(true);
        // expect(link.text()).toContain("Watch Now");
        // expect(link.find("span").classes()).toContain("glyphicon-eye-open");
        //
        // link.trigger('click');
        // expect(wrapper.vm.$router.push.calledWith({ path: `/execute/as_run/2`})).toBeTruthy();
        // expect(wrapper.vm.$router.go.calledOnce).toBeTruthy();
    });


});

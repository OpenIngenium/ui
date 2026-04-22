import * as faker from "faker";
import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import VueRouter from 'vue-router';
import { createLocalVue } from "@vue/test-utils";
import Controls from "../../../../src/modules/common/side-panel/Controls.vue";
import { flushPromises } from "../../helpers";

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(VueRouter);

describe("Controls.vue", () => {
    let actions;
    let getters;
    let mutations;
    let store;
    let router;

    beforeEach(() => {
        actions = {
            closeExecution: sinon.spy(),
            resetState: sinon.spy(),
        };

        getters = {
        };

        mutations = {};

        router = new VueRouter();
    });

    // TODO: JSDom compatibility
    xit("closeExecutionAndRedirect - success closes modal and redirects user", async(done) => {
        const executionId = faker.random.uuid();
        actions["closeExecution"] = sinon.stub().returns(true);

        store = new Vuex.Store({
            modules: {
                execution: {
                    state: {},
                    actions,
                    getters,
                    mutations
                }
            }
        });

        const wrapper = shallow(Controls, {
            localVue,
            store,
            router,
            propsData: {},
            stubs: {"ing-modal": true}
        });
        wrapper.vm.executionId = executionId;
        wrapper.vm.$router.push = sinon.spy();
        wrapper.vm.$router.go = sinon.spy();

        wrapper.vm.$data.showModal = true;
        wrapper.vm.closeExecutionAndRedirect();
        // because closeExecutionAndRedirect is async
        await flushPromises();
        expect(wrapper.vm.$data.showModal).toBeFalsy();
        expect(wrapper.vm.$router.go.calledOnce).toBeTruthy();
        expect(wrapper.vm.$router.push.args[0][0]["path"]).toBe(`/execute/as_run/${executionId}`);
        done();
    });

    // TODO: JSDom compatibility
    xit("closeExecutionAndRedirect - failure closes modal no redirect", async(done) => {
        const executionId = faker.random.uuid();
        actions["closeExecution"] = sinon.stub().returns(false);

        store = new Vuex.Store({
            modules: {
                execution: {
                    state: {},
                    actions,
                    getters,
                    mutations
                }
            }
        });

        const wrapper = shallow(Controls, {
            localVue,
            store,
            router,
            propsData: {},
            stubs: {"ing-modal": true}
        });
        wrapper.vm.executionId = executionId;
        wrapper.vm.$router.push = sinon.spy();
        wrapper.vm.$router.go = sinon.spy();

        wrapper.vm.$data.showModal = true;
        wrapper.vm.closeExecutionAndRedirect();
        // because closeExecutionAndRedirect is async
        await flushPromises();
        expect(wrapper.vm.$data.showModal).toBeFalsy();
        expect(wrapper.vm.$router.go.notCalled).toBeTruthy();
        expect(wrapper.vm.$router.push.notCalled).toBeTruthy();
        done();
    });

});

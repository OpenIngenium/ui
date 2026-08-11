import * as faker from "faker";
import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import ExecutionToolbar from "../../../../src/modules/execution/ExecutionToolbar.vue";
import ExecutionStore from "../../../../src/modules/execution/execution-store.js";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("ExecutionToolbar.vue", () => {
    let actions;
    let getters;
    let mutations;
    let store;

    beforeEach(() => {
        actions = {
            updateCurrentElement: sinon.spy(),
            executeElement: sinon.spy(),
            prepareReExecuteElement: sinon.spy(),
        };

        getters = {
            currentStepId: sinon.stub(),
            directionalUnExecutedElement: () => () => false,
            execution: ExecutionStore.getters.execution,
            executionMetaDataKey: ExecutionStore.getters.executionMetaDataKey
        };

        mutations = {
            receiveVenue(state, venue) {
                state.venue = venue;
            }
        };

    });

    it("shows bullseye icon when step hasn't been executed", () => {
        const elementId = faker.random.uuid();
        const elements = {};
        elements[elementId] = {
            execution: {
                meta_data: {
                }
            }
        };
        store = new Vuex.Store({
            modules: {
                execution: {
                    state: {
                        elements: elements
                    },
                    actions,
                    getters,
                    mutations
                }
            }
        });

        const wrapper = shallow(ExecutionToolbar, {
            propsData: {
                elementId: elementId,
                executed: false,
                element: {
                    elem_id: elementId
                },
                clearForExecution: false,
                executable: "EXECUTED",
                executionId: '',
            },
            store,
            localVue
        });
        const buttons = wrapper.findAll("button.glyphicon");
        expect(buttons.length).toEqual(1);
        const focusButton = buttons.at(0);
        expect(focusButton.classes()).toContain("glyphicon-screenshot");
    });

    it("shows flash icon when step is currentStepId", () => {
        const elementId = faker.random.uuid();
        const elements = {};
        elements[elementId] = {
            execution: {
                meta_data: {
                }
            }
        };

        getters.currentStepId = sinon.stub().returns(elementId);
        store = new Vuex.Store({
            modules: {
                execution: {
                    state: {
                        elements: elements
                    },
                    actions,
                    getters,
                    mutations
                }
            }
        });

        const wrapper = shallow(ExecutionToolbar, {
            propsData: {
                elementId: elementId,
                executed: false,
                element: {
                    elem_id: elementId
                },
                clearForExecution: false,
                executable: "EXECUTED",
                executionId: '',
            },
            store,
            localVue
        });
        const buttons = wrapper.findAll("button.glyphicon");
        expect(buttons.length).toEqual(1);
        const focusButton = buttons.at(0);
        expect(focusButton.classes()).toContain("glyphicon-flash");
    });

});

describe("ExecutionToolbar.vue methods and computeds", () => {
    const ELEMENT_ID = "toolbar-elem-1";

    function build({props = {}, currentStepId = "other", isPending = false, unExecuted = false, stepType = "MANUAL_STEP"} = {}) {
        const actions = {
            setPending: sinon.spy(),
            executeElement: sinon.spy(),
            prepareReExecuteElement: sinon.spy(),
            updateCurrentElement: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                isPending: () => isPending,
                currentStepId: () => currentStepId,
                directionalUnExecutedElement: () => () => unExecuted,
                elementKey: () => (elemId, key) => (key === "step_type" ? stepType : undefined),
                execution: () => ({status: "IDLE"}),
                executionMetaDataKey: () => () => undefined,
                updatingElementInput: () => false
            },
            actions
        });
        const wrapper = shallow(ExecutionToolbar, {
            store,
            localVue,
            propsData: {
                elementId: ELEMENT_ID,
                element: {elem_id: ELEMENT_ID},
                executionId: "exec1",
                executed: false,
                executable: "EXECUTED",
                isStepPending: false,
                clearForExecution: true,
                ...props
            },
            stubs: {"ing-modal": true}
        });
        return {wrapper, actions};
    }

    it("showSelectButton when not the current step and unexecuted", () => {
        expect(build({currentStepId: "other", props: {executed: false}}).wrapper.vm.showSelectButton).toBe(true);
    });

    it("showExecuteButton when it is the current step and unexecuted", () => {
        expect(build({currentStepId: ELEMENT_ID, props: {executed: false}}).wrapper.vm.showExecuteButton).toBe(true);
    });

    it("showReExecuteButton when executed and executable", () => {
        expect(build({props: {executed: true, executable: "EXECUTED"}}).wrapper.vm.showReExecuteButton).toBe(true);
    });

    it("hasUnExecutedAbove/Below reflect directionalUnExecutedElement", () => {
        expect(build({unExecuted: "e2"}).wrapper.vm.hasUnExecutedAbove).toBe(true);
        expect(build({unExecuted: false}).wrapper.vm.hasUnExecutedBelow).toBe(false);
    });

    it("isVIS detects verification item status steps", () => {
        expect(build({stepType: "VERIFICATION_ITEM_STATUS"}).wrapper.vm.isVIS).toBe(true);
        expect(build({stepType: "MANUAL_STEP"}).wrapper.vm.isVIS).toBe(false);
    });

    it("activateExecuteableElementCallback updates the current element", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.activateExecuteableElementCallback();
        expect(actions.updateCurrentElement.lastCall.args[1]).toEqual({executionId: "exec1", element: {elem_id: ELEMENT_ID}});
    });

    it("onExecuteElement executes and toggles pending", async() => {
        const {wrapper, actions} = build({isPending: false});
        await wrapper.vm.onExecuteElement();
        expect(actions.executeElement.lastCall.args[1]).toEqual({elementId: ELEMENT_ID});
        expect(actions.setPending.callCount).toBe(2);
    });

    it("onExecuteElement is a no-op while pending", async() => {
        const {wrapper, actions} = build({isPending: true});
        await wrapper.vm.onExecuteElement();
        expect(actions.executeElement.called).toBe(false);
    });

    it("prepareReExecuteConfirmationCallback opens the rerun modal", () => {
        const {wrapper} = build();
        wrapper.vm.prepareReExecuteConfirmationCallback();
        expect(wrapper.vm.showRerunModal).toBe(true);
    });

    it("prepareReExecuteElementCallback closes the modal and re-executes", async() => {
        const {wrapper, actions} = build();
        wrapper.vm.showRerunModal = true;
        await wrapper.vm.prepareReExecuteElementCallback();
        expect(wrapper.vm.showRerunModal).toBe(false);
        expect(actions.prepareReExecuteElement.lastCall.args[1]).toEqual({elementId: ELEMENT_ID});
    });

    it("prepareExecuteNextStepCallback closes the modal and scrolls to the next executable", () => {
        const {wrapper} = build({unExecuted: "next-el"});
        const anchor = document.createElement("div");
        anchor.id = "next-el";
        document.body.appendChild(anchor);
        const scrollSpy = sinon.stub(window, "scrollTo");
        wrapper.vm.showRerunModal = true;
        wrapper.vm.prepareExecuteNextStepCallback();
        expect(wrapper.vm.showRerunModal).toBe(false);
        expect(scrollSpy.called).toBe(true);
        scrollSpy.restore();
        document.body.removeChild(anchor);
    });
});

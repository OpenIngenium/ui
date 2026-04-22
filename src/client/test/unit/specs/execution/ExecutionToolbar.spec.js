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

    xit("shows repeat icon when step has already been executed", () => {
        const elementId = faker.random.uuid();
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

        const wrapper = shallow(ExecutionToolbar, {
            propsData: {
                elementId: elementId,
                executed: true,
                executable: "EXECUTED",
                element: {
                    elem_id: elementId
                },
                clearForExecution: false,
                executionId: '',
            },
            store,
            localVue
        });
        const buttons = wrapper.findAll("button.glyphicon");
        expect(buttons.length).toEqual(1);
        const focusButton = buttons.at(0);
        expect(focusButton.classes()).toContain("glyphicon-repeat");
    });

    xit("clicking repeat icon toggles local showModal state", () => {
        const elementId = faker.random.uuid();
        store = new Vuex.Store({
            state: {},
            actions,
            getters,
            mutations,
        });

        const wrapper = shallow(ExecutionToolbar, {
            propsData: {
                elementId: elementId,
                executed: true,
                executable: "EXECUTED",
                element: {
                    elem_id: elementId
                },
                clearForExecution: false,
                executionId: '',
            },
            store,
            localVue,
            stubs: {"ing-modal": true}
        });

        expect(wrapper.vm.showModal).toBeFalsy();
        const reExecute = wrapper.find("button.glyphicon-repeat");
        reExecute.trigger("click");
        expect(wrapper.vm.showModal).toBeTruthy();
    });
    //This test is obsolete because we no longer use arrow buttons. 
    xit("navigation buttons display when directionalUnExecutedElement returns an element", () => {
        const elementId = faker.random.uuid();
        const unExecutedId = faker.random.uuid();
        getters.directionalUnExecutedElement = () => sinon.stub().returns(unExecutedId);
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
            localVue,
            stubs: {"ing-modal": true}
        });

        const buttons = wrapper.findAll("button.glyphicon");
        expect(buttons.length).toEqual(3); // two arrow buttons and bullseye
        const upButton = buttons.at(1);
        expect(upButton.classes()).toContain("glyphicon-arrow-up");
        const downButton = buttons.at(2);
        expect(downButton.classes()).toContain("glyphicon-arrow-down");
    });
});

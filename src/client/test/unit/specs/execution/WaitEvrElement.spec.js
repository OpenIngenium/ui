import { shallow, createLocalVue } from "@vue/test-utils";
import * as faker from "faker";
import Vue from "vue";
import Vuex from "vuex";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import executionStore from "../../../../src/modules/execution/execution-store";
import WaitEvrElement from "../../../../src/modules/elements/executable/wait-evr/WaitEvrElement.vue";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey,
    numEntries,
} = executionStore.getters;

const {
    editElementInput,
} = executionStore.actions;

const {
    setBooleanKey,
    receiveElementInput,
} = executionStore.mutations;

const localVue = createLocalVue();
localVue.use(Vuex);

describe("WaitEvrElement.vue", () => {
    let getters;
    let actions;
    let mutations;
    let commonStore;
    let elementId = faker.random.uuid();
    let store;
    let wrapper;

    getters = {
        executionInputKey,
        elementKey,
        executionMetaDataKey,
        numEntries,
        elementViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true,
    };
    actions = {
        editElementInput,
    };
    mutations = {
        setBooleanKey,
        receiveElementInput,
    };

    beforeEach(() => {
        commonStore = {
            state: {
                elementIds: [elementId],
                elements: {
                    [elementId]: {
                        description: "",
                        elem_id: elementId,
                        elem_type: "STEP",
                        executed: false,
                        execution: {meta_state: {status: undefined}},
                        execution_id: "m2020-ingenium-1005",
                        execution_user_input: {
                            data_path: "",
                            start_time: "",
                            lookback: "",
                            timeout: "",
                            entries: [],
                        },
                        number: "1",
                        parent_id: "",
                        specification: {},
                        step_type: "WAIT_EVR",
                        title: "",
                    }
                }
            },
            getters,
            actions,
            mutations,
        };

        store = new Vuex.Store(commonStore);

        wrapper = shallow(Vue.extend(elementExecutionMixin).extend(WaitEvrElement), {
            propsData: {
                elementMap: {
                    category: "executable",
                    comp: "wait-evr-element",
                    displayName: "Wait EVR",
                    isNestable: false,
                    name: "WAIT_EVR",
                    paletteGroup: "Telemetry",
                    path: "wait_evr_steps"

                },
                elementId: elementId,
                mode: "execution",
            },
            store,
            localVue,
            stubs: {
                "execution-status-check": true,
            }
        });
    });

    // DataPath
    xit("dynamic status bar conditionally displays dataPath", () => {
        let dataPath = "SidaA";

        let dataPathInput = wrapper.findAll(".edit-container input").at(0);
        dataPathInput.element.value = dataPath;
        dataPathInput.trigger("input");
        dataPathInput.trigger("change");

        let dataPathElement = wrapper.findAll(".data-bar-element div span").at(1);
        expect(dataPathElement.text().trim()).toContain(dataPath);
    });

    // StartTime
    xit("dynamic status bar conditionally displays startTime", () => {
        let startTime = "13:45:58T0800";

        let startTimeInput = wrapper.findAll(".edit-container input").at(1);
        startTimeInput.element.value = startTime;
        startTimeInput.trigger("input");
        startTimeInput.trigger("change");

        let startTimeElement = wrapper.findAll(".data-bar-element div span").at(0);
        expect(startTimeElement.text().trim()).toContain(startTime);
    });

    //Lookback
    xit("dynamic status bar conditionally displays Lookback", () => {
        let lookback = 30;

        let lookbackInput = wrapper.findAll(".edit-container input").at(2);
        lookbackInput.element.value = lookback;
        lookbackInput.trigger("input");
        lookbackInput.trigger("change");

        let lookbackElement = wrapper.findAll(".data-bar-element div span").at(2);
        expect(lookbackElement.text().trim()).toContain(lookback);
    });

    // Timeout
    xit("dynamic status bar conditionally displays timeout", () => {
        let timeout = 260;

        let timeoutInput = wrapper.findAll(".edit-container input").at(3);
        timeoutInput.element.value = timeout;
        timeoutInput.trigger("input");
        timeoutInput.trigger("change");

        let timeoutElement = wrapper.findAll(".data-bar-element div span").at(3);
        expect(timeoutElement.text().trim()).toContain(timeout); 
    });
});

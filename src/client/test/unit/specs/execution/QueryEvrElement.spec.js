import { mount } from "@vue/test-utils";
import * as faker from "faker";
import Vue from "vue";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import QueryEvrElement from "../../../../src/modules/elements/executable/query-evr/QueryEvrElement.vue";
import executionStore from "../../../../src/modules/execution/execution-store";
import evrsStore from "../../../../src/modules/elements/executable/query-evr/evr-store";
import dictionariesStore from "../../../../src/modules/common/dictionaries-store";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey,
    executionResultsKey
} = executionStore.getters;

const {
    setBooleanKey,
    receiveElementInput
} = executionStore.mutations;

const {
    saveElementInput,
    editElementInput
} = executionStore.actions;

const {
    evrs,
} = evrsStore.getters;

const {
    selectedSseDictionaryVersion,
    selectedFlightDictionaryVersion,
} = executionStore.getters;

const {
    fetchFlightEvrs,
    fetchSseEvrs,
} =  evrsStore.actions;

const localVue = createLocalVue();
localVue.use(Vuex);

describe("QueryEvrElement.vue", () => {
    let actions;
    let getters;
    let mutations;
    let commonStore;
    let store;
    let elementId = faker.random.uuid();

    actions = {
        saveElementInput,
        editElementInput,
        fetchFlightEvrs,
        fetchSseEvrs,
    };
    mutations = {
        setBooleanKey,
        receiveElementInput
    };
    getters = {
        evrs,
        selectedSseDictionaryVersion,
        selectedFlightDictionaryVersion,
        executionInputKey,
        elementKey,
        executionMetaDataKey,
        executionResultsKey,
        elementViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true
    };

    beforeEach(() => {
        commonStore = {
            state: {
                elementIds: [elementId],
                elements: {
                    [elementId]: {
                        elem_id: elementId,
                        elem_type: "STEP",
                        executed: false,
                        execution: {meta_data: {status: undefined}},
                        execution_user_input: {},
                        number: "1",
                        parent_id: "",
                        specification: {},
                        step_type: "QUERY_EVR",
                    }
                }
            },
            mutations,
            actions,
            getters
        };
    });

    xit("data bar conditionally displays start time and duration", () => {
        let start = new Date();
        let startTime = `${start.getFullYear()}-${start.getMonth()}-${start.getDay()}`;
        let duration = 30;

        commonStore.state.elements[elementId]["execution_user_input"] = {
            start_time: startTime,
            end_time: "",
            duration: duration,
            evrs: [],
        };
        store = new Vuex.Store(commonStore);

        const wrapper = mount(Vue.extend(elementExecutionMixin).extend(QueryEvrElement), {
            propsData: {
                elementMap: {
                    'QUERY_EVR': {
                        name: 'QUERY_EVR',
                        displayName: 'Query EVR',
                        paletteGroup: 'Telemetry',
                        comp: 'queryevr-container',
                        category: 'executable',
                        path: 'query_evr_steps',
                        isNestable: false
                    }
                },
                elementId: elementId,
                mode: "execution"
            },
            store,
            localVue,
            stubs: { "execution-status-check": true }
        });
        const dataBarItems = wrapper.findAll(".data-bar-contents-flex li");
        expect(dataBarItems.at(0).text()).toContain(`Query starting: ${startTime}`);
        expect(dataBarItems.at(1).text()).toContain(`Duration: ${duration} seconds`);
    });

    xit("data bar conditionally displays end time and duration", () => {
        let end = new Date();
        let endTime = `${end.getFullYear()}-${end.getMonth()}-${end.getDay()}`;
        let duration = 30;

        commonStore.state.elements[elementId]["execution_user_input"] = {
            start_time: "",
            end_time: endTime,
            duration: duration,
            evrs: [],
        };
        store = new Vuex.Store(commonStore);

        const wrapper = mount(Vue.extend(elementExecutionMixin).extend(QueryEvrElement), {
            propsData: {
                elementMap: {
                    'QUERY_EVR': {
                        name: 'QUERY_EVR',
                        displayName: 'Query EVR',
                        paletteGroup: 'Telemetry',
                        comp: 'queryevr-container',
                        category: 'executable',
                        path: 'query_evr_steps',
                        isNestable: false
                    }
                },
                elementId: elementId,
                mode: "execution"
            },
            store,
            localVue,
            stubs: { "execution-status-check": true }
        });
        const dataBarItems = wrapper.findAll(".data-bar-contents-flex li");
        expect(dataBarItems.at(0).text()).toContain(`Query ending at: ${endTime}`);
        expect(dataBarItems.at(1).text()).toContain(`Duration: ${duration} seconds`);
    });

    xit("data bar displays start and end time", () => {
        let date = new Date();
        let dateTime = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;

        commonStore.state.elements[elementId]["execution_user_input"] = {
            start_time: dateTime,
            end_time: dateTime,
            duration: "",
            evrs: [],
        };
        store = new Vuex.Store(commonStore);

        const wrapper = mount(Vue.extend(elementExecutionMixin).extend(QueryEvrElement), {
            propsData: {
                elementMap: {
                    'QUERY_EVR': {
                        name: 'QUERY_EVR',
                        displayName: 'Query EVR',
                        paletteGroup: 'Telemetry',
                        comp: 'queryevr-container',
                        category: 'executable',
                        path: 'query_evr_steps',
                        isNestable: false
                    }
                },
                elementId: elementId,
                mode: "execution"
            },
            store,
            localVue,
            stubs: { "execution-status-check": true }
        });
        const dataBarItems = wrapper.findAll(".data-bar-contents-flex li");
        expect(dataBarItems.at(0).text()).toContain(`Query starting: ${dateTime}`);
        expect(dataBarItems.at(1).text()).toContain(`and ending: ${dateTime}`);
    });
});

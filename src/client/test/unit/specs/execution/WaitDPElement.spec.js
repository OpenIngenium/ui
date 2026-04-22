import { shallow, createLocalVue } from "@vue/test-utils";
import executionStore from "../../../../src/modules/execution/execution-store";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import Vue from "vue";
import Vuex from "vuex";
import WaitDPElement from "../../../../src/modules/elements/executable/wait-dp/WaitDPElement.vue";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey,
    executionResultsKey,
    modStyle,
} = executionStore.getters;

const {
    setBooleanKey,
    receiveElementInput
} = executionStore.mutations;

const {
    saveElementInput,
    editElementInput
} = executionStore.actions;

let localVue = createLocalVue();
localVue.use(Vuex);

describe("WaitDPElement.vue", () => {
    let actions;
    let getters;
    let mutations;
    let store;
    let wrapper;
    let stubs;

    actions = {
        saveElementInput,
        editElementInput
    };
    mutations = {
        setBooleanKey,
        receiveElementInput
    };
    getters = {
        executionInputKey,
        elementKey,
        executionMetaDataKey,
        executionResultsKey,
        modStyle,
        elementViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true,
        numEntries: () => () => 1
    };
    store = new Vuex.Store({
        state: {
            elementIds: ['abc123'],
            elements: {
                'abc123': {
                    description:"",
                    elem_id: "abc123",
                    elem_type: "STEP",
                    executed: false,
                    execution: {meta_data: {status: undefined}},
                    execution_id: "m2020-ingenium-10151",
                    execution_user_input: {
                        data_path: "123",
                        start_time: "123",
                        lookback: 100,
                        timeout: 240,
                        entries: [
                            {
                                apid: 100,
                                product_status_filter: "100",
                                verification_condition: "GREATER_THAN",
                                verification_value: 10
                            }
                        ]
                    },
                    number: "1",
                    parent_id: "",
                    specification: {},
                    step_type: "WAIT_DATA_PRODUCTS",
                    title: "",
                }
            }
        },
        mutations,
        actions,
        getters
    });
    stubs = {
        ExecutionStatusCheck: true,
        EntriesWrapper: true
    };
    wrapper = shallow(Vue.extend(elementExecutionMixin).extend(WaitDPElement), {
        localVue,
        store,
        propsData: {
            elementMap: {
                'WAIT_DATA_PRODUCTS': {
                    name: 'WAIT_DATA_PRODUCTS',
                    displayName: 'Wait DP',
                    paletteGroup: 'Telemetry',
                    comp: 'wait-dp-element',
                    category: 'executable',
                    path: 'wait_data_products_steps',
                    isNestable: false
                }
            },
            elementId: "abc123",
            mode: "execution"
        },
        stubs
    });

    it("Displays the correct label and input text", () => {
        // Data Path
        expect(wrapper.vm.dataPath).toEqual('123');
        expect(wrapper.vm.startTime).toEqual('123');
        expect(wrapper.vm.lookback).toEqual(100);
        expect(wrapper.vm.timeout).toEqual(240);
    });
});

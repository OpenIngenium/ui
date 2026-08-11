import { shallow, createLocalVue } from "@vue/test-utils";
import executionStore from "../../../../src/modules/execution/execution-store";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import Vue from "vue";
import Vuex from "vuex";
import EipElement from "../../../../src/modules/elements/executable/eip/EipElement.vue";
import ExecutionStore from "../../../../src/modules/execution/execution-store";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey,
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

describe("EipElement.vue", () => {
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
        modStyle,
        elementViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true,
        numEntries: ExecutionStore.getters.numEntries,
    };
    store = new Vuex.Store({
        state: {
            elementIds: ['abc123'],
            elemModificationMap: {},
            elements: {
                'abc123': {
                    description:"",
                    elem_id: "abc123",
                    elem_type: "STEP",
                    executed: false,
                    execution: {meta_data: {status: undefined}},
                    execution_id: "m2020-ingenium-10151",
                    execution_user_input: {
                        entries: [
                            {
                                signal_name: "qeqd23ddkmkl23 d23dklm213kd",
                                icds: "34",
                                from: "23",
                                to: "23",
                                unit: "Volt",
                                min_value: "23",
                                max_value: "23",
                                actual_value: "23",
                            },
                            {
                                signal_name: "testabc",
                                icds: "34",
                                from: "23",
                                to: "23",
                                unit: "Volt",
                                min_value: "23",
                                max_value: "23",
                                actual_value: "23",
                            }
                        ]
                    },
                    number: "1",
                    parent_id: "",
                    specification: {},
                    step_type: "EIP",
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
    wrapper = shallow(Vue.extend(elementExecutionMixin).extend(EipElement), {
        localVue,
        store,
        propsData: {
            elementMap: {
                'MANUAL_EIP': {
                    name: 'MANUAL_EIP',
                    displayName: 'EIP',
                    paletteGroup: 'Manual',
                    comp: 'eip-element',
                    category: 'executable',
                    path: 'manual_eip_steps',
                    isNestable: false
                }
            },
            elementId: "abc123",
            mode: "execution"
        },
        stubs
    });

    afterAll(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("Entries exist", () => {
        // Data Path
        expect(wrapper.vm.numEntries("abc123")).toEqual(2);
    });
});

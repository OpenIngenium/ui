import { shallow, createLocalVue } from "@vue/test-utils";
import executionStore from "../../../../src/modules/execution/execution-store";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import Vue from "vue";
import Vuex from "vuex";
import WaitElement from "../../../../src/modules/elements/executable/wait/WaitElement.vue";

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

describe("WaitElement.vue", () => {
    let actions;
    let getters;
    let mutations;
    let store;
    let wrapper;

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
        isLevelThreeDetail: () => () => true
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
                        time_value: "600",
                        wait_type: "DURATION"
                    },
                    number: "1",
                    parent_id: "",
                    specification: {},
                    step_type: "WAIT",
                    title: "",
                }
            }
        },
        mutations,
        actions,
        getters
    });

    beforeEach(() => {
        wrapper = shallow(Vue.extend(elementExecutionMixin).extend(WaitElement), {
            localVue,
            store,
            propsData: {
                elementMap: {
                    'WAIT': {
                        name: 'WAIT',
                        displayName: 'Wait',
                        paletteGroup: 'Manual',
                        comp: 'wait-element',
                        category: 'executable',
                        path: 'wait_steps',
                        isNestable: false
                    }
                },
                elementId: "abc123",
                mode: "execution"
            },
            stubs: {
                'execution-status-check': true,
            }
        });
    });

    it("Displays the correct label and input text", () => {
        wrapper.findAll('option').at(0).element.selected = true;
        wrapper.find('select').trigger('change');
        expect(wrapper.vm.waitTypeIsDuration).toEqual(true);
        expect(wrapper.vm.timeOrDurationText).toEqual('600 seconds');
        expect(wrapper.vm.timeOrDurationInputLabel).toEqual('Duration(sec)');
    });
    xit("Resets the time value when the wait type is changed.", async() => {
        wrapper.findAll('option').at(1).element.selected = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.waitTypeIsDuration).toEqual(false);
        expect(wrapper.vm.timeOrDurationText).toEqual('_____');
        expect(wrapper.vm.timeOrDurationInputLabel).toEqual('Time(UTC)');
    });
});

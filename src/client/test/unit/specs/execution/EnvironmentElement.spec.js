import { shallow, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import EnvironmentElement from "../../../../src/modules/elements/executable/environment/EnvironmentElement.vue";
import executionStore from "../../../../src/modules/execution/execution-store";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";

const {
    executionInputKey,
    executionInput,
    elementKey,
    executionMetaDataKey
} = executionStore.getters;

const localVue = createLocalVue();
localVue.use(Vuex);

const Composed = Vue.extend(elementExecutionMixin).extend(EnvironmentElement);

describe("EnvironmentElement.vue", () => {
    const elementId = "env1";

    function build(userInput) {
        const actions = {
            editElementInput: sinon.spy(),
            editElementArray: sinon.spy(),
            saveElementInput: sinon.spy()
        };
        const state = {
            elementIds: [elementId],
            elements: {
                [elementId]: {
                    elem_id: elementId,
                    elem_type: "STEP",
                    executed: false,
                    execution: {meta_data: {status: undefined}, results: {}},
                    execution_user_input: userInput || {
                        temperature: {verify_on: "VALUE", verification_condition: "LESS_THAN", verification_values: [10], actual_value: 5},
                        humidity: {verify_on: "CHANGE", verification_condition: "INCLUSIVE_RANGE", verification_values: [1, 9], actual_value: 3}
                    },
                    number: "1",
                    parent_id: "",
                    specification: {},
                    step_type: "ENVIRONMENT_MANUAL"
                }
            }
        };
        const store = new Vuex.Store({
            state,
            getters: {
                executionInputKey,
                executionInput,
                elementKey,
                executionMetaDataKey,
                executionResultsKey: () => () => undefined,
                executionResultsEntryKey: () => () => undefined,
                executionRedlineInputKey: () => () => undefined,
                canParticipate: () => true,
                numEntries: () => () => 0,
                modStyle: () => () => "",
                elementViewState: () => () => ({detailLevel: 3})
            },
            actions
        });
        const wrapper = shallow(Composed, {
            propsData: {
                elementId,
                elementMap: {name: "ENVIRONMENT_MANUAL", path: "environment_steps", isNestable: false},
                mode: "execution"
            },
            store,
            localVue,
            stubs: {"execution-status-check": true}
        });
        return {wrapper, actions, state};
    }

    it("reads nested temperature and humidity input via getters", () => {
        const vm = build().wrapper.vm;
        expect(vm.temperatureVerifyOn).toBe("VALUE");
        expect(vm.temperatureVerificationCondition).toBe("LESS_THAN");
        expect(vm.temperatureVerificationFromValue).toBe(10);
        expect(vm.temperatureActualValue).toBe(5);
        expect(vm.humidityVerifyOn).toBe("CHANGE");
        expect(vm.humidityVerificationFromValue).toBe(1);
        expect(vm.humidityVerificationToValue).toBe(9);
    });

    it("range/record condition computeds classify the conditions", () => {
        const vm = build().wrapper.vm;
        expect(vm.temperatureIsRangeCondition).toBe(false);
        expect(vm.humidityIsRangeCondition).toBe(true);
        expect(vm.temperatureIsRecordCondition).toBe(false);
    });

    it("simple setters dispatch editElementInput", () => {
        const {wrapper, actions} = build();
        wrapper.vm.temperatureVerifyOn = "CHANGE";
        wrapper.vm.humidityActualValue = 7;
        expect(actions.editElementInput.callCount).toBe(2);
    });

    it("range value setters dispatch editElementArray with the position", () => {
        const {wrapper, actions} = build();
        wrapper.vm.temperatureVerificationFromValue = 2;
        wrapper.vm.temperatureVerificationToValue = 8;
        expect(actions.editElementArray.args[0][1].position).toBe(0);
        expect(actions.editElementArray.args[1][1].position).toBe(1);
    });

    it("checkRangeConditionChange clears the upper bound when leaving a range condition", () => {
        const {wrapper, actions} = build();
        wrapper.vm.checkRangeConditionChange("EQUAL", "INCLUSIVE_RANGE", "temperature.verification_values");
        expect(actions.editElementArray.called).toBe(true);
        expect(actions.editElementArray.args[0][1]).toEqual({keyString: "temperature.verification_values", position: 1, value: null, elementId});
    });

    it("checkRangeConditionChange does nothing when staying within range types", () => {
        const {wrapper, actions} = build();
        wrapper.vm.checkRangeConditionChange("EXCLUSIVE_RANGE", "INCLUSIVE_RANGE", "temperature.verification_values");
        expect(actions.editElementArray.called).toBe(false);
    });

    it("changing the condition getter triggers the range watcher", async() => {
        const {wrapper, actions, state} = build();
        state.elements[elementId].execution_user_input.humidity.verification_condition = "EQUAL";
        await wrapper.vm.$nextTick();
        expect(actions.editElementArray.called).toBe(true);
    });
});

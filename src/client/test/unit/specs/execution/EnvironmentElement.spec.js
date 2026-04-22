import { shallow, createLocalVue } from "@vue/test-utils";
import * as faker from "faker";
import Vue from "vue";
import Vuex from "vuex";
import EnvironmentElement from "../../../../src/modules/elements/executable/environment/EnvironmentElement.vue";
import executionStore from "../../../../src/modules/execution/execution-store";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";

const {
    executionInputKey,
    executionInput,
    elementKey,
    executionMetaDataKey,
} = executionStore.getters;

const {
    setBooleanKey,
    receiveElementInput,
    receiveElementArrayValue,
} = executionStore.mutations;

const {
    saveElementInput,
    editElementInput,
    editElementArray,
} = executionStore.actions;

const localVue = createLocalVue();
localVue.use(Vuex);

describe("EnvironmentElement.vue", () => {
    let actions;
    let getters;
    let wrapper;
    let mutations;
    let commonStore;
    let store;
    let elementId = faker.random.uuid();

    actions = {
        saveElementInput,
        editElementInput,
        editElementArray,
    };
    mutations = {
        setBooleanKey,

        receiveElementArrayValue,
        receiveElementInput
    };
    getters = {
        executionInputKey,
        executionInput,
        elementKey,
        executionMetaDataKey,
        elementViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true,
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
                        step_type: "ENVIRONMENT_MANUAL",
                    }
                }
            },
            mutations,
            actions,
            getters
        };

        commonStore.state.elements[elementId]["execution_user_input"] = {
            temperature: {
                verify_on: '',
                verification_condition: '',
                verification_values: [],
                actual_value: ''
            },
            humidity: {
                verify_on: '',
                verification_condition: '',
                verification_values: [],
                actual_value: ''
            },
        };
        store = new Vuex.Store(commonStore);

        wrapper = shallow(Vue.extend(elementExecutionMixin).extend(EnvironmentElement), {
            propsData: {
                elementId: elementId,
                elementMap: {
                    name: 'ENVIRONMENT_MANUAL',
                    displayName: 'Environment',
                    paletteGroup: 'Manual',
                    comp: 'environment-element',
                    category: 'executable',
                    path: 'environment_steps',
                    isNestable: false
                },
                mode: 'execution'
            },
            store,
            localVue,
            stubs: { "execution-status-check": true }
        });
    });

    xit("sets condition and on values", async() => {

        const userInput = commonStore.state.elements[elementId]["execution_user_input"];

        const tempVerifyOn = wrapper.findAll('select').at(0);
        tempVerifyOn.findAll('option').at(0).trigger('change');

        expect(userInput.temperature.verify_on).toEqual('VALUE');

        const tempVerifyCondition = wrapper.findAll('select').at(1);
        tempVerifyCondition.findAll('option').at(1).trigger('change');

        expect(userInput.temperature.verification_condition).toEqual('LESS_THAN');
    });

    xit("parses verification values", () => {
        const userInput = commonStore.state.elements[elementId]["execution_user_input"];
        const tempVerifyCondition = wrapper.findAll('select').at(1);
        const tempVerifyValueFrom = wrapper.findAll('input').at(0);

        tempVerifyValueFrom.element.value ='1.5';
        tempVerifyValueFrom.trigger('input');
        tempVerifyValueFrom.trigger('change');

        expect(userInput.temperature.verification_values).toEqual([1.5]);

        tempVerifyCondition.findAll('option').at(7).element.selected = true;
        tempVerifyCondition.trigger('change');

        const tempVerifyValueTo = wrapper.findAll('input').at(1);
        tempVerifyValueTo.element.value ='100';
        tempVerifyValueTo.trigger('input');
        tempVerifyValueTo.trigger('change');

        expect(userInput.temperature.verification_values).toEqual([1.5, 100]);

        tempVerifyCondition.findAll('option').at(1).element.selected = true;
        tempVerifyCondition.trigger('change');

        expect(userInput.temperature.verification_values).toEqual([1.5]);

        tempVerifyValueFrom.element.value = '';
        tempVerifyValueFrom.trigger('input');
        tempVerifyValueFrom.trigger('change');

        expect(userInput.temperature.verification_values).toEqual([]);

        const humidityVerifyOn = wrapper.findAll('select').at(2);
        humidityVerifyOn.findAll('option').at(1).element.selected = true;
        humidityVerifyOn.trigger('change');

        expect(userInput.humidity.verify_on).toEqual('CHANGE');

    });
});

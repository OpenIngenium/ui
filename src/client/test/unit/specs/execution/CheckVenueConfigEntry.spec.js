import Vue from 'vue';
import { shallow } from "@vue/test-utils";
import Vuex from "vuex";
import * as faker from "faker";
import sinon from "sinon";
import { createLocalVue } from "@vue/test-utils";
import CheckVenueConfigEntry from "../../../../src/modules/elements/executable/check-venue-config/CheckVenueConfigEntry.vue";
import executionStore from "../../../../src/modules/execution/execution-store";
import entryExecutionMixin from "../../../../src/modules/elements/mixins/entry-execution-mixin";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop.js';

Vue.directive('drag-and-drop', DragAndDrop);


const {
    executionInputEntryKey,
    executionResultsEntryKey,
    elementKey
} = executionStore.getters;

const {
    setBooleanKey,
    receiveEntryInput,
} = executionStore.mutations;

const {
    editEntryInput,
} = executionStore.actions;

const localVue = createLocalVue();
localVue.use(Vuex);

describe("CheckVenueConfigEntry.vue", () => {
    let actions;
    let getters;
    let mutations;
    let commonStore;
    let store;
    let elementId = faker.random.uuid();

    actions = {
        editEntryInput,
    };
    mutations = {
        setBooleanKey,
        receiveEntryInput
    };
    getters = {
        executionInputEntryKey,
        executionResultsEntryKey,
        elementKey,
        entryViewState: () => function() {return {detailLevel: 3}; },
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
                        execution_user_input: {},
                        number: "1",
                        parent_id: "",
                        specification: {},
                        execution: {
                            results: {
                                entries: [
                                    {
                                        actual_value: 5
                                    }
                                ]
                            }
                        },
                        step_type: "VENUE_CONFIG_CHECK",
                    }
                }
            },
            mutations,
            actions,
            getters
        };

        commonStore.state.elements[elementId]["execution_user_input"]['entries'] = [{
            config_elem_name: '',
            field_name: 'STATUS',
            verification_condition: '',
            verification_value: '',
            actual_value: ''
        }];
        store = new Vuex.Store(commonStore);
    });

    xit("watches field name and resets the verification value on change", async() => {
        let wrapper = shallow(CheckVenueConfigEntry, {
            propsData: {
                elementId: elementId,
                index: 0,
                mode: 'execution'
            },
            mixins: [entryExecutionMixin],
            store,
            localVue,
            stubs: {
                "ing-modal": true,
                "ing-popover": true,
                "execution-full-results": true,
                "execution-status-check": true,
                "drag-and-drop": true
            }
        });

        sinon.spy(wrapper.vm,'editEntryInput');

        expect(wrapper.vm.editEntryInput.callCount).toEqual(0);
        expect(commonStore.state.elements[elementId]["execution_user_input"]['entries'][0].verification_value).toEqual('');

        const fieldName = wrapper.findAll('select').at(0);
        fieldName.findAll('option').at(1).element.selected = true;
        fieldName.trigger('change');
        await wrapper.vm.$nextTick();

        expect(commonStore.state.elements[elementId]["execution_user_input"]['entries'][0].field_name).toEqual('TYPE');
        expect(commonStore.state.elements[elementId]["execution_user_input"]['entries'][0].verification_value).toEqual('BREADBOARD');
        expect(wrapper.vm.editEntryInput.callCount).toEqual(2);
    });
});

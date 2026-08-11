import Vue from 'vue';
import { shallow, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
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

const localVue = createLocalVue();
localVue.use(Vuex);

const Composed = Vue.extend(entryExecutionMixin).extend(CheckVenueConfigEntry);

describe("CheckVenueConfigEntry.vue", () => {
    const elementId = "cvc1";

    function build(entry = {}) {
        const editEntryInputSpy = sinon.spy();
        const state = {
            elementIds: [elementId],
            elements: {
                [elementId]: {
                    elem_id: elementId,
                    elem_type: "STEP",
                    executed: false,
                    execution_user_input: {
                        entries: [{
                            config_elem_name: "",
                            field_name: "STATUS",
                            verification_condition: "",
                            verification_value: "",
                            ...entry
                        }]
                    },
                    number: "1",
                    parent_id: "",
                    specification: {},
                    execution: {results: {entries: [{actual_value: 5}]}},
                    step_type: "VENUE_CONFIG_CHECK"
                }
            }
        };
        const store = new Vuex.Store({
            state,
            getters: {
                executionInputEntryKey,
                executionResultsEntryKey,
                elementKey,
                executionResultsEntry: () => () => ({}),
                executionRedlineInputKey: () => () => undefined,
                canParticipate: () => true,
                entryViewState: () => () => ({detailLevel: 3})
            },
            actions: {
                editEntryInput: editEntryInputSpy,
                editEntryArray: sinon.spy(),
                saveElementInput: sinon.spy(),
                moveEntry: sinon.spy(),
                setEntryViewStateDetailLevel: sinon.spy()
            }
        });
        const wrapper = shallow(Composed, {
            propsData: {elementId, index: 0, mode: "execution"},
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
        return {wrapper, state, editEntryInputSpy};
    }

    it("computed getters read the entry input", () => {
        const {wrapper} = build({config_elem_name: "PWR", field_name: "TYPE", verification_condition: "EQUAL", verification_value: "FLIGHT"});
        expect(wrapper.vm.configElemName).toBe("PWR");
        expect(wrapper.vm.fieldName).toBe("TYPE");
        expect(wrapper.vm.verificationCondition).toBe("EQUAL");
        expect(wrapper.vm.verificationValue).toBe("FLIGHT");
        expect(wrapper.vm.isType).toBe(true);
    });

    it("isType is false for a STATUS field", () => {
        expect(build({field_name: "STATUS"}).wrapper.vm.isType).toBe(false);
    });

    it("actualValue reads from execution results", () => {
        expect(build().wrapper.vm.actualValue).toBe(5);
    });

    it("setters dispatch editEntryInput with the entry coordinates", () => {
        const {wrapper, editEntryInputSpy} = build();
        wrapper.vm.configElemName = "NewName";
        expect(editEntryInputSpy.called).toBe(true);
        expect(editEntryInputSpy.args[0][1]).toEqual({elementId, index: 0, key: "config_elem_name", value: "NewName"});
    });

    it("saveCheckVenueConfigEntry emits a save event", () => {
        const {wrapper} = build();
        wrapper.vm.saveCheckVenueConfigEntry();
        expect(wrapper.emitted("save")).toBeTruthy();
    });

    it("switching to TYPE resets the verification value to the first type option", async() => {
        const {wrapper, state, editEntryInputSpy} = build({field_name: "STATUS"});
        state.elements[elementId].execution_user_input.entries[0].field_name = "TYPE";
        await wrapper.vm.$nextTick();
        const call = editEntryInputSpy.getCalls().find((c) => c.args[1].key === "verification_value");
        expect(call.args[1].value).toBe("BREADBOARD");
    });

    it("switching to STATUS resets the verification value to the first status option", async() => {
        const {wrapper, state, editEntryInputSpy} = build({field_name: "TYPE"});
        state.elements[elementId].execution_user_input.entries[0].field_name = "STATUS";
        await wrapper.vm.$nextTick();
        const call = editEntryInputSpy.getCalls().find((c) => c.args[1].key === "verification_value");
        expect(call.args[1].value).toBe("INSTALLED");
    });
});

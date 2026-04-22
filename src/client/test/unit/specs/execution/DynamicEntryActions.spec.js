import { shallow, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import DynamicEntryActions from "../../../../src/modules/elements/DynamicEntryActions.vue";
import Vue from "vue";
import {DragAndDrop} from "../../../../src/modules/common/directives/DragAndDrop";
import executionStore from "../../../../src/modules/execution/execution-store";

Vue.directive('drag-and-drop', DragAndDrop);
const localVue = createLocalVue();
localVue.use(Vuex);

describe("DynamicEntryActions.vue", () => {
    let actions;
    let getters;
    let store;
    let wrapper;

    beforeEach(() => {
        actions = {
            createEntryInput: sinon.spy(),
            copyEntryInput: sinon.spy(),
            deleteEntryInput: sinon.spy()
        };
    });

    it("renders with nominal data", () => {
        getters = {
            numEntries: () => () => 2,
            elementKey: executionStore.getters.elementKey,
        };

        store = new Vuex.Store({
            state: {
                elements: [],
            },
            actions,
            getters
        });

        wrapper = shallow(DynamicEntryActions, {
            localVue,
            store,
            propsData: {
                elementId: "1",
                index: 0,
                elementPath: "cmd_steps"
            }
        });

        // Ensure 3 buttons rendered
        expect(wrapper.findAll(".dynamic_entry_button").length).toBe(3);

        // Check render of add button
        const addBtn = wrapper.find(".dynamic_entry_add_button");
        expect(addBtn.find("span").classes()).toContain("glyphicon-plus");

        // Check render of copy button
        const copyBtn = wrapper.find(".dynamic_entry_copy_button");
        expect(copyBtn.find("span").classes()).toContain("glyphicon-copy");
        expect(copyBtn.text()).toContain("Copy");

        // Check render of remove button
        const removeBtn = wrapper.find(".dynamic_entry_remove_button");
        expect(removeBtn.find("span").classes()).toContain("glyphicon-remove");
        expect(removeBtn.attributes()["disabled"]).toBeUndefined();
    });

    it("handles add click", () => {
        getters = {
            numEntries: () => () => 2,
            elementKey: executionStore.getters.elementKey,
        };

        store = new Vuex.Store({
            state: {
                elements: [],
            },
            actions,
            getters
        });

        wrapper = shallow(DynamicEntryActions, {
            localVue,
            store,
            propsData: {
                elementId: "1",
                index: 0,
                elementPath: "cmd_steps"
            }
        });

        const addBtn = wrapper.find(".dynamic_entry_add_button");
        expect(actions.createEntryInput.callCount).toBe(0);
        addBtn.trigger("click");
        expect(actions.createEntryInput.callCount).toBe(1);
        expect(actions.createEntryInput.args[0][1].elementId).toEqual("1");
        expect(actions.createEntryInput.args[0][1].elementPath).toEqual("cmd_steps");
        expect(actions.createEntryInput.args[0][1].refIndex).toEqual(0);
    });

    it("handles copy click", () => {
        getters = {
            numEntries: () => () => 2,
            elementKey: executionStore.getters.elementKey,
        };

        store = new Vuex.Store({
            state: {
                elements: [],
            },
            actions,
            getters
        });

        wrapper = shallow(DynamicEntryActions, {
            localVue,
            store,
            propsData: {
                elementId: "1",
                index: 0,
                elementPath: "cmd_steps"
            }
        });

        const copyBtn = wrapper.find(".dynamic_entry_copy_button");
        expect(actions.copyEntryInput.callCount).toBe(0);
        copyBtn.trigger("click");
        expect(actions.copyEntryInput.callCount).toBe(1);
        expect(actions.copyEntryInput.args[0][1].elementId).toEqual("1");
        expect(actions.copyEntryInput.args[0][1].elementPath).toEqual("cmd_steps");
        expect(actions.copyEntryInput.args[0][1].refIndex).toEqual(0);
    });

    it("handles remove click w/ > 1 entries", () => {
        getters = {
            numEntries: () => () => 2,
            elementKey: executionStore.getters.elementKey,
        };

        store = new Vuex.Store({
            state: {
                elements: [],
            },
            actions,
            getters
        });

        wrapper = shallow(DynamicEntryActions, {
            localVue,
            store,
            propsData: {
                elementId: "1",
                index: 0,
                elementPath: "cmd_steps"
            }
        });

        const removeBtn = wrapper.find(".dynamic_entry_remove_button");
        expect(actions.deleteEntryInput.callCount).toBe(0);
        removeBtn.trigger("click");
        expect(actions.deleteEntryInput.callCount).toBe(1);
        expect(actions.deleteEntryInput.args[0][1].elementId).toEqual("1");
        expect(actions.deleteEntryInput.args[0][1].elementPath).toEqual("cmd_steps");
        expect(actions.deleteEntryInput.args[0][1].refIndex).toEqual(0);
    });

    it("disables remove click w/ 1 entry", () => {
        getters = {
            numEntries: () => () => 1,
            elementKey: executionStore.getters.elementKey,
        };

        store = new Vuex.Store({
            state: {
                elements: [],
            },
            actions,
            getters
        });

        wrapper = shallow(DynamicEntryActions, {
            localVue,
            store,
            propsData: {
                elementId: "1",
                index: 0,
                elementPath: "cmd_steps"
            }
        });

        const removeBtn = wrapper.find(".dynamic_entry_remove_button");
        expect(removeBtn.attributes()["disabled"]).toEqual("disabled");
        expect(actions.deleteEntryInput.callCount).toBe(0);
        removeBtn.trigger("click");
        expect(actions.deleteEntryInput.callCount).toBe(0);
    });
});

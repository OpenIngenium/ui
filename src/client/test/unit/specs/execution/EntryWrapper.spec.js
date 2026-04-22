import { mount } from "@vue/test-utils";
import * as faker from "faker";
import Vue from "vue";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import entryExecutionMixin from "../../../../src/modules/elements/mixins/entry-execution-mixin";
import entryAsRunMixin from "../../../../src/modules/elements/mixins/entry-as-run-mixin";
import EntryWrapper from "../../../../src/modules/elements/EntryWrapper.vue";
import executionStore from "../../../../src/modules/execution/execution-store";
import {DragAndDrop} from "../../../../src/modules/common/directives/DragAndDrop";

const {
    executionInputEntryKey,
} = executionStore.getters;

const {
    setBooleanKey,
    receiveElementInput
} = executionStore.mutations;

const {
    saveElementInput,
    editElementInput,
    createEntryInput,
    copyEntryInput,
    deleteEntryInput,
} = executionStore.actions;

Vue.directive('drag-and-drop', DragAndDrop);
const localVue = createLocalVue();
localVue.use(Vuex);

describe("EntryWrapper.vue", () => {
    let actions;
    let getters;
    let mutations;
    let commonStore;
    let store;
    let elementId = faker.random.uuid();

    actions = {
        saveElementInput,
        editElementInput,
        createEntryInput,
        copyEntryInput,
        deleteEntryInput
    };
    mutations = {
        setBooleanKey,
        receiveElementInput
    };
    getters = {
        executionInputEntryKey,
        entryViewState: () => function() {return {detailLevel: 3}; },
        isLevelTwoDetail: () => () => true,
        isLevelThreeDetail: () => () => true,
        numEntries: () => () => 1,
        elementKey: () => () => 1
    };

    beforeEach(() => {
        commonStore = {
            state: {
                elements: {
                    [elementId]: {
                        execution_user_input: {
                            entries: []
                        }
                    }}
            },
            mutations,
            actions,
            getters
        };
    });

    it("renders dynamic-entry-actions in execution mode", () => {
        commonStore.state.elements[elementId]["execution_user_input"].entries.push({
            hw_fsw: "",
            cmd_string: "",
            timeout: "",
            verify: ""
        });
        store = new Vuex.Store(commonStore);

        const wrapper = mount(Vue.extend(entryExecutionMixin).extend(EntryWrapper), {
            propsData: {
                elementId: elementId,
                index: 0,
                mode: "execution",
                entry: "",
                elementPath: ""
            },
            stubs: {
                "dynamic-entry-actions": "<div class='fake-dynamic-entry-actions'></div>"
            },
            store,
            localVue
        });

        expect(wrapper.find(".fake-dynamic-entry-actions").exists()).toBe(true);
    });

    it("doesn't render dynamic-entry-actions in as-run mode", () => {
        commonStore.state.elements[elementId]["execution_user_input"].entries.push({
            hw_fsw: "",
            cmd_string: "",
            timeout: "",
            verify: ""
        });
        store = new Vuex.Store(commonStore);

        const wrapper = mount(Vue.extend(entryAsRunMixin).extend(EntryWrapper), {
            propsData: {
                elementId: elementId,
                index: 0,
                mode: "as-run",
                entry: "",
                elementPath: ""
            },
            stubs: {
                "dynamic-entry-actions": "<div class='fake-dynamic-entry-actions'></div>"
            },
            store,
            localVue
        });
        expect(wrapper.find(".fake-dynamic-entry-actions").exists()).toBe(false);
    });

});

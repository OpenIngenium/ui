import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngConversations from "../../../../src/modules/common/IngConversations.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build({conversations = {}, isPending = false} = {}) {
    const actions = {
        postConversation: sinon.spy(),
        setPending: sinon.spy()
    };
    const store = new Vuex.Store({
        getters: {
            conversations: () => () => conversations,
            execution: () => ({}),
            executionFinalized: () => false,
            isPending: () => isPending
        },
        actions
    });
    const wrapper = shallowMount(IngConversations, {
        localVue,
        store,
        propsData: {version: -1, elementId: "e1", executionId: "ex1"},
        stubs: {"ing-conversation": true}
    });
    return {wrapper, actions};
}

describe("IngConversations.vue", () => {
    it("elementConversations is false when there are none", () => {
        expect(build().wrapper.vm.elementConversations).toBe(false);
    });

    it("elementConversations returns the conversations object when present", () => {
        const convos = {c1: {conversation_id: "c1"}};
        expect(build({conversations: convos}).wrapper.vm.elementConversations).toEqual(convos);
    });

    it("createNewConversation posts a conversation and toggles pending", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.createNewConversation("COMMENT");
        expect(actions.setPending.callCount).toBe(2);
        expect(actions.postConversation.calledOnce).toBe(true);
        expect(actions.postConversation.args[0][1].conversation.type).toBe("COMMENT");
    });

    it("createNewConversation is a no-op while a request is pending", async() => {
        const {wrapper, actions} = build({isPending: true});
        await wrapper.vm.createNewConversation("COMMENT");
        expect(actions.postConversation.called).toBe(false);
    });
});

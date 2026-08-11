import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngConversation from "../../../../src/modules/common/IngConversation.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function conversationFixture(overrides = {}) {
    return {
        conversation_id: "c1",
        type: "COMMENT",
        status: "UNRESOLVED",
        comments: {a: {content: "first reply", user_name: "someone"}},
        ...overrides
    };
}

describe("IngConversation.vue", () => {
    function build({conversation = conversationFixture(), mode = "authoring", finalized = false, canUpdate = true} = {}) {
        const actions = {
            postComment: sinon.spy(),
            editConversation: sinon.spy(),
            deleteConversation: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                conversation: () => () => conversation,
                comments: () => () => Object.values(conversation.comments),
                commentFilter: () => "",
                resolvedFilter: () => true,
                unresolvedFilter: () => true,
                dataReviewFilter: () => true,
                activityReportFilter: () => true,
                mode: () => mode,
                executionFinalized: () => finalized
            },
            actions
        });
        const wrapper = shallowMount(IngConversation, {
            store,
            localVue,
            mocks: {$can: () => canUpdate},
            propsData: {version: -1, executionId: "ex1", elementId: "el1", conversationId: "c1"},
            stubs: {"ing-comment": true, "ing-toggle": true}
        });
        return {wrapper, actions};
    }

    it("isResolved reflects the conversation status", () => {
        expect(build({conversation: conversationFixture({status: "RESOLVED"})}).wrapper.vm.isResolved).toBe(true);
        expect(build().wrapper.vm.isResolved).toBe(false);
    });

    it("maps conversation type to a color", () => {
        expect(build().wrapper.vm.conversationTypeColor).toBe("lightgray");
        expect(build({conversation: conversationFixture({type: "ACTIVITY_REPORT_COMMENT"})}).wrapper.vm.conversationTypeColor).toBe("#add8e6");
        expect(build({conversation: conversationFixture({type: "DATA_REVIEW_COMMENT"})}).wrapper.vm.conversationTypeColor).toBe("#e6add8");
    });

    it("maps conversation type to display text", () => {
        expect(build().wrapper.vm.conversationTypeText).toBe("Comments");
        expect(build({conversation: conversationFixture({type: "DATA_REVIEW_COMMENT"})}).wrapper.vm.conversationTypeText).toBe("Data Review/Closeout Comments");
    });

    it("displayConversation is true for authoring mode", () => {
        expect(build({mode: "authoring"}).wrapper.vm.displayConversation).toBe(true);
    });

    it("displayConversation filters by allowed types during execution", () => {
        expect(build({mode: "execution", conversation: conversationFixture({type: "COMMENT"})}).wrapper.vm.displayConversation).toBe(true);
        expect(build({mode: "execution", conversation: conversationFixture({type: "OTHER"})}).wrapper.vm.displayConversation).toBe(false);
    });

    it("firstCommentPreview returns the first comment content", () => {
        expect(build().wrapper.vm.firstCommentPreview).toBe("first reply");
    });

    it("canDeleteConversation is true for admins", () => {
        expect(build({canUpdate: true}).wrapper.vm.canDeleteConversation).toBe(true);
    });

    it("canDeleteConversation is true when there are no comments", () => {
        const conversation = conversationFixture({comments: {}});
        expect(build({canUpdate: false, conversation}).wrapper.vm.canDeleteConversation).toBe(true);
    });

    it("conversationType getter returns the type", () => {
        expect(build().wrapper.vm.conversationType).toBe("COMMENT");
    });

    it("conversationType setter dispatches editConversation and closes edit mode", () => {
        const {wrapper, actions} = build();
        wrapper.vm.editType = true;
        wrapper.vm.conversationType = "DATA_REVIEW_COMMENT";
        expect(actions.editConversation.called).toBe(true);
        expect(actions.editConversation.lastCall.args[1].conversation.type).toBe("DATA_REVIEW_COMMENT");
        expect(wrapper.vm.editType).toBe(false);
    });

    it("toggleMode dispatches editConversation with the flipped status", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.toggleMode();
        expect(actions.editConversation.lastCall.args[1].conversation.status).toBe("RESOLVED");
    });

    it("addReplyCallback posts an empty comment", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.addReplyCallback();
        expect(actions.postComment.called).toBe(true);
        expect(actions.postComment.lastCall.args[1].comment).toBe("");
    });

    it("activateEditType enables edit mode unless finalized", () => {
        const enabled = build({finalized: false}).wrapper;
        enabled.vm.activateEditType();
        expect(enabled.vm.editType).toBe(true);

        const finalized = build({finalized: true}).wrapper;
        finalized.vm.activateEditType();
        expect(finalized.vm.editType).toBe(false);
    });
});

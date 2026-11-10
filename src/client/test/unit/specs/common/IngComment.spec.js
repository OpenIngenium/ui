import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngComment from "../../../../src/modules/common/IngComment.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function makeJwt(payload) {
    const b64 = (obj) => window.btoa(JSON.stringify(obj)).replace(/=+$/, "");
    return `${b64({alg: "HS256", typ: "JWT"})}.${b64(payload)}.sig`;
}
function setUsername(username) {
    document.cookie = `access_token=${makeJwt({username})}`;
}
function clearUsername() {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function build(overrides = {}) {
    const opts = {
        userName: "alice",
        expandedComment: "",
        execution: {status: "CLOSED", execution_id: "ex1"},
        executionFinalized: false,
        can: false,
        files: [],
        mode: "",
        ...overrides
    };

    const commentObj = {
        user_name: opts.userName,
        content: "hello",
        time_updated: "2020-01-01T00:00:00Z",
        files: opts.files
    };

    const actions = {
        deleteComment: sinon.spy(),
        editComment: sinon.spy(),
        clearExpandedEdit: sinon.spy(),
        deleteExecutionConversationCommentFile: sinon.spy(),
        deleteProcedureConversationCommentFile: sinon.spy(),
        toggleExecutionFollow: sinon.spy()
    };

    const store = new Vuex.Store({
        getters: {
            comment: () => () => commentObj,
            expandedComment: () => opts.expandedComment,
            execution: () => opts.execution,
            executionFinalized: () => opts.executionFinalized
        },
        actions
    });

    const wrapper = shallowMount(IngComment, {
        localVue,
        store,
        mocks: {$can: sinon.stub().returns(opts.can)},
        propsData: {
            version: 1,
            executionId: "ex1",
            elementId: "e1",
            conversationId: "c1",
            commentId: "cm1",
            mode: opts.mode
        }
    });

    return {wrapper, actions, commentObj};
}

describe("IngComment.vue", () => {
    let wrapper;

    beforeEach(() => setUsername("alice"));

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        clearUsername();
    });

    describe("computed", () => {
        it("elementComment resolves from the comment getter", () => {
            const built = build();
            wrapper = built.wrapper;
            expect(wrapper.vm.elementComment.content).toBe("hello");
        });

        it("canEditComment true only for the author", () => {
            wrapper = build({userName: "alice"}).wrapper;
            expect(wrapper.vm.canEditComment).toBe(true);
            wrapper.destroy();
            wrapper = build({userName: "bob"}).wrapper;
            expect(wrapper.vm.canEditComment).toBe(false);
        });

        it("canModifyComment true for author or admin", () => {
            wrapper = build({userName: "bob", can: true}).wrapper;
            expect(wrapper.vm.canModifyComment).toBe(true);
            wrapper.destroy();
            wrapper = build({userName: "bob", can: false}).wrapper;
            expect(wrapper.vm.canModifyComment).toBe(false);
        });

        it("editModeComputed true when expanded for the author", () => {
            wrapper = build({expandedComment: "cm1", userName: "alice"}).wrapper;
            expect(wrapper.vm.editModeComputed).toBe(true);
        });

        it("editModeComputed falls back to editMode data", () => {
            wrapper = build({expandedComment: "other"}).wrapper;
            expect(wrapper.vm.editModeComputed).toBe(false);
            wrapper.setData({editMode: true});
            expect(wrapper.vm.editModeComputed).toBe(true);
        });

        it("config exposes upload params and event handlers", () => {
            wrapper = build().wrapper;
            const cfg = wrapper.vm.config;
            expect(cfg.imageUploadParams.execution_id).toBe("ex1");
            expect(cfg.fileUploadParams.elem_id).toBe("e1");
            expect(typeof cfg.events["image.beforeUpload"]).toBe("function");
        });
    });

    describe("methods", () => {
        it("convertTime returns a human string", () => {
            wrapper = build().wrapper;
            expect(typeof wrapper.vm.convertTime("2020-01-01T00:00:00Z")).toBe("string");
        });

        it("updateFrolaValue updates content", () => {
            wrapper = build().wrapper;
            wrapper.vm.updateFrolaValue("new content");
            expect(wrapper.vm.content).toBe("new content");
        });

        it("fileConfig builds fileIdLookup from comment files", () => {
            wrapper = build({files: [{url: "/f1", file_id: "id1"}]}).wrapper;
            wrapper.vm.fileConfig();
            expect(Object.values(wrapper.vm.fileIdLookup)).toContain("id1");
        });

        it("activateCommentEditMode enters edit mode when allowed", () => {
            wrapper = build({userName: "alice", executionFinalized: false}).wrapper;
            wrapper.vm.activateCommentEditMode();
            expect(wrapper.vm.editMode).toBe(true);
        });

        it("activateCommentEditMode is a no-op when finalized", () => {
            wrapper = build({executionFinalized: true}).wrapper;
            wrapper.vm.activateCommentEditMode();
            expect(wrapper.vm.editMode).toBe(false);
        });

        it("handleDelete dispatches deleteComment and closes modal", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.setData({showModal: true});
            wrapper.vm.handleDelete();
            expect(built.actions.deleteComment.called).toBe(true);
            expect(wrapper.vm.showModal).toBe(false);
        });

        it("updateExistingComment dispatches editComment and clears expanded edit", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.setData({content: "edited"});
            wrapper.vm.updateExistingComment();
            expect(built.actions.editComment.called).toBe(true);
            expect(built.actions.clearExpandedEdit.called).toBe(true);
            expect(wrapper.vm.editMode).toBe(false);
        });

        it("cancelCallback resets edit mode and clears expanded edit", () => {
            const built = build();
            wrapper = built.wrapper;
            wrapper.setData({editMode: true});
            wrapper.vm.cancelCallback();
            expect(wrapper.vm.editMode).toBe(false);
            expect(built.actions.clearExpandedEdit.called).toBe(true);
        });

        it("close emits a close event", () => {
            wrapper = build().wrapper;
            wrapper.vm.close();
            expect(wrapper.emitted("close")).toBeTruthy();
        });

        it("toggleCommentSection flips showAddComment", () => {
            wrapper = build().wrapper;
            wrapper.vm.toggleCommentSection();
            expect(wrapper.vm.showAddComment).toBe(true);
        });
    });

    describe("upload handlers (safe branches)", () => {
        it("beforeImgUploadHandler/beforeFileUploadHandler reject non-single selections", () => {
            wrapper = build().wrapper;
            expect(wrapper.vm.beforeImgUploadHandler([])).toBe(false);
            expect(wrapper.vm.beforeImgUploadHandler([1, 2])).toBe(false);
            expect(wrapper.vm.beforeFileUploadHandler([])).toBe(false);
        });

        it("afterImgUploadedHandler/afterFileUploadedHandler swallow errors gracefully", () => {
            wrapper = build().wrapper;
            // response present but $refs not available -> caught, returns undefined
            expect(wrapper.vm.afterImgUploadedHandler('{"url":"u","file_id":"f"}')).toBeUndefined();
            expect(wrapper.vm.afterFileUploadedHandler('{"url":"u","file_id":"f"}')).toBeUndefined();
        });

        it("imageRemovedHandler deletes execution file when known", () => {
            const built = build({mode: ""});
            wrapper = built.wrapper;
            wrapper.vm.fileIdLookup = {"http://x/img": "f1"};
            wrapper.vm.imageRemovedHandler({attr: () => "http://x/img"});
            expect(built.actions.deleteExecutionConversationCommentFile.called).toBe(true);
        });

        it("imageRemovedHandler deletes procedure file in authoring mode", () => {
            const built = build({mode: "authoring"});
            wrapper = built.wrapper;
            wrapper.vm.fileIdLookup = {"http://x/img": "f1"};
            wrapper.vm.imageRemovedHandler({attr: () => "http://x/img"});
            expect(built.actions.deleteProcedureConversationCommentFile.called).toBe(true);
        });

        it("fileUnlinkHandler deletes execution file when known", () => {
            const built = build({mode: ""});
            wrapper = built.wrapper;
            wrapper.vm.fileIdLookup = {"http://x/file": "f1"};
            wrapper.vm.fileUnlinkHandler({attributes: {href: {value: "http://x/file"}}});
            expect(built.actions.deleteExecutionConversationCommentFile.called).toBe(true);
        });
    });
});

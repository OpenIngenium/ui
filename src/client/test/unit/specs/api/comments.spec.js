import sinon from "sinon";
import * as commentsApi from "../../../../src/api/comments";
import transport from "../../../../src/api/transport";

describe("api/comments.js", () => {
    let stubs;

    beforeEach(() => {
        stubs = [];
    });

    afterEach(() => {
        stubs.forEach((s) => s.restore());
    });

    function stub(method, behavior) {
        const s = sinon.stub(transport, method);
        behavior(s);
        stubs.push(s);
        return s;
    }

    const content = {editorContent: "hello"};

    it("getComments returns response data", async() => {
        stub("get", (s) => s.resolves({data: [{c: 1}]}));
        expect(await commentsApi.getComments("ex1", "e1")).toEqual([{c: 1}]);
    });

    it("post conversation/comment functions return response data", async() => {
        stub("post", (s) => s.resolves({data: {ok: true}}));
        expect(await commentsApi.postExecutionConversation("ex1", "e1", {})).toEqual({ok: true});
        expect(await commentsApi.postProcedureConversation("p1", 1, "e1", {})).toEqual({ok: true});
        expect(await commentsApi.postExecutionComment("ex1", "e1", "c1", content)).toEqual({ok: true});
        expect(await commentsApi.postProcedureComment("p1", 1, "e1", "c1", content)).toEqual({ok: true});
    });

    it("patch conversation/comment functions return response data", async() => {
        stub("patch", (s) => s.resolves({data: {ok: true}}));
        expect(await commentsApi.editExecutionConversation("ex1", "e1", "c1", {})).toEqual({ok: true});
        expect(await commentsApi.editProcedureConversation("p1", 1, "e1", "c1", {})).toEqual({ok: true});
        expect(await commentsApi.editExecutionComment("ex1", "e1", "c1", "cm1", content)).toEqual({ok: true});
        expect(await commentsApi.editProcedureComment("p1", 1, "e1", "c1", "cm1", content)).toEqual({ok: true});
    });

    it("delete conversation/comment/file functions return response data", async() => {
        stub("delete", (s) => s.resolves({data: {ok: true}}));
        expect(await commentsApi.deleteExecutionConversation("ex1", "e1", "c1")).toEqual({ok: true});
        expect(await commentsApi.deleteProcedureConversation("p1", 1, "e1", "c1")).toEqual({ok: true});
        expect(await commentsApi.deleteExecutionComment("ex1", "e1", "c1", "cm1")).toEqual({ok: true});
        expect(await commentsApi.deleteProcedureComment("p1", 1, "e1", "c1", "cm1")).toEqual({ok: true});
        expect(await commentsApi.deleteExecutionConversationCommentFile("ex1", "e1", "c1", "cm1", "f1")).toEqual({ok: true});
        expect(await commentsApi.deleteProcedureConversationCommentFile("p1", 1, "e1", "c1", "cm1", "f1")).toEqual({ok: true});
        expect(await commentsApi.deleteExecutionElementFile("ex1", "e1", "f1")).toEqual({ok: true});
        expect(await commentsApi.deleteProcedureElementFile("p1", "e1", "f1")).toEqual({ok: true});
    });

    it("deleteExecutionFile returns the whole response", async() => {
        stub("delete", (s) => s.resolves({status: 204}));
        expect(await commentsApi.deleteExecutionFile("ex1", "f1")).toEqual({status: 204});
    });

    it("returns undefined and logs on error", async() => {
        stub("get", (s) => s.rejects(new Error("boom")));
        expect(await commentsApi.getComments("ex1", "e1")).toBeUndefined();
    });
});

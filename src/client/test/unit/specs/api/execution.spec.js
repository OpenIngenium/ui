import sinon from "sinon";
import * as executionApi from "../../../../src/api/execution";
import transport from "../../../../src/api/transport";

// NOTE: Functions relying on newAbortSignal() (AbortController) are intentionally
// not exercised here to avoid environment issues on the pinned Node runtime.

describe("api/execution.js", () => {
    let stubs;
    let success;
    let failure;

    beforeEach(() => {
        stubs = [];
        success = sinon.spy();
        failure = sinon.spy();
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

    describe("return-style functions", () => {
        it("fetchExecutions returns executions + total and applies filters", async() => {
            const get = stub("get", (s) => s.resolves({data: [{e: 1}], headers: {"x-total-count": "4"}}));
            const result = await executionApi.fetchExecutions({
                venueId: "v1",
                filters: {someFilter: {value: "x"}}
            });
            expect(result).toEqual({executions: [{e: 1}], total: 4});
            expect(get.firstCall.args[1].params.some_filter).toBe("x");
        });

        it("fetchTimeReferences returns data", async() => {
            stub("get", (s) => s.resolves({data: [{ref: 1}]}));
            expect(await executionApi.fetchTimeReferences("ex1")).toEqual([{ref: 1}]);
        });

        it("getExecution returns data", async() => {
            stub("get", (s) => s.resolves({data: {execution_id: "ex1"}}));
            expect(await executionApi.getExecution("ex1")).toEqual({execution_id: "ex1"});
        });

        it("deleteSwitchWaitFlag returns data", async() => {
            stub("delete", (s) => s.resolves({data: {ok: true}}));
            expect(await executionApi.deleteSwitchWaitFlag("ex1")).toEqual({ok: true});
        });

        it("patchExecution returns response", async() => {
            stub("patch", (s) => s.resolves({status: 200}));
            expect(await executionApi.patchExecution("ex1", {a: 1})).toEqual({status: 200});
        });

        it("getExecutionElement returns data / {error}", async() => {
            stub("get", (s) => s.resolves({data: {elem_id: "e1"}}));
            expect(await executionApi.getExecutionElement("ex1", "e1")).toEqual({elem_id: "e1"});
            stubs.pop().restore();
            stub("get", (s) => s.rejects(new Error("boom")));
            expect((await executionApi.getExecutionElement("ex1", "e1")).error).toBeDefined();
        });

        it("getExecutionElements returns {elements} / {error}", async() => {
            stub("get", (s) => s.resolves({data: [{elem_id: "e1"}]}));
            expect(await executionApi.getExecutionElements("ex1")).toEqual({elements: [{elem_id: "e1"}]});
            stubs.pop().restore();
            stub("get", (s) => s.rejects(new Error("boom")));
            expect((await executionApi.getExecutionElements("ex1")).error).toBeDefined();
        });

        it("importExecution returns {response,error} and invokes success", async() => {
            stub("post", (s) => s.resolves({data: {imported: true}}));
            const result = await executionApi.importExecution({}, success);
            expect(success.calledWith({imported: true})).toBe(true);
            expect(result.error).toBeNull();
        });

        it("postImportProcedure / postCallProcedure / postSuspendResume return wrapped data", async() => {
            stub("post", (s) => s.resolves({data: {ok: true}}));
            expect(await executionApi.postImportProcedure("ex1", "e1")).toEqual({elements: {ok: true}});
            expect(await executionApi.postCallProcedure("ex1", "e1")).toEqual({execution: {ok: true}});
            expect(await executionApi.postSuspendResume("ex1", "ex2")).toEqual({execution: {ok: true}});
        });

        it("postImportProcedure returns {error} on failure", async() => {
            stub("post", (s) => s.rejects({message: "boom"}));
            expect((await executionApi.postImportProcedure("ex1", "e1")).error).toBeDefined();
        });

        it("exportExecutionInGzip returns the raw response", async() => {
            stub("get", (s) => s.resolves({data: new ArrayBuffer(8)}));
            expect(await executionApi.exportExecutionInGzip("ex1", {})).toBeDefined();
        });
    });

    describe("callback-style success paths", () => {
        it("searchExecution calls success with data", async() => {
            stub("post", (s) => s.resolves({data: {matches: []}}));
            await executionApi.searchExecution("ex1", {}, success, failure);
            expect(success.calledWith({matches: []})).toBe(true);
        });

        it("move/copy element call success with numbers + ids", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem_ids: ["a"], elements: [{}]}}));
            await executionApi.moveExecutionElement("ex1", "e1", "e0", 0, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], elem_ids: ["a"]});
            success.resetHistory();
            await executionApi.copyExecutionElement("ex1", "e1", "e0", 0, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], elements: [{}], elem_ids: ["a"]});
        });

        it("multiCopy/multiMove call success", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem_ids: ["a"], elements: [{}]}}));
            await executionApi.multiCopyExecutionElement({executionId: "ex1", elementIds: ["e1"], insertAfterId: "e0", level: 0}, success, failure);
            await executionApi.multiMoveExecutionElement({executionId: "ex1", elementIds: ["e1"], insertAfterId: "e0", level: 0}, success, failure);
            expect(success.callCount).toBe(2);
        });

        it("postExecutionElement calls success with element", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem: {elem_id: "e1"}, elem_ids: ["e1"]}}));
            await executionApi.postExecutionElement("ex1", "sections", "e0", 0, {script_id: "s1"}, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], element: {elem_id: "e1"}, elem_ids: ["e1"]});
        });

        it("justify/approve/discard (single + bulk) call success", async() => {
            stub("post", (s) => s.resolves({status: 200}));
            await executionApi.justifyExecutionElement("ex1", "e1", {}, success, failure);
            await executionApi.bulkJustifyExecutionElements("ex1", {}, success, failure);
            await executionApi.approveExecutionElement("ex1", "e1", {}, success, failure);
            await executionApi.bulkApproveExecutionElements("ex1", {}, success, failure);
            await executionApi.discardExecutionElement("ex1", "e1", success, failure);
            await executionApi.bulkDiscardExecutionElements("ex1", {}, success, failure);
            expect(success.callCount).toBe(6);
        });

        it("clearBreakPoints / prepareReExecuteElement / patchViStatusStep call success", async() => {
            stub("delete", (s) => s.resolves({data: {ok: true}}));
            stub("post", (s) => s.resolves({status: 200}));
            stub("patch", (s) => s.resolves({status: 200}));
            await executionApi.clearBreakPoints("ex1", success, failure);
            await executionApi.prepareReExecuteElement("ex1", "e1", success, failure);
            await executionApi.patchViStatusStep("ex1", "e1", {}, success, failure);
            expect(success.callCount).toBe(3);
        });
    });

    describe("callback-style failure paths", () => {
        it("callbacks receive parsed errors on failure", async() => {
            stub("post", (s) => s.rejects({message: "nope"}));
            await executionApi.searchExecution("ex1", {}, success, failure);
            await executionApi.moveExecutionElement("ex1", "e1", "e0", 0, success, failure);
            await executionApi.justifyExecutionElement("ex1", "e1", {}, success, failure);
            await executionApi.haltExecution("ex1", failure);
            expect(failure.callCount).toBe(4);
            expect(success.called).toBe(false);
        });
    });
});

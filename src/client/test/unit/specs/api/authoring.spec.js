import sinon from "sinon";
import * as authoringApi from "../../../../src/api/authoring";
import transport from "../../../../src/api/transport";

describe("api/authoring.js", () => {
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
        it("getProcedure returns response data / undefined on error", async() => {
            stub("get", (s) => s.resolves({data: {procedure_id: "p1"}}));
            expect(await authoringApi.getProcedure("p1")).toEqual({procedure_id: "p1"});
            stubs.pop().restore();
            stub("get", (s) => s.rejects(new Error("x")));
            expect(await authoringApi.getProcedure("p1")).toBeUndefined();
        });

        it("getProcedureVersions returns versions + total", async() => {
            stub("get", (s) => s.resolves({data: [{v: 0}], headers: {"x-total-count": "2"}}));
            expect(await authoringApi.getProcedureVersions("p1", 10, 0)).toEqual({versions: [{v: 0}], total: 2});
        });

        it("createProcedure returns data / null on error", async() => {
            stub("post", (s) => s.resolves({data: {procedure_id: "new"}}));
            expect(await authoringApi.createProcedure("t", "i", "d")).toEqual({procedure_id: "new"});
            stubs.pop().restore();
            stub("post", (s) => s.rejects(new Error("x")));
            expect(await authoringApi.createProcedure("t", "i", "d")).toBeNull();
        });

        it("updateProcedure builds a partial payload and returns response", async() => {
            const patch = stub("patch", (s) => s.resolves({status: 200}));
            const result = await authoringApi.updateProcedure("p1", "title", null, "desc");
            expect(result).toEqual({status: 200});
            expect(patch.firstCall.args[1]).toEqual({title: "title", description: "desc"});
        });

        it("updateProcedure returns null on error", async() => {
            stub("patch", (s) => s.rejects(new Error("x")));
            expect(await authoringApi.updateProcedure("p1", "title")).toBeNull();
        });

        it("deleteProcedure returns response / null on error", async() => {
            stub("delete", (s) => s.resolves({status: 204}));
            expect(await authoringApi.deleteProcedure("p1")).toEqual({status: 204});
            stubs.pop().restore();
            stub("delete", (s) => s.rejects(new Error("x")));
            expect(await authoringApi.deleteProcedure("p1")).toBeNull();
        });

        it("getProcedureVersion returns data", async() => {
            stub("get", (s) => s.resolves({data: {version: 1}}));
            expect(await authoringApi.getProcedureVersion("p1", 1)).toEqual({version: 1});
        });

        it("fetchTimeReferences returns data", async() => {
            stub("get", (s) => s.resolves({data: [{ref: 1}]}));
            expect(await authoringApi.fetchTimeReferences("p1", 1)).toEqual([{ref: 1}]);
        });

        it("getProcedureElements returns elements / error", async() => {
            stub("get", (s) => s.resolves({data: [{elem_id: "e1"}]}));
            expect(await authoringApi.getProcedureElements("p1", 1)).toEqual({elements: [{elem_id: "e1"}]});
            stubs.pop().restore();
            stub("get", (s) => s.rejects(new Error("boom")));
            const result = await authoringApi.getProcedureElements("p1", 1);
            expect(result.error).toBeDefined();
        });

        it("importProcedureVersion returns {response,error} and invokes success callback", async() => {
            stub("post", (s) => s.resolves({data: {imported: true}}));
            const result = await authoringApi.importProcedureVersion("p1", {}, success);
            expect(success.calledWith({imported: true})).toBe(true);
            expect(result.error).toBeNull();
        });

        it("importProcedureVersion returns error object when no failure callback", async() => {
            stub("post", (s) => s.rejects(new Error("boom")));
            const result = await authoringApi.importProcedureVersion("p1", {});
            expect(result.error).toBeDefined();
        });

        it("importProcedureVersions invokes success callback", async() => {
            stub("post", (s) => s.resolves({data: {imported: true}}));
            const result = await authoringApi.importProcedureVersions({}, success);
            expect(success.calledWith({imported: true})).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe("callback-style success paths", () => {
        it("lockProcedure / unlockProcedure call success with response", async() => {
            stub("patch", (s) => s.resolves({status: 200}));
            await authoringApi.lockProcedure("p1", "me", success, failure);
            await authoringApi.unlockProcedure("p1", success, failure);
            expect(success.callCount).toBe(2);
            expect(failure.called).toBe(false);
        });

        it("searchProcedure / replaceProcedure call success with data", async() => {
            stub("post", (s) => s.resolves({data: {matches: []}}));
            await authoringApi.searchProcedure("p1", 1, {}, success, failure);
            await authoringApi.replaceProcedure("p1", {}, success, failure);
            expect(success.callCount).toBe(2);
            expect(success.alwaysCalledWith({matches: []})).toBe(true);
        });

        it("patchProcedureVersion / postProcedureVersionStatus call success", async() => {
            stub("patch", (s) => s.resolves({status: 200}));
            stub("post", (s) => s.resolves({status: 200}));
            await authoringApi.patchProcedureVersion("p1", 1, {}, success, failure);
            await authoringApi.postProcedureVersionStatus("p1", 1, {}, success, failure);
            expect(success.callCount).toBe(2);
        });

        it("deleteProcedureVersion calls success", async() => {
            stub("delete", (s) => s.resolves({status: 204}));
            await authoringApi.deleteProcedureVersion("p1", 1, success, failure);
            expect(success.called).toBe(true);
        });

        it("move/copy element call success with numbers + ids", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem_ids: ["a"], elements: [{}]}}));
            await authoringApi.moveProcedureElement("p1", "e1", "e0", 0, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], elem_ids: ["a"]});
            success.resetHistory();
            await authoringApi.copyProcedureElement("p1", "e1", "e0", 0, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], elements: [{}], elem_ids: ["a"]});
        });

        it("multiCopy/multiMove element call success", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem_ids: ["a"], elements: [{}]}}));
            await authoringApi.multiCopyProcedureElement({procedureId: "p1", elementIds: ["e1"], insertAfterId: "e0", level: 0}, success, failure);
            await authoringApi.multiMoveProcedureElement({procedureId: "p1", elementIds: ["e1"], insertAfterId: "e0", level: 0}, success, failure);
            expect(success.callCount).toBe(2);
        });

        it("postProcedureElement calls success with element", async() => {
            stub("post", (s) => s.resolves({data: {numbers: [1], elem: {elem_id: "e1"}, elem_ids: ["e1"]}}));
            await authoringApi.postProcedureElement("p1", "sections", "e0", 0, {script_id: "s1"}, success, failure);
            expect(success.firstCall.args[0]).toEqual({numbers: [1], element: {elem_id: "e1"}, elem_ids: ["e1"]});
        });

        it("postReplaceProcedureElement / patchViStatusStep / validate* / revert call success", async() => {
            stub("post", (s) => s.resolves({status: 200}));
            stub("patch", (s) => s.resolves({status: 200}));
            await authoringApi.postReplaceProcedureElement("p1", "e1", {}, success, failure);
            await authoringApi.patchViStatusStep("p1", "e1", {}, success, failure);
            await authoringApi.validateProcedureVersion("p1", 1, {}, success, failure);
            await authoringApi.validateProcedureElement("p1", {}, "e1", success, failure);
            await authoringApi.revertProcedure("p1", "src", 1, success, failure);
            expect(success.callCount).toBe(5);
            expect(failure.called).toBe(false);
        });
    });

    describe("callback-style failure paths", () => {
        it("callbacks receive parsed errors on failure", async() => {
            stub("patch", (s) => s.rejects({message: "nope"}));
            stub("post", (s) => s.rejects({message: "nope"}));
            stub("delete", (s) => s.rejects({message: "nope"}));
            await authoringApi.lockProcedure("p1", "me", success, failure);
            await authoringApi.searchProcedure("p1", 1, {}, success, failure);
            await authoringApi.deleteProcedureVersion("p1", 1, success, failure);
            await authoringApi.moveProcedureElement("p1", "e1", "e0", 0, success, failure);
            expect(failure.callCount).toBe(4);
            expect(success.called).toBe(false);
        });
    });
});

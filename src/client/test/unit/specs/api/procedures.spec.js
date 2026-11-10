import sinon from "sinon";
import proceduresApi from "../../../../src/api/procedures";
import transport from "../../../../src/api/transport";

describe("api/procedures.js", () => {
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

    it("getProcedures returns procedures + total and applies filters/sort", async() => {
        const get = stub("get", (s) => s.resolves({data: [{p: 1}], headers: {"x-total-count": "3"}}));
        const result = await proceduresApi.getProcedures({
            limit: 10,
            offset: 0,
            sort: "asc",
            sortBy: "title",
            filters: {someFilter: {value: "v"}}
        });
        expect(result).toEqual({procedures: [{p: 1}], total: 3});
        const options = get.firstCall.args[1].params;
        expect(options.sort).toBe("ASC");
        expect(options.sort_by).toBe("TITLE");
        expect(options.some_filter).toBe("v");
    });

    it("getProcedureVersions returns versions + total", async() => {
        stub("get", (s) => s.resolves({data: [{v: 0}], headers: {"x-total-count": "2"}}));
        expect(await proceduresApi.getProcedureVersions("p1")).toEqual({versions: [{v: 0}], total: 2});
    });

    it("getProcedure returns data / {error} on failure", async() => {
        stub("get", (s) => s.resolves({data: {procedure_id: "p1"}}));
        expect(await proceduresApi.getProcedure("p1")).toEqual({procedure_id: "p1"});
        stubs.pop().restore();
        stub("get", (s) => s.rejects(new Error("boom")));
        const result = await proceduresApi.getProcedure("p1");
        expect(result.error).toBeDefined();
    });

    it("getProcedureVersion / getProcedureOutline return {error} on failure", async() => {
        stub("get", (s) => s.rejects(new Error("boom")));
        expect((await proceduresApi.getProcedureVersion("p1", 1)).error).toBeDefined();
        expect((await proceduresApi.getProcedureOutline("p1", 1)).error).toBeDefined();
    });

    it("get element/structure/version/outline return response data on success", async() => {
        stub("get", (s) => s.resolves({data: {ok: true}}));
        expect(await proceduresApi.getProcedureElement("p1", "e1")).toEqual({ok: true});
        expect(await proceduresApi.getProcedureElementStructure("p1", "e1")).toEqual({ok: true});
        expect(await proceduresApi.getProcedureVersion("p1", 1)).toEqual({ok: true});
        expect(await proceduresApi.getProcedureOutline("p1", 1)).toEqual({ok: true});
    });

    it("tag create/edit/delete functions return response data", async() => {
        stub("post", (s) => s.resolves({data: {tag_id: "t1"}}));
        stub("patch", (s) => s.resolves({data: {tag_id: "t1", edited: true}}));
        stub("delete", (s) => s.resolves({data: {deleted: true}}));
        expect(await proceduresApi.createProcedureTag("p1", {})).toEqual({tag_id: "t1"});
        expect(await proceduresApi.createProcedureElementTag("p1", "e1", "t1")).toEqual({tag_id: "t1"});
        expect(await proceduresApi.editProcedureTag("p1", "t1", {})).toEqual({tag_id: "t1", edited: true});
        expect(await proceduresApi.deleteProcedureTag("p1", "t1")).toEqual({deleted: true});
        expect(await proceduresApi.deleteProcedureElementTag("p1", "e1", "t1")).toEqual({deleted: true});
    });

    it("export functions return the raw response", async() => {
        stub("get", (s) => s.resolves({data: new ArrayBuffer(8)}));
        expect(await proceduresApi.exportProcedureVersionInGzip("p1", 1)).toBeDefined();
        expect(await proceduresApi.exportProcedureInGzip("p1", {})).toBeDefined();
    });

    it("export functions return null on failure", async() => {
        stub("get", (s) => s.rejects(new Error("boom")));
        expect(await proceduresApi.exportProcedureVersionInGzip("p1", 1)).toBeNull();
    });

    it("label functions", async() => {
        stub("post", (s) => s.resolves({data: {label_id: "l1"}}));
        stub("get", (s) => s.resolves({data: [{label_id: "l1"}]}));
        stub("delete", (s) => s.resolves({data: {deleted: true}}));
        expect(await proceduresApi.createLabel({})).toEqual({label_id: "l1"});
        expect(await proceduresApi.getLabels({})).toEqual({data: [{label_id: "l1"}]});
        expect(await proceduresApi.deleteLabel("l1")).toEqual({deleted: true});
    });
});

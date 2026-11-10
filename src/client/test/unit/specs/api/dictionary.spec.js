import sinon from "sinon";
import dictionaryApi from "../../../../src/api/dictionary";
import transport from "../../../../src/api/transport";

function listResponse() {
    return {data: [{x: 1}], headers: {"x-total-count": "5"}};
}

describe("api/dictionary.js", () => {
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

    describe("list getters (transport.get)", () => {
        it("getFlightDictionaries returns data + total", async() => {
            const get = stub("get", (s) => s.resolves(listResponse()));
            const result = await dictionaryApi.getFlightDictionaries({dictionaryVersion: "v1"});
            expect(result).toEqual({data: [{x: 1}], total: 5});
            expect(get.called).toBe(true);
        });

        it("getSseDictionaries returns data + total", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            const result = await dictionaryApi.getSseDictionaries({dictionaryVersion: "v1"});
            expect(result).toEqual({data: [{x: 1}], total: 5});
        });

        it("getFlightCmds returns cmds + total", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            const result = await dictionaryApi.getFlightCmds({dictionaryVersion: "v1"});
            expect(result).toEqual({cmds: [{x: 1}], total: 5});
        });

        it("getFlightEvrs/Ehas/1553 resolve without throwing", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getFlightEvrs({dictionaryVersion: "v1"})).toBeDefined();
            expect(await dictionaryApi.getFlightEhas({dictionaryVersion: "v1"})).toBeDefined();
            expect(await dictionaryApi.getFlight1553({dictionaryVersion: "v1"})).toBeDefined();
        });

        it("getSseCmds/Evrs/Ehas/1553 resolve without throwing", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getSseCmds({dictionaryVersion: "v1"})).toBeDefined();
            expect(await dictionaryApi.getSseEvrs({dictionaryVersion: "v1"})).toBeDefined();
            expect(await dictionaryApi.getSseEhas({dictionaryVersion: "v1"})).toBeDefined();
            expect(await dictionaryApi.getSse1553({dictionaryVersion: "v1"})).toBeDefined();
        });

        it("getSseCmdDetails returns cmdSseDetails", async() => {
            stub("get", (s) => s.resolves({data: {stem: "S"}, headers: {}}));
            const result = await dictionaryApi.getSseCmdDetails({dictionaryVersion: "v1", cmdStem: "S"});
            expect(result).toEqual({cmdSseDetails: {stem: "S"}});
        });

        it("getVIs returns data + total", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getVIs({})).toEqual({data: [{x: 1}], total: 5});
        });

        it("getVI returns response data", async() => {
            stub("get", (s) => s.resolves({data: {vi_id: "v1"}}));
            expect(await dictionaryApi.getVI("v1")).toEqual({vi_id: "v1"});
        });

        it("getCustomScripts returns data + total", async() => {
            stub("get", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getCustomScripts({})).toEqual({data: [{x: 1}], total: 5});
        });

        it("getCustomScript returns response data", async() => {
            stub("get", (s) => s.resolves({data: {script_id: "s1"}}));
            expect(await dictionaryApi.getCustomScript("s1")).toEqual({script_id: "s1"});
        });

        it("getStepPaletteBuiltIn/Custom return response data", async() => {
            stub("get", (s) => s.resolves({data: [{p: 1}]}));
            expect(await dictionaryApi.getStepPaletteBuiltIn()).toEqual([{p: 1}]);
            expect(await dictionaryApi.getStepPaletteCustom()).toEqual([{p: 1}]);
        });
    });

    describe("bulk getters (transport.post)", () => {
        it("getVIsBulk returns data + total", async() => {
            const post = stub("post", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getVIsBulk(["v1"])).toEqual({data: [{x: 1}], total: 5});
            expect(post.calledWith(sinon.match.any, ["v1"])).toBe(true);
        });

        it("getCustomScriptsBulk returns data + total", async() => {
            stub("post", (s) => s.resolves(listResponse()));
            expect(await dictionaryApi.getCustomScriptsBulk(["s1"])).toEqual({data: [{x: 1}], total: 5});
        });
    });

    describe("patch + delete", () => {
        it("patchFlightDictionary returns response data", async() => {
            stub("patch", (s) => s.resolves({data: {ok: true}}));
            expect(await dictionaryApi.patchFlightDictionary("v1", "state", "desc", null)).toEqual({ok: true});
        });

        it("patchSseDictionary returns response data", async() => {
            stub("patch", (s) => s.resolves({data: {ok: true}}));
            expect(await dictionaryApi.patchSseDictionary("v1", "state", "desc", null)).toEqual({ok: true});
        });

        it("patchCustomScripts resolves", async() => {
            stub("patch", (s) => s.resolves({data: {ok: true}}));
            expect(await dictionaryApi.patchCustomScripts("name", "ACTIVE")).toBeDefined();
        });

        it("deleteFlightDictionary/deleteSseDictionary return the response", async() => {
            stub("delete", (s) => s.resolves({status: 204}));
            expect(await dictionaryApi.deleteFlightDictionary("v1")).toEqual({status: 204});
            expect(await dictionaryApi.deleteSseDictionary("v1")).toEqual({status: 204});
        });

        it("deleteCustomScript returns the response", async() => {
            stub("delete", (s) => s.resolves({status: 204}));
            expect(await dictionaryApi.deleteCustomScript("s1")).toEqual({status: 204});
        });
    });

    describe("error handling", () => {
        it("getCustomScripts returns empty result on failure", async() => {
            stub("get", (s) => s.rejects(new Error("boom")));
            expect(await dictionaryApi.getCustomScripts({})).toEqual({data: [], total: 0});
        });

        it("getVI returns null on failure", async() => {
            stub("get", (s) => s.rejects(new Error("boom")));
            expect(await dictionaryApi.getVI("v1")).toBeNull();
        });

        it("getFlightDictionaries returns undefined on failure", async() => {
            stub("get", (s) => s.rejects(new Error("boom")));
            expect(await dictionaryApi.getFlightDictionaries({})).toBeUndefined();
        });

        it("deleteCustomScript rethrows on failure", async() => {
            stub("delete", (s) => s.rejects(new Error("boom")));
            let threw = false;
            try {
                await dictionaryApi.deleteCustomScript("s1");
            } catch (e) {
                threw = true;
            }
            expect(threw).toBe(true);
        });
    });
});

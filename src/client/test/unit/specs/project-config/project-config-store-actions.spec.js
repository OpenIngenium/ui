import sinon from "sinon";
import projectConfigStore from "../../../../src/modules/project-config/project-config-store";
import dictionaryApi from "../../../../src/api/dictionary";

const actions = projectConfigStore.actions;

describe("project-config-store actions", () => {
    let stubs;
    let commits;
    let dispatches;
    let commit;
    let dispatch;

    beforeEach(() => {
        stubs = [];
        commits = [];
        dispatches = [];
        commit = (type, payload) => commits.push({type, payload});
        dispatch = (type, payload) => dispatches.push({type, payload});
    });

    afterEach(() => {
        stubs.forEach((s) => s.restore());
    });

    function stub(name, result) {
        const s = sinon.stub(dictionaryApi, name).resolves(result);
        stubs.push(s);
        return s;
    }

    it("fetchFlightDicts/fetchSseDicts commit receiveDictionaries", async() => {
        stub("getFlightDictionaries", {data: [{d: 1}], total: 1});
        stub("getSseDictionaries", {data: [{d: 2}], total: 1});
        await actions.fetchFlightDicts({commit}, {});
        await actions.fetchSseDicts({commit}, {});
        const receives = commits.filter((c) => c.type === "receiveDictionaries");
        expect(receives.length).toBe(2);
        expect(receives[0].payload.type).toBe("flight");
    });

    it("fetchVersion commits receiveVersions for each type", async() => {
        stub("getFlightEvrs", {evrs: [{}], total: 1});
        stub("getFlightEhas", {ehas: [{}], total: 1});
        stub("getFlightCmds", {cmds: [{}], total: 1});
        stub("getFlight1553", {mil1553: [{}], total: 1});
        for (const type of ["evrs", "ehas", "cmds", "mil1553"]) {
            await actions.fetchVersion({commit}, {dict_type: "flight", version: "v1", type, options: {}});
        }
        expect(commits.filter((c) => c.type === "receiveVersions").length).toBe(4);
    });

    it("fetchVersion supports sse dict types", async() => {
        stub("getSseEvrs", {evrs: [{}], total: 1});
        await actions.fetchVersion({commit}, {dict_type: "sse", version: "v1", type: "evrs", options: {}});
        expect(commits.find((c) => c.type === "receiveVersions").payload.dict_type).toBe("sse");
    });

    it("fetchDictItem commits receiveDictItem for each type", async() => {
        stub("getFlightEvrs", {evrs: {evr_name: "E"}});
        stub("getFlightEhas", {ehas: {channel_name: "C"}});
        stub("getFlightCmds", {cmds: {command_stem: "CMD"}});
        stub("getFlight1553", {mil1553: {mil1553_name: "M"}});
        for (const type of ["evrs", "ehas", "cmds", "mil1553"]) {
            await actions.fetchDictItem({commit}, {dict_type: "flight", version: "v1", type, options: {}, id: "x"});
        }
        expect(commits.filter((c) => c.type === "receiveDictItem").length).toBe(4);
    });

    it("updateFlightDict returns true and commits upload results", async() => {
        stub("patchFlightDictionary", {upload_results: {ok: 1}});
        const result = await actions.updateFlightDict({commit, dispatch}, {version: "v1"});
        expect(result).toBe(true);
        expect(commits.find((c) => c.type === "receiveUploadResults")).toBeDefined();
    });

    it("updateFlightDict returns true for dictionary_info without upload results", async() => {
        stub("patchFlightDictionary", {dictionary_info: {id: 1}});
        expect(await actions.updateFlightDict({commit, dispatch}, {version: "v1"})).toBe(true);
    });

    it("updateFlightDict returns false when response is empty", async() => {
        stub("patchFlightDictionary", null);
        expect(await actions.updateFlightDict({commit, dispatch}, {version: "v1"})).toBe(false);
    });

    it("updateSseDict returns true and commits upload results", async() => {
        stub("patchSseDictionary", {upload_results: {ok: 1}});
        expect(await actions.updateSseDict({commit, dispatch}, {version: "v1"})).toBe(true);
    });

    it("clear*UploadResults commit empty results", async() => {
        await actions.clearFlightUploadResults({commit});
        await actions.clearSseUploadResults({commit});
        await actions.clearVisUploadResults({commit});
        await actions.clearCustomScriptsUploadResults({commit});
        expect(commits.filter((c) => c.type === "receiveUploadResults").length).toBe(4);
    });

    it("delete dict actions call the api and refetch", async() => {
        stub("deleteFlightDictionary", {});
        stub("deleteSseDictionary", {});
        await actions.deleteFlightDict({dispatch}, {version: "v1"});
        await actions.deleteSseDict({dispatch}, {version: "v1"});
        expect(dispatches.map((d) => d.type)).toEqual(["fetchFlightDicts", "fetchSseDicts"]);
    });

    it("fetchVIs commits receiveVIs", async() => {
        stub("getVIs", {data: [{vi_id: "v1"}], total: 1});
        await actions.fetchVIs({commit}, {});
        expect(commits.find((c) => c.type === "receiveVIs").payload.total).toBe(1);
    });

    it("fetchCustomScripts commits receiveCustomScripts", async() => {
        stub("getCustomScripts", {data: [{script_id: "s1"}], total: 1});
        await actions.fetchCustomScripts({commit}, {});
        expect(commits.find((c) => c.type === "receiveCustomScripts").payload.total).toBe(1);
    });

    it("updateCustomScriptsStatus and deleteCustomScript call the api", async() => {
        stub("patchCustomScripts", {});
        const del = stub("deleteCustomScript", {status: 204});
        await actions.updateCustomScriptsStatus({dispatch}, {name: "n", status: "ACTIVE"});
        const result = await actions.deleteCustomScript({dispatch}, {script_id: "s1"});
        expect(del.called).toBe(true);
        expect(result).toEqual({status: 204});
    });
});

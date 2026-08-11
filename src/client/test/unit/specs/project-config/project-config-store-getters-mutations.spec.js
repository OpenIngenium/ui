import Vue from "vue";
import Vuex from "vuex";
import projectConfigStore from "../../../../src/modules/project-config/project-config-store";

Vue.use(Vuex);

function buildState() {
    return {
        flight: {
            total_count: 5,
            v1: {
                cmds: {total_count: 1, C1: {command_stem: "C1"}},
                evrs: {},
                ehas: {},
                mil1553: {},
                sse: ["a", "b"]
            }
        },
        flightIndex: [{id: 1}],
        flightParsers: [{p: 1}],
        flightUploadResults: {ok: true},

        sse: {total_count: 3, v2: {evrs: {E1: {}}}},
        sseIndex: [],
        sseParsers: [],
        sseUploadResults: {},

        vis: {vi1: {vi_id: "vi1"}},
        visParsers: [],
        visCount: 2,
        visUploadResults: {u: 1},

        customScripts: {s1: {script_id: "s1", script_path: "p/1"}},
        customScriptsCount: 1,
        customScriptsParsers: [],
        customScriptsUploadResults: {c: 1},
        totalCount: 0
    };
}

describe("project-config-store getters", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({state: buildState(), getters: projectConfigStore.getters});
    });

    it("flight getters", () => {
        const g = store.getters;
        expect(g.flight.total_count).toBe(5);
        expect(g.flightTotalCount).toBe(5);
        expect(g.flightParsers).toEqual([{p: 1}]);
        expect(g.flightIndex).toEqual([{id: 1}]);
        expect(g.flightUploadResults).toEqual({ok: true});
        expect(g.flightVersions("v1", "sse")).toEqual(["a", "b"]);
        expect(g.flightVersions("missing", "sse")).toEqual([]);
        expect(g.flightVersion("v1").cmds.C1).toEqual({command_stem: "C1"});
    });

    it("sse getters", () => {
        const g = store.getters;
        expect(g.sse.total_count).toBe(3);
        expect(g.sseTotalCount).toBe(3);
        expect(g.sseParsers).toEqual([]);
        expect(g.sseIndex).toEqual([]);
        expect(g.sseUploadResults).toEqual({});
        expect(g.sseVersions("v2", "evrs")).toEqual({E1: {}});
        expect(g.sseVersion("v2").evrs).toEqual({E1: {}});
    });

    it("vis + custom script getters", () => {
        const g = store.getters;
        expect(g.vis).toEqual({vi1: {vi_id: "vi1"}});
        expect(g.visCount).toBe(2);
        expect(g.visUploadResults).toEqual({u: 1});
        expect(g.customScripts).toEqual({s1: {script_id: "s1", script_path: "p/1"}});
        expect(g.customScriptsCount).toBe(1);
        expect(g.customScriptsUploadResults).toEqual({c: 1});
    });

    it("details returns nested item or empty object", () => {
        expect(store.getters.details({dict_type: "flight", version: "v1", type: "cmds", id: "C1"}))
            .toEqual({command_stem: "C1"});
        expect(store.getters.details({dict_type: "flight", version: "v1", type: "missing", id: "x"}))
            .toEqual({});
    });

    it("customScriptDetails returns script or empty object", () => {
        expect(store.getters.customScriptDetails({scriptId: "s1"}).script_id).toBe("s1");
        expect(store.getters.customScriptDetails({scriptId: "nope"})).toEqual({});
    });

    it("customScriptIdByPath resolves an id from a path", () => {
        expect(store.getters.customScriptIdByPath({scriptPath: "p/1"})).toBe("s1");
        expect(store.getters.customScriptIdByPath({scriptPath: "nope"})).toBe("");
    });

    it("totalCount returns nested total or 0", () => {
        expect(store.getters.totalCount({dict_type: "flight", version: "v1", type: "cmds"})).toBe(1);
        expect(store.getters.totalCount({dict_type: "nope", version: "v", type: "t"})).toBe(0);
    });
});

describe("project-config-store mutations", () => {
    const m = projectConfigStore.mutations;
    let state;

    beforeEach(() => {
        state = buildState();
    });

    it("receiveDictionaries indexes dictionaries and sets total", () => {
        m.receiveDictionaries(state, {
            dictionaries: [{dictionary_type: "flight", dictionary_version: "v9"}],
            total: 2
        });
        expect(state.flight.total_count).toBe(2);
        expect(state.flightIndex.length).toBe(1);
        expect(state.flight.v9.cmds).toEqual({});
        expect(state.flight.v9.evrs).toEqual({});
    });

    it("receiveDictionaries accepts a single (non-array) dictionary", () => {
        m.receiveDictionaries(state, {
            dictionaries: {dictionary_type: "sse", dictionary_version: "v5"},
            total: 1
        });
        expect(state.sse.v5).toBeDefined();
        expect(state.sseIndex.length).toBe(1);
    });

    it("receiveVersions populates typed entries", () => {
        m.receiveVersions(state, {
            dict_type: "flight",
            version: "v1",
            type: "cmds",
            versions: [{command_stem: "CX"}],
            total: 1
        });
        expect(state.flight.v1.cmds.total_count).toBe(1);
        expect(state.flight.v1.cmds.CX).toEqual({command_stem: "CX"});
    });

    it("receiveDictItem adds an item by its type key", () => {
        m.receiveDictItem(state, {
            dict_type: "flight",
            version: "v1",
            type: "cmds",
            item: {command_stem: "CY"}
        });
        expect(state.flight.v1.cmds.CY).toEqual({command_stem: "CY"});

        m.receiveDictItem(state, {
            dict_type: "flight",
            version: "v1",
            type: "evrs",
            item: {evr_name: "EV"}
        });
        expect(state.flight.v1.evrs.EV).toEqual({evr_name: "EV"});
    });

    it("receiveParsers sets the typed parser list", () => {
        m.receiveParsers(state, {dict_type: "flight", parsers: [{p: 2}]});
        expect(state.flightParsers).toEqual([{p: 2}]);
    });

    it("receiveVIs builds a vi map and sets count", () => {
        m.receiveVIs(state, {vis: [{vi_id: "v9"}], total: 5});
        expect(state.visCount).toBe(5);
        expect(state.vis.v9).toEqual({vi_id: "v9"});
    });

    it("receiveCustomScripts builds a script map and sets count", () => {
        m.receiveCustomScripts(state, {customScripts: [{script_id: "s9"}], total: 3});
        expect(state.customScriptsCount).toBe(3);
        expect(state.customScripts.s9).toEqual({script_id: "s9"});
    });

    it("receiveUploadResults sets the typed upload results", () => {
        m.receiveUploadResults(state, {type: "flight", uploadResults: {done: true}});
        expect(state.flightUploadResults).toEqual({done: true});
    });
});

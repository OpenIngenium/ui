import store from "../../../../src/modules/project-config/project-config-store";

describe("Store project-config-store.js", () => {
    describe("Flight", () => {
        describe("(getters)", () => {
            it("flight", () => {
                let flight = {
                    "v1": {
                        "foo": "bar"
                    }
                };

                const state = {
                    flight: flight
                };

                let flight_result = store.getters.flight(state);

                expect(flight_result).toBe(flight);
            });

            it("flightVersions", () => {
                let flight = {
                    "v1": {
                        "sse": {
                            "foo": "bar"
                        }
                    }
                };

                const state = {
                    flight: flight
                };

                let flight_result = store.getters.flightVersions(state, "v1", "sse");
                
                expect(flight_result).toBe(flight_result);
            });
        });
        describe("(mutations)", () => {
            it("receiveDictionaries", () => {
                const state = {
                    "sse": {}
                };

                expect(typeof state).toBe('object');

                store.mutations.receiveDictionaries(state, {
                    dictionaries: [
                        {
                            "dictionary_type": "sse",
                            "dictionary_version": "v1",
                            "foo": "bar"
                        }
                    ],
                    total: 1
                });

                expect(typeof state.sse).toBe('object');
            });
        });
    });

    describe("SSE", () => {
        describe("(getters)", () => {
            it("sse returns the sse state", () => {
                const sse = { total_count: 2, v1: { foo: "bar" } };
                const state = { sse };
                expect(store.getters.sse(state)).toBe(sse);
                expect(store.getters.sseTotalCount(state)).toBe(2);
            });

            it("sseVersions returns the requested type for a version", () => {
                const state = { sse: { v1: { evrs: [{ evr_name: "A" }] } } };
                expect(store.getters.sseVersions(state)("v1", "evrs")).toEqual([{ evr_name: "A" }]);
            });

            it("sseVersion returns the full version object", () => {
                const v1 = { evrs: {}, ehas: {} };
                const state = { sse: { v1 } };
                expect(store.getters.sseVersion(state)("v1")).toBe(v1);
            });
        });
        describe("(mutations)", () => {
            it("receiveDictionaries populates sse state and index", () => {
                const state = { sse: {}, sseIndex: [] };
                store.mutations.receiveDictionaries(state, {
                    dictionaries: [{ dictionary_type: "sse", dictionary_version: "v1", foo: "bar" }],
                    total: 1
                });
                expect(state.sse.total_count).toBe(1);
                expect(state.sse.v1.dictionary_version).toBe("v1");
                expect(state.sseIndex.length).toBe(1);
            });
        });
    });

    describe("Vis", () => {
        describe("(getters)", () => {
            it("vis / visCount / visUploadResults return state", () => {
                const vis = { vi1: { vi_id: "vi1" } };
                const state = { vis, visCount: 5, visUploadResults: { ok: true } };
                expect(store.getters.vis(state)).toBe(vis);
                expect(store.getters.visCount(state)).toBe(5);
                expect(store.getters.visUploadResults(state)).toEqual({ ok: true });
            });
        });
        describe("(mutations)", () => {
            it("receiveVIs maps VIs by vi_id and sets the count", () => {
                const state = { vis: {}, visCount: 0 };
                store.mutations.receiveVIs(state, {
                    vis: [{ vi_id: "vi1" }, { vi_id: "vi2" }],
                    total: 2
                });
                expect(state.visCount).toBe(2);
                expect(Object.keys(state.vis)).toEqual(["vi1", "vi2"]);
                expect(state.vis.vi1.vi_id).toBe("vi1");
            });
        });
    });

    describe("Custom Scripts", () => {
        describe("(getters)", () => {
            it("customScripts / customScriptsCount return state", () => {
                const customScripts = { s1: { script_id: "s1" } };
                const state = { customScripts, customScriptsCount: 3, customScriptsUploadResults: {} };
                expect(store.getters.customScripts(state)).toBe(customScripts);
                expect(store.getters.customScriptsCount(state)).toBe(3);
            });

            it("customScriptDetails returns the matching script or {}", () => {
                const state = { customScripts: { s1: { script_id: "s1", name: "one" } } };
                expect(store.getters.customScriptDetails(state)({ scriptId: "s1" })).toEqual({ script_id: "s1", name: "one" });
                expect(store.getters.customScriptDetails(state)({ scriptId: "missing" })).toEqual({});
            });

            it("customScriptIdByPath resolves script_id from a path", () => {
                const state = { customScripts: { s1: { script_id: "s1", script_path: "/a/b.py" } } };
                expect(store.getters.customScriptIdByPath(state)({ scriptPath: "/a/b.py" })).toBe("s1");
                expect(store.getters.customScriptIdByPath(state)({ scriptPath: "/nope" })).toBe("");
            });
        });
        describe("(mutations)", () => {
            it("receiveCustomScripts maps scripts by script_id and sets the count", () => {
                const state = { customScripts: {}, customScriptsCount: 0 };
                store.mutations.receiveCustomScripts(state, {
                    customScripts: [{ script_id: "s1" }, { script_id: "s2" }],
                    total: 2
                });
                expect(state.customScriptsCount).toBe(2);
                expect(Object.keys(state.customScripts)).toEqual(["s1", "s2"]);
            });
        });
    });
});
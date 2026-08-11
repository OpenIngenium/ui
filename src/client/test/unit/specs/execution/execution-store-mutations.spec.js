import executionStore from "../../../../src/modules/execution/execution-store";

const m = executionStore.mutations;

function buildState() {
    return {
        isPending: false,
        outlineFollow: false,
        mode: "as-run",
        notificationMessage: null,
        execution: {status: "RUNNING", mode: "old"},
        follow: false,
        executionId: "",
        venue: null,
        timeReferences: [],
        tags: [],
        searchResult: {},
        reloadProcedureOutline: false,
        callProcedureRedirectUrl: "",
        elements: {
            e1: {
                elem_id: "e1",
                parent_id: "",
                elem_type: "STEP",
                executed: false,
                execution: {meta_data: {status: "OLD"}, results: {}},
                execution_user_input: {entries: [{}], k: {}},
                specification: {execution_user_input: {}},
                procedure_modification: {}
            },
            e2: {
                elem_id: "e2",
                parent_id: "",
                elem_type: "STEP",
                executed: false,
                execution: {},
                execution_user_input: {}
            }
        },
        elementIds: ["e1", "e2"],
        filteredElementIds: ["e1", "e2", "e3", "e4"],
        elementsViewState: {e1: {detailLevel: 1}, e2: {detailLevel: 1}},
        entriesViewState: {e1: [{detailLevel: 1}]},
        outlinePrecomputed: {e1: {elem_id: "e1", children: {}}},
        viewportTopPointer: 0,
        viewportSize: 2,
        viewportPageSize: 1
    };
}

describe("execution-store mutations", () => {
    let state;

    beforeEach(() => {
        state = buildState();
    });

    describe("simple setters", () => {
        it("setPending sets isPending", () => {
            m.setPending(state, true);
            expect(state.isPending).toBe(true);
        });

        it("setOutlineFollow sets outlineFollow", () => {
            m.setOutlineFollow(state, true);
            expect(state.outlineFollow).toBe(true);
        });

        it("setMode sets mode", () => {
            m.setMode(state, {mode: "execution"});
            expect(state.mode).toBe("execution");
        });

        it("receiveNotification stores the message", () => {
            m.receiveNotification(state, {msg: "hi"});
            expect(state.notificationMessage).toEqual({msg: "hi"});
        });

        it("setStateKey sets an arbitrary key", () => {
            m.setStateKey(state, {key: "foo", val: 5});
            expect(state.foo).toBe(5);
        });

        it("setBooleanKey sets a boolean key", () => {
            m.setBooleanKey(state, {key: "creatingElement", bool: true});
            expect(state.creatingElement).toBe(true);
        });

        it("setCallProcedureRedirectUrl sets the keyed value", () => {
            m.setCallProcedureRedirectUrl(state, {key: "callProcedureRedirectUrl", value: "u"});
            expect(state.callProcedureRedirectUrl).toBe("u");
        });

        it("setElementViewStateKey sets a nested view state key", () => {
            m.setElementViewStateKey(state, {elementId: "e1", key: "loading", val: true});
            expect(state.elementsViewState.e1.loading).toBe(true);
        });

        it("setExecutionMode and setExecutionFollow", () => {
            m.setExecutionMode(state, {mode: "m"});
            expect(state.execution.mode).toBe("m");
            m.setExecutionFollow(state, {follow: true});
            expect(state.follow).toBe(true);
        });
    });

    describe("execution + venue + tags", () => {
        it("receiveVenue stores the venue", () => {
            m.receiveVenue(state, {venue_status: {}});
            expect(state.venue).toEqual({venue_status: {}});
        });

        it("receiveExecutionObj merges into execution", () => {
            m.receiveExecutionObj(state, {status: "CLOSED", extra: 1});
            expect(state.execution.status).toBe("CLOSED");
            expect(state.execution.mode).toBe("old");
            expect(state.execution.extra).toBe(1);
        });

        it("receiveTimeReferences and receiveTags", () => {
            m.receiveTimeReferences(state, [1, 2]);
            expect(state.timeReferences).toEqual([1, 2]);
            m.receiveTags(state, [{tag_id: "t"}]);
            expect(state.tags).toEqual([{tag_id: "t"}]);
        });

        it("updateExecutionStatus and receiveExecution", () => {
            m.updateExecutionStatus(state, "CLOSED");
            expect(state.execution.status).toBe("CLOSED");
            m.receiveExecution(state, {executionId: "x"});
            expect(state.executionId).toBe("x");
        });

        it("receiveExecutionKeyValue sets a keyed execution value", () => {
            m.receiveExecutionKeyValue(state, {keyString: "foo.bar", value: 7});
            expect(state.execution.foo.bar).toBe(7);
        });
    });

    describe("element execution mutations", () => {
        it("initElementExecution sets status RUNNING when meta_data exists", () => {
            m.initElementExecution(state, "e1");
            expect(state.elements.e1.execution.meta_data.status).toBe("RUNNING");
        });

        it("initElementExecution creates meta_data when missing", () => {
            m.initElementExecution(state, "e2");
            expect(state.elements.e2.execution.meta_data.status).toBe("RUNNING");
        });

        it("updateElementExecution updates execution fields and preserves defaults", () => {
            m.updateElementExecution(state, {
                elementId: "e1",
                execution: {meta_data: {status: "PASS"}},
                executed: true,
                execution_user_input: {new: 1},
                run_records: [{r: 1}]
            });
            expect(state.elements.e1.executed).toBe(true);
            expect(state.elements.e1.execution.meta_data.status).toBe("PASS");
            expect(state.elements.e1.run_records).toEqual([{r: 1}]);
        });

        it("updateElementInputWS replaces input and flags outline reload for procedure sections", () => {
            m.updateElementInputWS(state, {elementId: "e1", value: {new: 1}});
            expect(state.elements.e1.execution_user_input).toEqual({new: 1});
            expect(state.reloadProcedureOutline).toBe(false);

            state.elements.e1.elem_type = "PROCEDURE_SECTION";
            m.updateElementInputWS(state, {elementId: "e1", value: {x: 1}});
            expect(state.reloadProcedureOutline).toEqual({elementId: "e1"});
        });

        it("updateElementWebsocketsMetaData merges meta_data and marks executed", () => {
            m.updateElementWebsocketsMetaData(state, {elementId: "e1", value: {status: "PASS"}});
            expect(state.elements.e1.execution.meta_data.status).toBe("PASS");
            expect(state.elements.e1.executed).toBe(true);
        });

        it("updateElementWebsocketsMetaData creates meta_data when absent", () => {
            m.updateElementWebsocketsMetaData(state, {elementId: "e2", value: {status: "PASS"}});
            expect(state.elements.e2.execution.meta_data).toEqual({status: "PASS"});
        });

        it("updateElementWebsocketsResults merges results", () => {
            m.updateElementWebsocketsResults(state, {elementId: "e1", value: {r: 2}});
            expect(state.elements.e1.execution.results.r).toBe(2);
        });

        it("updateElementConsistencyFlag sets the flag", () => {
            m.updateElementConsistencyFlag(state, {elementId: "e1", consistencyFlag: true});
            expect(state.elements.e1.consistency_flag).toBe(true);
        });
    });

    describe("input / key mutations", () => {
        it("receiveElementKeyValue sets element key and mirrors to outline", () => {
            m.receiveElementKeyValue(state, {elementId: "e1", keyString: "title", value: "T"});
            expect(state.elements.e1.title).toBe("T");
            expect(state.outlinePrecomputed.e1.title).toBe("T");
        });

        it("receiveElementInput sets a nested input value", () => {
            m.receiveElementInput(state, {elementId: "e1", keyString: "k.deep", value: 9});
            expect(state.elements.e1.execution_user_input.k.deep).toBe(9);
        });

        it("receiveElementSpecification sets a spec input value", () => {
            m.receiveElementSpecification(state, {elementId: "e1", keyString: "foo", value: "bar"});
            expect(state.elements.e1.specification.execution_user_input.foo).toBe("bar");
        });

        it("receiveRedlineInput sets a redline value", () => {
            m.receiveRedlineInput(state, {elementId: "e1", keyString: "approval.status", value: "APPROVED"});
            expect(state.elements.e1.procedure_modification.approval.status).toBe("APPROVED");
        });

        it("receiveEntries sets entries and rebuilds entry view state", () => {
            m.receiveEntries(state, {elementId: "e1", value: [{}, {}], level: 3});
            expect(state.elements.e1.execution_user_input.entries.length).toBe(2);
            expect(state.entriesViewState.e1.length).toBe(2);
            expect(state.entriesViewState.e1[0].detailLevel).toBe(3);
        });
    });

    describe("search + paging + reset mutations", () => {
        it("receiveSearch builds a matchMap and removes matches", () => {
            m.receiveSearch(state, {matches: [{elem_id: "e1", field_path: "title"}], total_count: 1});
            expect(state.searchResult.matchMap["e1:title"]).toEqual({elem_id: "e1", field_path: "title"});
            expect(state.searchResult.hasOwnProperty("matches")).toBe(false);
        });

        it("clearSearchResults resets to default search result", () => {
            m.clearSearchResults(state);
            expect(state.searchResult.search_for).toBe("");
            expect(state.searchResult.total_count).toBe(0);
        });

        it("pageElements scrolls the viewport down", () => {
            m.pageElements(state, {scrollDirection: "down"});
            expect(state.viewportTopPointer).toBe(1);
        });

        it("resetElementsState clears element collections", () => {
            m.resetElementsState(state);
            expect(state.elementIds).toEqual([]);
            expect(state.elements).toEqual({});
            expect(state.elementsViewState).toEqual({});
            expect(state.entriesViewState).toEqual({});
        });
    });
});

import authoringStore from "../../../../src/modules/authoring/authoring-store";

const m = authoringStore.mutations;

function buildState() {
    return {
        isPending: false,
        importResponse: {},
        procedureId: "",
        procedureVersion: "0",
        procedureDetails: {title: "t", tags: []},
        authoringProcedures: [],
        authoringProceduresCount: 0,
        authoringProcedureVersions: [],
        authoringProcedureVersionsCount: 0,
        authoringProcedureVersionsWorkingVersion: null,
        authoringProcedureIndex: -1,
        authoringProcedureVersionIndex: -1,
        currentProcedureDeleted: false,
        stepPaletteBuiltIn: [],
        stepPaletteCustom: [],
        timeReferences: [],
        editMode: false,
        elements: {
            e1: {
                elem_id: "e1",
                parent_id: "",
                elem_type: "STEP",
                title: "old",
                authoring_user_input: {entries: [{}], arr: [1, 2], k: {}},
                execution: {}
            },
            e2: {elem_id: "e2", parent_id: "", elem_type: "STEP", authoring_user_input: {entries: []}}
        },
        elementIds: ["e1", "e2"],
        filteredElementIds: ["e1", "e2"],
        elementsViewState: {e1: {detailLevel: 1}, e2: {detailLevel: 1}},
        entriesViewState: {e1: [{detailLevel: 1}]},
        outlinePrecomputed: {},
        searchResult: {matchMap: {}},
        reloadProcedureOutline: false,
        elemFilters: {
            comment: false,
            activityReport: false,
            dataReview: false,
            resolved: false,
            unresolved: false,
            redline: false,
            blueline: false,
            tag_ids: [],
            filterElementIdMap: {}
        },
        viewportTopPointer: 0,
        viewportSize: 2,
        viewportPageSize: 1
    };
}

function rootState() {
    return {comments: {conversations: {}}};
}

describe("authoring-store mutations", () => {
    let state;

    beforeEach(() => {
        state = buildState();
    });

    describe("simple setters", () => {
        it("setPending / setStateKey / setBooleanKey", () => {
            m.setPending(state, true);
            expect(state.isPending).toBe(true);
            m.setStateKey(state, {key: "foo", val: 3});
            expect(state.foo).toBe(3);
            m.setBooleanKey(state, {key: "movingElement", bool: true});
            expect(state.movingElement).toBe(true);
        });

        it("receiveNotification is a no-op", () => {
            m.receiveNotification(state, {msg: "x"});
            expect(state.notificationMessage).toBeUndefined();
        });

        it("receiveImportResponse / setProcedureId", () => {
            m.receiveImportResponse(state, {importResponse: {procedure_info: {procedure_id: "p"}}});
            expect(state.importResponse.procedure_info.procedure_id).toBe("p");
            m.setProcedureId(state, {procedureId: "p2"});
            expect(state.procedureId).toBe("p2");
        });

        it("setElementViewStateKey", () => {
            m.setElementViewStateKey(state, {elementId: "e1", key: "loading", val: true});
            expect(state.elementsViewState.e1.loading).toBe(true);
        });

        it("receiveAuthoringProcedures / receiveAuthoringProcedureVersions", () => {
            m.receiveAuthoringProcedures(state, {procedures: [{procedure_id: "a"}], total: 5});
            expect(state.authoringProcedures.length).toBe(1);
            expect(state.authoringProceduresCount).toBe(5);
            m.receiveAuthoringProcedureVersions(state, {versions: [{version: 0}], total: 3});
            expect(state.authoringProcedureVersions.length).toBe(1);
            expect(state.authoringProcedureVersionsCount).toBe(3);
        });

        it("receiveAuthoringProcedureVersionsWorkingVersion", () => {
            m.receiveAuthoringProcedureVersionsWorkingVersion(state, {version: {version: 0}});
            expect(state.authoringProcedureVersionsWorkingVersion).toEqual({version: 0});
        });

        it("setStepPaletteBuiltIn / setStepPaletteCustom", () => {
            m.setStepPaletteBuiltIn(state, {stepPaletteBuiltIn: [{a: 1}]});
            expect(state.stepPaletteBuiltIn).toEqual([{a: 1}]);
            m.setStepPaletteCustom(state, {stepPaletteCustom: [{b: 2}]});
            expect(state.stepPaletteCustom).toEqual([{b: 2}]);
        });

        it("index + deleted + version setters", () => {
            m.setAuthoringProcedureIndex(state, {index: 2});
            expect(state.authoringProcedureIndex).toBe(2);
            m.setAuthoringProcedureVersionIndex(state, {index: 4});
            expect(state.authoringProcedureVersionIndex).toBe(4);
            m.setCurrentProcedureDeleted(state, {currentProcedureDeleted: true});
            expect(state.currentProcedureDeleted).toBe(true);
            m.receiveProcedureVersion(state, {procedureId: "p9", version: "2"});
            expect(state.procedureId).toBe("p9");
            expect(state.procedureVersion).toBe("2");
        });

        it("time references + procedure info + tags", () => {
            m.receiveTimeReferences(state, [1, 2]);
            expect(state.timeReferences).toEqual([1, 2]);
            m.receiveProcedureInfo(state, {author: "me"});
            expect(state.procedureDetails.author).toBe("me");
            expect(state.procedureDetails.title).toBe("t");
            m.mergeReceiveProcedureDetails(state, {procedureDetails: {title: "new"}, procedureDetailsVersion: {v: 1}});
            expect(state.procedureDetails.title).toBe("new");
            expect(state.procedureDetails.v).toBe(1);
            m.receiveProcedureTags(state, [{tag_id: "t1"}]);
            expect(state.procedureDetails.tags).toEqual([{tag_id: "t1"}]);
        });

        it("setEditMode", () => {
            m.setEditMode(state, {editMode: true});
            expect(state.editMode).toBe(true);
        });
    });

    describe("element mutations", () => {
        it("receiveProcedureElementsTags sets tag_ids", () => {
            m.receiveProcedureElementsTags(state, [{elem_id: "e1", tag_ids: ["t1"]}]);
            expect(state.elements.e1.tag_ids).toEqual(["t1"]);
        });

        it("receiveOnlyElements merges/adds elements", () => {
            m.receiveOnlyElements(state, {elements: [
                {elem_id: "e1", title: "merged"},
                {elem_id: "e3", title: "added"}
            ]});
            expect(state.elements.e1.title).toBe("merged");
            expect(state.elements.e3.title).toBe("added");
        });

        it("updateElementInputWS replaces input and flags procedure section reload", () => {
            m.updateElementInputWS(state, {elementId: "e1", value: {x: 1}});
            expect(state.elements.e1.authoring_user_input).toEqual({x: 1});
            expect(state.reloadProcedureOutline).toBe(false);

            state.elements.e1.elem_type = "PROCEDURE_SECTION";
            m.updateElementInputWS(state, {elementId: "e1", value: {y: 2}});
            expect(state.reloadProcedureOutline).toEqual({elementId: "e1"});
        });

        it("receiveElementArrayValue replaces or removes an index", () => {
            m.receiveElementArrayValue(state, {elementId: "e1", keyString: "arr", value: 9, position: 0});
            expect(state.elements.e1.authoring_user_input.arr).toEqual([9, 2]);
            m.receiveElementArrayValue(state, {elementId: "e1", keyString: "arr", value: "", position: 0});
            expect(state.elements.e1.authoring_user_input.arr).toEqual([2]);
        });

        it("receiveEntryArrayValue replaces or removes an entry index", () => {
            state.elements.e1.authoring_user_input.entries = [{widgets: ["a", "b"]}];
            m.receiveEntryArrayValue(state, {elementId: "e1", keyString: "widgets", value: "q", entryIndex: 0, targetIndex: 0});
            expect(state.elements.e1.authoring_user_input.entries[0].widgets).toEqual(["q", "b"]);
            m.receiveEntryArrayValue(state, {elementId: "e1", keyString: "widgets", value: null, entryIndex: 0, targetIndex: 0});
            expect(state.elements.e1.authoring_user_input.entries[0].widgets).toEqual(["b"]);
        });

        it("receiveElementInput sets a nested input value", () => {
            m.receiveElementInput(state, {elementId: "e1", keyString: "k.deep", value: 5});
            expect(state.elements.e1.authoring_user_input.k.deep).toBe(5);
        });

        it("receiveElementKeyValue sets element key and mirrors to outline", () => {
            m.receiveElementKeyValue(state, {elementId: "e1", keyString: "title", value: "NEW"});
            expect(state.elements.e1.title).toBe("NEW");
            expect(state.outlinePrecomputed.e1.title).toBe("NEW");
        });

        it("updateElementConsistencyFlag sets the flag", () => {
            m.updateElementConsistencyFlag(state, {elementId: "e1", consistencyFlag: true});
            expect(state.elements.e1.consistency_flag).toBe(true);
        });

        it("updateReplacedFields updates matched fields and marks replaced", () => {
            state.searchResult = {matchMap: {"e1:title": {elem_id: "e1", field_path: "title"}}};
            m.updateReplacedFields(state, {replacements: [
                {elem_id: "e1", field_path: "title", field_value: "replaced", number: "1"}
            ]});
            expect(state.elements.e1.title).toBe("replaced");
            expect(state.searchResult.matchMap["e1:title"].replaced).toBe(true);
        });

        it("updateOutline recomputes outlinePrecomputed", () => {
            m.updateOutline(state);
            expect(state.outlinePrecomputed.e1).toBeDefined();
        });
    });

    describe("search + paging + delete", () => {
        it("receiveSearch builds matchMap and removes matches", () => {
            m.receiveSearch(state, {matches: [{elem_id: "e1", field_path: "title"}], total_count: 1});
            expect(state.searchResult.matchMap["e1:title"]).toEqual({elem_id: "e1", field_path: "title"});
            expect(state.searchResult.hasOwnProperty("matches")).toBe(false);
        });

        it("clearSearchResults resets to default", () => {
            m.clearSearchResults(state);
            expect(state.searchResult.search_for).toBe("");
        });

        it("pageElements scrolls the viewport", () => {
            state.filteredElementIds = ["e1", "e2", "e3", "e4"];
            m.pageElements(state, {scrollDirection: "down"});
            expect(state.viewportTopPointer).toBe(1);
        });

        it("deleteElement removes an element and recomputes ids", () => {
            m.deleteElement(state, {
                elementId: "e1",
                numbers: [{elem_id: "e2", number: "1"}],
                elementIds: ["e2"],
                rootState: rootState()
            });
            expect(state.elements.hasOwnProperty("e1")).toBe(false);
            expect(state.elementIds).toEqual(["e2"]);
            expect(state.filteredElementIds).toEqual(["e2"]);
        });
    });
});

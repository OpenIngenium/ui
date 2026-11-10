import Vue from "vue";
import Vuex from "vuex";
import executionStore from "../../../../src/modules/execution/execution-store";

Vue.use(Vuex);

// Build an unsigned JWT-like token decodable by jwt-decode, to control getUsername().
function makeJwt(payload) {
    const b64 = (obj) => window.btoa(JSON.stringify(obj)).replace(/=+$/, "");
    return `${b64({alg: "HS256", typ: "JWT"})}.${b64(payload)}.sig`;
}

function setUsername(username) {
    document.cookie = `access_token=${makeJwt({username})}`;
}

function clearUsername() {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

function buildState() {
    return {
        dataInitialized: true,
        reloadProcedureOutline: false,
        execution: {
            status: "RUNNING",
            current_step_id: "e1",
            parent_execution_id: "parent-1",
            test_conductors: ["tc1"],
            participants: ["p1"],
            redline_approvers: ["ra1"],
            flight_dictionary_version: "fdv",
            sse_dictionary_version: "sdv"
        },
        follow: true,
        isPending: false,
        mode: "execution",
        timeReferences: [{id: 1}],
        outlineFollow: true,
        venue: {venue_status: {test_conductor: "tcUser", execution_id: "exec-1"}},
        kickedOut: false,
        selectedViMap: {vi1: true},
        executionId: "exec-1",
        elementIds: ["e1", "e2"],
        elements: {
            e1: {
                elem_id: "e1",
                parent_id: "",
                number: "1",
                executed: false,
                step_type: "GDS_MANUAL",
                execution_user_input: {
                    tag_selections: ["t1"],
                    entries: [{data_path: "dp1", a: 1, arr: [1, 2]}],
                    elements: [
                        {elem_id: "c1", parent_id: "e1", selected: true},
                        {elem_id: "c2", parent_id: "e1", selected: false}
                    ],
                    vis: [{vi_id: "v1"}],
                    steps: [{s: 1}]
                },
                execution: {
                    meta_data: {status: "RUNNING", k: "v"},
                    results: {steps: [{r: 1}], entries: [{re: 1}]}
                },
                procedure_modification: {approval: {status: "APPROVED"}}
            },
            e2: {
                elem_id: "e2",
                parent_id: "",
                number: "2",
                executed: true,
                step_type: "VERIFICATION_ITEM",
                execution_user_input: {entries: [], elements: [], vis: [{vi_id: "v2"}]},
                execution: {meta_data: {status: "PASS"}, results: {}}
            }
        },
        searchResult: {total_count: 0},
        filteredElementIds: ["e1", "e2"],
        procedurePreview: {e1: ["e1"]},
        notificationMessage: {msg: "hi"},
        tags: [{tag_id: "t1", name: "Tag1"}],
        selectedVisStepElementId: "e1",
        elemFilters: {
            comment: true,
            activityReport: false,
            dataReview: false,
            resolved: false,
            unresolved: false,
            redline: false,
            blueline: false,
            filterElementIdMap: {},
            tag_ids: []
        },
        outlinePrecomputed: {e1: {elem_id: "e1", collapsed: false, children: {}}},
        elemModificationMap: {
            e1: {"execution_user_input.entries.0.a": "A", "title": "CD"}
        },
        importingProcedure: false,
        callProcedureRedirectUrl: "url",
        creatingElement: false,
        movingElement: false,
        copyingElement: false,
        updatingElementInput: false,
        copyParams: {execution_id: "exec-1", copyElemIdMap: {e1: "e1"}},
        replaceElementSource: {execution_id: "exec-1", elem_id: "e1"},
        stepPaletteBuiltIn: [{a: 1}],
        stepPaletteCustom: [{b: 2}],
        procedureModificationModal: {show: false},
        redlineElementIds: ["e1"],
        bulkJustificationModalMessage: "msg",
        bulkRedlineElementIds: ["e1"],
        elementsViewState: {e1: {detailLevel: 2, loading: false}, e2: {detailLevel: 3}},
        entriesViewState: {e1: [{detailLevel: 1}]},
        viewportTopPointer: 0,
        viewportSize: 2,
        viewportPageSize: 1,
        scrollToElement: null
    };
}

describe("execution-store getters", () => {
    let store;

    beforeEach(() => {
        setUsername("tcUser");
        store = new Vuex.Store({
            state: buildState(),
            getters: executionStore.getters
        });
    });

    afterEach(() => {
        clearUsername();
    });

    describe("simple state accessors", () => {
        it("expose primitive state values", () => {
            const g = store.getters;
            expect(g.dataInitialized).toBe(true);
            expect(g.reloadProcedureOutline).toBe(false);
            expect(g.follow).toBe(true);
            expect(g.isPending).toBe(false);
            expect(g.mode).toBe("execution");
            expect(g.editMode).toBe(true);
            expect(g.outlineFollow).toBe(true);
            expect(g.kickedOut).toBe(false);
            expect(g.executionId).toBe("exec-1");
            expect(g.notificationMessage).toEqual({msg: "hi"});
            expect(g.timeReferences).toEqual([{id: 1}]);
            expect(g.searchResult).toEqual({total_count: 0});
            expect(g.viewportTopPointer).toBe(0);
            expect(g.scrollToElement).toBeNull();
            expect(g.importingProcedure).toBe(false);
            expect(g.callProcedureRedirectUrl).toBe("url");
            expect(g.creatingElement).toBe(false);
            expect(g.movingElement).toBe(false);
            expect(g.copyingElement).toBe(false);
            expect(g.updatingElementInput).toBe(false);
            expect(g.stepPaletteBuiltIn).toEqual([{a: 1}]);
            expect(g.stepPaletteCustom).toEqual([{b: 2}]);
            expect(g.procedureModificationModal).toEqual({show: false});
            expect(g.redlineElementIds).toEqual(["e1"]);
            expect(g.bulkJustificationModalMessage).toBe("msg");
            expect(g.bulkRedlineElementIds).toEqual(["e1"]);
            expect(g.selectedVisStepElementId).toBe("e1");
            expect(g.procedureDetails).toEqual({});
        });
    });

    describe("execution-derived getters", () => {
        it("pageTitle reflects mode/open state", () => {
            expect(store.getters.pageTitle).toBe("Execution (TC)");
        });

        it("currentStepId and parentExecutionId read from execution", () => {
            expect(store.getters.currentStepId).toBe("e1");
            expect(store.getters.parentExecutionId).toBe("parent-1");
        });

        it("executionOpen/Finalized/HasBeenClosed reflect status", () => {
            expect(store.getters.executionOpen).toBe(true);
            expect(store.getters.executionFinalized).toBe(false);
            expect(store.getters.executionHasBeenClosed).toBe(false);
        });

        it("dictionary version getters read from execution", () => {
            expect(store.getters.selectedFlightDictionaryVersion).toBe("fdv");
            expect(store.getters.selectedSseDictionaryVersion).toBe("sdv");
        });
    });

    describe("test conductor / participation getters", () => {
        it("testConductor comes from the venue status", () => {
            expect(store.getters.testConductor).toBe("tcUser");
            expect(store.getters.isTestConductor).toBe(true);
        });

        it("canParticipate and canApproveRedline are true for the TC", () => {
            expect(store.getters.canParticipate).toBe(true);
            expect(store.getters.canApproveRedline).toBe(true);
            expect(store.getters.canBulkRedline).toBe(true);
        });

        it("testConductors/participants/redlineApprovers read from execution", () => {
            expect(store.getters.testConductors).toEqual(["tc1"]);
            expect(store.getters.participants).toEqual(["p1"]);
            expect(store.getters.redlineApprovers).toEqual(["ra1"]);
            expect(store.getters.isOneOfTestConductors).toBe(false);
        });

        it("canBulkRedlineElement respects approval status for participants", () => {
            setUsername("p1");
            const localStore = new Vuex.Store({state: buildState(), getters: executionStore.getters});
            // participant cannot re-select an already APPROVED redline
            expect(localStore.getters.canBulkRedlineElement("e1")).toBe(false);
        });
    });

    describe("element accessor getters", () => {
        it("element/elements/elementsAll/elementIds", () => {
            expect(store.getters.element("e1").elem_id).toBe("e1");
            expect(store.getters.elementIds).toEqual(["e1", "e2"]);
            expect(store.getters.elementsAll.length).toBe(2);
            expect(store.getters.elements.length).toBe(2);
        });

        it("elementKey/elementViewState/elementViewStateKey", () => {
            expect(store.getters.elementKey("e1", "number")).toBe("1");
            expect(store.getters.elementViewState("e1")).toEqual({detailLevel: 2, loading: false});
            expect(store.getters.elementViewStateKey("e1", "detailLevel")).toBe(2);
        });

        it("entryViewState reads nested entry view state", () => {
            expect(store.getters.entryViewState("e1", 0)).toEqual({detailLevel: 1});
        });

        it("elementsByParent filters and includes children", () => {
            const roots = store.getters.elementsByParent("");
            expect(roots.length).toBe(2);
        });

        it("childIdsByParent groups elementIds by parent_id in a single pass", () => {
            expect(store.getters.childIdsByParent).toEqual({"": ["e1", "e2"]});
        });

        it("nestedChildIds returns the element id itself when it has no children", () => {
            expect(store.getters.nestedChildIds("e2")).toEqual(["e2"]);
        });

        it("elementsByParent/nestedChildIds walk multi-level nesting via the parent index", () => {
            const state = buildState();
            state.elementIds = ["e1", "e2", "e3", "e4"];
            state.elements.e3 = {elem_id: "e3", parent_id: "e1", number: "1.1"};
            state.elements.e4 = {elem_id: "e4", parent_id: "e3", number: "1.1.1"};
            const nestedStore = new Vuex.Store({state, getters: executionStore.getters});

            expect(nestedStore.getters.childIdsByParent).toEqual({
                "": ["e1", "e2"],
                e1: ["e3"],
                e3: ["e4"]
            });
            expect(nestedStore.getters.elementsByParent("e1").map((e) => e.elem_id)).toEqual(["e3"]);
            expect(nestedStore.getters.elementsByParent("e3").map((e) => e.elem_id)).toEqual(["e4"]);
            expect(nestedStore.getters.nestedChildIds("e1").sort()).toEqual(["e1", "e3", "e4"]);
        });

        it("parentIdsByChild/parentsByChild walk up the tree", () => {
            expect(store.getters.parentIdsByChild("e1")).toEqual([]);
            expect(store.getters.parentsByChild("e1")).toEqual([]);
        });

        it("directionalUnExecutedElement finds the next unexecuted element", () => {
            expect(store.getters.directionalUnExecutedElement("e2", "before")).toBe("e1");
        });

        it("filteredElementIds/filteredElementIdMap", () => {
            expect(store.getters.filteredElementIds).toEqual(["e1", "e2"]);
            expect(store.getters.filteredElementIdMap).toEqual({e1: "e1", e2: "e2"});
        });
    });

    describe("execution input / results getters", () => {
        it("executionInput and executionInputKey", () => {
            expect(store.getters.executionInput("e1").tag_selections).toEqual(["t1"]);
            expect(store.getters.executionInputKey("e1", "entries.0.data_path")).toBe("dp1");
        });

        it("executionInputEntryKey and executionInputChildIndexById", () => {
            expect(store.getters.executionInputEntryKey("e1", 0, "a")).toBe(1);
            expect(store.getters.executionInputChildIndexById("e1", "c2")).toBe(1);
        });

        it("executionInputEntriesArrayFilter joins array values", () => {
            const values = store.getters.executionInputEntriesArrayFilter("e1", ["a", "arr"]);
            expect(values).toEqual([[1, "1,2"]]);
        });

        it("executionInputEntriesArrayFilter returns [] for unknown element", () => {
            expect(store.getters.executionInputEntriesArrayFilter("nope", ["a"])).toEqual([]);
        });

        it("executionMetaData/Key and results getters", () => {
            expect(store.getters.executionMetaData("e1")).toEqual({status: "RUNNING", k: "v"});
            expect(store.getters.executionMetaDataKey("e1", "status")).toBe("RUNNING");
            expect(store.getters.executionResultsKey("e1", "steps.0.r")).toBe(1);
            expect(store.getters.executionResultsEntry("e1", 0)).toEqual({re: 1});
            expect(store.getters.executionResultsEntryKey("e1", 0, "re")).toBe(1);
        });

        it("numEntries counts entries and handles missing input", () => {
            expect(store.getters.numEntries("e1")).toBe(1);
            expect(store.getters.numEntries("e2")).toBe(0);
        });

        it("procedureTagSelections reads tag_selections", () => {
            expect(store.getters.procedureTagSelections("e1")).toEqual(["t1"]);
        });

        it("redline input getters", () => {
            expect(store.getters.executionRedlineInput("e1")).toEqual({approval: {status: "APPROVED"}});
            expect(store.getters.executionRedlineInputKey("e1", "approval.status")).toBe("APPROVED");
        });
    });

    describe("venue / tags / VI getters", () => {
        it("venue and venueKey", () => {
            expect(store.getters.venue.venue_status.execution_id).toBe("exec-1");
            expect(store.getters.venueKey("execution_id")).toBe("exec-1");
        });

        it("tag/tags lookups", () => {
            expect(store.getters.tag("t1")).toEqual({tag_id: "t1", name: "Tag1"});
            expect(store.getters.tags()).toEqual([{tag_id: "t1", name: "Tag1"}]);
        });

        it("VI getters read from element input/results", () => {
            expect(store.getters.getVisByElementId("e1")).toEqual([{vi_id: "v1"}]);
            expect(store.getters.getStepsByElementId("e1")).toEqual([{s: 1}]);
            expect(store.getters.getStepResultsByElementId("e1")).toEqual([{r: 1}]);
            expect(store.getters.isSelectedViId("vi1")).toBe(true);
            expect(store.getters.isSelectedViId("nope")).toBe(false);
        });

        it("allSelectedVis dedupes verification item vis", () => {
            expect(store.getters.allSelectedVis).toEqual([{vi_id: "v2"}]);
        });

        it("dataPaths collects unique GDS_MANUAL data paths", () => {
            expect(store.getters.dataPaths).toEqual(["dp1"]);
        });
    });

    describe("filter + outline + modStyle getters", () => {
        it("filter getters read elemFilters", () => {
            expect(store.getters.commentFilter).toBe(true);
            expect(store.getters.activityReportFilter).toBe(false);
            expect(store.getters.dataReviewFilter).toBe(false);
            expect(store.getters.resolvedFilter).toBe(false);
            expect(store.getters.unresolvedFilter).toBe(false);
            expect(store.getters.redlineFilter).toBe(false);
            expect(store.getters.bluelineFilter).toBe(false);
            expect(store.getters.anyFilter).toBe(true);
        });

        it("fetchOutlinePrecomputed returns outline state", () => {
            expect(store.getters.fetchOutlinePrecomputed.e1.elem_id).toBe("e1");
        });

        it("modStyle maps modification codes to classes", () => {
            expect(store.getters.modStyle("e1", "entries.0.a")).toBe("mod-added");
            expect(store.getters.modStyle("e1", "title", false)).toBe("mod-changed-del");
            expect(store.getters.modStyle("e2", "anything")).toBe("");
        });

        it("elemDiffsShown reflects presence of a modification map", () => {
            expect(store.getters.elemDiffsShown("e1")).toBe(true);
            expect(store.getters.elemDiffsShown("e2")).toBe(false);
        });

        it("scrolling getters delegate to helpers", () => {
            expect(store.getters.hasAdditionalElementsBefore).toBe(false);
            expect(store.getters.hasAdditionalElementsAfter).toBe(false);
        });
    });

    describe("copy/move selection getters", () => {
        it("copyParams/copyElemIdMap and selection ids", () => {
            expect(store.getters.copyParams).toEqual({execution_id: "exec-1", copyElemIdMap: {e1: "e1"}});
            expect(store.getters.copyElemIdMap).toEqual({e1: "e1"});
            expect(store.getters.selectedElementIds).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForCopy).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForThis).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForMove).toEqual(["e1"]);
        });

        it("hasSelectedElements* booleans", () => {
            expect(store.getters.hasSelectedElements).toBe(true);
            expect(store.getters.hasSelectedElementsToCopy).toBe(true);
            expect(store.getters.hasSelectedElementsForThis).toBe(true);
            expect(store.getters.hasSelectedElementsToMove).toBe(true);
        });

        it("selectedElement checks membership in the copy map", () => {
            expect(store.getters.selectedElement("e1")).toBe(true);
            expect(store.getters.selectedElement("e2")).toBe(false);
        });

        it("replaceElementSource getters", () => {
            expect(store.getters.replaceElementSource).toEqual({execution_id: "exec-1", elem_id: "e1"});
            expect(store.getters.hasReplaceElementSource).toBe(true);
        });

        it("procedure preview getters", () => {
            expect(store.getters.getProcedurePreviewByElementId("e1")).toEqual(["e1"]);
            expect(store.getters.procedurePreviewElementIds).toEqual(["e1"]);
            expect(store.getters.procedurePreviewRootElements("e1").map((e) => e.elem_id)).toEqual(["e1"]);
        });
    });

    describe("isAuthoringMode", () => {
        it("is always false in the execution store", () => {
            expect(store.getters.isAuthoringMode).toBe(false);
        });
    });
});

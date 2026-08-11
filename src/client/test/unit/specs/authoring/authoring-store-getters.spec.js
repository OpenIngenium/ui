import Vue from "vue";
import Vuex from "vuex";
import authoringStore from "../../../../src/modules/authoring/authoring-store";

Vue.use(Vuex);

function buildState() {
    return {
        isPending: false,
        dataInitialized: true,
        reloadProcedureOutline: false,
        execution: {status: "AUTHORING"},
        validationItems: [{id: 1}],
        authoringProcedures: [{procedure_id: "p1", title: "Proc 1"}],
        authoringProcedureIndex: 0,
        authoringProceduresCount: 1,
        authoringProcedureVersionsCount: 2,
        authoringProcedureVersions: [{version: 0}, {version: 1}],
        authoringProcedureVersionsWorkingVersion: {version: 0},
        currentProcedureDeleted: false,
        procedureId: "p1",
        procedureVersion: "0",
        procedureDetails: {
            title: "Proc 1",
            tags: [{tag_id: "t1", name: "Tag1"}],
            flight_dictionary_version: "fdv",
            sse_dictionary_version: "sdv"
        },
        mode: "authoring",
        editMode: true,
        timeReferences: [{id: 1}],
        selectedViMap: {vi1: true},
        elements: {
            e1: {
                elem_id: "e1",
                parent_id: "",
                number: "1",
                step_type: "GDS_MANUAL",
                authoring_user_input: {
                    tag_selections: ["t1"],
                    entries: [{data_path: "dp1", a: 1, arr: [1, 2]}],
                    elements: [
                        {elem_id: "c1", parent_id: "e1", selected: true},
                        {elem_id: "c2", parent_id: "e1", selected: false}
                    ]
                },
                execution: {meta_data: {status: "NONE"}}
            },
            e2: {
                elem_id: "e2",
                parent_id: "",
                number: "2",
                step_type: "VERIFICATION_ITEM",
                authoring_user_input: {vis: [{vi_id: "v2"}], steps: [{s: 1}], entries: []},
                execution: {meta_data: {}}
            },
            e3: {
                elem_id: "e3",
                parent_id: "",
                number: "3",
                step_type: "CUSTOM_SCRIPT",
                authoring_user_input: {script_id: "script-1", entries: []},
                execution: {meta_data: {}}
            }
        },
        elementIds: ["e1", "e2", "e3"],
        filteredElementIds: ["e1", "e2", "e3"],
        elementsViewState: {e1: {detailLevel: 2}, e2: {detailLevel: 3}, e3: {detailLevel: 2}},
        entriesViewState: {e1: [{detailLevel: 1}]},
        searchResult: {total_count: 0},
        viewportTopPointer: 0,
        viewportSize: 3,
        viewportPageSize: 1,
        scrollToElement: null,
        elemFilters: {
            comment: false,
            activityReport: false,
            dataReview: false,
            resolved: false,
            unresolved: false,
            redline: true,
            blueline: false,
            tag_ids: ["t1"],
            procedureStep: "PS",
            filterElementName: "name",
            filterElementIdMap: {}
        },
        outlinePrecomputed: {e1: {elem_id: "e1", children: {}}},
        procedureNotFound: false,
        loadingProcedure: false,
        importingProcedure: false,
        importResponse: {
            procedure_info: {procedure_id: "imp-1"},
            version_infos: [{version: 0}, {version: 1}]
        },
        creatingElement: false,
        movingElement: false,
        copyingElement: false,
        updatingElementInput: false,
        creatingProcedureVersion: false,
        copyParams: {procedure_id: "p1", procedure_version: 0, copyElemIdMap: {e1: "e1"}},
        replaceElementSource: {procedure_id: "p1", elem_id: "e1"},
        stepPaletteBuiltIn: [{a: 1}],
        stepPaletteCustom: [{b: 2}],
        procedureModificationModal: {show: false},
        bulkJustificationModalMessage: "msg",
        selectedViStepElementId: "e1"
    };
}

describe("authoring-store getters", () => {
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            state: buildState(),
            getters: authoringStore.getters
        });
    });

    describe("procedure + mode getters", () => {
        it("exposes procedure state values", () => {
            const g = store.getters;
            expect(g.isPending).toBe(false);
            expect(g.dataInitialized).toBe(true);
            expect(g.reloadProcedureOutline).toBe(false);
            expect(g.execution).toEqual({status: "AUTHORING"});
            expect(g.validationItems).toEqual([{id: 1}]);
            expect(g.authoringProcedures.length).toBe(1);
            expect(g.authoringProcedureIndex).toBe(0);
            expect(g.authoringProceduresCount).toBe(1);
            expect(g.authoringProcedureVersionsCount).toBe(2);
            expect(g.authoringProcedureVersions.length).toBe(2);
            expect(g.authoringProcedureVersionsWorkingVersion).toEqual({version: 0});
            expect(g.currentProcedureDeleted).toBe(false);
            expect(g.procedureId).toBe("p1");
            expect(g.procedureVersion).toBe("0");
            expect(g.procedureDetails.title).toBe("Proc 1");
            expect(g.mode).toBe("authoring");
            expect(g.editMode).toBe(true);
            expect(g.timeReferences).toEqual([{id: 1}]);
        });

        it("authoringProcedure resolves by index then by id", () => {
            expect(store.getters.authoringProcedure().procedure_id).toBe("p1");

            const noIndexState = buildState();
            noIndexState.authoringProcedureIndex = -1;
            const store2 = new Vuex.Store({state: noIndexState, getters: authoringStore.getters});
            expect(store2.getters.authoringProcedure("p1").procedure_id).toBe("p1");
        });

        it("isAuthoringMode is always true and executionFinalized false", () => {
            expect(store.getters.isAuthoringMode).toBe(true);
            expect(store.getters.executionFinalized).toBe(false);
        });

        it("isWorkingCopy true for version 0", () => {
            expect(store.getters.isWorkingCopy).toBe(true);
        });

        it("pageTitle reflects working-copy edit mode", () => {
            expect(store.getters.pageTitle).toBe("Procedure Edit: Proc 1 (Working Version)");
        });

        it("pageTitle for a non-working version shows the version number", () => {
            const versionedState = buildState();
            versionedState.procedureVersion = "3";
            const store2 = new Vuex.Store({state: versionedState, getters: authoringStore.getters});
            expect(store2.getters.pageTitle).toBe("Procedure Review: Proc 1 (Version 3)");
        });

        it("procedureTagsObj maps tags by id", () => {
            expect(store.getters.procedureTagsObj).toEqual({t1: {tag_id: "t1", name: "Tag1"}});
        });
    });

    describe("element getters", () => {
        it("element/elements/elementsAll/elementIds", () => {
            expect(store.getters.element("e1").elem_id).toBe("e1");
            expect(store.getters.elementIds).toEqual(["e1", "e2", "e3"]);
            expect(store.getters.elementsAll.length).toBe(3);
            expect(store.getters.elements.length).toBe(3);
        });

        it("elementKey/elementViewState/elementViewStateKey/entryViewState", () => {
            expect(store.getters.elementKey("e1", "number")).toBe("1");
            expect(store.getters.elementViewState("e1")).toEqual({detailLevel: 2});
            expect(store.getters.elementViewStateKey("e1", "detailLevel")).toBe(2);
            expect(store.getters.entryViewState("e1", 0)).toEqual({detailLevel: 1});
        });

        it("elementsByParent/nestedChildIds/parentIdsByChild", () => {
            expect(store.getters.elementsByParent("").length).toBe(3);
            expect(store.getters.nestedChildIds("e2")).toEqual(["e2"]);
            expect(store.getters.parentIdsByChild("e1")).toEqual([]);
            expect(store.getters.parentsByChild("e1")).toEqual([]);
        });

        it("filteredElementIds/filteredElementIdMap", () => {
            expect(store.getters.filteredElementIds).toEqual(["e1", "e2", "e3"]);
            expect(store.getters.filteredElementIdMap).toEqual({e1: "e1", e2: "e2", e3: "e3"});
        });

        it("parentExecutionId is empty in authoring", () => {
            expect(store.getters.parentExecutionId).toBe("");
        });
    });

    describe("input getters", () => {
        it("executionInput/executionInputKey read authoring_user_input", () => {
            expect(store.getters.executionInput("e1").tag_selections).toEqual(["t1"]);
            expect(store.getters.executionInputKey("e1", "entries.0.data_path")).toBe("dp1");
        });

        it("executionInputEntryKey/executionInputChildIndexById", () => {
            expect(store.getters.executionInputEntryKey("e1", 0, "a")).toBe(1);
            expect(store.getters.executionInputChildIndexById("e1", "c2")).toBe(1);
        });

        it("executionInputEntriesArrayFilter joins array values", () => {
            expect(store.getters.executionInputEntriesArrayFilter("e1", ["a", "arr"])).toEqual([[1, "1,2"]]);
            expect(store.getters.executionInputEntriesArrayFilter("nope", ["a"])).toEqual([]);
        });

        it("numEntries counts entries", () => {
            expect(store.getters.numEntries("e1")).toBe(1);
            expect(store.getters.numEntries("e2")).toBe(0);
        });

        it("procedureTagSelections and executionMetaData", () => {
            expect(store.getters.procedureTagSelections("e1")).toEqual(["t1"]);
            expect(store.getters.executionMetaData("e1")).toEqual({status: "NONE"});
            expect(store.getters.executionMetaDataKey("e1", "status")).toBe("NONE");
        });
    });

    describe("VI / custom script / data path getters", () => {
        it("getVisByElementId/getStepsByElementId/getStepResultsByElementId", () => {
            expect(store.getters.getVisByElementId("e2")).toEqual([{vi_id: "v2"}]);
            expect(store.getters.getStepsByElementId("e2")).toEqual([{s: 1}]);
            expect(store.getters.getStepResultsByElementId("e2")).toEqual([{s: 1}]);
        });

        it("allSelectedVis/allVis dedupe verification items", () => {
            expect(store.getters.allSelectedVis).toEqual([{vi_id: "v2"}]);
            expect(store.getters.allVis).toEqual([{vi_id: "v2"}]);
        });

        it("allCustomScripts collects custom script inputs", () => {
            expect(store.getters.allCustomScripts.length).toBe(1);
            expect(store.getters.allCustomScripts[0].script_id).toBe("script-1");
        });

        it("dataPaths collects GDS_MANUAL data paths", () => {
            expect(store.getters.dataPaths).toEqual(["dp1"]);
        });

        it("isSelectedViId and selectedVisStepElementId", () => {
            expect(store.getters.isSelectedViId("vi1")).toBe(true);
            expect(store.getters.isSelectedViId("nope")).toBe(false);
            expect(store.getters.selectedVisStepElementId).toBe("e1");
        });
    });

    describe("filter + spinner + copy getters", () => {
        it("filter getters", () => {
            expect(store.getters.commentFilter).toBe(false);
            expect(store.getters.redlineFilter).toBe(true);
            expect(store.getters.anyFilter).toBe(true);
            expect(store.getters.tagsFilter).toEqual(["t1"]);
            expect(store.getters.procedureStepFilter).toBe("PS");
            expect(store.getters.filterElementName).toBe("name");
        });

        it("outline + not-found getters", () => {
            expect(store.getters.fetchOutlinePrecomputed.e1.elem_id).toBe("e1");
            expect(store.getters.procedureNotFound).toBe(false);
        });

        it("spinner getters", () => {
            expect(store.getters.loadingProcedure).toBe(false);
            expect(store.getters.importingProcedure).toBe(false);
            expect(store.getters.creatingElement).toBe(false);
            expect(store.getters.movingElement).toBe(false);
            expect(store.getters.copyingElement).toBe(false);
            expect(store.getters.updatingElementInput).toBe(false);
            expect(store.getters.creatingProcedureVersion).toBe(false);
        });

        it("import response getters", () => {
            expect(store.getters.importedProcedureId).toBe("imp-1");
            expect(store.getters.importedVersions).toEqual([0, 1]);
        });

        it("copy/move selection getters", () => {
            expect(store.getters.copyParams.copyElemIdMap).toEqual({e1: "e1"});
            expect(store.getters.copyElemIdMap).toEqual({e1: "e1"});
            expect(store.getters.selectedElementIds).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForCopy).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForThis).toEqual(["e1"]);
            expect(store.getters.selectedElementIdsForMove).toEqual(["e1"]);
            expect(store.getters.hasSelectedElements).toBe(true);
            expect(store.getters.hasSelectedElementsToCopy).toBe(true);
            expect(store.getters.hasSelectedElementsForThis).toBe(true);
            expect(store.getters.hasSelectedElementsToMove).toBe(true);
            expect(store.getters.selectedElement("e1")).toBe(true);
            expect(store.getters.selectedElement("e9")).toBe(false);
        });

        it("replace element source getters", () => {
            expect(store.getters.replaceElementSource).toEqual({procedure_id: "p1", elem_id: "e1"});
            expect(store.getters.hasReplaceElementSource).toBe(true);
        });

        it("dictionary version + conductor + palette + modStyle getters", () => {
            expect(store.getters.selectedFlightDictionaryVersion).toBe("fdv");
            expect(store.getters.selectedSseDictionaryVersion).toBe("sdv");
            expect(store.getters.isTestConductor).toBe(false);
            expect(store.getters.canParticipate).toBe(true);
            expect(store.getters.stepPaletteBuiltIn).toEqual([{a: 1}]);
            expect(store.getters.stepPaletteCustom).toEqual([{b: 2}]);
            expect(store.getters.modStyle("e1", "x")).toBe("");
            expect(store.getters.procedureModificationModal).toEqual({show: false});
            expect(store.getters.bulkJustificationModalMessage).toBe("msg");
            expect(store.getters.procedurePreviewElementIds).toEqual([]);
        });
    });
});

import * as faker from "faker";
import store from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";

const fakeProcedureElementId1 = faker.random.uuid();
const parentOneLevelId = faker.random.uuid();
const parentTierOneId = faker.random.uuid();
const parentTierTwoId = faker.random.uuid();
const childWithOneParentId = faker.random.uuid();
const childWithTwoAncestorsId = faker.random.uuid();
const fakeProcedureElementId2 = faker.random.uuid();
const elementId1 = faker.random.uuid();
const elementId2 = faker.random.uuid();

const author1 = faker.name.findName();
const author2 = faker.name.findName();
const author3 = faker.name.findName();
const procedureId1 = faker.random.word();
const procedureId2 = faker.random.word();
const procedureId3 = faker.random.word();
const title1 = faker.random.word();
const title2 = faker.random.word();
const title3 = faker.random.word();
const procedureCount = 10;
const procedure2VersionId1 = faker.random.uuid();
const procedure3VersionId1 = faker.random.uuid();
const procedure3VersionId2 = faker.random.uuid();

let state;
const procedures = [
    {
        author: author1,
        current_release_version: 0,
        current_version: 0,
        deprecated: false,
        description: "",
        institutional_id: "",
        locked_by: "",
        procedure_id: procedureId1,
        status: "WORKING",
        time_created: "",
        time_saved: "",
        title: title1,
    },
    {
        author: author2,
        current_release_version: 0,
        current_version: 0,
        deprecated: false,
        description: "",
        institutional_id: "",
        locked_by: "",
        procedure_id: procedureId2,
        status: "WORKING",
        time_created: "",
        time_saved: "",
        title: title2,
    },
    {
        author: author3,
        current_release_version: 0,
        current_version: 0,
        deprecated: false,
        description: "",
        institutional_id: "",
        locked_by: "",
        procedure_id: procedureId3,
        status: "WORKING",
        time_created: "",
        time_saved: "",
        title: title3,
    },
];
const procedureId2Versions = {
    total: 1,
    versions: [
        {
            api_version: "1",
            deprecated: false,
            flight_dictionary_version: "",
            institutional_release_id: "",
            procedure_id: procedureId2,
            sse_dictionary_version: "",
            status: "VERSIONAED",
            time_released: "",
            time_saved: "",
            version: 1,
            version_author: "",
            version_description: "",
            version_id: procedure2VersionId1,
        },
    ]
};
const procedureId3Versions = {
    total: 2,
    versions: [
        {
            api_version: "1",
            deprecated: false,
            flight_dictionary_version: "",
            institutional_release_id: "",
            procedure_id: procedureId3,
            sse_dictionary_version: "",
            status: "VERSIONAED",
            time_released: "",
            time_saved: "",
            version: 1,
            version_author: "",
            version_description: "",
            version_id: procedure3VersionId1,
        },
        {
            api_version: "1",
            deprecated: false,
            flight_dictionary_version: "",
            institutional_release_id: "",
            procedure_id: procedureId3,
            sse_dictionary_version: "",
            status: "VERSIONAED",
            time_released: "",
            time_saved: "",
            version: 1,
            version_author: "",
            version_description: "",
            version_id: procedure3VersionId2,
        },
    ]
};
const procedureOutlineElementObject1 = {
    [parentOneLevelId]: {elem_id: parentOneLevelId, parent_id: ""},
    [parentTierOneId]: {elem_id: parentTierOneId, parent_id: ""},
    [parentTierTwoId]: {elem_id: parentTierTwoId, parent_id: parentTierOneId},
    [childWithOneParentId]: {elem_id: childWithOneParentId, parent_id: parentOneLevelId},
    [childWithTwoAncestorsId]: {elem_id: childWithTwoAncestorsId, parent_id: parentTierTwoId}
};
const procedureOutlineElementObject2 = {
    [elementId1]: {elem_id: elementId1, selected: true},
    [elementId2]: {elem_id: elementId2, selected: false},
};
const rootState = {
    execution: {
        elements: [
            {
                [elementId1]: {
                    execution_user_input: {
                        elements: []
                    }
                }
            }
        ]
    },
    authoring: {
        elements: [
            {
                [elementId1]: {
                    authoring_user_input: {
                        elements: []
                    }
                }
            }
        ]
    }
};

describe("Store run-procedure-store.js", () => {
    describe("getters", () => {
        let state;
        const procedures = [
            {
                author: author1,
                current_release_version: 0,
                current_version: 0,
                deprecated: false,
                description: "",
                institutional_id: "",
                locked_by: "",
                procedure_id: procedureId1,
                status: "WORKING",
                time_created: "",
                time_saved: "",
                title: title1,
            },
            {
                author: author2,
                current_release_version: 0,
                current_version: 0,
                deprecated: false,
                description: "",
                institutional_id: "",
                locked_by: "",
                procedure_id: procedureId2,
                status: "WORKING",
                time_created: "",
                time_saved: "",
                title: title2,
            },
            {
                author: author3,
                current_release_version: 0,
                current_version: 0,
                deprecated: false,
                description: "",
                institutional_id: "",
                locked_by: "",
                procedure_id: procedureId3,
                status: "WORKING",
                time_created: "",
                time_saved: "",
                title: title3,
            },
        ];
        const procedureId2Versions = {
            total: 1,
            versions: [
                {
                    api_version: "1",
                    deprecated: false,
                    flight_dictionary_version: "",
                    institutional_release_id: "",
                    procedure_id: procedureId2,
                    sse_dictionary_version: "",
                    status: "VERSIONAED",
                    time_released: "",
                    time_saved: "",
                    version: 1,
                    version_author: "",
                    version_description: "",
                    version_id: procedure2VersionId1,
                },
            ]
        };
        const procedureId3Versions = {
            total: 2,
            versions: [
                {
                    api_version: "1",
                    deprecated: false,
                    flight_dictionary_version: "",
                    institutional_release_id: "",
                    procedure_id: procedureId3,
                    sse_dictionary_version: "",
                    status: "VERSIONAED",
                    time_released: "",
                    time_saved: "",
                    version: 1,
                    version_author: "",
                    version_description: "",
                    version_id: procedure3VersionId1,
                },
                {
                    api_version: "1",
                    deprecated: false,
                    flight_dictionary_version: "",
                    institutional_release_id: "",
                    procedure_id: procedureId3,
                    sse_dictionary_version: "",
                    status: "VERSIONAED",
                    time_released: "",
                    time_saved: "",
                    version: 1,
                    version_author: "",
                    version_description: "",
                    version_id: procedure3VersionId2,
                },
            ]
        };
        const procedureOutlineElementObject1 = {
            [parentOneLevelId]: {elem_id: parentOneLevelId, parent_id: "", child_ids: [parentOneLevelId]},
            [parentTierOneId]: {elem_id: parentTierOneId, parent_id: "", child_ids: [parentTierOneId]},
            [parentTierTwoId]: {elem_id: parentTierTwoId, parent_id: parentTierOneId, child_ids: [parentOneLevelId]},
            [childWithOneParentId]: {elem_id: childWithOneParentId, parent_id: parentOneLevelId},
            [childWithTwoAncestorsId]: {elem_id: childWithTwoAncestorsId, parent_id: parentTierTwoId}
        };
        const procedureOutlineElementObject2 = {
            [elementId1]: {elem_id: elementId1, selected: true},
            [elementId2]: {elem_id: elementId2, selected: false},
        };

        beforeEach(() => {
            state = {
                procedures: procedures,
                procedureCount: procedureCount,
                procedureOutlines: {
                    [fakeProcedureElementId1]: procedureOutlineElementObject1,
                    [fakeProcedureElementId2]: procedureOutlineElementObject2,
                    [parentOneLevelId]: {elem_id: parentOneLevelId, parent_id: "", child_ids: [parentOneLevelId]},
                    [parentTierOneId]: {elem_id: parentTierOneId, parent_id: "", child_ids: [parentTierOneId]},
                    [parentTierTwoId]: {elem_id: parentTierTwoId, parent_id: "", child_ids: [parentTierTwoId]}
                },
                procedureOutlineStructures: {
                    [fakeProcedureElementId1]: procedureOutlineElementObject1
                },
                procedureOutlineIds: {
                    [fakeProcedureElementId1]: [
                        parentOneLevelId,
                        parentTierOneId,
                        parentTierTwoId,
                        childWithOneParentId,
                        childWithTwoAncestorsId
                    ]
                },
                procedureVersions: {
                    [procedureId1]: {
                        total: 0,
                        versions: []
                    },
                    [procedureId2]: procedureId2Versions,
                    [procedureId3]: procedureId3Versions,
                }
            };
        });

        it("procedures - get all procedures", () => {
            expect(store.getters.procedures(state).length).toBe(procedures.length);
        });

        it("procedureCount - get procedureCount", () => {
            expect(store.getters.procedureCount(state)).toBe(procedureCount);
        });

        it("procedureVersions - get procedure versions given procedure ID", () => {
            const id2Versions = store.getters.procedureVersions(state)(procedureId2);
            expect(id2Versions.total).toBe(procedureId2Versions.total);
            expect(id2Versions.versions.length).toBe(procedureId2Versions.versions.length);

            const id3Versions = store.getters.procedureVersions(state)(procedureId3);
            expect(id3Versions.total).toBe(procedureId3Versions.total);
            expect(id3Versions.versions.length).toBe(procedureId3Versions.versions.length);
        });

        it("procedureOutlineElements - get procedure outlines by element Id", () => {
            expect(store.getters.procedureOutlineElements(state)(fakeProcedureElementId2)).toEqual(procedureOutlineElementObject2);
            expect(store.getters.procedureOutlineElements(state)(fakeProcedureElementId2)).toEqual(procedureOutlineElementObject2);
        });

        it("procedureOutlineElementSelections - returns a list of objects {elem_id: elem_id, selection: true/false}", () => {
            const outlineElementSelections = store.getters.procedureOutlineElementSelections(state)(fakeProcedureElementId2);
            expect(outlineElementSelections.length).toBe(2);
            expect(Object.keys(outlineElementSelections[0]).length, 2);
            expect(Object.keys(outlineElementSelections[0])).toContain("elem_id");
            expect(Object.keys(outlineElementSelections[0])).toContain("selected");
        });

        it("procedureOutlineElementsByParent - get a list of element objects that are children of a parent element in a procedure outline", () => {
            let parentLevelOneChildren = store.getters.procedureOutlineElementsByParent(state)({
                runProcedureElementId: fakeProcedureElementId1,
                elementId: parentOneLevelId
            });
            expect(parentLevelOneChildren).toBeDefined();

            let parentTierOneChildren = store.getters.procedureOutlineElementsByParent(state)({
                runProcedureElementId: fakeProcedureElementId1,
                elementId: parentTierOneId
            });
            expect(parentTierOneChildren).toBeDefined();
            
            let parentTierTwoChildren = store.getters.procedureOutlineElementsByParent(state)({
                runProcedureElementId: fakeProcedureElementId1,
                elementId: parentTierTwoId
            });
            expect(parentTierTwoChildren).toBeDefined();
        });

        it("procedureOutlineParentElementIds - gets a list of parentIds for an element in a procedure outline", () => {
            let parentOneLevelParents = store.getters.procedureOutlineParentElementIds(state)(fakeProcedureElementId1, parentOneLevelId);
            expect(parentOneLevelParents.length).toBe(0);

            let childOneLevelParents = store.getters.procedureOutlineParentElementIds(state)(fakeProcedureElementId1, childWithOneParentId);
            expect(childOneLevelParents.length).toBe(1);
            expect(childOneLevelParents[0]).toBe(parentOneLevelId);

            let childTierTwoParents = store.getters.procedureOutlineParentElementIds(state)(fakeProcedureElementId1, childWithTwoAncestorsId);
            expect(childTierTwoParents.length).toBe(2);
            expect(childTierTwoParents).toContain(parentTierOneId);
            expect(childTierTwoParents).toContain(parentTierTwoId);
        });

        xit("procedureOutlineNestedElementIds - returns a list of elementIds that are nested below a given elementId in a procedure outline", () => {
            let nestedIds = store.getters.procedureOutlineNestedElementIds(state, {
                // crashes test suite
                procedureOutlineElementsByParent: store.getters.procedureOutlineElementsByParent
            })(fakeProcedureElementId1, parentTierOneId);
            expect(nestedIds.length).toBe(2);
            expect(nestedIds).toContain(parentTierTwoId);
            expect(nestedIds).toContain(childWithTwoAncestorsId);
        }).pend('calling a getter within another getter crashes the test suite');
    });

    describe("mutations", () => {
        it("setBooleanKey - set boolean given key/ID", () => {
            const state = {
                loadingProcedure: false
            };

            expect(state.loadingProcedure).toBe(false);

            store.mutations.setBooleanKey(state, {key: 'loadingProcedure', bool: true});
            expect(state.loadingProcedure).toBe(true);
        });

        it("initializeProcedureState - adds dynamic procedureId for reactivity", () => {
            let fakeProcedureId = faker.random.uuid();
            const state = {
                procedureVersions: {}
            };

            expect(state.procedureVersions[fakeProcedureId]).toBeUndefined();

            store.mutations.initializeProcedureState(state, {procedureId: fakeProcedureId});
            expect(state.procedureVersions[fakeProcedureId]).toBeDefined();
            expect(state.procedureVersions[fakeProcedureId].versions).toBeDefined();
            expect(state.procedureVersions[fakeProcedureId].total).toBeDefined();
        });

        it("receiveProcedures - adds procedures and total", () => {
            const proceduresPayload = [
                {procedure_id: faker.random.uuid()},
                {procedure_id: faker.random.uuid()}
            ];
            const total = 10;
            const state = {
                procedures: [],
                procedureCount: 0
            };

            expect(state.procedures.length).toBe(0);
            expect(state.procedureCount).toBe(0);

            store.mutations.receiveProcedures(state, {
                procedures: proceduresPayload,
                total: total
            });

            expect(state.procedures.length).toBe(proceduresPayload.length);
            expect(state.procedureCount).toBe(total);
        });

        it("receiveProcedureVersions - adds procedureVersions and total", () => {
            let fakeProcedureId = faker.random.uuid();
            const versionsPayload = [
                {version_id: faker.random.uuid()},
                {version_id: faker.random.uuid()}
            ];
            const total = 10;
            const state = {
                procedureVersions: {}
            };

            expect(state.procedureVersions[fakeProcedureId]).toBeUndefined();
            store.mutations.receiveProcedureVersions(state, {
                procedureId: fakeProcedureId,
                versions: versionsPayload,
                total: total
            });

            expect(state.procedureVersions[fakeProcedureId]).toBeDefined();
            expect(state.procedureVersions[fakeProcedureId].versions.length).toBe(versionsPayload.length);
            expect(state.procedureVersions[fakeProcedureId].total).toBe(total);
        });

        it("receiveProcedureOutline - adds procedureOutlines and procedureOutlineIds", () => {
            const fakeProcedureElementId = faker.random.uuid();
            const outlinePayload = [
                {elem_id: faker.random.uuid(), parent_id: ""},
                {elem_id: faker.random.uuid(), parent_id: ""}
            ];
            const state = {
                procedureOutlines: {},
                procedureOutlineIds: {}
            };

            expect(state.procedureOutlines[fakeProcedureElementId]).toBeUndefined();
            expect(state.procedureOutlineIds[fakeProcedureElementId]).toBeUndefined();
            store.mutations.receiveProcedureOutline(state, {
                elementId: fakeProcedureElementId,
                outline: outlinePayload,
                rootState
            });

            expect(state.procedureOutlines[fakeProcedureElementId]).toBeDefined();
            expect(state.procedureOutlines[fakeProcedureElementId][outlinePayload[0]["elem_id"]]).toBeDefined();
            expect(state.procedureOutlines[fakeProcedureElementId][outlinePayload[1]["elem_id"]]).toBeDefined();

            expect(state.procedureOutlineIds[fakeProcedureElementId]).toBeDefined();
            expect(state.procedureOutlineIds[fakeProcedureElementId].length).toBe(outlinePayload.length);
        });
    });
});

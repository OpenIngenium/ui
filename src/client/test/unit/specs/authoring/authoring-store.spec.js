import * as faker from "faker";
import store from "../../../../src/modules/authoring/authoring-store";
const {
    elements,
    elementsByParent,
    executionInput,
    executionInputKey,
    executionInputEntryKey,
    numEntries,
    elementViewState,
    entryViewState,
    nestedChildIds
} = store.getters;
const {
    receiveElement,
    updateElementExecution,
    moveEntryViewState,
    receiveElementInput,
    receiveEntryInput,
    receiveEntryArrayValue,
    receiveElementArrayValue,
    setStateKey,
    deleteElement,
    setElementViewStateDetailLevel,
    setEntryViewStateDetailLevel,
} = store.mutations;

describe("Store authoring-store.js", () => {
    describe("getters", () => {
        it("elements - returns the filtered elements within the viewport window", () => {
            const fakeId1 = faker.random.uuid();
            const fakeId2 = faker.random.uuid();
            const fakeId3 = faker.random.uuid();
            const state = {
                // ordering now comes from filteredElementIds (precomputed), not a number sort
                filteredElementIds: [fakeId1, fakeId2, fakeId3],
                elements: {
                    [fakeId3]: { elem_id: fakeId3, number: 3 },
                    [fakeId1]: { elem_id: fakeId1, number: 1 },
                    [fakeId2]: { elem_id: fakeId2, number: 2 }
                },
                viewportTopPointer: 0,
                viewportSize: 10
            };
            const visible = elements(state);
            expect(visible.map(e => e.elem_id)).toEqual([fakeId1, fakeId2, fakeId3]);
        });

        it("elements - limits the result to the viewport size starting at the top pointer", () => {
            const state = {
                filteredElementIds: ["a", "b", "c", "d"],
                elements: {
                    a: { elem_id: "a" }, b: { elem_id: "b" }, c: { elem_id: "c" }, d: { elem_id: "d" }
                },
                viewportTopPointer: 1,
                viewportSize: 2
            };
            expect(elements(state).map(e => e.elem_id)).toEqual(["b", "c"]);
        });
        it("nestedChildIds - takes an elementId argument, and retrieves all nested child ids", () => {
            const fakeElementId = faker.random.uuid();
            const fakeElementId2 = faker.random.uuid();
            const fakeParentId = faker.random.uuid();
            const fakeGrandparentId = faker.random.uuid();

            const state = {
                elementIds: [fakeGrandparentId, fakeParentId, fakeElementId, fakeElementId2],
                elements: {
                    [fakeElementId]: {
                        parent_id: fakeParentId,
                        elem_id: fakeElementId
                    },
                    [fakeElementId2]: {
                        parent_id: fakeParentId,
                        elem_id: fakeElementId2
                    },
                    [fakeParentId]: {
                        parent_id: fakeGrandparentId,
                        elem_id: fakeParentId
                    },
                    [fakeGrandparentId]: {
                        parent_id: '',
                        elem_id: fakeGrandparentId
                    }
                }
            };

            expect(nestedChildIds(state)(fakeElementId)).toEqual([fakeElementId]);
            expect(nestedChildIds(state)(fakeParentId)).toEqual([fakeParentId, fakeElementId2, fakeElementId]);
            expect(nestedChildIds(state)(fakeGrandparentId)).toEqual([fakeGrandparentId, fakeParentId, fakeElementId2, fakeElementId]);
        });

        it("elementsByParent - retrieves elements by their parent ID and sorts them by number", () => {
            const fakeGetterEls = {
                "abc123b77-685f-11e8-adc0-fa7ae01bbebc": {
                    elem_id: "abc123b77-685f-11e8-adc0-fa7ae01bbebc",
                    parent_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                    number: "1-2",
                },
                "db76aa92-685f-11e8-adc0-fa7ae01bbebc": {
                    elem_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                    parent_id: "",
                    number: "1",
                },
                "bbd55b66-685f-11e8-adc0-fa7ae01bbebc": {
                    elem_id: "bbd55b66-685f-11e8-adc0-fa7ae01bbebc",
                    parent_id: "8642804a-c6fa-47d2-9b36-293e09ccde56",
                    number: "1-1-1",
                },
                "8642804a-c6fa-47d2-9b36-293e09ccde56": {
                    elem_id: "8642804a-c6fa-47d2-9b36-293e09ccde56",
                    parent_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                    number: "1-1",
                }
            };

            const state = {
                elementIds: [
                    "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                    "8642804a-c6fa-47d2-9b36-293e09ccde56",
                    "abc123b77-685f-11e8-adc0-fa7ae01bbebc",
                    "bbd55b66-685f-11e8-adc0-fa7ae01bbebc"
                ],
                elements: fakeGetterEls
            };

            const rootElements = elementsByParent(state)('');

            expect(rootElements.length).toEqual(1);
            expect(rootElements[0].number).toEqual("1");

            const childElements = elementsByParent(state)('db76aa92-685f-11e8-adc0-fa7ae01bbebc');
            expect(childElements.length).toEqual(2);
            expect(childElements[0].number).toEqual("1-1");
            expect(childElements[1].number).toEqual("1-2");
        });

        it("executionInput - gets execution input for an element", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            key1: "val1",
                            key2: "val2"
                        }
                    }
                }
            };
            const executionObj = executionInput(state)(fakeId);
            expect(executionObj).toEqual(state.elements[fakeId].authoring_user_input);
        });

        it("executionInputKey - gets execution input value for an element at a specific key", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            key1: {
                                nestedKey1: ['foo', 'fuzz', 'fam'],
                                nestedKey2: 'furry'
                            }
                        }
                    }
                }
            };
            const executionVal = executionInputKey(state)(fakeId, 'key1.nestedKey1[1]');
            const executionVal2 = executionInputKey(state)(fakeId, 'key1.nestedKey2');
            expect(executionVal).toEqual('fuzz');
            expect(executionVal2).toEqual('furry');
        });

        it("executionInputEntryKey - gets execution entry input value for an element at a specific index/key", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            entries: [{key1: "val1"}, {key2: "val2"}]
                        }
                    }
                }
            };
            const entryVal = executionInputEntryKey(state)(fakeId, 1, "key2");
            expect(entryVal).toEqual(state.elements[fakeId].authoring_user_input.entries[1].key2);
        });

        it("numEntries - gets total number of authoring_user_input.entries for an element", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            entries: [{key1: "val1", key2: "val2"}]
                        }
                    }
                }
            };

            const entryCount = numEntries(state)(fakeId);
            expect(entryCount).toEqual(state.elements[fakeId].authoring_user_input.entries.length);
        });

        it("numEntries - returns 0 when authoring_user_input does not exist", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {}
                }
            };

            const entryCount = numEntries(state)(fakeId);
            expect(entryCount).toEqual(0);
        });

        it("elementViewState - gets viewState value for a element", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elementsViewState: {
                    [fakeId]: {
                        detailLevel: 1,
                        loading: false
                    }
                }
            };

            const viewState = elementViewState(state)(fakeId);
            expect(viewState).toEqual({
                detailLevel: 1,
                loading: false
            });
        });

        it("entryViewState - gets viewState value for an entry", () => {
            const fakeId = faker.random.uuid();
            const state = {
                entriesViewState: {
                    [fakeId]: [{detailLevel: 2}, {detailLevel: 3}]
                }
            };

            const viewState = entryViewState(state)(fakeId, 1);
            expect(viewState).toEqual({detailLevel: 3});
        });
    });

    describe("mutations", () => {
        it("setStateKey - sets arbitrary state key to a value", () => {
            const fakeExecutionId = faker.random.uuid();
            const state = {
                executionId: undefined
            };
            setStateKey(state, {key: "executionId", val: fakeExecutionId});
            expect(state.executionId).toEqual(fakeExecutionId);
        });

        it("receiveElement - receives a element and updates state", () => {
            const newCmdStep = {
                elem_id: faker.random.uuid(),
                parent_id: "",
                authoring_user_input: {
                    entries: [
                        {dynamicKey1: "dynamicValue1", moreVals: [1, 2, 3]}
                    ]
                },
                garbageKey1: "",
                garbageKey2: ""
            };

            const state = {
                elementIds: [],
                elements: {},
                elementsViewState: {},
                entriesViewState: {},
                elemFilters: {filterElementIdMap: {}},
                filteredElementIds: [],
                outlinePrecomputed: {}
            };
            // receiveElement now takes precomputed numbers/elementIds and rootState (for conversations)
            const rootState = {comments: {conversations: {}}};

            expect(Object.keys(state.elementsViewState).length).toEqual(0);
            expect(Object.keys(state.entriesViewState).length).toEqual(0);

            receiveElement(state, {
                element: newCmdStep,
                detailLevel: 2,
                numbers: [{elem_id: newCmdStep.elem_id, number: 1}],
                elementIds: [newCmdStep.elem_id],
                rootState
            });

            expect(state.elementIds.length).toEqual(1);
            expect(state.elementIds).toContain(newCmdStep.elem_id);
            expect(state.elements[newCmdStep.elem_id].authoring_user_input).toEqual(newCmdStep.authoring_user_input);

            // filters out garbage keys (slimElement whitelists known fields)
            expect(Object.keys(state.elements[newCmdStep.elem_id])).not.toContain("garbageKey1");
            // new element and entry should also get added to respective view state shapes
            expect(Object.keys(state.elementsViewState).length).toEqual(1);
            expect(Object.keys(state.entriesViewState).length).toEqual(1);
        });

        it("receiveElement - doesn't throw an error if authoring_user_input is not found in element", () => {
            const newBogusStep = {elem_id: "5ef0ad50-6865-11e8-adc0-fa7ae01bbebc", parent_id: ""};

            const state = {
                elementIds: [],
                elements: {},
                elementsViewState: {},
                entriesViewState: {},
                elemFilters: {filterElementIdMap: {}},
                filteredElementIds: [],
                outlinePrecomputed: {}
            };
            const rootState = {comments: {conversations: {}}};

            expect(() => receiveElement(state, {
                element: newBogusStep,
                detailLevel: 2,
                numbers: [{elem_id: newBogusStep.elem_id, number: 1}],
                elementIds: [newBogusStep.elem_id],
                rootState
            })).not.toThrow();

            expect(state.elementIds.length).toEqual(1);
            expect(state.elements[newBogusStep.elem_id].authoring_user_input).toBe(undefined);
        });

        it("moveEntryViewState - updates entries view state on move", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            entries: [
                                { number: 1 },
                                { number: 4 },
                                { number: 2 },
                                { number: 3 }
                            ]
                        }
                    }
                },
                entriesViewState: {
                    [fakeId]: [
                        { detailLevel: 1 },
                        { detailLevel: 1 },
                        { detailLevel: 1 },
                        { detailLevel: 1 }
                    ]
                }
            };
            // test view state
            state.entriesViewState[fakeId][0].detailLevel = 3;
            let entryOrderChange = {elementId: fakeId, insertAfterIndex: "3", draggedEntryIndex: "0"};

            moveEntryViewState(state, entryOrderChange);

            expect(state.entriesViewState[fakeId][0].detailLevel).toEqual(1);
            expect(state.entriesViewState[fakeId][3].detailLevel).toEqual(3);
        });

        it("deleteElement - removes the element and rebuilds from surviving elementIds", () => {
            // deleteElement now deletes the given elementId and rebuilds ordering/outline
            // from the caller-provided surviving elementIds/numbers plus rootState.
            const state = {
                elementIds: ["destructible", "indestructible"],
                elements: {
                    "destructible": {elem_id: "destructible", parent_id: ""},
                    "indestructible": {elem_id: "indestructible", parent_id: ""}
                },
                elementsViewState: {"destructible": {}, "indestructible": {}},
                entriesViewState: {"destructible": [], "indestructible": []},
                elemFilters: {filterElementIdMap: {}},
                filteredElementIds: ["destructible", "indestructible"],
                outlinePrecomputed: {}
            };
            const rootState = {comments: {conversations: {}}};

            expect(state.elementIds.length).toEqual(2);
            expect(Object.keys(state.elements).length).toEqual(2);

            deleteElement(state, {
                elementId: "destructible",
                numbers: [{elem_id: "indestructible", number: 1}],
                elementIds: ["indestructible"],
                rootState
            });

            expect(state.elementIds).toEqual(["indestructible"]);
            expect(Object.keys(state.elements)).toEqual(["indestructible"]);
            expect(state.elements.destructible).toBeUndefined();
        });

        it("receiveEntryInput - adds an entry to authoring_user_input entries state", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            entries: [{"foo": "bar"}]
                        }
                    }
                }
            };

            const fakeObj = {elementId: fakeId, index: 0, key: "someKey", value: "someValue"};
            expect(Object.keys(state.elements[fakeId].authoring_user_input.entries[0]).length).toEqual(1);

            receiveEntryInput(state, fakeObj);

            expect(Object.keys(state.elements[fakeId].authoring_user_input.entries[0]).length).toEqual(2);
            expect(state.elements[fakeId].authoring_user_input.entries[0]).toEqual({"foo": "bar", "someKey": "someValue"});
        });

        it("receiveElementInput - sets an authoring_user_input key, value", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            foo: {
                                bar: 'baz'
                            }
                        }
                    }
                }
            };

            expect(state.elements[fakeId].authoring_user_input.foo.bar).toEqual('baz');
            const fakeObj = {elementId: fakeId, keyString: "foo.bar", value: 'ham'};

            receiveElementInput(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.foo.bar).toEqual('ham');

        });

        it("receiveElementArrayValue - splices or removes a value of a nested array", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            someKey: {
                                aNestedArray: ['allen', 'holub']
                            }
                        }
                    }
                }
            };
            expect(state.elements[fakeId].authoring_user_input.someKey.aNestedArray[1]).toEqual('holub');

            let fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: "hodor", position: 1};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.someKey.aNestedArray[1]).toEqual('hodor');

            fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: null, position: 1};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.someKey.aNestedArray[1]).toEqual(undefined);
            expect(state.elements[fakeId].authoring_user_input.someKey.aNestedArray.length).toEqual(1);

            fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: '', position: 0};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.someKey.aNestedArray.length).toEqual(0);
        });

        it("receiveEntryArrayValue - splices or removes a value of a nested array", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        authoring_user_input: {
                            entries: [
                                { widgets: ['a', 'b'] }
                            ]
                        }
                    }
                }
            };
            expect(state.elements[fakeId].authoring_user_input.entries[0].widgets).toEqual(['a','b']);

            let fakeObj = {elementId: fakeId, keyString: "widgets", value: "q", targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.entries[0].widgets).toEqual(['q','b']);

            fakeObj = {elementId: fakeId, keyString: "widgets", value: null, targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.entries[0].widgets).toEqual(['b']);

            // Only null/undefined removes an index; an empty string is a real
            // value and replaces the target index.
            fakeObj = {elementId: fakeId, keyString: "widgets", value: '', targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.entries[0].widgets).toEqual(['']);

            fakeObj = {elementId: fakeId, keyString: "widgets", value: undefined, targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].authoring_user_input.entries[0].widgets).toEqual([]);
        });

        it("setElementViewStateDetailLevel - sets element detailLevel", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elementsViewState: {
                    [fakeId]: {detailLevel: 1}
                }
            };

            expect(state.elementsViewState[fakeId].detailLevel).toEqual(1);

            setElementViewStateDetailLevel(state, {elementId: fakeId, detailLevel: 2});
            expect(state.elementsViewState[fakeId].detailLevel).toEqual(2);

            setElementViewStateDetailLevel(state, {elementId: fakeId, detailLevel: 3});
            expect(state.elementsViewState[fakeId].detailLevel).toEqual(3);
        });

        it("setEntryViewStateDetailLevel - sets entry viewState", () => {
            const fakeId = faker.random.uuid();
            const state = {
                entriesViewState: {
                    [fakeId]: [{detailLevel: 1 }]
                }
            };

            expect(state.entriesViewState[fakeId][0].detailLevel).toEqual(1);

            setEntryViewStateDetailLevel(state, {elementId: fakeId, refIndex: 0, detailLevel: 2});
            expect(state.entriesViewState[fakeId][0].detailLevel).toEqual(2);

            setEntryViewStateDetailLevel(state, {elementId: fakeId, refIndex: 0, detailLevel: 3});
            expect(state.entriesViewState[fakeId][0].detailLevel).toEqual(3);
        });
    });
});

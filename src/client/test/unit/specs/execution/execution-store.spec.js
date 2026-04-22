import * as faker from "faker";
import store from "../../../../src/modules/execution/execution-store";
const {
    elements,
    elementsByParent,
    executionInput,
    executionInputKey,
    executionInputEntryKey,
    executionInputChildIndexById,
    executionMetaDataKey,
    executionResultsKey,
    executionResultsEntryKey,
    numEntries,
    directionalUnExecutedElement,
    elementViewState,
    entryViewState,
    nestedChildIds
} = store.getters;
const {
    resetState,
    resetElementsState,
    receiveElement,
    updateElementExecution,
    updateElementOrder,
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

describe("Store execution-store.js", () => {
    describe("getters", () => {
        xit("elements - gets elements sorted by number", () => {
            const fakeId1 = faker.random.uuid();
            const fakeId2 = faker.random.uuid();
            const fakeId3 = faker.random.uuid();
            const state = {
                elementIds: [fakeId1, fakeId2, fakeId3],
                elements: {
                    [fakeId3]: { number: 3 },
                    [fakeId1]: { number: 1 },
                    [fakeId2]: { number: 2 }
                }
            };
            const sortedElements = elements(state);
            expect(sortedElements[0].number).toEqual(1);
            expect(sortedElements[1].number).toEqual(2);
            expect(sortedElements[2].number).toEqual(3);
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

        it("executionMetaDataKey - retrieves data by key", () => {
            const fakeElementId = faker.random.uuid();
            const fakeUserName = faker.internet.userName();

            const state = {
                elements: {
                    [fakeElementId]: {
                        execution: {
                            meta_data: {
                                test_conductor: fakeUserName,
                                status: "Pass"
                            }
                        }
                    }
                }
            };

            expect(executionMetaDataKey(state)(fakeElementId, "test_conductor")).toEqual(fakeUserName);
            expect(executionMetaDataKey(state)(fakeElementId, "status")).toEqual("Pass");
        });
        it("executionResultsKey - retrieves results  data by key", () => {
            const fakeElementId = faker.random.uuid();
            const fakeValue = faker.random.uuid();

            const state = {
                elements: {
                    [fakeElementId]: {
                        execution: {
                            results: {
                                status: "Pass",
                                value: fakeValue
                            }
                        }
                    }
                }
            };

            expect(executionResultsKey(state)(fakeElementId, "status")).toEqual("Pass");
            expect(executionResultsKey(state)(fakeElementId, "value")).toEqual(fakeValue);
        });
        it("executionResultsEntryKey - retrieves results data from an entry by key", () => {
            const fakeElementId = faker.random.uuid();
            const fakeStatus1 = faker.random.uuid();
            const fakeStatus2 = faker.random.uuid();
            const fakeValue1 = faker.random.uuid();
            const fakeValue2 = faker.random.uuid();

            const state = {
                elements: {
                    [fakeElementId]: {
                        execution: {
                            results: {
                                entries: [
                                    {
                                        status: fakeStatus1,
                                        value: fakeValue1
                                    },
                                    {
                                        status: fakeStatus2,
                                        value: fakeValue2
                                    },
                                ]

                            }
                        }
                    }
                }
            };

            expect(executionResultsEntryKey(state)(fakeElementId, 0, "value")).toEqual(fakeValue1);
            expect(executionResultsEntryKey(state)(fakeElementId, 1, "status")).toEqual(fakeStatus2);
        });

        it("elementsByParent - retrieves elements by their parent ID and sorts them by number", () => {
            const state = {
                elementIds: [
                    "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                    "8642804a-c6fa-47d2-9b36-293e09ccde56",
                    "abc123b77-685f-11e8-adc0-fa7ae01bbebc",
                    "bbd55b66-685f-11e8-adc0-fa7ae01bbebc"
                ],
                elements: {
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
                },
                parentToChildren: {
                    "": [
                        {
                            elem_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                            parent_id: "",
                            number: "1",
                        }
                    ],
                    "abc123b77-685f-11e8-adc0-fa7ae01bbebc": [],
                    "db76aa92-685f-11e8-adc0-fa7ae01bbebc": [
                        {
                            elem_id: "abc123b77-685f-11e8-adc0-fa7ae01bbebc",
                            parent_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                            number: "1-2",
                        },
                        {
                            elem_id: "8642804a-c6fa-47d2-9b36-293e09ccde56",
                            parent_id: "db76aa92-685f-11e8-adc0-fa7ae01bbebc",
                            number: "1-1",
                        },
                    ],
                    "bbd55b66-685f-11e8-adc0-fa7ae01bbebc": [],
                    "8642804a-c6fa-47d2-9b36-293e09ccde56": [
                        {
                            elem_id: "bbd55b66-685f-11e8-adc0-fa7ae01bbebc",
                            parent_id: "8642804a-c6fa-47d2-9b36-293e09ccde56",
                            number: "1-1-1",
                        },
                    ],
                }
            };

            const rootElements = elementsByParent(state)('');

            expect(rootElements.length).toEqual(1);
            expect(rootElements[0].number).toEqual("1");

            const childElements = elementsByParent(state)('db76aa92-685f-11e8-adc0-fa7ae01bbebc');
            expect(childElements.length).toEqual(2);
        });

        it("executionInput - gets execution input for an element", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            key1: "val1",
                            key2: "val2"
                        }
                    }
                }
            };
            const executionObj = executionInput(state)(fakeId);
            expect(executionObj).toEqual(state.elements[fakeId].execution_user_input);
        });

        it("executionInputKey - gets execution input value for an element at a specific key", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
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
                        execution_user_input: {
                            entries: [{key1: "val1"}, {key2: "val2"}]
                        }
                    }
                }
            };
            const entryVal = executionInputEntryKey(state)(fakeId, 1, "key2");
            expect(entryVal).toEqual(state.elements[fakeId].execution_user_input.entries[1].key2);
        });

        it("executionInputChildIndexById - gets the index of an element within execution_user_input.elements", () => {
            const parentId = faker.random.uuid();
            const childId = faker.random.uuid();
            const state = {
                elements: {
                    [parentId]: {
                        execution_user_input: {
                            elements: [{elem_id: faker.random.uuid()}, {elem_id: childId}]
                        }
                    }
                }
            };

            const childIndex = executionInputChildIndexById(state)(parentId, childId);
            expect(childIndex).toBe(1);
        });

        it("numEntries - gets total number of execution_user_input.entries for an element", () => {
            const fakeId = faker.random.uuid();
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            entries: [{key1: "val1", key2: "val2"}]
                        }
                    }
                }
            };

            const entryCount = numEntries(state)(fakeId);
            expect(entryCount).toEqual(state.elements[fakeId].execution_user_input.entries.length);
        });

        it("numEntries - returns 0 when execution_user_input does not exist", () => {
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

        it("directionalUnExecutedElement - returns elementId if an unexecuted element exists above/below or false", () => {
            const fakeId1 = faker.random.uuid();
            const fakeId2 = faker.random.uuid();
            const fakeId3 = faker.random.uuid();
            const fakeId4 = faker.random.uuid();
            const fakeId5 = faker.random.uuid();

            const state = {
                elementIds: [fakeId1, fakeId2, fakeId3, fakeId4, fakeId5],
                elements: {
                    [fakeId1]: {executed: true},
                    [fakeId2]: {executed: false},
                    [fakeId3]: {executed: true},
                    [fakeId4]: {executed: true},
                    [fakeId5]: {executed: false}
                }
            };

            expect(directionalUnExecutedElement(state)(fakeId2, "before")).toBeFalsy();
            expect(directionalUnExecutedElement(state)(fakeId3, "before")).toEqual(fakeId2);
            expect(directionalUnExecutedElement(state)(fakeId4, "after")).toEqual(fakeId5);
            expect(directionalUnExecutedElement(state)(fakeId5, "after")).toBeFalsy();
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

        it("resetElementsState - resets elements state", () => {
            const state = {
                elementIds: ["garbage_id1", "garbage_id2"],
                elements: {oldelement1: {}, oldelement2: {}},
                elementsViewState: {},
                entriesViewState: {}
            };

            expect(Object.keys(state.elementsViewState).length).toEqual(0);
            expect(Object.keys(state.entriesViewState).length).toEqual(0);
            expect(state.elementIds.length).toEqual(2);
            expect(Object.keys(state.elements).length).toEqual(2);

            resetElementsState(state);

            expect(Object.keys(state.elementIds).length).toEqual(0);
            expect(Object.keys(state.elements).length).toEqual(0);
            expect(Object.keys(state.elementsViewState).length).toEqual(0);
            expect(Object.keys(state.entriesViewState).length).toEqual(0);
        });

        xit("receiveElement - receives a element and updates state", () => {
            const newCmdStep = {
                elem_id: faker.random.uuid(),
                procedure_modification: {
                    justification: {
                        content: "",
                        modification_type: "REDLINE",
                        time_updated: "",
                        user_name: ""
                    }
                },
                execution_user_input: {
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
                entriesViewState: {}
            };

            expect(Object.keys(state.elementsViewState).length).toEqual(0);
            expect(Object.keys(state.entriesViewState).length).toEqual(0);

            receiveElement(state, {element: newCmdStep});

            expect(state.elementIds.length).toEqual(1);
            expect(state.elementIds).toContain(newCmdStep.elem_id);
            expect(state.elements[newCmdStep.elem_id].execution_user_input).toEqual(newCmdStep.execution_user_input);

            // filters out garbage keys
            expect(Object.keys(state.elements[newCmdStep.elem_id])).not.toContain("garbageKey1");
            expect(Object.keys(state.elements[newCmdStep.elem_id])).not.toContain("garbageKey2");
            // new element and entry should also get added to respective view state shapes
            expect(Object.keys(state.elementsViewState).length).toEqual(1);
            expect(Object.keys(state.entriesViewState).length).toEqual(1);
        });

        xit("receiveElement - doesn't throw an error if execution_user_input is not found in element", () => {
            const newBogusStep = {
                elem_id: faker.random.uuid(),
                procedure_modification: {
                    justification: {
                        content: "",
                        modification_type: "REDLINE",
                        time_updated: "",
                        user_name: ""
                    }
                }
            };

            const state = {
                elementIds: [],
                elements: {}
            };

            receiveElement(state, {element: newBogusStep, detailLevel: 2});
            expect(state.elementIds.length).toEqual(1);
            expect(Object.keys(state.elements[newBogusStep.elem_id]).execution_user_input).toBe(undefined);
        });

        xit("updateElementExecution - updates element execution contents (meta_data, results)", () => {
            const fakeElementId = faker.random.uuid();
            const fakeUserName = faker.internet.userName();

            const state = {
                elements: {
                    [fakeElementId]: {
                        executed: true,
                        execution: {
                            meta_data: {},
                            results: {}
                        },
                        execution_user_input: {},
                        run_records: [{executed: true}]
                    }
                }
            };

            updateElementExecution(state, {
                elementId: fakeElementId,
                executed: undefined,
                run_records: undefined
            });

            // run records shouldn't be wiped out by undefined
            expect(state.elements[fakeElementId].run_records.length).toEqual(1);
            // executed should't be wiped out by undefined
            expect(state.elements[fakeElementId].executed).toBeTruthy();

            updateElementExecution(state, {
                elementId: fakeElementId,
                executed: false,
                run_records: [],
                execution: {
                    meta_data: {test_conductor: fakeUserName},
                    results: {status: "PASS"}
                }
            });

            expect(state.elements[fakeElementId].run_records.length).toEqual(0);
            expect(state.elements[fakeElementId].executed).toBeFalsy();
            expect(state.elements[fakeElementId].execution.meta_data.test_conductor).toBe(fakeUserName);
            expect(state.elements[fakeElementId].execution.results.status).toBe("PASS");
        });

        it("moveEntryViewState - updates entries view state on move", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
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

        xit("deleteElement - deletes a specific element from elementIds and elements", () => {
            const state = {
                elementIds: ["destructible", "indestructible"],
                elements: {"destructible": {}, "indestructible": {}}
            };

            expect(state.elementIds.length).toEqual(2);
            expect(Object.keys(state.elements).length).toEqual(2);

            deleteElement(state, {elementId: "destructible"});

            expect(state.elementIds.length).toEqual(1);
            expect(state.elementIds).toContain("indestructible");
            expect(Object.keys(state.elements).length).toEqual(1);
        });

        it("receiveEntryInput - adds an entry to execution_user_input entries state", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            entries: [{"foo": "bar"}]
                        }
                    }
                }
            };

            const fakeObj = {elementId: fakeId, index: 0, key: "someKey", value: "someValue"};
            expect(Object.keys(state.elements[fakeId].execution_user_input.entries[0]).length).toEqual(1);

            receiveEntryInput(state, fakeObj);

            expect(Object.keys(state.elements[fakeId].execution_user_input.entries[0]).length).toEqual(2);
            expect(state.elements[fakeId].execution_user_input.entries[0]).toEqual({"foo": "bar", "someKey": "someValue"});
        });

        it("receiveElementInput - sets an execution_user_input key, value", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            foo: {
                                bar: 'baz'
                            }
                        }
                    }
                }
            };

            expect(state.elements[fakeId].execution_user_input.foo.bar).toEqual('baz');
            const fakeObj = {elementId: fakeId, keyString: "foo.bar", value: 'ham'};

            receiveElementInput(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.foo.bar).toEqual('ham');

        });

        it("receiveElementArrayValue - splices or removes a value of a nested array", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            someKey: {
                                aNestedArray: ['allen', 'holub']
                            }
                        }
                    }
                }
            };
            expect(state.elements[fakeId].execution_user_input.someKey.aNestedArray[1]).toEqual('holub');

            let fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: "hodor", position: 1};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.someKey.aNestedArray[1]).toEqual('hodor');

            fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: null, position: 1};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.someKey.aNestedArray[1]).toEqual(undefined);
            expect(state.elements[fakeId].execution_user_input.someKey.aNestedArray.length).toEqual(1);

            fakeObj = {elementId: fakeId, keyString: "someKey.aNestedArray", value: '', position: 0};
            receiveElementArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.someKey.aNestedArray.length).toEqual(0);
        });

        it("receiveEntryArrayValue - splices or removes a value of a nested array", () => {
            const fakeId = "363c51ea-688b-11e8-adc0-fa7ae01bbebc";
            const state = {
                elements: {
                    [fakeId]: {
                        execution_user_input: {
                            entries: [
                                { widgets: ['a', 'b'] }
                            ]
                        }
                    }
                }
            };
            expect(state.elements[fakeId].execution_user_input.entries[0].widgets).toEqual(['a','b']);

            let fakeObj = {elementId: fakeId, keyString: "widgets", value: "q", targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.entries[0].widgets).toEqual(['q','b']);

            fakeObj = {elementId: fakeId, keyString: "widgets", value: null, targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.entries[0].widgets).toEqual(['b']);

            fakeObj = {elementId: fakeId, keyString: "widgets", value: '', targetIndex: 0, entryIndex: 0};
            receiveEntryArrayValue(state, fakeObj);
            expect(state.elements[fakeId].execution_user_input.entries[0].widgets).toEqual([]);
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

        it("resetState - resets state to initial values", () => {
            const state = {
                executionId: faker.random.uuid(),
                loadingVenueDetails: true,
                elementIds: [faker.random.uuid(), faker.random.uuid()]
            };

            resetState(state);
            expect(state.executionId).toBe(undefined);
            expect(state.loadingVenueDetails).toBe(false);
            expect(state.elementIds.length).toEqual(0);
        });
    });
});

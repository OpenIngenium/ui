import store from "../../../src/modules/execution/execution-store";

describe("As Run Web-Sockets", () => {
    describe("mutations", () => {
        it("execute wait step", () => {
            const state = {
                elements: {
                    'abc-123': {
                        execution_user_input: {
                            value: '123'
                        }
                    }
                }
            };

            expect(state.elements['abc-123'].execution_user_input.value).toBe('123');

            store.mutations.updateElementInputWS(state, {
                elementId: 'abc-123',
                value: {
                    value: '456'
                }
            });

            expect(state.elements['abc-123'].execution_user_input.value).toBe('456');
        });

        xit("add wait step", () => {
            const state = {
                elements: {
                    'abc-123': {
                        execution: {
                            meta_data: {
                                status: 'RUNNING',
                                status_message: '45 left'
                            }
                        }
                    }
                },
                elementIds: ['abc-123']
            };

            expect(Object.keys(state.elements).length).toBe(1);

            store.mutations.receiveElement(state, {
                element: {
                    elem_id: 'abc-456',
                    execution: {
                        meta_data: {
                            status: 'RUNNING',
                            status_message: '55 left'
                        }
                    }
                }, 
                detailLevel: 3
            });

            expect(Object.keys(state.elements).length).toBe(2);
        });

        xit("delete wait step", () => {
            const state = {
                elements: {
                    'abc-123': {
                        execution: {
                            meta_data: {
                                status: 'RUNNING',
                                status_message: '45 left'
                            }
                        }
                    }
                },
                elementIds: ['abc-123']
            };

            expect(Object.keys(state.elements).length).toBe(1);

            store.mutations.deleteElement(state, {
                elementId: 'abc-123'
            });

            expect(Object.keys(state.elements).length).toBe(0);
        });

        it("edit wait step input", () => {
            const state = {
                elements: {
                    'abc-123': {
                        execution: {
                            meta_data: {
                                value: '123'
                            }
                        }
                    }
                },
                elementIds: ['abc-123']
            };

            expect(state.elements['abc-123'].execution.meta_data.value).toBe('123');

            store.mutations.updateElementWebsocketsMetaData(state, {
                elementId: 'abc-123', 
                value: {
                    value: '456'
                }
            });

            expect(state.elements['abc-123'].execution.meta_data.value).toBe('456');
        });

        xit("edit wait step", () => {
            const state = {
                elements: {
                    elem_id: 'abc-123',
                    value: 'a',
                    execution: {
                        meta_data: {
                            status: 'RUNNING',
                            status_message: '45 left'
                        }
                    }
                },
                elementIds: ['abc-123']
            };

            expect(state.elements.value).toBe('a');

            store.mutations.receiveElement(state, {
                element: {
                    elem_id: 'abc-123',
                    value: 'b',
                    execution: {
                        meta_data: {
                            status: 'RUNNING',
                            status_message: '45 left'
                        }
                    }
                },
                detailLevel: 3
            });

            expect(state.elements.value).toBe('a');
        });

        xit("wait step returns execution results", () => {
            const state = {
                elements: {
                    elem_id: 'abc-123',
                    execution: {
                        meta_data: {
                            status: 'RUNNING',
                            status_message: '45 left'
                        }
                    }
                },
                elementIds: ['abc-123']
            };

            expect(Object.keys(state.elements).length).toBe(2);

            store.mutations.receiveElement(state, {
                element:  {
                    elem_id: 'abc-456',
                    execution: {
                        meta_data: {
                            status: 'RUNNING',
                            status_message: '50 left'
                        }
                    }
                },
                detailLevel: 3
            });

            expect(Object.keys(state.elements).length).toBe(3);
        });
    });
});

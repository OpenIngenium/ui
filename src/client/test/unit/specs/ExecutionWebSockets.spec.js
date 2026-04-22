import store from "../../../src/modules/execution/execution-store";

describe("Execution Web-Sockets", () => {
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
    });
});
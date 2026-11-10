import store from "../../../../src/modules/elements/executable/cmd/cmd-store";

describe("Store cmd-store.js", () => {
    describe("getters", () => {
        it("selectedCmdObj", () => {
            let selectedCmdObj = { key: "value" };
            
            const state = {
                selectedCmdObj: selectedCmdObj
            }; 

            let selectedCmdObj_result = store.getters.selectedCmdObj(state); 
            
            expect(selectedCmdObj_result).toBe(selectedCmdObj);
        }); 

        it("selectedCmdObjArgs", () => {
            let selectedCmdObjArgs = [
                { key: "value" },
                { key: "value" }
            ];
            
            const state = {
                selectedCmdObjArgs: selectedCmdObjArgs
            }; 

            let selectedCmdObjArgs_result = store.getters.selectedCmdObjArgs(state); 

            expect(selectedCmdObjArgs_result.length).toBe(2);
            expect(selectedCmdObjArgs_result).toBe(selectedCmdObjArgs);
        }); 

        it("selectedCmdObjRepeatArgs", () => {
            let selectedCmdObjRepeatArgs = [
                { key: "value" },
                { key: "value" }
            ];
            
            const state = {
                selectedCmdObjRepeatArgs: selectedCmdObjRepeatArgs
            }; 

            let selectedCmdObjRepeatArgs_result = store.getters.selectedCmdObjRepeatArgs(state);

            expect(selectedCmdObjRepeatArgs_result.length).toBe(2);
            expect(selectedCmdObjRepeatArgs_result).toBe(selectedCmdObjRepeatArgs);
        });

        it("repeatArgsTemplate", () => {
            let repeatArgsTemplate = { key: "value" };
            
            const state = {
                repeatArgsTemplate: repeatArgsTemplate
            }; 

            let repeatArgsTemplate_result = store.getters.repeatArgsTemplate(state); 
            
            expect(repeatArgsTemplate_result).toBe(repeatArgsTemplate);
        });

        it("commandString", () => {
            let commandString = "command_string";
            
            const state = {
                commandString: commandString
            }; 

            let commandString_result = store.getters.commandString(state); 
            
            expect(commandString_result).toBe(commandString);
        });

        it("commandBuilderCount", () => {
            let commandBuilderCount = 2;
            
            const state = {
                cmdBuilderCount: commandBuilderCount
            };

            let commandBuilderCount_result = store.getters.cmdBuilderCount(state);

            expect(commandBuilderCount_result).toBe(commandBuilderCount);
        });
    });
    describe("mutations", () => {
        it("setBooleanKey - set loadingCmds indicator true/false", () => {
            const state = {
                loadingCmds: true
            };

            expect(state.loadingCmds).toBe(true);

            store.mutations.setBooleanKey(state, {
                key: "loadingCmds",
                bool: false
            });

            expect(state.loadingCmds).toBe(false);
        });

        it("receiveBuilderCmds - receive a cmd in state", () => {
            const state = {
                cmds: "before",
                total: 0
            };

            expect(state.cmds).toBe("before");
            expect(state.total).toBe(0);

            store.mutations.receiveBuilderCmds(state, {
                cmds: "after",
                total: 1
            });

            expect(state.builderCmds).toBe("after");
            expect(state.cmdBuilderCount).toBe(1);
        });

        it("receiveFlightCmdDetails - receive a flight cmd detail", () => {
            const state = {
                cmds: "before"
            };

            expect(state.cmds).toBe("before");

            store.mutations.receiveFlightCmdDetails(state, {
                cmds: "after"
            });

            expect(state.cmdDetails).toBe("after");
        });

        it("setArg - set an argument value for a command", () => {
            const state = {
                selectedCmdObjArgs: [
                    {
                        argument_value: "blah"
                    }
                ]
            };

            const event_before = {
                argumentIndex: 0,
                argumentValue: "blah"
            };

            expect(state.selectedCmdObjArgs[event_before.argumentIndex].argument_value).toBe(event_before.argumentValue);

            const event_after = {
                argumentIndex: 0,
                argumentValue: "nah"
            };

            store.mutations.setArg(state, event_after);

            expect(state.selectedCmdObjArgs[event_before.argumentIndex].argument_value).toBe(event_after.argumentValue);
        });

        it("setRepeatArg - set a repeat argument value for a command", () => {
            const state = {
                selectedCmdObjRepeatArgs: [
                    [
                        {
                            argument_value: "blah"
                        }
                    ]
                ]
            };

            const event_before = {
                sectionIndex: 0,
                argumentIndex: 0,
                argumentValue: "blah"
            };

            expect(state.selectedCmdObjRepeatArgs[event_before.sectionIndex][event_before.argumentIndex].argument_value).toBe(event_before.argumentValue);

            const event_after = {
                sectionIndex: 0,
                argumentIndex: 0,
                argumentValue: "nah"
            };

            store.mutations.setRepeatArg(state, event_after);

            expect(state.selectedCmdObjRepeatArgs[event_before.sectionIndex][event_before.argumentIndex].argument_value).toBe(event_after.argumentValue);
        });
    });
});
import store from "../../../../src/modules/elements/executable/cmd-sse/cmd-store";

describe("Store cmd-sse-store.js", () => {
    describe("getters", () => {
        it("evrs - get a list of all cmds currently in the store.", () => {
            let cmdValues = [{
                cmd_description: "Constrols description",
                command_stem: "bridge1553 cut",
                operations_category: "SSE"
            }];
            
            const state = {
                cmds: cmdValues
            }; 

            let cmds = store.getters.cmds(state); 
            expect(cmds.length).toBe(1);
            expect(cmds).toBe(cmdValues);
        }); 

        it("cmdCount - get the count of all the cmds currently in the store.", () => {
            let count = 5;
            const state = {
                cmdCount: count
            };

            let cmdCount = store.getters.cmdCount(state);
            expect(cmdCount).toBe(count);
        });
    });

    describe("cmdSseDetails", () => {
        it("receives details on a command stem", () => {
            const cmdSseDetails = [{
                arguments: [{
                    argument_description: "argument_description",
                    argument_type: "argument_type",
                }],
                cmd_description: "description example",
                dictionary_version: "m2020edl_sse",
                operations_category: "SSE"
            }];

            const state = {
                cmdSseDetails
            };

            let details = store.getters.cmdSseDetails(state);
            expect(details).toBe(cmdSseDetails);
        });


        it("receives and mutates cmdSsseDetails", () => {
            const state = {
                cmds: [],
                cmdCount: 0,
                cmdSseDetails: []
            };

            const payload = [{
                arguments: [{
                    argument_description: "argument_description",
                    argument_type: "argument_type",
                }],
                cmd_description: "description example",
                dictionary_version: "m2020edl_sse",
                operations_category: "SSE"
            }];


            store.mutations.receiveCmdSseDetails(state, {
                cmds: [],
                cmdCount: 0,
                cmdSseDetails: payload
            });

            expect(state.cmdSseDetails.length).toBe(1);
            expect(state.cmdSseDetails).toBe(payload);
        });
    });


    describe("mutations", () => {
        it("receiveCmds - adds Cmds and total", () => {

            const cmdPayload = [
                {
                    cmd_description: "Constrols description",
                    command_stem: "bridge1553 cut",
                    operations_category: "SSE"
                
                },
                {
                    cmd_description: "Test data 2",
                    command_stem: "bridge1553 cut 2",
                    operations_category: "SSE"
                }
            ];

            const total = 10;
            const state = {
                cmds: [],
                cmdCount: 0
            };

            expect(state.cmds.length).toBe(0);
            expect(state.cmdCount).toBe(0);

            store.mutations.receiveCmds(state, {
                cmds: cmdPayload,
                total: total
            });

            expect(state.cmds.length).toBe(cmdPayload.length);
            expect(state.cmdCount).toBe(total);
            expect(state.cmdCount).toEqual(jasmine.any(Number));
        });

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
    });
});
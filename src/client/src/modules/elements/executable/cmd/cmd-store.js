import dictionaryApi from "../../../../api/dictionary";

import { deepCopy } from "../../../common/utils";

// initial state
const state = {
    builderCmds: [],
    cmdBuilderCount: 0,
    cmdDetails: [],
    commandString: "",
    selectedCmdObj: undefined, // command in object format
    selectedCmdObjArgs: [],
    repeatArgsTemplate: [],
    selectedCmdObjRepeatArgs: []
};

const getters = {
    builderCmds: state => state.builderCmds,
    cmdBuilderCount: state => state.cmdBuilderCount,
    selectedCmdObj: state => state.selectedCmdObj,
    commandString: state => state.commandString,
    selectedCmdObjArgs: state => state.selectedCmdObjArgs,
    selectedCmdObjRepeatArgs: state => state.selectedCmdObjRepeatArgs,
    repeatArgsTemplate: state => state.repeatArgsTemplate,
    cmdDetails: state => state.cmdDetails,

    numberOfArgs: function(state) {
        return state.selectedCmdObjArgs.length;
    },
    numberOfSections: function(state) {
        return state.selectedCmdObjRepeatArgs.length;
    },
    numberOfRepeatArgs: function(state) {
        return state.selectedCmdObjRepeatArgs.length * state.repeatArgsTemplate.length;
    },
    numberOfTotalArgs: function(state) {
        return (state.selectedCmdObjRepeatArgs.length * state.repeatArgsTemplate.length) 
            + state.selectedCmdObjArgs.length;
    }
};

const actions = {
    async fetchFlightCmds({commit}, options) {
        commit("setBooleanKey", {key: "loadingCmds", bool: true});
        const { cmds, total } = await dictionaryApi.getFlightCmds(options);
        commit("receiveBuilderCmds", { cmds, total });
        commit("setBooleanKey", {key: "loadingCmds", bool: false});
    },
    async setCmd({commit}, options) {
        commit("setBooleanKey", {key: "loadingCmd", bool: true});
        options.wild = true;
        const { cmds } = await dictionaryApi.getFlightCmds(options);
        const args = {
            cmd: cmds,
            cmdArgs: options.cmdArgs
        };
        commit("setCmd", args);
        commit("setBooleanKey", {key: "loadingCmd", bool: false});
    },

    async fetchCmdDetails({commit}, options) {
        commit("setBooleanKey", {key: "loadingCmdStringDetails", bool: true});
        options.wild = true;
        const { cmds } = await dictionaryApi.getFlightCmds(options);
        commit("receiveFlightCmdDetails", { cmds });
        commit("setBooleanKey", {key: "loadingCmdStringDetails", bool: false});
    },

    async setArg({commit}, arg) {
        commit("setArg", arg);
    },
    async setRepeatArg({commit}, arg) {
        commit("setRepeatArg", arg);
    },
    async addSection({commit}) {
        commit("addSection");
    },
    async removeSection({commit}, position) {
        commit("removeSection", position);
    },
    async setCmdArguments({commit}, options){
        commit("setCmdArguments", options);
    }
};

const mutations = {
    setBooleanKey(state, { key, bool }) {
        state[key] = bool;
    },
    receiveBuilderCmds(state, { cmds, total }) {
        state.builderCmds = cmds;
        state.cmdBuilderCount = total;
    },

    receiveFlightCmdDetails(state, {cmds}) {
        state.cmdDetails = cmds; 
    },

    setCmd(state, options) {
        //clear out previous state
        const cmd = options.cmd;
        const cmdArgs = (options.cmdArgs != undefined ? options.cmdArgs : []);

        state.selectedCmdObjArgs = [];
        state.selectedCmdObjRepeatArgs = [];
        state.selectedCmdObj = undefined;
        state.repeatArgsTemplate = [];

        state.selectedCmdObj = cmd;
        state.commandString = cmd.command_stem;

        // check if args are present
        if (cmd.arguments.length > 0) {
            // set the arguments
            state.selectedCmdObjArgs = cmd.arguments.filter((argument) => {
                return argument.repeat_arg === "No";
            });

            // add argument_value key
            state.selectedCmdObjArgs.map(argument => {
                argument.argument_value = "";
            });
        }
        
        // check if repeat arguments are allowed
        if (state.selectedCmdObj.repeat_max > 0) {
            // set repeat arguments template
            state.repeatArgsTemplate = cmd.arguments.filter((argument) => {
                return argument.repeat_arg === "Yes";
            });

            // add argument_value key
            state.repeatArgsTemplate.map(argument => {
                argument.argument_value = "";
            });
        
            // set the first repeat arg, keep in mind repeat min value
            for(let i = 0; i < cmd.repeat_min; i++) {
                state.selectedCmdObjRepeatArgs.push(deepCopy(state.repeatArgsTemplate));
            }
        }
        // command string is populated with value
        if (cmdArgs.length > 0) {
            if (cmdArgs.length > state.selectedCmdObjRepeatArgs.length + state.selectedCmdObjArgs) {
                let sections = (state.selectedCmdObjArgs.length - state.selectedCmdObjRepeatArgs.length + 
                    state.selectedCmdObjArgs.length) / state.selectedCmdObjRepeatArgs.length;

                for(let i = 0; i < sections; i++) {
                    state.selectedCmdObjRepeatArgs.push(deepCopy(state.repeatArgsTemplate));
                }
            }
        
            let numberOfTotalArgs = (state.selectedCmdObjRepeatArgs.length * state.repeatArgsTemplate.length) 
            + state.selectedCmdObjArgs.length;

            if (cmdArgs.length == numberOfTotalArgs) {
                let cmdArgCtr = 0;
                // set all the regular arguments
                for(let i = 0; i < state.selectedCmdObjArgs.length; i++) {
                    state.selectedCmdObjArgs[i].argument_value = cmdArgs[cmdArgCtr];
                    cmdArgCtr++;
                }
                // set all the repeat arguments
                for(let i = 0; i < state.selectedCmdObjRepeatArgs.length; i++) {
                    for(let j = 0; j < state.selectedCmdObjRepeatArgs.length; j++) {
                        state.selectedCmdObjRepeatArgs[i][j].argument_value = cmdArgs[cmdArgCtr];
                        cmdArgCtr++;
                    }
                }
            }
        }
    },
    setArg(state, event) {
        state.selectedCmdObjArgs[event.argumentIndex].argument_value = event.argumentValue;
    },
    setRepeatArg(state, event){
        state.selectedCmdObjRepeatArgs[event.sectionIndex][event.argumentIndex].argument_value = event.argumentValue;
    },
    addSection(state) {
        if (state.selectedCmdObjRepeatArgs.length < state.selectedCmdObj.repeat_max) {
            state.selectedCmdObjRepeatArgs.push(deepCopy(state.repeatArgsTemplate));
        } //else; error you can't add more than the max amount of repeat args
    },
    removeSection(state, position) {
        if (state.selectedCmdObjRepeatArgs.length > position) {
            state.selectedCmdObjRepeatArgs.splice(position, 1);
        }
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

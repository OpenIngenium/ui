import dictionaryApi from "../../../../api/dictionary";

// initial state
const state = {
    cmds: [],
    cmdSseDetails: [],
    cmdCount: 0
};

const getters = {
    cmds: state => state.cmds,
    cmdCount: state => state.cmdCount,
    cmdSseDetails: state => state.cmdSseDetails,
};


const actions = {
    async fetchCmds({commit}, options) {
        commit("setBooleanKey", {key: "loadingCmds", bool: true});
        const { cmds, total } = await dictionaryApi.getSseCmds(options);
        commit("receiveCmds", { cmds, total });
        commit("setBooleanKey", {key: "loadingCmds", bool: false});  
    },

    async fetchCmdSseDetails({commit}, options) {
        commit("setBooleanKey", {key: "loadingCmdStringDetails", bool: true});
        const { cmdSseDetails } = await dictionaryApi.getSseCmdDetails(options);
        commit("receiveCmdSseDetails", { cmdSseDetails });
        commit("setBooleanKey", {key: "loadingCmdStringDetails", bool: false});
    }
};

const mutations = {
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },

    receiveCmds(state, {cmds, total}) {
        state.cmds = cmds;
        state.cmdCount = total;
    },
    
    receiveCmdSseDetails(state, {cmdSseDetails}) {
        state.cmdSseDetails = cmdSseDetails; 
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};
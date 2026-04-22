import dictionaryApi from "../../../../api/dictionary";

// initial state
const state = {
    evrs: [],
    evrCount: 0
};

const getters = {
    evrs: state => state.evrs,
    evrCount: state => state.evrCount
};

const actions = {
    async fetchFlightEvrs({commit}, options) {
        commit("setBooleanKey", {key: "loadingEvrs", bool: true});
        const { evrs, total } = await dictionaryApi.getFlightEvrs(options);
        commit("receiveEvrs", { evrs, total });
        commit("setBooleanKey", {key: "loadingEvrs", bool: false});
    },
    async fetchSseEvrs({commit}, options) {
        commit("setBooleanKey", {key: "loadingEvrs", bool: true});
        const { evrs, total } = await dictionaryApi.getSseEvrs(options);
        commit("receiveEvrs", { evrs, total });
        commit("setBooleanKey", {key: "loadingEvrs", bool: false});
    }
};

const mutations = {
    setBooleanKey(state, { key, bool }) {
        state[key] = bool;
    },
    receiveEvrs(state, { evrs, total }) {
        state.evrs = evrs;
        state.evrCount = total;
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};
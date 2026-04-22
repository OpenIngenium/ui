import dictionaryApi from "../../api/dictionary";
import _ from "lodash";

// initial state
const initialState = () => {
    return {
        flightDictionaries: [],
        sseDictionaries: [],
    };
};

const state = initialState();

const getters = {
    flightDictionaries: function(state) {
        let returnArray = [];
        state.flightDictionaries.forEach(dict => {
            if(dict.state === "PUBLISHED" || dict.state === "RELEASED")
                returnArray = [...returnArray, dict];
        });
        return returnArray;
    },
    sseDictionaries: function(state) {
        let returnArray = [];
        state.sseDictionaries.map(dict => {
            if(dict.state === "PUBLISHED" || dict.state === "RELEASED")
                returnArray = [...returnArray, dict];
        });
        return returnArray;
    }
};

/* istanbul ignore next */
const actions = {
    async fetchFlightDictionaries({commit}, options = {}) {
        const { data } = await dictionaryApi.getFlightDictionaries(options);
        commit("receiveDictionary", {type: "flight", data});
    },
    async fetchSseDictionaries({commit}, options = {}) {
        const { data } = await dictionaryApi.getSseDictionaries(options);
        commit("receiveDictionary", {type: "sse", data});
    }
};

const mutations = {
    setStateKey(state, {key, val}) {
        state[key] = val;
    },
    receiveDictionary(state, {type, data}) {
        if(type === "flight")
            state.flightDictionaries = [];
        else if(type === "sse")
            state.sseDictionaries = [];

        data.map(dict => {
            switch(type){
            case "flight": {
                state.flightDictionaries = [...state.flightDictionaries, dict];
                // state.flightDictionaries.push(dict);
                break;
            }
            case "sse": {
                state.sseDictionaries = [...state.sseDictionaries, dict];
                // state.sseDictionaries.push(dict);
                break;
            }
            }
        });
    },
};

export default {
    state,
    mutations,
    actions,
    getters
};

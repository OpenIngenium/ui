import dictionaryApi from "../../../../api/dictionary";
import _ from "lodash";

// initial state
const state = {
    ehas: [],
    ehaCount: 0,

    // euPresents is an object that maps "<channel-type>-<dictionary-version>-<channel-name>" to eu_present status
    //   { `${channelType}-${dictionaryVersion}-${channelName}`: `${euPresent}` }
    euPresents: {},

    // enumerations is an object that maps "<channel-type>-<dictionary-version>-<channel-name>" to enumerations object
    //   { `${channelType}-${dictionaryVersion}-${channelName}`: `${enumerationsObject}` }
    enumerations: {},

    // ehaTypes is an object that maps "<channel-type>-<dictionary-version>-<channel-name>" to ehaTypes object
    //   { `${channelType}-${dictionaryVersion}-${channelName}`: `${ehaTypeOnject}` }
    ehaTypes: {},

};


const getters = {
    ehas: state => state.ehas,
    ehaCount: state => state.ehaCount,
    euPresent: state => (channelType, dictionaryVersion, channelName) => {
        return _.get(state.euPresents, `${channelType}-${dictionaryVersion}-${channelName}`, null);
    },
    enumeration: state => (channelType, dictionaryVersion, channelName) => {
        return _.get(state.enumerations, `${channelType}-${dictionaryVersion}-${channelName}`, null);
    },
    enumerations: state => state.enumerations,
    ehaType: state => (channelType, dictionaryVersion, channelName) => {
        return _.get(state.ehaTypes, `${channelType}-${dictionaryVersion}-${channelName}`, null);
    },
};


const actions = {
    async fetchFlightEhas({commit}, options) {
        commit("setBooleanKey", {key: "loadingEhas", bool: true});
        const { ehas, total } = await dictionaryApi.getFlightEhas(options);
        commit("receiveEhas", { ehas, total });
        commit("setBooleanKey", {key: "loadingEhas", bool: false});
    },

    async fetchSseEhas({commit}, options) {
        commit("setBooleanKey", {key: "loadingEhas", bool: true});
        const { ehas, total } = await dictionaryApi.getSseEhas(options);
        commit("receiveEhas", { ehas, total });
        commit("setBooleanKey", {key: "loadingEhas", bool: false});
    },

    async fetchFlightEhasEuPresentAndEhasType({commit, getters}, {channelType, dictionaryVersion, channelName}) {
        if (dictionaryVersion) {
            const { ehas } = await dictionaryApi.getFlightEhas({
                dictionaryVersion: dictionaryVersion,
                channel_name: channelName,
            });


            if ('eu_present' in ehas && ehas.eu_present === 'Yes') {
                commit('setEuPresents', {
                    channelType: channelType,
                    dictionaryVersion: dictionaryVersion,
                    channelName: channelName,
                    val: true,
                });
            }
            else {
                commit('setEuPresents', {
                    channelType: channelType,
                    dictionaryVersion: dictionaryVersion,
                    channelName: channelName,
                    val: false,
                });
            }

            commit('setEhasType', {
                channelType: channelType,
                dictionaryVersion: dictionaryVersion,
                channelName: channelName,
                val: ehas.eha_type,
            });
        }
    },

    async fetchSseEhasEuPresentAndEhasType({commit, getters}, {channelType, dictionaryVersion, channelName}) {
        if (dictionaryVersion) {
            const { ehas } = await dictionaryApi.getSseEhas({
                dictionaryVersion: dictionaryVersion,
                channel_name: channelName,
            });

            if ('eu_present' in ehas && ehas.eu_present === 'Yes') {
                commit('setEuPresents', {
                    channelType: channelType,
                    dictionaryVersion: dictionaryVersion,
                    channelName: channelName,
                    val: true,
                });
            }
            else {
                commit('setEuPresents', {
                    channelType: channelType,
                    dictionaryVersion: dictionaryVersion,
                    channelName: channelName,
                    val: false,
                });
            }

            commit('setEhasType', {
                channelType: channelType,
                dictionaryVersion: dictionaryVersion,
                channelName: channelName,
                val: ehas.eha_type,
            });
        }
    },

    async fetchFlight1553EuEn({commit, getters}, {channelType, dictionaryVersion, channelName}) {
        if (dictionaryVersion) {
            // Call API to fetch 1553
            const res = await dictionaryApi.getFlight1553({
                dictionaryVersion: dictionaryVersion,
                mil1553_name: channelName,
            });

            if (res) {
                const mil1553 = res.mil1553;
                // Set euPresents
                if ('eu_present' in mil1553 && mil1553.eu_present === 'Yes') {
                    commit('setEuPresents', {
                        channelType: channelType,
                        dictionaryVersion: dictionaryVersion,
                        channelName: channelName,
                        val: true,
                    });
                }
                else {
                    commit('setEuPresents', {
                        channelType: channelType,
                        dictionaryVersion: dictionaryVersion,
                        channelName: channelName,
                        val: false,
                    });
                }
                // Set enumerations
                if ('enumerations' in mil1553) {
                    commit('setEnumerations', {
                        channelType: channelType,
                        dictionaryVersion: dictionaryVersion,
                        channelName: channelName,
                        val: mil1553.enumerations,
                    });
                }
                else {
                    commit('setEnumerations', {
                        channelType: channelType,
                        dictionaryVersion: dictionaryVersion,
                        channelName: channelName,
                        val: [],
                    });
                }
            }
        }
    },
};

const mutations = {
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },

    receiveEhas(state, {ehas, total}) {
        state.ehas = ehas;
        state.ehaCount = total;
    },

    setEuPresents(state, {channelType, dictionaryVersion, channelName, val}) {
        state.euPresents = {...state.euPresents, [`${channelType}-${dictionaryVersion}-${channelName}`]: val};
    },

    setEnumerations(state, {channelType, dictionaryVersion, channelName, val}) {
        state.enumerations = {...state.enumerations, [`${channelType}-${dictionaryVersion}-${channelName}`]: val};
    },
    setEhasType(state, {channelType, dictionaryVersion, channelName, val}) {
        state.ehaTypes = {...state.ehaTypes, [`${channelType}-${dictionaryVersion}-${channelName}`]: val};
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

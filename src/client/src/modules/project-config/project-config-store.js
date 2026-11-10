import dictionaryApi from '../../api/dictionary';
import Vue from "vue";
import _ from "lodash";

// initial state
const state = {
    flight: {},
    flightIndex: [], // had to add this for filtering
    flightParsers: [],
    flightUploadResults: {},

    sse: {},
    sseIndex: [], // had to add this for filtering
    sseParsers: [],
    sseUploadResults: {},

    vis: {},
    visParsers: [],
    visCount: 0,
    visUploadResults: {},

    customScripts: {},
    customScriptsCount: 0,
    customScriptsParsers: [],
    customScriptsUploadResults: {},
    totalCount: 0
};

const getters = {
    flight: state => state.flight,
    flightTotalCount: state => state.flight.total_count,
    flightParsers: state => state.flightParsers,
    flightIndex: state => state.flightIndex,
    flightVersions: state => (version, type) => {
        if(state.flight[version]) {
            return state.flight[version][type];
        }
        return [];
    },
    flightVersion: state => (version) => { return state.flight[version]; },
    flightUploadResults: state => state.flightUploadResults,

    sse: state => state.sse,
    sseTotalCount: state => state.sse.total_count,
    sseParsers: state => state.sseParsers,
    sseIndex: state => state.sseIndex,
    sseVersions: state => (version, type) => { return state.sse[version][type]; },

    vis: state => state.vis,
    visCount: state => state.visCount,
    visUploadResults: state => state.visUploadResults,

    customScripts: state => state.customScripts,
    customScriptsCount: state => state.customScriptsCount,
    customScriptsUploadResults: state => state.customScriptsUploadResults,

    sseVersion: state => (version) => { return state.sse[version]; },
    sseUploadResults: state => state.sseUploadResults,

    details: function(state) {
        return({dict_type, version, type, id}) => {
            if(state[dict_type][version][type] !== undefined)
                return state[dict_type][version][type][id];
            else
                return {};
        };
    },

    customScriptDetails: function(state) {
        return({scriptId}) => {
            let customScript = {};
            if(state.customScripts[scriptId] !== undefined) {
                customScript = state.customScripts[scriptId];
            }
            return customScript;
        };
    },

    customScriptIdByPath: function(state) {
        return({scriptPath}) => {
            for (let key in state.customScripts) {
                let customScript = state.customScripts[key];
                if (customScript.script_path === scriptPath) {
                    return customScript.script_id;
                }
            }
            return '';
        };
    },

    totalCount: function(state) {
        return({dict_type, version, type}) => {
            if(state[dict_type] !== undefined)
                return state[dict_type][version][type].total_count;
            else
                return 0;
        };
    }
};

const actions = {
    async fetchFlightDicts({commit}, options) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        const { data, total } = await dictionaryApi.getFlightDictionaries(options);
        commit("receiveDictionaries", { type: 'flight', dictionaries: data, total });
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async fetchSseDicts({commit}, options) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        const { data, total } = await dictionaryApi.getSseDictionaries(options);
        commit("receiveDictionaries", { type: 'sse', dictionaries: data, total });
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async fetchVersion({commit}, {dict_type, version, type, options}) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        // fetch particular dict used for this sse version
        options.dictionaryVersion = version;
        switch(type) {
        case "evrs": {
            let { evrs, total } = dict_type === "sse" ? await dictionaryApi.getSseEvrs(options) : await dictionaryApi.getFlightEvrs(options);
            commit("receiveVersions", { dict_type, version, type, versions: evrs, total });
            break;
        }
        case "ehas": {
            let { ehas, total } = dict_type === "sse" ? await dictionaryApi.getSseEhas(options) : await dictionaryApi.getFlightEhas(options);
            commit("receiveVersions", { dict_type, version, type, versions: ehas, total });
            break;
        }
        case "cmds": {
            let { cmds, total } = dict_type === "sse" ? await dictionaryApi.getSseCmds(options) : await dictionaryApi.getFlightCmds(options);
            commit("receiveVersions", { dict_type, version, type, versions: cmds, total });
            break;
        }
        case "mil1553": {
            let { mil1553, total } = dict_type === "sse" ? await dictionaryApi.getSse1553(options) : await dictionaryApi.getFlight1553(options);
            commit("receiveVersions", { dict_type, version, type, versions: mil1553, total });
            break;
        }
        }
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async updateFlightDict({commit, dispatch}, {version, state=null, description="", file=null}) {
        let retVal = false;
        // Update dictionary
        await dictionaryApi.patchFlightDictionary(
            version, state, description, file
        ).then((response) => {
            if(response) {
                if(response.upload_results && !_.isEmpty(response.upload_results)) {
                    commit("receiveUploadResults", {type: "flight", uploadResults: response.upload_results});
                    retVal = true;
                }
                else if(response.dictionary_info && !_.isEmpty(response.dictionary_info)) {
                    retVal = true;
                }
            }
        });

        return retVal;
    },
    async clearFlightUploadResults({commit}) {
        commit("receiveUploadResults", {type: "flight", uploadResults: {}});
    },
    async deleteFlightDict({dispatch}, {version}) {
        await dictionaryApi.deleteFlightDictionary(version);
        dispatch("fetchFlightDicts", {});
    },

    async fetchDictItem({commit}, {dict_type, version, type, options, id}) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        // fetch particular dict used for this sse version
        options.dictionaryVersion = version;
        switch(type) {
        case "evrs": {
            options.evr_name = id;
            let { evrs } = dict_type === "sse" ? await dictionaryApi.getSseEvrs(options) : await dictionaryApi.getFlightEvrs(options);
            commit("receiveDictItem", { dict_type, version, type, item: evrs });
            break;
        }
        case "ehas": {
            options.eha_name = id;
            options.wild = true;
            let { ehas } = dict_type === "sse" ? await dictionaryApi.getSseEhas(options) : await dictionaryApi.getFlightEhas(options);
            commit("receiveDictItem", { dict_type, version, type, item: ehas });
            break;
        }
        case "cmds": {
            options.command_stem = id;
            options.wild = true;
            let { cmds } = dict_type === "sse" ? await dictionaryApi.getSseCmds(options) : await dictionaryApi.getFlightCmds(options);
            commit("receiveDictItem", { dict_type, version, type, item: cmds });
            break;
        }
        case "mil1553": {
            options.mil1553_name = id;
            let { mil1553 } = dict_type === "sse" ? await dictionaryApi.getSse1553(options) : await dictionaryApi.getFlight1553(options);
            commit("receiveDictItem", { dict_type, version, type, item: mil1553 });
            break;
        }
        }
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async updateSseDict({commit, dispatch}, {version, state=null, description="", file=null}) {
        let retVal = false;
        // Update dictionary
        await dictionaryApi.patchSseDictionary(
            version, state, description, file
        ).then((response) => {
            if(response) {
                if(response.upload_results && !_.isEmpty(response.upload_results)) {
                    commit("receiveUploadResults", {type: "sse", uploadResults: response.upload_results});
                    retVal = true;
                }
                else if(response.dictionary_info && !_.isEmpty(response.dictionary_info)) {
                    retVal = true;
                }
            }
        });

        return retVal;
    },
    async clearSseUploadResults({commit}) {
        commit("receiveUploadResults", {type: "sse", uploadResults: {}});
    },
    async deleteSseDict({dispatch}, {version}) {
        await dictionaryApi.deleteSseDictionary(version);
        dispatch("fetchSseDicts", {});
    },

    async fetchVIs({commit}, options) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        let { data, total } = await dictionaryApi.getVIs(options);
        commit("receiveVIs", { vis: data, total });
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async clearVisUploadResults({commit}) {
        commit("receiveUploadResults", {type: "vis", uploadResults: {}});
    },

    async fetchCustomScripts({commit}, options) {
        commit("setBooleanKey", {key: "fetchLoading", bool: true});
        let { data, total } = await dictionaryApi.getCustomScripts(options);
        commit("receiveCustomScripts", { customScripts: data, total });
        commit("setBooleanKey", {key: "fetchLoading", bool: false});
    },
    async clearCustomScriptsUploadResults({commit}) {
        commit("receiveUploadResults", {type: "customScripts", uploadResults: {}});
    },
    async updateCustomScriptsStatus({dispatch}, {name, status}) {
        await dictionaryApi.patchCustomScripts(name, status);
    },
    async deleteCustomScript({dispatch}, {script_id}) {
        return await dictionaryApi.deleteCustomScript(script_id);
    }
};

const mutations = {
    receiveDictionaries(state, { dictionaries, total }) {
        dictionaries = !Array.isArray(dictionaries) ? [dictionaries] : dictionaries; // if dictionaries is not a list

        if(dictionaries.length > 0) {
            // clear out previous dictionary index states
            state[`${dictionaries[0].dictionary_type}Index`] = [];

            // clear out previous dictionary states
            state[dictionaries[0].dictionary_type][dictionaries[0].dictionary_version] = {};

            // set total_count for dictionary
            state[dictionaries[0].dictionary_type].total_count = total;

            dictionaries.map(dictionary => {
                // set this for pagination and filtering purposes
                state[`${dictionary.dictionary_type}Index`].push(dictionary);

                // TODO this may overwrite existing cmds, ehas, evrs, etc...
                // add in types for future population
                dictionary = {...dictionary, evrs: {}, ehas: {}, mil1553: {}, cmds: {}};
                state[dictionary.dictionary_type] = {...state[dictionary.dictionary_type], [dictionary.dictionary_version]: dictionary};
            });
        }
    },
    receiveVersions(state, {dict_type, version, type, versions, total}) {
        if(state[dict_type][version] !== undefined && versions !== undefined){

            // clear out the version state
            state[dict_type][version][type] = {};

            // store total_count
            state[dict_type][version][type] = {...state[dict_type][version][type], total_count: total};

            // set the version's individual fields.
            versions.map(ver => {
                // handle evrs, ehas, cmds, and mil1553 here...
                switch(type) {
                case "evrs":
                    state[dict_type][version][type] = {...state[dict_type][version][type], [ver.evr_name]: ver};
                    break;
                case "ehas":
                    state[dict_type][version][type] = {...state[dict_type][version][type], [ver.channel_name]: ver};
                    break;
                case "mil1553":
                    state[dict_type][version][type] = {...state[dict_type][version][type], [ver.mil1553_name]: ver};
                    break;
                case "cmds":
                    state[dict_type][version][type] = {...state[dict_type][version][type], [ver.command_stem]: ver};
                    break;
                }
            });
        }
    },
    receiveDictItem(state, {dict_type, version, type, item}) {
        if(item !== undefined) {
            switch(type) {
            case "evrs": {
                if (item.hasOwnProperty('evr_name')) {
                    state[dict_type][version][type] = {...state[dict_type][version][type], [item.evr_name]: item};
                }
                break;
            }
            case "ehas": {
                if (item.hasOwnProperty('channel_name')) {
                    state[dict_type][version][type] = {...state[dict_type][version][type], [item.channel_name]: item};
                }
                break;
            }
            case "mil1553": {
                if (item.hasOwnProperty('mil1553_name')) {
                    state[dict_type][version][type] = {...state[dict_type][version][type], [item.mil1553_name]: item};
                }
                break;
            }
            case "cmds": {
                if (item.hasOwnProperty('command_stem')) {
                    state[dict_type][version][type] = {...state[dict_type][version][type], [item.command_stem]: item};
                }
                break;
            }
            }
        }
    },
    receiveParsers(state, {dict_type, parsers}) {
        Vue.set(state, dict_type + "Parsers", parsers);  // E.g. if dict_type is "flight", parser will be "flightParsers"
    },
    receiveVIs(state, {vis, total}) {
        if(vis !== undefined) {
            state.visCount = total;

            // clear out state for pagination and filtering
            const visMap = {};
            for (const vi of vis) {
                visMap[vi.vi_id] = vi;
            }
            state.vis = visMap;
        }
    },
    receiveCustomScripts(state, {customScripts, total}) {
        if(customScripts !== undefined) {
            state.customScriptsCount = total;

            // clear out state for pagination and filtering
            const customScriptMap = {};
            for (const customScript of customScripts) {
                customScriptMap[customScript.script_id] = customScript;
            }
            state.customScripts = customScriptMap;
        }
    },
    receiveUploadResults(state, {type, uploadResults}) {
        Vue.set(state, type + "UploadResults", uploadResults );
    },
};

export default {
    state,
    getters,
    mutations,
    actions
};

import transport from "./transport";
import {toSnakeCase, upperCase} from "../modules/common/utils";
import {
    customScriptsUrls,
    dictionaryFlightUrls,
    dictionarySseUrls,
    dictionaryUrls,
    verificationAndValidation
} from "./dict-urls";
import _ from "lodash";

async function getFlightDictionaries(params = {}) {
    try {
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            sort_by: upperCase(toSnakeCase(params.sortField)),
            wild: true
        };
        if(params.filters !== undefined && 'state' in params.filters) {
            options.state_filter = params.filters.state.value;
        }
        if(params.filters !== undefined && 'dictionary_description' in params.filters) {
            options.description_filter = params.filters.dictionary_description.value;
        }

        const url = dictionaryUrls.versions("flight", params.dictionaryVersion);
        let response = undefined;
        if(params != {}){
            response = await transport.get(url, {params: options});
        } else {
            response = await transport.get(url);
        }

        return {
            data: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getSseDictionaries(params = {}) {
    try {
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            sort_by: upperCase(toSnakeCase(params.sortField)),
            wild: true
        };

        if(params.filters !== undefined && 'state' in params.filters) {
            options.state_filter = params.filters.state.value;
        }
        if(params.filters !== undefined && 'dictionary_description' in params.filters) {
            options.description_filter = params.filters.dictionary_description.value;
        }

        const url = dictionaryUrls.versions("sse", params.dictionaryVersion);
        let response = undefined;
        if(params != {}){
            response = await transport.get(url, {params: options});
        } else {
            response = await transport.get(url);
        }

        return {
            data: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getFlightCmds(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };
        // since filter by name doesnt match field we cant do this
        // for (let filter in params.filters) {
        //     options[toSnakeCase(filter)] = params.filters[filter].value;
        // }

        if(params.filters !== undefined && 'command_stem' in params.filters && params.filters.command_stem.value) {
            options.command_stem = params.filters.command_stem.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'cmd_description' in params.filters && params.filters.cmd_description.value) {
            options.command_description = params.filters.cmd_description.value;
        }

        const url = dictionaryFlightUrls.cmds(params.dictionaryVersion, params.command_stem);
        const response = await transport.get(url, {params: options});

        return {
            cmds: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getFlightEvrs(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };
        // since filter by name doesnt match field we cant do this
        // for (let filter in params.filters) {
        //     options[toSnakeCase(filter)] = params.filters[filter].value;
        // }
        if(params.filters !== undefined && 'evr_id' in params.filters && params.filters.evr_id.value) {
            options.evr_id = params.filters.evr_id.value;
        }
        if(params.filters !== undefined && 'evr_name' in params.filters && params.filters.evr_name.value) {
            options.evr_name = params.filters.evr_name.value;
        }
        if(params.filters !== undefined && 'evr_level' in params.filters && params.filters.evr_level.value) {
            options.evr_level = params.filters.evr_level.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'evr_description' in params.filters && params.filters.evr_description.value) {
            options.evr_description = params.filters.evr_description.value;
        }
        if(params.filters !== undefined && 'evr_message' in params.filters && params.filters.evr_message.value) {
            options.evr_message = params.filters.evr_message.value;
        }

        const url = dictionaryFlightUrls.evrs(params.dictionaryVersion, params.evr_name);
        const response = await transport.get(url, {params: options});

        return {
            evrs: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

//UPDATED MODIFIED
async function getFlightEhas(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };
        // since filter by name doesnt match field we cant do this
        // for (let filter in params.filters) {
        //     options[toSnakeCase(filter)] = params.filters[filter].value;
        // }

        if(params.filters !== undefined && 'eha_name' in params.filters && params.filters.eha_name.value) {
            options.channel_name = params.filters.eha_name.value;
        }
        if(params.filters !== undefined && 'channel_id' in params.filters && params.filters.channel_id.value) {
            options.channel_id = params.filters.channel_id.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'eha_description' in params.filters && params.filters.eha_description.value) {
            options.description = params.filters.eha_description.value;
        }
        if(params.filters !== undefined && 'derived' in params.filters && params.filters.derived.value) {
            options.derived = params.filters.derived.value;
        }

        const url = dictionaryFlightUrls.channels(params.dictionaryVersion, params.eha_name);
        const response = await transport.get(url, {params: options});

        return {
            ehas: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getFlight1553(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }

        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };

        if(params.filters !== undefined && 'mil1553_name' in params.filters && params.filters.mil1553_name.value) {
            options.mil1553_name = params.filters.mil1553_name.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'output_type' in params.filters && params.filters.output_type.value) {
            options.output_type = params.filters.output_type.value;
        }
        if(params.filters !== undefined && 'description' in params.filters && params.filters.description.value) {
            options.description = params.filters.description.value;
        }
        if(params.filters !== undefined && 'remote_terminal' in params.filters && params.filters.remote_terminal.value) {
            options.remote_terminal = params.filters.remote_terminal.value;
        }

        const url = dictionaryFlightUrls.mil1553(params.dictionaryVersion, params.mil1553_name);
        const response = await transport.get(url, {params: options});

        return {
            mil1553: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

//UDPATED MODIFIED
async function patchFlightDictionary(version, state, description, file) {
    try {
        const url = dictionaryUrls.versions("flight", version);

        const payload = {
            state: state,
            dictionary_description: description
        };

        const response = await transport.patch(
            url,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteFlightDictionary(version) {
    try {
        const url = dictionaryUrls.versions("flight", version);
        const response = await transport.delete(url);
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

//UDPATED MODIFIED
async function patchSseDictionary(version, state, description, file) {
    console.log('UPDATED MODIFIED:patchSseDictionary');
    try {
        const url = dictionaryUrls.versions("sse", version);

        const payload = {
            state: state,
            dictionary_description: description
        };

        const response = await transport.patch(
            url,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteSseDictionary(version) {
    try {
        const url = dictionaryUrls.versions("sse", version);
        const response = await transport.delete(url);
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getSseCmds(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };

        if(params.filters !== undefined && 'command_stem' in params.filters && params.filters.command_stem.value) {
            options.command_stem = params.filters.command_stem.value;
        }
        if(params.filters !== undefined && 'cmd_description' in params.filters && params.filters.cmd_description.value) {
            options.command_description = params.filters.cmd_description.value;
        }

        const url = dictionarySseUrls.cmds(params.dictionaryVersion, params.command_stem);
        const response = await transport.get(url, {params: options});

        return {
            cmds: response.data,
            total: parseInt(response.headers["x-total-count"]),
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getSseCmdDetails(params) {
    try {
        const options = {
            cmdStem: params.cmdStem
        };

        const url = dictionarySseUrls.cmds(params.dictionaryVersion, params.cmdStem);
        const response = await transport.get(url, {params: options});
        return {
            cmdSseDetails: response.data
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getSseEvrs(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }

        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };

        if(params.filters !== undefined && 'evr_id' in params.filters && params.filters.evr_id.value) {
            options.evr_id = params.filters.evr_id.value;
        }
        if(params.filters !== undefined && 'evr_name' in params.filters && params.filters.evr_name.value) {
            options.evr_name = params.filters.evr_name.value;
        }
        if(params.filters !== undefined && 'evr_level' in params.filters && params.filters.evr_level.value) {
            options.evr_level = params.filters.evr_level.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'evr_description' in params.filters && params.filters.evr_description.value) {
            options.evr_description = params.filters.evr_description.value;
        }
        if(params.filters !== undefined && 'evr_message' in params.filters && params.filters.evr_message.value) {
            options.evr_message = params.filters.evr_message.value;
        }

        const url = dictionarySseUrls.evrs(params.dictionaryVersion, params.evr_name);
        const response = await transport.get(url, {params: options});

        return {
            evrs: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

//UPDATED MODIFIED
async function getSseEhas(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };

        if(params.filters !== undefined && 'eha_name' in params.filters && params.filters.eha_name.value) {
            options.channel_name = params.filters.eha_name.value;
        }
        if(params.filters !== undefined && 'channel_id' in params.filters && params.filters.channel_id.value) {
            options.channel_id = params.filters.channel_id.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'eha_description' in params.filters && params.filters.eha_description.value) {
            options.description = params.filters.eha_description.value;
        }
        if(params.filters !== undefined && 'derived' in params.filters && params.filters.derived.value) {
            options.derived = params.filters.derived.value;
        }

        const url = dictionarySseUrls.channels(params.dictionaryVersion, params.eha_name);
        const response = await transport.get(url, {params: options});

        return {
            ehas: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getSse1553(params) {
    try {
        if(params.wild === undefined){
            params.wild = false;
        }

        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            offset: params.offset,
            wild: params.wild
        };

        if(params.filters !== undefined && 'mil1553_name' in params.filters && params.filters.mil1553_name.value) {
            options.mil1553_name = params.filters.mil1553_name.value;
        }
        if(params.filters !== undefined && 'operations_category' in params.filters && params.filters.operations_category.value) {
            options.ops_cat = params.filters.operations_category.value;
        }
        if(params.filters !== undefined && 'description' in params.filters && params.filters.description.value) {
            options.description = params.filters.description.value;
        }
        if(params.filters !== undefined && 'remote_terminal' in params.filters && params.filters.remote_terminal.value) {
            options.remote_terminal = params.filters.remote_terminal.value;
        }
        if(params.filters !== undefined && 'sub_address' in params.filters && params.filters.sub_address.value) {
            options.sub_address = params.filters.sub_address.value;
        }
        if(params.filters !== undefined && 'transmit_receive' in params.filters && params.filters.transmit_receive.value) {
            options.transmit_receive = params.filters.transmit_receive.value;
        }

        const url = dictionarySseUrls.mil1553(params.dictionaryVersion, params.mil1553_name);
        const response = await transport.get(url, {params: options});

        return {
            mil1553: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getVIs(params){
    try {
        const options = {
            sort: params.sortDirection,
            limit: params.limit,
            wild: true,
            offset: params.offset
        };

        for (let filter in params.filters) {
            options[toSnakeCase(filter)] = params.filters[filter].value;
        }

        const url = verificationAndValidation.vnvVis(params.vi_id);
        const response = await transport.get(url, {params: options});

        return {
            data: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getVIsBulk(vi_ids){
    try {
        const url = verificationAndValidation.vnvVisBulk();
        const response = await transport.post(url, vi_ids);

        return {
            data: response.data,
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getVI(vi_id){
    try {
        const url = verificationAndValidation.vnvVis(vi_id);
        const response = await transport.get(url);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.warn(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function getCustomScripts(params){
    try {
        const options = {
            sort: params.sortDirection,
            sort_by: upperCase(toSnakeCase(params.sortField)),
            limit: params.limit,
            offset: params.offset,
            script_path: params.scriptPath,
            wild: true
        };

        for (let filter in params.filters) {
            options[toSnakeCase(filter)] = params.filters[filter].value;
        }

        const url = customScriptsUrls.customScripts(params.script_id);
        const response = await transport.get(url, {params: options});
        return {
            data: response.data || [],
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        return {
            data: [],
            total: 0
        };
        /* eslint-enable no-console */
    }
}

//UPDATED MODIFIED
async function getCustomScriptsBulk(script_ids){
    try {
        const url = customScriptsUrls.customScriptsBulkQuery();
        const response = await transport.post(url, script_ids);
        return {
            data: response.data || [],
            total: parseInt(response.headers["x-total-count"])
        };
    } catch (error) {
        /* eslint-disable no-console */
        return {
            data: [],
            total: 0
        };
        /* eslint-enable no-console */
    }
}

async function getCustomScript(script_id){
    try {
        const url = customScriptsUrls.customScripts(script_id);
        const response = await transport.get(url);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.warn(error);
        /* eslint-enable no-console */
        return null;
    }
}

//UPDATED MODIFIED
async function patchCustomScripts(name, status) {
    try {
        const url = customScriptsUrls.customScripts(name);
        const payload = {
            status: status
        };

        const response = await transport.patch(
            url,
            payload,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        return response;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteCustomScript(script_id) {
    try {
        const url = customScriptsUrls.customScripts(script_id);
        const response = await transport.delete(url);
        return response;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

const dictionaryApi = {
    getFlightDictionaries,
    getFlightCmds,
    getFlightEhas,
    getFlightEvrs,
    getFlight1553,
    getSseDictionaries,
    getSseCmds,
    getSseCmdDetails,
    getSseEhas,
    getSseEvrs,
    getSse1553,
    getVIs,
    getVIsBulk,
    getVI,
    getCustomScripts,
    getCustomScriptsBulk,
    getCustomScript,
    patchSseDictionary,
    patchFlightDictionary,
    patchCustomScripts,
    deleteFlightDictionary,
    deleteSseDictionary,
    deleteCustomScript
};

export default dictionaryApi;

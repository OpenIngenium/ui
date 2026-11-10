import { commonDateTime } from '../common/filters';

import {
    fetchExecutions,
    importExecution,
    getExecution
} from "../../api/execution";

import venueApi from "../../api/venue";



// initial state
const initialState = () => {
    return {
        executions: [],
        executionCount: 0,
        availableVenues: [],
        importingExecution: false,
        importResponse: {},
    };
};

const state = initialState();

function parseExecutionInfo(execution) {
    return {
        execution_id: execution.execution_id,
        conductors: execution.test_conductors,
        description: execution.description,
        used_procedures: execution.used_procedures,
        time_started: commonDateTime(execution.time_started),
        time_completed: commonDateTime(execution.time_completed),
        run_for_score: execution.run_for_score.toString().toUpperCase(),
        status: execution.status,
        venue_id: execution.venue_id,
        venue_name: execution.venue_name,
        conversations_count: execution.conversations_count,
        unresolved_conversations_count: execution.unresolved_conversations_count
    };
}

const getters = {
    executions: state => state.executions ,
    executionsCount: state => state.executionCount ,
    availableVenues: state => state.availableVenues,
    importedExecutionId: state => {
        return state.importResponse.execution_info ? state.importResponse.execution_info.execution_id : '';
    },
    importingExecution: state => {
        return state.importingExecution;
    },
};

const actions = {
    async importExecution({commit}, {formData}) {
        commit('setBooleanKey', {key: 'importingExecution', bool: true});
        await importExecution(formData,
            (response) => {
                commit('receiveImportResponse', {importResponse: response});
            },
            (error) => {
                // The mutator in message-store is used
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit('setBooleanKey', {key: 'importingExecution', bool: false});
    },
    resetImportResponse({commit}){
        commit('resetImportResponse');
    },
    async getVenueInfo(_, venueId) {
        try {
            return await venueApi.getVenue(venueId);
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    async fetchAvailableVenues({commit}) {
        const { venues } = await venueApi.getDashboardVenues({status: "AVAILABLE", limit: 2000});
        commit("receiveVenues", {venues});
    },
    async fetchExecutions({commit}, {limit, offset, filters, sort, sortBy}){
        const data = await fetchExecutions({
            limit: limit, offset: offset, filters: filters,
            sortDirection: sort, sortField: sortBy
        });
        
        // Massage the data into forms I can use in the table
        const filteredExecutions = data.executions.map(execution => parseExecutionInfo(execution));
        
        commit("receiveExecutions", {executions: filteredExecutions, total: data.total});
    },
    async fetchExecutionInfo({commit}, {executionId}){
        const data = await getExecution(executionId);
        commit("receiveExecutionInfo", {executionInfo: data});
    },
    
};


const mutations = {
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },
    receiveImportResponse(state, {importResponse}) {
        state.importResponse = importResponse;
    },
    receiveExecutions(state, {executions,total}) {
        state.executions = executions;
        state.executionCount = total;
    },
    receiveExecutionInfo(state, {executionInfo}) {
        for (const [i, execution] of state.executions.entries()) {
            if (execution.execution_id === executionInfo.execution_id) {
                const parsedExecutoinInfo = parseExecutionInfo(executionInfo);
                const executions = [...state.executions];
                executions[i] = parsedExecutoinInfo;
                state.executions = executions;
                
                break;
            }
        }
    },
    receiveVenues(state, {venues}) {
        state.availableVenues = venues.map(venue => {
            return {
                name: venue.name,
                venue_id: venue.venue_id,
                venue_group_id: venue.venue_group_id,
                type: venue.type
            };
        });
    },
    resetImportResponse: function() {
        state.importResponse = {};
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

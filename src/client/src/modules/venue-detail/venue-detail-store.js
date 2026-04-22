import venueApi from '../../api/venue';
import { commonDateTime } from '../common/filters';
import { fetchExecutions } from "../../api/execution";

// initial state
const state = {
    venueData: {
        ampcsAddress: "",
        description: "",
        location: "",
        name: "",
        type: "",
        url: "",
        venueId: "",
        venue_status: {
            status: "",
            started_on: "",
            execution_id: "",
            test_conductor: ""
        }
    },
    configElements: [],
    historyElements: [],
    executionElements: [],
    totalConfigElements: 0,
    totalExecutionElements: 0,
};

const getters = {
    venueData: state => {
        const venue = state.venueData;
        return {
            ampcsAddress: venue.ampcs_address,
            description: venue.description,
            location: venue.location,
            name: venue.name,
            type: venue.type,
            url: venue.url,
            venueId: venue.venue_id,
            venueStatus: {
                status: venue.venue_status.status,
                startedOn: venue.venue_status.started_on,
                executionId: venue.venue_status.execution_id,
                testConductor: venue.venue_status.test_conductor
            }
        };
    },
    configElements: state => {
        return state.configElements.map(element => ({
            elemName: element.elem_name,
            type: element.type,
            description: element.description,
            status: element.status,
            serial: element.serial_number,
            notes: element.notes,

        }));
    },
    historyElements: state => {
        return state.historyElements.map(element => ({
            elemName: element.elem_name,
            elemId: element.elem_id,
            time: element.time,
            venueId: element.venue_id,
            changes: element.changes.map(change => ({
                fieldName: change.field_name,
                oldValue: change.old_value,
                newValue: change.new_value
            }))
        }));
    },
    executionElements: state => {
        return state.executionElements.map(execution => ({
            executionId: execution.execution_id,
            venueId: execution.venue_id,
            venueName: execution.venue_name,
            status: execution.status,
            runForScore: execution.run_for_score,
            description: execution.description,
            usedProcedures: execution.used_procedures.map(proc => proc.procedure_id).join(","),
            conductors: execution.test_conductors.join(","),
            timeStarted: commonDateTime(execution.time_started),
            timeCompleted: commonDateTime(execution.time_completed),
            
        }));
    },
    totalConfigElements: state => state.totalConfigElements,
    totalExecutionElements: state => state.totalExecutionElements,
};

const actions = {
    async fetchVenueData({commit}, {venueId}) {
        const data = await venueApi.getVenue(venueId);
        commit("receiveVenueData", data);
    },
    async fetchExecutions({commit}, {venueId, limit, offset, sortField, sortDirection, filters}) {
        const { executions, total } = await fetchExecutions({venueId, limit, offset, sortField, sortDirection, filters});
        commit("receiveExecutionElements", {executions, total});
    }
};

const mutations = {
    setLoadingStatus(state, key, bool) {
        state[key] = bool;
    },
    receiveVenueData(state, data) {
        state.venueData = data;
    },
    receiveConfigElements(state, {elements, total}) {
        state.configElements = elements;
        state.totalConfigElements = total;
    },
    receiveHistoryElements(state, {elements, total}) {
        state.historyElements = elements;
        state.totalHistoryElements = total;
    },
    receiveExecutionElements(state, {executions, total}) {
        state.executionElements = executions;
        state.totalExecutionElements = total;
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

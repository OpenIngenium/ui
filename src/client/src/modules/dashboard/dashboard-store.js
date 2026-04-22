import venueApi from "../../api/venue";
import { fetchExecutions } from "../../api/execution";
import { getUsername } from "../common/utils";

// initial state
const state = {
    venueGroups: [],
    totalVenueGroups: 0,
    venues: [],
    totalVenues: 0,
    activeExecutionMap: {},
};

const getters = {
    totalVenueGroups: state => state.totalVenueGroups,
    venueGroups: state => state.venueGroups.map(venueGroup => ({
        venueGroupId: venueGroup.venue_group_id,
        name: venueGroup.name,
        description: venueGroup.description,
        status: venueGroup.status,
    })),
    activeVenueGroups: function(state, getters) {
        return getters.venueGroups.filter((venueGroup => venueGroup.status === 'ACTIVE'));
    },
    venueGroupNames: function(state) {
        const names = state.venueGroups.map((venueGroup) => venueGroup.name);
        return names;
    },
    activeVenueGroupNames: function(state, getters) {
        const names = getters.activeVenueGroups.map((venueGroup) => venueGroup.name);
        return names;
    },
    venueGroupMap: function(state) {
        const map = {};
        for (const venueGroup of state.venueGroups) {
            map[venueGroup.venue_group_id] = venueGroup;
        }
        return map;
    },
    venueGroupIdMap: function(state) {
        const map = {};
        for (const venueGroup of state.venueGroups) {
            map[venueGroup.name] = venueGroup.venue_group_id;
        }
        return map;
    },
    venueGroupNameMap: function(state) {
        const map = {};
        for (const venueGroup of state.venueGroups) {
            map[venueGroup.venue_group_id] = venueGroup.name;
        }
        return map;
    },
    venues: function(state, getters) {
        return state.venues.map(venue => 
            ({
                venueGroupId: venue.venue_group_id,
                venueGroupName: getters.venueGroupMap[venue.venue_group_id] ? getters.venueGroupMap[venue.venue_group_id].name : '',
                name: venue.name,
                type: venue.type,
                venueId: venue.venue_id,
                status: venue.venue_status.status,
                testConductor: venue.venue_status.test_conductor,
                executionId: venue.venue_status.execution_id,
                startedOn: venue.venue_status.started_on,
                ampcsAddress: venue.ampcs_address,
                description: venue.description,
                location: venue.location
            })
        );
    },
    totalVenues: state => state.totalVenues,
    canJoinExecution: function(state) {
        return (executionId) => {
            let execution = state.activeExecutionMap[executionId];
            if (execution) {
                const username = getUsername();
                if (execution.participants && execution.participants.includes(username)) {
                    return true;
                }
                if (execution.redline_approvers && execution.redline_approvers.includes(username)) {
                    return true;
                }
            } else {
                return false;
            }
        };
    },
};
const actions = {
    async getVenueGroups({commit}, params) {
        const { venueGroups, total } = await venueApi.getVenueGroups(params);
        commit("receiveVenueGroups", {venueGroups, total});
    },
    async getVenues({commit}, params) {
        const { venues, total } = await venueApi.getDashboardVenues(params);
        commit("receiveVenues", {venues, total});
        // note that fetchExecution expects filters in the format of IngTable's filter, which has field value in "value"
        const { executions } = await fetchExecutions({limit: 10000, filters: {statuses: {value: 'IDLE,RUNNING,HALTED,PAUSED'}}});
        commit("receiveActiveExecutions", {executions});
    },
    async deleteVenue({commit, state}, venue_id) {
        // note that this does not update state
        // Vue component needs to call getVenues to update state.
        try {
            await venueApi.deleteVenue(venue_id);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    }
};
const mutations = {
    receiveVenueGroups(state, {venueGroups, total}) {
        state.venueGroups = venueGroups;
        state.totalVenueGroups = total;
    },
    receiveVenues(state, {venues, total}) {
        state.venues = venues;
        state.totalVenues = total;
    },
    receiveActiveExecutions(state, {executions}) {
        const activeExecutionMap = {};
        for (const execution of executions) {
            activeExecutionMap[execution.execution_id] = execution;
        }
        state.activeExecutionMap = activeExecutionMap;
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

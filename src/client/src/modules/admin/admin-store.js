import Vue from "vue";
import _ from "lodash";
import venueApi, { createVenue } from '../../api/venue';
import proceduresApi from "../../api/procedures";
import adminApi from '../../api/admin';
import dictionaryApi from '../../api/dictionary';

const PERSONAL_PREFERENCES = 'PERSONAL_PREFERENCES';
const state = {
    selectedSseParser: '',
    selectedFlightParser: '',
    users: [],
    usersCount: 0,
    permissionIdToName: {},
    permissionNameToId: {},
    roles: [],
    rolesCount: 0,
    debugEnabled: false,
    totalLabels: 0,
    labels:[]
};

const getters = {
    selectedSseParser: state => state.selectedSseParser,
    selectedFlightParser: state => state.selectedFlightParser,
    users: state => state.users,
    usersCount: state => state.usersCount,
    roles: function(state, getters) {
        return state.roles.map(role => {
            const roleInfo = {...role};
            roleInfo.venueGroupName = getters.venueGroupMap[role.venue_group_id] ? getters.venueGroupMap[role.venue_group_id].name : '';
            return roleInfo;
        });
    },
    rolesCount: state => state.rolesCount,
    permissionIdToName: state => state.permissionIdToName,
    permissionNameToId: state => state.permissionNameToId,
    debugEnabled: state => state.debugEnabled,
    totalLabels: state => state.totalLabels,
    labels: state => state.labels
};

const actions = {
    async createVenueGroup({commit}, venueGroup) {
        return await venueApi.createVenueGroup(venueGroup);
    },
    async editVenueGroup({commit}, { venueGroupId, venueGroup }) {
        await venueApi.editVenueGroup(venueGroupId, venueGroup);
    },
    async createVenue({commit}, venue) {
        return await venueApi.createVenue(venue);
    },
    async createLabel({commit}, label) {
        return await proceduresApi.createLabel(label);
    },
    async getLabels({commit}, params) {
        const {data, headers } = await proceduresApi.getLabels(params);
        const total = Number(headers['x-total-count']);

        commit("receiveLabels", { labels: data, total });
    },
    async deleteLabel({commit}, labelId) {
        await proceduresApi.deleteLabel(labelId);
    },
    async editVenue({commit}, { venueId, venue }) {
        await venueApi.editVenue(venueId, venue);
    },
    async changeVenueStatus({commit}, {venueId, statusInfo}) {
        try {
            await venueApi.changeStatus(venueId, statusInfo);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async fetchUsers({commit}, queryParams) {
        const { data } = await adminApi.getUsers(queryParams);
        commit("receiveUsers", data);
    },
    async fetchPermissions({commit}, queryParams) {
        const { data } = await adminApi.getPermissions(queryParams);
        commit("receivePermissions", data);
    },
    async fetchRoles({commit}, queryParams) {
        const { data } = await adminApi.getRoles(queryParams);
        commit("receiveRoles", data);
    },
    async createRole({commit}, role) {
        await adminApi.createRole(role);
    },
    async deleteRole({commit}, role_id) {
        await adminApi.deleteRole(role_id);
    },
    async editRole({commit}, { roleId, role }) {
        return await adminApi.editRole(roleId, role);
    },
    setDebugEnabled({commit}, enabled) {
        const personalPreferencesStr = localStorage.getItem(PERSONAL_PREFERENCES);
        let personalPreferences = {debugEnabled: enabled};
        if (personalPreferencesStr) {
            personalPreferences = JSON.parse(personalPreferencesStr);
            personalPreferences.debugEnabled = enabled;
        }
        localStorage.setItem(PERSONAL_PREFERENCES, JSON.stringify(personalPreferences));
        commit("setDebugEnabled", enabled);
    },
    loadDebugEnabled({commit}) {
        const personalPreferencesStr = localStorage.getItem(PERSONAL_PREFERENCES);
        let enabled = false;
        if (personalPreferencesStr) {
            const personalPreferences = JSON.parse(personalPreferencesStr);
            enabled = personalPreferences.debugEnabled === true;
        }
        commit("setDebugEnabled", enabled);
    },
};

const mutations = {
    receiveUsers(state, {results, total}) { 
        state.usersCount = total;
        state.users = results;
    },
    receivePermissions(state, permissions) { 
        const permissionIdToName = {};
        const permissionNameToId = {};
        for (const permission of permissions) {
            permissionIdToName[`${permission.id}`] = permission.name;
            permissionNameToId[permission.name] = permission.id;
        }
        state.permissionIdToName = permissionIdToName;
        state.permissionNameToId = permissionNameToId;
    },
    receiveRoles(state, {results, total}) {
        state.rolesCount = total;
        state.roles = results;
    },
    removeRole(state, role_id) {
        state.roles.splice(
            state.roles.findIndex(role => role.id === role_id),
            1
        );
    },
    setDebugEnabled(state, enabled) {
        state.debugEnabled = enabled;
    },
    receiveLabels(state, {labels, total}) {
        state.labels = labels;
        state.totalLabels = total;
    },
};

export default {
    state,
    getters,
    actions,
    mutations
};
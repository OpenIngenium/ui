import transport from "./transport";
import { authUrls } from './admin-urls';

async function getUsers(params) {
    try {
        const response = await transport.get(authUrls.users(), 
            { params }
        );
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function getPermissions(params) {
    try {
        const response = await transport.get(authUrls.permissions(), 
            { params }
        );
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function getRoles(params) {
    const response = await transport.get(authUrls.roles(), 
        { params }
    );
    return response;
}

async function getRole(role_id) {
    try {
        const response = await transport.get(authUrls.role(role_id));
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function createRole(role) {
    try {
        const response = await transport.post(authUrls.roles(), role);
        return response;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(`createRole error`, error);
        /* eslint-enable no-console */
        return null;
    }
}

async function deleteRole(role_id) {
    const response = await transport.delete(authUrls.role(role_id));

    return response.data;
}

async function editRole(role_id, role) {
    try {
        const response = await transport.put(authUrls.role(role_id), role);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        /* eslint-enable no-console */
        if (error.response && error.response.data && error.response.data.message) {
            return Promise.reject(error.response.data.message);
        } else {
            return Promise.reject('Failed to update role');
        }
    }
}

const adminApi = { 
    getUsers,
    getPermissions,
    getRoles,
    getRole,
    createRole,
    deleteRole,
    editRole
};

export default adminApi;
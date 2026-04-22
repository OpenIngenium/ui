import transport from "./transport";

/**
 * This function returns users in Ingenium. This requires admin scope.
 * @param {string} userName 
 * @returns results field is an array of Ingenium user objects. See auth API.
 */
async function getUsers(userName) {
    try {
        if (userName) {
            const response = await transport.get('/auth_server/api/v2/users', {params: {q: userName}});
            return response.data;
        } else {
            // if no userName was provided
            return [];
        }
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

/**
 * This function re
 * @param {string} userName 
 * @returns an array of object that has LDAP username and displayName. See auth API.
 */
async function getLdapUsers(userName) {
    try {
        if (userName) {
            const response = await transport.get('/auth_server/api/v2/ldap/users', {params: {q: userName}});
            return response.data;
        } else {
            // if no userName was provided
            return [];
        }
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

/**
 * This function returns a list of groups matching search query
 * @param {string} groupName 
 * @returns an array of strings that has LDAP group names.
 */
async function getLdapGroups(groupName) {
    try {
        if (groupName) {
            const response = await transport.get('/auth_server/api/v2/ldap/groups', {params: {q: groupName}});
            return response.data;
        } else {
            // if no groupName was provided
            return [];
        }
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

const authApi = {
    getUsers,
    getLdapUsers,
    getLdapGroups
};

export default authApi;

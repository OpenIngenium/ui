// Auth
const authServerVersion = "v2";
const authServerUrl = `/auth_server/api/${authServerVersion}`;

/* istanbul ignore next */
const authUrls = {
    base: function() {
        return authServerUrl;
    },
    users: function() {
        return authServerUrl + "/users";
    },
    permissions: function() {
        return authServerUrl + "/permissions";
    },
    roles: function() {
        return authServerUrl + "/roles";
    },
    role: function(role_id) {
        return authServerUrl + "/roles/" + role_id;
    }
};

export { 
    authUrls
};


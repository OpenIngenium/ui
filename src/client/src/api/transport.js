import axios from "axios";
import jwt_decode from "jwt-decode";
import { getJwt } from "../modules/common/utils";
import moment from "moment";
import authApi from "./auth";

axios.defaults.headers.common["Authorization"] = "Bearer " + getJwt();
axios.defaults.headers.common["Content-Type"] = "application/json";

// Replicates the default query-param serializer from axios 0.18 (the version this app
// was built against). axios >= 0.27 changed the default so that params whose value is
// `null` are serialized as an empty `key=` instead of being omitted. That regression
// caused unset procedure/dictionary filters (e.g. `hazardous`) to be sent as empty
// strings, which the core server rejects with a 400. Omitting null/undefined here
// keeps the outgoing query strings identical to the pre-upgrade behavior.
function encodeParam(val) {
    return encodeURIComponent(val)
        .replace(/%3A/gi, ":")
        .replace(/%24/g, "$")
        .replace(/%2C/gi, ",")
        .replace(/%20/g, "+")
        .replace(/%5B/gi, "[")
        .replace(/%5D/gi, "]");
}

function legacyParamsSerializer(params) {
    const parts = [];
    Object.keys(params || {}).forEach(function(key) {
        let val = params[key];
        // axios 0.18 behavior: skip null and undefined values entirely
        if (val === null || typeof val === "undefined") {
            return;
        }
        let serializedKey = key;
        if (Array.isArray(val)) {
            serializedKey = key + "[]";
        } else {
            val = [val];
        }
        val.forEach(function(v) {
            if (v instanceof Date) {
                v = v.toISOString();
            } else if (v !== null && typeof v === "object") {
                v = JSON.stringify(v);
            }
            parts.push(encodeParam(serializedKey) + "=" + encodeParam(v));
        });
    });
    return parts.join("&");
}

// axios >= 0.27 expects paramsSerializer to be an object of the shape { serialize },
// not a bare function (passing a function throws "options must be an object").
const paramsSerializer = { serialize: legacyParamsSerializer };
axios.defaults.paramsSerializer = paramsSerializer;
const transport = axios.create();
transport.defaults.paramsSerializer = paramsSerializer;

const ING_CLIENT_TIME_OFFSET_SECS = 'ING_CLIENT_TIME_OFFSET_SECS';

// This will be called by JS code in session_expire.html
// to update API token used by axios using the session cookie
window.updateApiToken = function() {
    // Grab the jwt
    let jwt = getJwt();

    if (jwt) {
        axios.defaults.headers.common["Authorization"] = "Bearer " + jwt;
        // `transport` is a separate axios instance (axios.create() copies axios.defaults
        // at creation time, it does not keep a live reference), so it must be updated
        // explicitly or it keeps using the JWT that was valid at page-load time forever.
        transport.defaults.headers.common["Authorization"] = "Bearer " + jwt;
    }
};

// Always attach the latest JWT from the cookie to every request made through `transport`.
// This is the actual source of truth (rather than relying on defaults being kept in sync
// from window.updateApiToken/updateRequestHeader), so a renewed token is picked up
// immediately without requiring a page reload.
transport.interceptors.request.use(function(config) {
    const jwt = getJwt();
    if (jwt) {
        config.headers["Authorization"] = "Bearer " + jwt;
    }
    return config;
});

// Interceptor to Refresh Token
transport.interceptors.response.use(function(response) {
    let offset_sec = 0;
    let now = moment.utc();
    if (response.headers.date) {
        const server_time = moment(response.headers.date);
        // Calculate time drift of the client (Web browser) w.r.t the server time.
        // Cache it in local storage so that current time of the client can be calibrated.
        // This will be used by session_expire.html
        offset_sec = server_time.unix() - now.unix();
        localStorage.setItem(ING_CLIENT_TIME_OFFSET_SECS, `${offset_sec}`);
    } else {
        console.warn(`response did not contain date header`);
    }

    const expires = now.add(offset_sec, 'seconds').add(10, 'minutes').format();
    document.cookie = `last_action=${moment().format('YYYY-MM-D H:m:s.SSSSSS')}; expires=${expires};`;
    return response;
}, function(error) {
    return Promise.reject(error);
});

export default transport;

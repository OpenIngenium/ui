import axios from "axios";
import jwt_decode from "jwt-decode";
import { getJwt } from "../modules/common/utils";
import moment from "moment";
import authApi from "./auth";

axios.defaults.headers.common["Authorization"] = "Bearer " + getJwt();
axios.defaults.headers.common["Content-Type"] = "application/json";
const transport = axios.create();

const ING_CLIENT_TIME_OFFSET_SECS = 'ING_CLIENT_TIME_OFFSET_SECS';

// This will be called by JS code in session_expire.html
// to update API token used by axios using the session cookie
window.updateApiToken = function() {
    // Grab the jwt
    let jwt = getJwt();

    if (jwt) {
        axios.defaults.headers.common["Authorization"] = "Bearer " + jwt;
    }
};

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

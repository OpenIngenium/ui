const axios = require("axios");
const { createVenue } = require("./venues.js");
const { createToken } = require("../helpers/authentication.js");
const { timeoutPromise } = require("../helpers/utils.js");

const coreUrl = process.env.CORE_API_URL;
axios.defaults.headers.common["Authorization"] = "Bearer " + createToken();
axios.defaults.headers.post["Content-Type"] = "application/json";


async function createExecution(venueId) {
    if(venueId === undefined) {
        let venue = await createVenue();
        venueId = venue.venue_id;
    }
    try {
        const response = await axios({
            url: "executions",
            baseURL: coreUrl,
            method: "post",
            data: {venue_id: venueId}
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error adding execution: ${error}`);
        /* eslint-enable no-console */
    }
}

async function haltExecution(executionId) {
    try {
        const response = await axios({
            url: `executions/${executionId}/halt`,
            baseURL: coreUrl,
            method: "post"
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error halting execution: ${error}`);
        /* eslint-enable no-console */
    }
}

async function statusChangeExecution(executionId, status) {
    try {
        const response = await axios({
            url: `executions/${executionId}/status`,
            baseURL: coreUrl,
            method: "post",
            data: {status: status}
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error changing execution status: ${error}`);
        /* eslint-enable no-console */
    }
}

async function deleteExecutions() {
    const executions = await getExecutions();
    if(executions.length === 0 || executions === undefined) {
        return;
    }
    for(let counter = 0; counter < executions.length; counter++) {
        const executionId = executions[counter]["execution_id"];
        try {
            await axios({
                url: `executions/${executionId}`,
                baseURL: coreUrl,
                method: "delete"
            });
            timeoutPromise(100); // allow time for core and services to process delete
        } catch (error) {
            /* eslint-disable no-console */
            console.log(`Error deleting execution: ${executionId} (${error})`);
            /* eslint-enable no-console */
        }
    }
}

async function getExecutions() {
    try {
        const response = await axios.get(`${coreUrl}executions`, {
            params: {
                limit: 10000
            }
        });
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.log(`Error retrieving executions: ${error}`);
        /* eslint-enable no-console */
    }
}

async function getExecutionTypes(executionId, exec_type='') {
    try { //exec_type i.e. elements
        const response = await axios.get(`${coreUrl}executions/${executionId}/${exec_type}`);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error getting step results: ${error}`);
        /* eslint-enable no-console */
    }
}


module.exports.createExecution = createExecution;
module.exports.haltExecution = haltExecution;
module.exports.statusChangeExecution = statusChangeExecution;
module.exports.deleteExecutions = deleteExecutions;
module.exports.getExecutions = getExecutions;
module.exports.getExecutionTypes = getExecutionTypes;

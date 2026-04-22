const axios = require("axios");
const { createToken } = require("../helpers/authentication.js");

const coreUrl = process.env.CORE_API_URL;
axios.defaults.headers.common["Authorization"] = "Bearer " + createToken();
axios.defaults.headers.post["Content-Type"] = "application/json";


async function getStepsByType(executionId, stepType) {
    try {
        const response = await axios.get(`${coreUrl}executions/${executionId}/${stepType}`);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error getting step type: ${error}`);
        /* eslint-enable no-console */
    }
}

async function createStepsByType(executionId, stepType, id="-1", level="SIBLING") {
    try {
        const response = await axios({
            url: `executions/${executionId}/${stepType}?insert_after_id=${id}&level=${level}`,
            baseURL: coreUrl,
            method: "post",
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error adding step type: ${error}`);
        /* eslint-enable no-console */
    }
}

module.exports.getStepsByType = getStepsByType;
module.exports.createStepsByType = createStepsByType;

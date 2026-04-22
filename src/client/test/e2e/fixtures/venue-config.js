const axios = require("axios");
const faker = require("faker");
const { createToken } = require("../helpers/authentication.js");
const coreUrl = process.env.CORE_API_URL;
const venueConfigUrl = process.env.VENUE_CONFIG_API_URL + "configurations/";
const venueTemplateUrl = process.env.VENUE_CONFIG_API_URL + "templates/";
axios.defaults.headers.common['Authorization'] = 'Bearer ' + createToken();

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const types = [
    "SIMULATOR",
    "BREADBOARD",
    "FLIGHT",
    "EM",
    "OTHER"
];

const statuses = [
    "INSTALLED",
    "NOT_INSTALLED"
];

async function createVenueConfigs(requested = 1, venueId, venueName) {
    for (let counter = 0; counter < requested; counter++){
        await createVenueConfig(venueId, venueName);
    }
}

async function createVenueConfig(venueId, venueName, customData) {
    let typeRand = getRandomInt(5);
    let statusRand = getRandomInt(2);

    let data = Object.assign({
        elem_name: faker.random.word(),
        description: faker.random.words(5),
        type: types[typeRand],
        status: statuses[statusRand],
        serial_number: faker.random.word(),
        notes: faker.random.words(8),
        venue_id: venueId,
        venue_name: venueName
    }, customData);

    const url = venueConfigUrl + venueId + '/elements';

    try {
        await axios({
            url: url,
            method: "POST",
            data: data
        });
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error adding venue_config: ${error}`);
        /* eslint-enable no-console */
    }
}

async function deleteVenueConfigs(venueId) {
    const configs = await getVenueConfigs(venueId);
    if (configs === undefined) {
        return;
    }
    for(let counter = 0; counter < configs.length; counter++) {
        const venueId = configs[counter]["venue_id"];
        try {
            await axios({
                url: `venues/${venueId}`,
                baseURL: coreUrl,
                method: "DELETE"
            });
        } catch (error) {
            /* eslint-disable no-console */
            console.log(`Error deleting venue: ${venueId}`);
            /* eslint-enable no-console */
        }
    }
}

async function getVenueConfigTemplate(venueType) {
    try {
        const response = await axios({
            url: `${venueType}/elements`,
            baseURL: venueTemplateUrl,
            method: "GET"
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error fetching venue template: ${error}`);
        /* eslint-enable no-console */
    }
}
async function deleteVenueConfigTemplate(venueType) {
    const configs = await getVenueConfigTemplate(venueType);
    if (!configs.length) {
        return;
    }
    for (let counter = 0; counter < configs.length; counter++) {
        const elementId = configs[counter]["elem_template_id"];
        try {
            await axios({
                url: `${venueType}/elements/${elementId}`,
                baseURL: venueTemplateUrl,
                method: "DELETE"
            });
        } catch (error) {
            /* eslint-disable no-console */
            console.log(`Error deleting venue config template: ${error.message}`);
            /* eslint-enable no-console */
        }
    }
}

async function getVenueConfigs(venueId) {
    try {
        const url = venueConfigUrl + venueId + '/elements';
        await axios.get(url, {
            params: {
                limit: 1000
            }
        });
    }
    catch(error) {
        /* eslint-disable no-console */
        console.log(`Error retrieving venue configs: ${error}`);
        /* eslint-enable no-console */
    }
}

module.exports.createVenueConfigs = createVenueConfigs;
module.exports.createVenueConfig = createVenueConfig;
module.exports.getVenueConfigTemplate = getVenueConfigTemplate;
module.exports.deleteVenueConfigTemplate = deleteVenueConfigTemplate;
module.exports.deleteVenueConfigs = deleteVenueConfigs;
module.exports.getVenueConfigs = getVenueConfigs;

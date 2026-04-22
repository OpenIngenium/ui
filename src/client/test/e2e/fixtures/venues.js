const axios = require("axios");
const faker = require("faker");
const { createToken } = require("../helpers/authentication.js");
const { timeoutPromise } = require("../helpers/utils.js");

const coreUrl = process.env.CORE_API_URL;
axios.defaults.headers.common['Authorization'] = 'Bearer ' + createToken();


async function createVenue(customData={}) {
    // override fake data with test specific data
    let data = Object.assign({
        name: faker.commerce.productName(),
        description: "-",
        ampcs_address: "-",
        location: "-",
        type: "WSTS",
        venue_status: {
            status: "AVAILABLE"
        }
    }, customData);

    try {
        const response = await axios({
            url: "venues",
            baseURL: coreUrl,
            method: "post",
            data: data
        });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error adding venue: ${error}`);
        /* eslint-enable no-console */
    }
}

async function createVenues(requested = 1, type = "WSTS", venueStatus = {status: "AVAILABLE"}) {
    for (let counter = 0; counter < requested; counter++) {
        try {
            await axios({
                url: "venues",
                baseURL: coreUrl,
                method: "post",
                data: {
                    name: faker.commerce.productName(),
                    description: "-",
                    ampcs_address: "-",
                    location: "-",
                    type: type,
                    venue_status: venueStatus
                }
            });
        } catch (error) {
            /* eslint-disable no-console */
            console.log(`Error adding venue: ${error}`);
            /* eslint-enable no-console */
        }
    }
}

async function deleteVenues() {
    const venues = await getVenues();
    if(venues === undefined) {
        return;
    }
    for(let counter = 0; counter < venues.length; counter++) {
        const venueId = venues[counter]["venue_id"];
        await deleteVenue(venueId);
        await timeoutPromise(100);  // allow time for core and services to process delete
    }
}

async function deleteVenue(venueId) {
    try {
        await axios({
            url: `venues/${venueId}`,
            baseURL: coreUrl,
            method: "delete"
        });
    } catch (error) {
        /* eslint-disable no-console */
        console.log(`Error deleting venue: ${venueId}`);
        console.log(error.message);
        /* eslint-enable no-console */
    }
}

async function getVenues() {
    try {
        const response = await axios.get(`${coreUrl}venues`, {
            params: {
                limit: 10000
            }
        });
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.log(`Error retrieving venues: ${error}`);
        /* eslint-enable no-console */
    }
}

module.exports.createVenue = createVenue;
module.exports.createVenues = createVenues;
module.exports.deleteVenues = deleteVenues;
module.exports.deleteVenue = deleteVenue;
module.exports.getVenues = getVenues;

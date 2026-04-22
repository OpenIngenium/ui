import transport from "./transport";
import { newAbortSignal } from "../modules/common/utils";
import { coreVenueGroupUrls, coreVenueUrls } from "./core-urls";

async function createVenueGroup(venueGroup) {
    const url = coreVenueGroupUrls.create();
    const response = await transport.post(url, venueGroup);
    return response.data;
}

async function getVenueGroup(venueGroupId) {
    const url = coreVenueGroupUrls.base(venueGroupId);
    const response = await transport.get(url);
    return response.data;
}

async function getVenueGroups(queryParams) {
    try {
        const response = await transport.get(coreVenueGroupUrls.base(), {
            params: queryParams
        });
        return {
            venueGroups: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function editVenueGroup(venueGroupId, venueGroup) {
    const url = coreVenueGroupUrls.base(venueGroupId);

    const response = await transport.patch(url, venueGroup);
    return response.data;
}

async function getVenue(venueId) {
    const url = coreVenueUrls.base(venueId);
    const response = await transport.get(url);
    return response.data;
}

async function getVenues(queryParams) {
    try {
        const response = await transport.get(coreVenueUrls.base(), {
            params: queryParams
        });
        return {
            data: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getDashboardVenues(queryParams) {
    try {
        const { data, total } = await getVenues(queryParams);
        return {
            venues: data,
            total
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function createVenue(venue) {
    const url = coreVenueUrls.create();
    const response = await transport.post(url, venue);
    return response.data;
}

async function editVenue(venueId, venue) {
    const url = coreVenueUrls.base(venueId);

    const response = await transport.patch(url, venue);
    return response.data;
}

async function changeStatus(venueId, statusInfo) {
    const url = coreVenueUrls.status(venueId);
    const response = await transport.patch(url, statusInfo, {
        signal: newAbortSignal(10000),
        timeout: 10000
    });
    return response.data;
}

async function deleteVenue(venue_id) {
    const url = coreVenueUrls.base(venue_id);
    const response = await transport.delete(url, {
        params: { venue_id },
        signal: newAbortSignal(10000),
        timeout: 10000
    });
    return response;
}

const venueApi = {
    createVenueGroup,
    getVenueGroup,
    getVenueGroups,
    editVenueGroup,
    getVenue,
    getVenues,
    getDashboardVenues,
    createVenue,
    deleteVenue,
    editVenue,
    changeStatus
};

export default venueApi;

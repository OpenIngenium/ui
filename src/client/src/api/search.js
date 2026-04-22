import transport from "./transport";
import { searchUrls } from "./search-url";

async function getAllQueryBuilder() {
    let response = null;
    try {
        response = await transport.get(
            searchUrls.allQueryBuilder(),
            {
                responseType: 'json',
            }
        );
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
    return response;
}

async function getQueryBuilder(queryBuilderId) {
    let response = null;
    try {
        response = await transport.get(
            searchUrls.queryBuilder(queryBuilderId),
            {
                responseType: 'json',
            }
        );
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
    return response;
}

async function saveQueryBuilder(params) {
    let response = null;
    try {
        response = await transport.post(searchUrls.queryBuilder(), params);
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
    return response;
}

async function deleteQueryBuilder(queryBuilderId) {
    let response = null;
    try {
        response = await transport.delete(searchUrls.queryBuilder(queryBuilderId));
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
    return response;
}

async function searchElasticService(params) {
    let response = null;
    try {
        response = await transport.post(searchUrls.search(), params);
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
    return response;
}


const searchApi = {
    getAllQueryBuilder,
    getQueryBuilder,
    saveQueryBuilder,
    deleteQueryBuilder,
    searchElasticService
};

export default searchApi;

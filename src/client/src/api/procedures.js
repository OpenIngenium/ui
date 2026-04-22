import transport from "./transport";
import { coreProcedureUrls } from "./core-urls";
import {toSnakeCase} from "../modules/common/utils";

async function getProcedures(params) {
    try {
        const options = {
            limit: params.limit,
            offset: params.offset,
            wild: true
        };

        for (let filter in params.filters) {
            options[toSnakeCase(filter)] = params.filters[filter].value;
        }

        if (params.sort) {
            options.sort = params.sort.toUpperCase();
        }
        if (params.sortBy) {
            options.sort_by = params.sortBy.toUpperCase();
        }

        const response = await transport.get(coreProcedureUrls.base(), {params: options});
        return {
            procedures: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getProcedureVersions(procedureId, options={}) {
    try {
        const response = await transport.get(coreProcedureUrls.versions(procedureId), {params: options});
        return {
            versions: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getProcedure(procedureId) {
    try {
        const response = await transport.get(coreProcedureUrls.base(procedureId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return { error:error };
    }
}

async function getProcedureElement(procedureId, elementId) {
    try {
        const response = await transport.get(coreProcedureUrls.runProcedureElement(procedureId, elementId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getProcedureElementStructure(procedureId, elementId) {
    try {
        const response = await transport.get(coreProcedureUrls.structure(procedureId, elementId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function createProcedureTag(procedureId, tag) {
    try {
        const response = await transport.post(coreProcedureUrls.tags(procedureId), tag);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function createProcedureElementTag(procedureId, elementId, tagId) {
    try {
        const response = await transport.post(
            coreProcedureUrls.elementTags(procedureId, elementId), null, {
                params: { tag_id: tagId },
                headers: { 'Content-Type': 'application/json' }
            });
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function editProcedureTag(procedureId, tagId, tag) {
    try {
        const response = await transport.patch(coreProcedureUrls.tag(procedureId, tagId), tag);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteProcedureTag(procedureId, tagId) {
    try {
        const response = await transport.delete(coreProcedureUrls.tag(procedureId, tagId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteProcedureElementTag(procedureId, elementId, tagId) {
    try {
        const response = await transport.delete(coreProcedureUrls.elementTag(procedureId, elementId, tagId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getProcedureVersion(procedureId, version) {
    try {
        const response = await transport.get(coreProcedureUrls.versions(procedureId, version));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return { error:error };
    }
}

async function getProcedureOutline(procedureId, version) {
    try {
        const response = await transport.get(coreProcedureUrls.outline(procedureId, version));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return { error:error };
    }
}

async function exportProcedureVersionInGzip(procedureId, version) {
    let response = null;
    try {
        response = await transport.get(coreProcedureUrls.export(procedureId, version), {responseType: 'arraybuffer'});
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }

    return response;
}

async function exportProcedureInGzip(procedureId, params) {
    let response = null;
    try {
        response = await transport.get(coreProcedureUrls.exportVersions(procedureId), 
            {
                responseType: 'arraybuffer',
                params: params
            });
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }

    return response;
}


async function createLabel(label) {
    try {
        const response = await transport.post(coreProcedureUrls.labels(), label);
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getLabels(params) {
    try {
        const response = await transport.get(coreProcedureUrls.labels(),
            {
                params: params
            });
        return response;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteLabel(labelId) {
    try {
        const response = await transport.delete(coreProcedureUrls.labels(labelId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
    
}

const proceduresApi = {
    getProcedures,
    getProcedureOutline,
    getProcedure,
    getProcedureVersion,
    getProcedureVersions,
    createProcedureTag,
    editProcedureTag,
    deleteProcedureTag,
    createProcedureElementTag,
    deleteProcedureElementTag,
    getProcedureElement,
    getProcedureElementStructure,
    exportProcedureVersionInGzip,
    exportProcedureInGzip,
    createLabel,
    getLabels,
    deleteLabel
};

export default proceduresApi;

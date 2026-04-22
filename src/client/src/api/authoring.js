import transport from "./transport";
import {coreProcedureUrls} from "./core-urls";
import { parseAxiosError, newAbortSignal } from "../modules/common/utils";
import {getUsername} from "../modules/common/utils";

async function getProcedure(procedureId) {
    try {
        const response = await transport.get(coreProcedureUrls.base(procedureId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getProcedureVersions(procedureId, limit=null, offset=null, sort='DESC') {
    try {
        let params = { sort: sort };
        if (limit !== null) {
            params.limit = limit;
        }
        if (offset !== null) {
            params.offset = offset;
        }
        const response = await transport.get(coreProcedureUrls.versions(procedureId), { params: params });
        return {
            versions: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    }
    catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function createProcedure(title, institutionalId, description) {
    try {
        const response = await transport.post(coreProcedureUrls.base(), {
            title: title, institutional_id: institutionalId, 
            description: description, author: getUsername()
        });
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function updateProcedure(procedureId, title=null, institutionalId=null, description=null, author=null, hazardous=null, procedureType=null, labels=null) {
    try {
        const newProcedure = {};
        if (title !== null) {
            newProcedure.title = title;
        }
        if (institutionalId !== null) {
            newProcedure.institutional_id = institutionalId;
        }
        if (description !== null) {
            newProcedure.description = description;
        }
        if (author !== null) {
            newProcedure.author = author;
        }
        if (hazardous !== null) {
            newProcedure.hazardous = hazardous;
        }
        if(procedureType !== null) {
            newProcedure.procedure_type = procedureType;
        }
        if(labels !== null) {
            newProcedure.labels = labels;
        }
        const response = await transport.patch(coreProcedureUrls.base(procedureId), newProcedure);
        return response;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function deleteProcedure(procedureId) {
    try {
        const response = await transport.delete(coreProcedureUrls.base(procedureId));
        return response;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
        return null;
    }
}

async function lockProcedure(procedureId, lockedBy, successCallback, failureCallback) {
    try {
        const response = await transport.patch(
            coreProcedureUrls.base(procedureId),
            {
                locked_by: lockedBy
            }
        );
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function unlockProcedure(procedureId, successCallback, failureCallback) {
    try {
        const response = await transport.patch(
            coreProcedureUrls.base(procedureId),
            {
                locked_by: ""
            }
        );
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function searchProcedure(procedureId, version, searchPayload, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.search(procedureId, version), searchPayload);
        successCallback(response.data);
    } catch(error) {
        failureCallback(parseAxiosError(error));
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function fetchTimeReferences(procedure_id, version, successCallback=null, failureCallback=null) {
    let response = null;
    try {
        response = await transport.get(coreProcedureUrls.timeReferences(procedure_id, version));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */   
    }
}

async function replaceProcedure(procedureId, searchPayload, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.replace(procedureId), searchPayload);
        successCallback(response.data);
    } catch(error) {
        failureCallback(parseAxiosError(error));
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
        /* eslint-enable no-console */    }
}

async function postProcedureVersion(procedureId, versionDescription) {
    await transport.post(coreProcedureUrls.versions(procedureId), 
        { 
            version_description: versionDescription,
            version_author: getUsername()
        },
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function patchProcedureVersion(procedureId, version, versionObj, successCallback, failureCallback) {
    try {
        const response = await transport.patch(`${coreProcedureUrls.versions(procedureId)}/${version}`, versionObj);
        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function postProcedureVersionStatus(procedureId, version, statusObj, successCallback, failureCallback) {
    try {
        const response = await transport.post(`${coreProcedureUrls.versions(procedureId)}/${version}/status`, statusObj);
        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function importProcedureVersion(procedureId, formData, successCallback=null, failureCallback=null) {
    let response = null;
    try {
        response = await transport.post(`${coreProcedureUrls.import(procedureId)}`, formData);
        if (successCallback) {
            successCallback(response.data);
        }
    }
    catch (error) {
        if (failureCallback) {
            failureCallback(parseAxiosError(error));
        }
        else {
            return {response, error};
        }
    }

    return {response: response, error: null};
}

async function importProcedureVersions(formData, successCallback=null, failureCallback=null) {
    let response = null;
    try {
        response = await transport.post(`${coreProcedureUrls.import()}`, formData);
        if (successCallback) {
            successCallback(response.data);
        }
    }
    catch (error) {
        if (failureCallback) {
            failureCallback(parseAxiosError(error));
        }
        else {
            return {response, error};
        }
    }

    return {response: response, error: null};
}

async function deleteProcedureVersion(procedureId, version, successCallback, failureCallback) {
    try {
        const response = await transport.delete(coreProcedureUrls.versions(procedureId, version));
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

// In this file, async functions use callbacks, which may lead to unexpcted race conditions.
// Use return instead.
async function getProcedureElements(procedureId, version) {
    try {
        const response = await transport.get(coreProcedureUrls.versionElements(procedureId, version), {
            params: {
                limit: 10000
            }
        });
        return { elements: response.data };
    } catch(error) {
        return { error };
    }
}

async function moveProcedureElement(procedureId, elementId, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.move(procedureId), {
            elem_ids: [elementId],
            insert_after_id: insertAfterId,
            level: level
        });
        successCallback({
            numbers: response.data.numbers,
            elem_ids: response.data.elem_ids
        });
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function copyProcedureElement(procedureId, elementId, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.copy(procedureId), {
            elem_ids: [elementId],
            insert_after_id: insertAfterId,
            level: level
        });
        successCallback({
            numbers: response.data.numbers,
            elements: response.data.elements,
            elem_ids: response.data.elem_ids
        });
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function revertProcedure(procedureId, sourceProcedureId, sourceVersion, successCallback, failureCallback) {
    try {
        const response = await transport.post(
            coreProcedureUrls.load(procedureId),
            { procedure_id: sourceProcedureId, version: sourceVersion }
        );
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function multiCopyProcedureElement({
    procedureId,
    elementIds,
    insertAfterId,
    level,
    sourceExecutionId,
    sourceProcedureId,
    sourceProcedureVersion
}, successCallback, failureCallback) {
    try {
        // handle logic for copy from procedure vs copy from execution
        const response = await transport.post(coreProcedureUrls.copy(procedureId), {
            elem_ids: elementIds,
            insert_after_id: insertAfterId,
            level: level,
            source_execution_id: sourceExecutionId,
            source_procedure_id: sourceProcedureId,
            source_procedure_version: sourceProcedureVersion
        });
        successCallback({
            numbers: response.data.numbers,
            elements: response.data.elements,
            elem_ids: response.data.elem_ids
        });
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function multiMoveProcedureElement({
    procedureId,
    elementIds,
    insertAfterId,
    level,
    sourceExecutionId,
    sourceProcedureId,
    sourceProcedureVersion
}, successCallback, failureCallback) {
    try {
        // handle logic for copy from procedure vs copy from execution
        const response = await transport.post(coreProcedureUrls.move(procedureId), {
            elem_ids: elementIds,
            insert_after_id: insertAfterId,
            level: level,
            source_execution_id: sourceExecutionId,
            source_procedure_id: sourceProcedureId,
            source_procedure_version: sourceProcedureVersion
        });
        successCallback({
            numbers: response.data.numbers,
            elements: response.data.elements,
            elem_ids: response.data.elem_ids
        });
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function postProcedureElement(procedureId, elementPath, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.elementBase(procedureId, elementPath), {}, {
            params: {
                insert_after_id: insertAfterId,
                level: level
            }
        });
        successCallback({
            numbers: response.data.numbers,
            element: response.data.elem,
            elem_ids: response.data.elem_ids
        });
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function deleteProcedureElement(procedureId, elementId) {
    await transport.delete(coreProcedureUrls.elements(procedureId, elementId),
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function postProcedureElementInput(procedureId, elementPath, elementId, payload) {
    await transport.post(coreProcedureUrls.elementInput(procedureId, elementPath, elementId), payload, 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function patchProcedureElement(procedureId, elementPath, elementId, payload) {
    await transport.patch(coreProcedureUrls.elementData(procedureId, elementPath, elementId), payload,
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function postReplaceProcedureElement(procedureId, elementId, payload, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.replaceElement(procedureId, elementId), payload);
        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function patchViStatusStep(procedureId, elementId, payload, successCallback, failureCallback) {
    try {
        const response = await transport.patch(coreProcedureUrls.viStatusStep(procedureId, elementId), payload);
        successCallback(response);
    }
    catch( error) {
        failureCallback(parseAxiosError(error));
    }
}

async function validateProcedureVersion(procedureId, version, refreshInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.validateVersion(procedureId, version), refreshInput);
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function validateProcedureElement(procedureId, refreshInput, elementId, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreProcedureUrls.validateElement(procedureId, elementId), refreshInput);
        successCallback(response);
    }
    catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

export {
    deleteProcedureElement,
    getProcedure,
    searchProcedure,
    replaceProcedure,
    getProcedureVersion,
    getProcedureVersions,
    getProcedureElements,
    moveProcedureElement,
    copyProcedureElement,
    postProcedureElement,
    patchProcedureElement,
    postProcedureElementInput,
    postProcedureVersion,
    patchProcedureVersion,
    postProcedureVersionStatus,
    postReplaceProcedureElement,
    lockProcedure,
    unlockProcedure,
    patchViStatusStep,
    validateProcedureVersion,
    validateProcedureElement,
    multiCopyProcedureElement,
    multiMoveProcedureElement,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    deleteProcedureVersion,
    importProcedureVersion,
    importProcedureVersions,
    revertProcedure,
    fetchTimeReferences
};

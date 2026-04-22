import transport from "./transport";
import { upperCase, toSnakeCase, parseAxiosError, newAbortSignal } from "../modules/common/utils";
import {coreExecutionUrls, coreProcedureUrls} from "./core-urls";

async function fetchExecutions(queryParams) {
    try {
        const options = {
            venue_id: queryParams.venueId,
            sort: queryParams.sortDirection,
            sort_by: upperCase(toSnakeCase(queryParams.sortField)),
            limit: queryParams.limit,
            offset: queryParams.offset
        };
        for (let filter in queryParams.filters) {
            options[toSnakeCase(filter)] = queryParams.filters[filter].value;
        }
        const response = await transport.get(coreExecutionUrls.base(), {params: options});
        return {
            executions: response.data,
            total: parseInt(response.headers["x-total-count"], 10)
        };
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function fetchTimeReferences(execution_id, successCallback=null, failureCallback=null) {
    let response = null;
    try {
        response = await transport.get(coreExecutionUrls.timeReferences(execution_id));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */   
    }
}

async function importExecution(formData, successCallback=null, failureCallback=null) {
    let response = null;
    try {
        response = await transport.post(`${coreExecutionUrls.import()}`, formData);
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

async function patchExecution(execution_id, payload) {
    try {
        return await transport.patch(coreExecutionUrls.base(execution_id), {
            ...payload
        });
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function postExecution({venueId}) {
    return await transport.post(coreExecutionUrls.base(), {venue_id: venueId}, 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function refreshExecution(executionId) {
    const response = await transport.post(coreExecutionUrls.refresh(executionId), {}, 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
    return response.data;
}

async function getExecution(executionId) {
    try {
        const response = await transport.get(coreExecutionUrls.base(executionId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */    }
}

async function deleteSwitchWaitFlag(executionId) {
    try {
        const response = await transport.delete(coreExecutionUrls.deleteSwitchWaitFlag(executionId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */    }
}

async function searchExecution(executionId, searchPayload, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.search(executionId), searchPayload);
        successCallback(response.data);
    } catch(error) {
        failureCallback(parseAxiosError(error));
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function getExecutionElement(executionId, elementId) {
    try {
        const response = await transport.get(coreExecutionUrls.executionElement(executionId, elementId));
        return response.data;
    } catch(error) {
        return { error };
    }
}

async function getExecutionElements(executionId) {
    try {
        const response = await transport.get(coreExecutionUrls.elements(executionId), {
            params: {
                limit: 100000
            }
        });
        return { elements: response.data };
    } catch(error) {
        return { error };
    }
}

async function moveExecutionElement(executionId, elementId, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.move(executionId), {
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

async function copyExecutionElement(executionId, elementId, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.copy(executionId), {
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

async function multiCopyExecutionElement({
    executionId, 
    elementIds,
    insertAfterId,
    level,
    sourceExecutionId,
    sourceProcedureId,
    sourceProcedureVersion
}, successCallback, failureCallback) {
    try {
        // handle logic for copy from procedure vs copy from execution
        const response = await transport.post(coreExecutionUrls.copy(executionId), {
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

async function multiMoveExecutionElement({
    executionId, 
    elementIds,
    insertAfterId,
    level,
    sourceExecutionId,
    sourceProcedureId,
    sourceProcedureVersion
}, successCallback, failureCallback) {
    try {
        // handle logic for copy from procedure vs copy from execution
        const response = await transport.post(coreExecutionUrls.move(executionId), {
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

async function clearBreakPoints(executionId, successCallback, failureCallback) {
    try {   
        const response = await transport.delete(coreExecutionUrls.clearBreakPoints(executionId), {} , {});
        successCallback(response.data);
    } catch(error) {
        failureCallback(parseAxiosError(error));
    }
}

async function modifyExecutionElement(executionId, elementId) {
    await transport.post(coreExecutionUrls.modify(executionId, elementId), {},
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function justifyExecutionElement(executionId, elementId, justificationInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.justify(executionId, elementId), justificationInput, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function bulkJustifyExecutionElements(executionId, bulkJustificationInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.bulkJustify(executionId), bulkJustificationInput, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function approveExecutionElement(executionId, elementId, approvalInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.approve(executionId, elementId), approvalInput, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function bulkApproveExecutionElements(executionId, bulkApprovalInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.bulkApproval(executionId), bulkApprovalInput, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function discardExecutionElement(executionId, elementId, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.discard(executionId, elementId), {}, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function bulkDiscardExecutionElements(executionId, bulkDiscardInput, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.bulkDiscard(executionId), bulkDiscardInput, {});

        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function postExecutionElement(executionId, elementPath, insertAfterId, level, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.elementBase(executionId, elementPath), {}, {
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

async function deleteExecutionElement(executionId, elementId) {
    await transport.delete(coreExecutionUrls.elements(executionId, elementId), 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function postExecutionElementInput(executionId, elementPath, elementId, payload) {
    await transport.post(coreExecutionUrls.elementInput(executionId, elementPath, elementId), payload, 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function patchExecutionElement(executionId, elementPath, elementId, payload) {
    await transport.patch(coreExecutionUrls.elementData(executionId, elementPath, elementId), payload,
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function postExecutionStatus(executionId, status, comment) {
    return await transport.post(coreExecutionUrls.statusExecution(executionId), {status, comment},
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function executeElement(executionId, elementId) {
    if (elementId) {
        await transport.post(coreExecutionUrls.executeElement(executionId), {}, {
            params: {
                current_step_id: elementId
            },
            signal: newAbortSignal(10000),
            timeout: 10000
        });
    } else {
        await transport.post(coreExecutionUrls.executeElement(executionId), {}, {
            signal: newAbortSignal(10000),
            timeout: 10000
        });
    }
}

async function autoExecuteElement(executionId) {
    await transport.post(coreExecutionUrls.executeElement(executionId), {}, {
        params: { trigger: "INITIAL" },
        signal: newAbortSignal(10000),
        timeout: 10000
    });
}

async function haltExecution(executionId, failureCallback) {
    try {
        await transport.post(coreExecutionUrls.haltExecution(executionId), {});
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

/* moves existing execution details to run_records under a new element id, sets this element id to un-exected */
async function prepareReExecuteElement(executionId, elementId, successCallback, failureCallback) {
    try {
        const response = await transport.post(coreExecutionUrls.newRun(executionId, elementId), {});
        successCallback(response);
    } catch (error) {
        failureCallback(parseAxiosError(error));
    }
}

async function postImportProcedure(executionId, elementId) {
    try {
        const response = await transport.post(coreExecutionUrls.importRunProcedure(executionId, elementId), {});
        return { elements: response.data };
    } catch (error) {
        return { error: parseAxiosError(error) };
    }
}

async function postCallProcedure(executionId, elementId) {
    try {
        const response = await transport.post(coreExecutionUrls.importCallProcedure(executionId, elementId), {});
        return { execution: response.data };
    } catch (error) {
        return { error: parseAxiosError(error) };
    }
}

async function postSuspendResume(executionId, targetExecutionId) {
    try {
        const response = await transport.post(coreExecutionUrls.suspendResumeExecution(executionId), {target_execution_id:targetExecutionId});
        return { execution: response.data };
    } catch (error) {
        return { error: parseAxiosError(error) };
    }
}


async function pauseExecution(executionId) {
    await transport.post(
        coreExecutionUrls.pause(executionId), 
        {},
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function patchViStatusStep(executionId, elementId, payload, successCallback, failureCallback) {
    try {
        const response = await transport.patch(coreExecutionUrls.viStatusStep(executionId, elementId), payload);
        successCallback(response);
    }
    catch( error) {
        failureCallback(parseAxiosError(error));
    }
}

async function postResumeExecution(executionId, venueId) {
    return await transport.post(coreExecutionUrls.resume(executionId), { venue_id: venueId }, 
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function overrideStepStatus(executionId, elementId, justification) {
    await transport.post(coreExecutionUrls.override(executionId, elementId), { override_justification: justification },
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function updateOverrideStepStatus(executionId, elementId, justification) {
    await transport.patch(coreExecutionUrls.override(executionId, elementId), { override_justification: justification },
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function discardOverrideStepStatus(executionId, elementId) {
    await transport.post(coreExecutionUrls.discardOverride(executionId, elementId), {},
        {
            signal: newAbortSignal(10000),
            timeout: 10000
        }
    );
}

async function exportExecutionInGzip(executionId, params) {
    let response = null;
    try {
        response = await transport.get(coreExecutionUrls.export(executionId), 
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

export {
    deleteExecutionElement,
    executeElement,
    autoExecuteElement,
    haltExecution,
    fetchExecutions,
    getExecution,
    deleteSwitchWaitFlag,
    searchExecution,
    getExecutionElement,
    getExecutionElements,
    moveExecutionElement,
    prepareReExecuteElement,
    patchExecution,
    postExecution,
    refreshExecution,
    postExecutionStatus,
    postResumeExecution,
    copyExecutionElement,
    multiCopyExecutionElement,
    multiMoveExecutionElement,
    postExecutionElement,
    patchExecutionElement,
    postExecutionElementInput,
    postImportProcedure,
    postCallProcedure,
    postSuspendResume,
    modifyExecutionElement,
    clearBreakPoints,
    justifyExecutionElement,
    bulkJustifyExecutionElements,
    bulkApproveExecutionElements,
    bulkDiscardExecutionElements,
    approveExecutionElement,
    discardExecutionElement,
    pauseExecution,
    patchViStatusStep,
    overrideStepStatus,
    updateOverrideStepStatus,
    discardOverrideStepStatus,
    importExecution,
    exportExecutionInGzip,
    fetchTimeReferences
};

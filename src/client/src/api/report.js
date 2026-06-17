import transport from "./transport";
import { reportUrls } from "./report-urls";

async function getExecutionsReport(activeFilters) {
    return await transport.get(
        reportUrls.allExecutions(),
        {
            responseType: 'arraybuffer',
            params: {
                ...activeFilters,
                format: 'EXCEL',
            }
        }
    );
}

async function getSearchReport(searchParams) {
    return await transport.post(
        reportUrls.search_report(),
        {
            ...searchParams,
            format: 'EXCEL',
        },
        {
            responseType: 'arraybuffer'
        },
    );
}

async function getExecutionInPdf(executionId) {
    return await transport.get(
        reportUrls.executions(executionId),
        {
            responseType: 'json',
            params: {
                toc_level: 0,
                comment: true,
                activity_report_comment: true,
                data_review_comment: true,
                all_steps: true
            }                
        }
    );
}

async function getProcedureInPdf(procedureId, procedureVersion) {
    return await transport.get(
        reportUrls.procedures(procedureId, procedureVersion), 
        { 
            responseType: 'json',
            params: {
                toc_level: 0,
                comment: true
            }
        }
    );
}


async function getDifferenceReport(baseType, baseId, baseVersion, targetType, targetId, targetVersion){
    return await transport.get(
        reportUrls.difference_report(),
        { 
            responseType: 'json',
            params: {
                base_type: baseType,
                base_id: baseId,
                base_version: baseVersion >= 0 ? baseVersion : -1,
                target_type: targetType,
                target_id:targetId,
                target_version: targetVersion >= 0 ? targetVersion : -1
            }                
        }
    );
}

async function getReportQueue() {
    return await transport.get(
        reportUrls.report_queue(),
        {
            responseType: 'json'
        }
    );
}

async function abortReportQueueJob(jobId) {
    return await transport.delete(
        reportUrls.report_queue_job(jobId),
        {
            responseType: 'json'
        }
    );
}

const reportApi = {
    getExecutionsReport,
    getSearchReport,
    getExecutionInPdf,
    getProcedureInPdf,
    getDifferenceReport,
    getReportQueue,
    abortReportQueueJob,
};

export default reportApi;

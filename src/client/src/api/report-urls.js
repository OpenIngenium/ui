// Report Config
const reportVersion = 'v1';
const reportUrl = `/report_server/api/${reportVersion}`;

const reportUrls = {
    allExecutions() {
        return reportUrl + '/executions';
    },
    executions(executionId) {
        return reportUrl + `/pdf/executions/${executionId}`;
    },
    procedures(procedureId, procedureVersion) {
        return reportUrl + `/pdf/procedures/${procedureId}/versions/${procedureVersion}`;
    },
    difference_report() {
        return reportUrl + `/difference_report`;
    },
    search_report() {
        return reportUrl + `/search_report`;
    },
    report_queue() {
        return reportUrl + `/report_queue`;
    },
    report_queue_job(jobId) {
        return reportUrl + `/report_queue/${jobId}`;
    }
};

export {
    reportUrls
};

// Core
const coreServerVersion = "v5";
const coreServerUrl = `/core_server/api/${coreServerVersion}`;

const fileServerUrl = '/file_server/';

/* istanbul ignore next */
const coreVenueGroupUrls = {
    create: function() {
        return coreServerUrl + "/venue_groups";
    },
    base: function(venueGroupId = "") {
        return coreServerUrl + "/venue_groups" + (venueGroupId && "/" + venueGroupId);
    },
};

/* istanbul ignore next */
const coreVenueUrls = {
    create: function() {
        return coreServerUrl + "/venues";
    },
    base: function(venueId = "") {
        return coreServerUrl + "/venues" + (venueId && "/" + venueId);
    },
    status: function(venueId = "") {
        return coreVenueUrls.base(venueId) + "/status";
    }
};

/* istanbul ignore next */
const coreExecutionUrls = {
    base: function(executionId = "") {
        return coreServerUrl + "/executions" + (executionId && "/" + executionId);
    },
    timeReferences: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/time_references";
    },
    move: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/elements/move";
    },
    copy: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/elements/copy";
    },
    clearBreakPoints: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/break_points";
    },
    files: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/files";
    },
    file: function(executionId, fileId) {
        return coreExecutionUrls.base(executionId) + "/files/" + fileId;
    },
    status: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/status";
    },
    search: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/search";
    },
    refresh: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/refresh";
    },
    deleteSwitchWaitFlag: function(executionId = "") {
        return coreExecutionUrls.base(executionId) + "/switch_wait_flag";
    },
    elements: function(executionId, elementId="") {
        return coreExecutionUrls.base(executionId) + "/elements" + (elementId && "/" + elementId);
    },
    comments: function(executionId, elementId, commentId="") {
        return coreExecutionUrls.elements(executionId, elementId) + "/comments" + (commentId && "/" + commentId);
    },
    elementFile: function(executionId, elementId, fileId="") {
        return coreExecutionUrls.elements(executionId, elementId) + "/files" + (fileId && "/" + fileId);
    },
    commentFile: function(executionId, elementId, commentId, fileId="") {
        return coreExecutionUrls.comments(executionId, elementId, commentId) + "/files" + (fileId && "/" + fileId);
    },
    modify: function(executionId, elementId) {
        return coreExecutionUrls.elements(executionId, elementId) + "/modify";
    },
    justify: function(executionId, elementId) {
        return coreExecutionUrls.elements(executionId, elementId) + "/justify";
    },
    bulkJustify: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/elements/justify";
    },
    approve: function(executionId, elementId) {
        return coreExecutionUrls.elements(executionId, elementId) + "/approve";
    },
    bulkApproval: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/elements/approve";
    },
    discard: function(executionId, elementId) {
        return coreExecutionUrls.elements(executionId, elementId) + "/discard";
    },
    bulkDiscard: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/elements/discard";
    },
    conversations: function(executionId, elementId) {
        return coreExecutionUrls.elements(executionId, elementId) + "/conversations";
    },
    conversation: function(executionId, elementId, conversationId) {
        return coreExecutionUrls.elements(executionId, elementId) + `/conversations/${conversationId}`;
    },
    conversationComments: function(executionId, elementId, conversationId) {
        return coreExecutionUrls.elements(executionId, elementId) + `/conversations/${conversationId}/comments`;
    },
    conversationComment: function(executionId, elementId, conversationId, commentId) {
        return coreExecutionUrls.elements(executionId, elementId) + `/conversations/${conversationId}/comments/${commentId}`;
    },
    conversationCommentFiles: function(executionId, elementId, conversationId, commentId) {
        return coreExecutionUrls.elements(executionId, elementId) + `/conversations/${conversationId}/comments/${commentId}/files`;
    },
    conversationCommentFile: function(executionId, elementId, conversationId, commentId, fileId) {
        return coreExecutionUrls.elements(executionId, elementId) + `/conversations/${conversationId}/comments/${commentId}/files/${fileId}`;
    },
    elementBase: function(executionId, elementPath) {
        return coreExecutionUrls.base(executionId) + `/${elementPath}`;
    },
    elementData: function(executionId, elementPath, elementId) {
        return coreExecutionUrls.elementBase(executionId, elementPath) + `/${elementId}`;
    },
    elementInput: function(executionId, elementPath, elementId) {
        return coreExecutionUrls.elementBase(executionId, elementPath) + `/${elementId}/input`;
    },
    executeElement: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/run?run_mode=ASYNC";
    },
    statusExecution: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/status";
    },
    haltExecution: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/halt";
    },
    executionElement: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/steps/" + elementId;
    },
    newRun: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/steps/" + elementId + "/new_run";
    },
    override: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/steps/" + elementId + "/override";
    },
    discardOverride: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/steps/" + elementId + "/discard_override";
    },
    importRunProcedure: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + `/procedure_sections/${elementId}/import`;
    },
    importCallProcedure: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + `/procedure_sections/${elementId}/call`;
    },
    suspendResumeExecution: function(executionId) {
        return coreExecutionUrls.base(executionId) + `/suspend_resume`;
    },
    pause: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/pause";
    },
    viStep: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/vi_steps" + (elementId && `/${elementId}`);
    },
    viStatusStep: function(executionId, elementId) {
        return coreExecutionUrls.base(executionId) + "/vi_status_steps" + (elementId && `/${elementId}`);
    },
    resume: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/resume";
    },
    export: function(executionId) {
        return coreExecutionUrls.base(executionId) + "/export";
    },
    import: function() {
        return coreExecutionUrls.base() + "/import";
    }
};

/* istanbul ignore next */
const coreProcedureUrls = {
    base: function(procedureId = "") {
        return coreServerUrl + "/procedures" + (procedureId && "/" + procedureId);
    },
    labels: function(labelId = "") {
        return coreProcedureUrls.base() + "/labels" + (labelId && "/" + labelId);
    },
    move: function(procedureId = "") {
        return coreProcedureUrls.base(procedureId) + "/elements/move";
    },
    copy: function(procedureId = "") {
        return coreProcedureUrls.base(procedureId) + "/elements/copy";
    },
    outline: function(procedureId, version) {
        return coreProcedureUrls.versions(procedureId, version) + '/outline';
    },
    versions: function(procedureId, version = "") {
        // Can't do traditional (version && "/" + version) since if version is 0, error results
        return coreProcedureUrls.base(procedureId) + '/versions'+ (version !== "" ? "/" + version : version);
    },
    timeReferences: function(procedureId, version) {
        return coreProcedureUrls.versions(procedureId, version) + '/time_references';
    },
    export: function(procedureId, version) {
        return coreProcedureUrls.versions(procedureId, version) + '/export';
    },
    exportVersions: function(procedureId) {
        return coreProcedureUrls.base(procedureId) + '/export_versions';
    }, 
    import: function(procedureId) {
        return coreProcedureUrls.base(procedureId) + '/import';
    },
    tags: function(procedureId) {
        return coreProcedureUrls.base(procedureId) + '/tags';
    },
    tag: function(procedureId, tagId) {
        return coreProcedureUrls.base(procedureId) + `/tags/${tagId}`;
    },
    elementTags: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + `/elements/${elementId}/tags`;
    },
    elementTag: function(procedureId, elementId, tagId) {
        return coreProcedureUrls.base(procedureId) + `/elements/${elementId}/tags/${tagId}`;
    },
    structure: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + `/procedure_sections/${elementId}/structure`;
    },
    load: function(procedureId) {
        return coreProcedureUrls.base(procedureId) + '/load';
    },
    search: function(procedureId, version) {
        return coreProcedureUrls.versions(procedureId, version) + "/search";
    },
    replace: function(procedureId) {
        return coreProcedureUrls.base(procedureId) + "/replace";
    },
    replaceElement: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + `/elements/${elementId}/replace`;
    },
    runProcedureElement: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + `/procedure_sections/${elementId}`;
    },
    versionElements: function(procedureId, version) {
        return coreProcedureUrls.versions(procedureId, version) + '/elements';
    },
    conversations: function(procedureId, version, elementId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations`;
    },
    conversation: function(procedureId, version, elementId, conversationId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}`;
    },
    conversationComments: function(procedureId, version, elementId, conversationId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}/comments`;
    },
    conversationComment: function(procedureId, version, elementId, conversationId, commentId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}/comments/${commentId}`;
    },
    conversationCommentFiles: function(procedureId, version, elementId, conversationId, commentId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}/comments/${commentId}/files`;
    },
    versionedConversationCommentFiles: function(procedureId, version, elementId, conversationId, commentId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}/comments/${commentId}/files`;
    },
    conversationCommentFile: function(procedureId, version, elementId, conversationId, commentId, fileId) {
        return coreProcedureUrls.versions(procedureId, version) + `/elements/${elementId}/conversations/${conversationId}/comments/${commentId}/files/${fileId}`;
    },
    elements: function(procedureId, elementId="") {
        return coreProcedureUrls.base(procedureId) + "/elements" + (elementId && "/" + elementId);
    },
    elementBase: function(procedureId, elementPath) {
        return coreProcedureUrls.base(procedureId) + `/${elementPath}`;
    },
    elementData: function(procedureId, elementPath, elementId) {
        return coreProcedureUrls.elementBase(procedureId, elementPath) + `/${elementId}`;
    },
    elementInput: function(procedureId, elementPath, elementId) {
        return coreProcedureUrls.elementBase(procedureId, elementPath) + `/${elementId}/input`;
    },
    elementFile: function(procedureId, elementId, fileId='') {
        return coreProcedureUrls.elements(procedureId, elementId) + '/files' + (fileId ? `/${fileId}` : '');
    },
    validateVersion: function(procedureId, version) {
        return coreProcedureUrls.base(procedureId) + '/versions/' + version + '/validate';
    },
    validateElement: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + '/elements/' + elementId + '/validate';
    },
    viStep: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + "/vi_steps" + (elementId && `/${elementId}`);
    },
    viStatusStep: function(procedureId, elementId) {
        return coreProcedureUrls.base(procedureId) + "/vi_status_steps" + (elementId && `/${elementId}`);
    },
};

/* istanbul ignore next */
const fileServerUrls = {
    fileGet: function(fileUrl) {
        if(fileUrl.startsWith(fileServerUrl)) {
            return fileUrl;
        }

        return fileServerUrl + fileUrl;
    }
};

export {
    coreVenueGroupUrls,
    coreVenueUrls,
    coreExecutionUrls,
    coreProcedureUrls,
    fileServerUrls,
    fileServerUrl,
};

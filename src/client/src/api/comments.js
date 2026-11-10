import transport from "./transport";
import {coreExecutionUrls, coreProcedureUrls} from "./core-urls";


async function editExecutionConversation(executionId, elementId, conversationId, conversation) {
    try {
        const response = await transport.patch(coreExecutionUrls.conversation(executionId, elementId, conversationId), conversation);
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function editProcedureConversation(procedureId, version, elementId, conversationId, conversation) {
    try {
        const response = await transport.patch(coreProcedureUrls.conversation(procedureId, version, elementId, conversationId), conversation);
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function postExecutionConversation(executionId, elementId, conversation) {
    try {
        const response = await transport.post(coreExecutionUrls.conversations(executionId, elementId), conversation);
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function postProcedureConversation(procedureId, version, elementId, conversation) {
    try {
        const response = await transport.post(coreProcedureUrls.conversations(procedureId, version, elementId), conversation);
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function deleteExecutionConversation(executionId, elementId, conversationId) {
    try {
        const response = await transport.delete(coreExecutionUrls.conversation(executionId, elementId, conversationId));
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function deleteProcedureConversation(procedureId, version, elementId, conversationId) {
    try {
        const response = await transport.delete(coreProcedureUrls.conversation(procedureId, version, elementId, conversationId));
        return response.data;
    } catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */ 
    }
}

async function getComments(executionId, elementId) {
    try {
        const response = await transport.get(coreExecutionUrls.comments(executionId, elementId));
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */    }
}

async function postExecutionComment(executionId, elementId, conversationId, { editorContent }) {
    try {
        const response = await transport.post(coreExecutionUrls.conversationComments(executionId, elementId, conversationId), {content: editorContent});
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */    }
}

async function postProcedureComment(procedureId, version, elementId, conversationId, { editorContent }) {
    try {
        const response = await transport.post(coreProcedureUrls.conversationComments(procedureId, version, elementId, conversationId), {content: editorContent});
        return response.data;
    } catch (error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */    }
}

async function deleteExecutionComment(executionId, elementId, conversationId, commentId) {
    try {
        const response = await transport.delete(coreExecutionUrls.conversationComment(executionId, elementId, conversationId, commentId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteProcedureComment(executionId, version, elementId, conversationId, commentId) {
    try {
        const response = await transport.delete(coreProcedureUrls.conversationComment(executionId, version, elementId, conversationId, commentId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function editExecutionComment(executionId, elementId, conversationId, commentId, { editorContent }) {
    try {
        const response = await transport.patch(coreExecutionUrls.conversationComment(executionId, elementId, conversationId, commentId), {content: editorContent});
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function editProcedureComment(executionId, version, elementId, conversationId, commentId, { editorContent }) {
    try {
        const response = await transport.patch(coreProcedureUrls.conversationComment(executionId, version, elementId, conversationId, commentId), {content: editorContent});
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteExecutionConversationCommentFile(executionId, elementId, conversationId, commentId, fileId) {
    try {
        const response = await transport.delete(coreExecutionUrls.conversationCommentFile(executionId, elementId, conversationId, commentId, fileId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}


async function deleteProcedureConversationCommentFile(procedureId, version, elementId, conversationId, commentId, fileId) {
    try {
        const response = await transport.delete(coreProcedureUrls.conversationCommentFile(procedureId, version, elementId, conversationId, commentId, fileId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteExecutionElementFile(executionId, elementId, fileId) {
    try {
        const response = await transport.delete(coreExecutionUrls.elementFile(executionId, elementId, fileId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteProcedureElementFile(procedureId, elementId, fileId) {
    try {
        const response = await transport.delete(coreProcedureUrls.elementFile(procedureId, elementId, fileId));
        return response.data;
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

async function deleteExecutionFile(executionId, fileId) {
    try {
        return await transport.delete(coreExecutionUrls.file(executionId, fileId));
    }
    catch(error) {
        /* eslint-disable no-console */
        console.error(error);
        /* eslint-enable no-console */
    }
}

export {
    getComments,
    postExecutionComment,
    postProcedureComment,
    deleteExecutionComment,
    deleteProcedureComment,
    editExecutionComment,
    editProcedureComment,
    deleteExecutionFile,
    editExecutionConversation,
    editProcedureConversation,
    postExecutionConversation,
    postProcedureConversation,
    deleteExecutionConversation,
    deleteProcedureConversation,
    deleteExecutionConversationCommentFile,
    deleteProcedureConversationCommentFile,
    deleteExecutionElementFile,
    deleteProcedureElementFile
};

import {
    getComments, 
    postExecutionComment, 
    postProcedureComment,
    deleteExecutionFile, 
    editExecutionComment,
    editProcedureComment,
    deleteExecutionComment, 
    deleteProcedureComment, 
    postExecutionConversation,
    postProcedureConversation,
    editExecutionConversation,
    editProcedureConversation,
    deleteExecutionConversation,
    deleteProcedureConversation,
    deleteExecutionConversationCommentFile,
    deleteProcedureConversationCommentFile,
    deleteProcedureElementFile,
    deleteExecutionElementFile
} from "../../api/comments";

import { checkShowElement } from "../../modules/common/utils";

import Vue from "vue";

// initial state
const initialState = () => {
    return {
        conversations: {},
        comments: {},
        currEditCommentIds: {},  // {elementId: currEditCommentId}
        expandedComment: '',
    };
};

const state = initialState();

const getters = {
    elementsConversations: function(state, getters, rootState) {
        // console.trace('getter elementsConversations');
        // console.log('state.conversations:', JSON.stringify(state.conversations, 0, 2));
        
        const conversations = [];
        // console.log('comment-store rootState:', JSON.stringify(rootState, 0, 2));
        
        let mainState = null;
        
        if (rootState.hasOwnProperty('execution')) {
            mainState = rootState.execution;
        } else if (rootState.hasOwnProperty('authoring')) {
            mainState = rootState.authoring;
        } else {
            console.log('ERROR: vue store execution or authoring is not found');
            return [];
        }
        
        mainState.elementIds.forEach((elem_id) => {
            let elem = mainState.elements[elem_id];
            let elemConversations = state.conversations[elem_id];
            if (checkShowElement(elem_id, elem, elemConversations, mainState.elemFilters)) {
                if (elemConversations) {
                    // TODO: is the order of conversations maintained?
                    for (const conversation_id in elemConversations) {
                        let conversation = elemConversations[conversation_id];
                        conversations.push({...conversation, 
                            element: {element_id: elem.elem_id, title: elem.title, number: elem.number}
                        });
                    }
                }
            }
        });
        return conversations;
    },    
    conversations: (state) => (elementId) => state.conversations[elementId],
    conversation: (state) => (elementId, conversationId) => state.conversations[elementId][conversationId],
    comments: (state) => (elementId, conversationId) => state.conversations[elementId][conversationId].comments,
    comment: (state) => (elementId, conversationId, commentId) => state.conversations[elementId][conversationId].comments[commentId],
    expandedComment: (state) => state.expandedComment,
    currEditCommentIds: (state) => state.currEditCommentIds,
    reviewers: state => {
        let reviewers = new Set();

        const elementsConversations = Object.entries(state.conversations);
        elementsConversations.forEach(entry => {
            const elementKey = entry[0];
            const elementValue = entry[1];

            const elementConversations = Object.entries(elementValue);
            elementConversations.forEach(innerEntry => {
                const conversationKey = innerEntry[0];
                const conversationValue = innerEntry[1];

                if(conversationValue.type == 'DATA_REVIEW_COMMENT') {
                    const conversationComments = Object.entries(conversationValue.comments);
                    conversationComments.forEach(innerCommentEntry => {
                        const commentKey = innerCommentEntry[0];
                        const commentValue = innerCommentEntry[1];

                        reviewers.add(commentValue.user_name);
                    });
                }
            });
        });

        return [...reviewers];
    }
};

/* istanbul ignore next */
const actions = {
    /* 
        Execution
    */
    async initConversations({commit, dispatch, rootState}, {elements}) {
        const conversationsObj = {};
        if (elements) {
            elements.forEach((elem) => {
                const elemConversations = {};
                conversationsObj[elem.elem_id] = elemConversations;
                if (elem.conversations) {
                    elem.conversations.forEach((conversation) => {
                        const comments = {};
                        const elemConversation = {...conversation, ...{comments: comments}};
                        elemConversations[conversation.conversation_id] = elemConversation;
                        if (conversation.comments) {
                            conversation.comments.forEach((comment) => {
                                comments[comment.comment_id] = comment;
                            });
                        }
                    });
                }
            });
        }

        commit("setConversations", {conversations: conversationsObj});
    },
    async editConversation({commit, dispatch, rootState}, {executionId, elementId, conversationId, conversation, fromType, version}) {
        let response;
        if(version == -1) {
            response = await editExecutionConversation(executionId, elementId, conversationId, conversation);
        }
        else {
            response = await editProcedureConversation(executionId, version, elementId, conversationId, conversation);
            commit("editElementConversation", {elementId: elementId, conversationId: conversationId, conversation: response});
        }            
    },
    async postConversation({commit, dispatch, rootState}, {executionId, elementId, conversation, version}) {
        let response;
        if(version == -1) {
            response = await postExecutionConversation(executionId, elementId, conversation);
        }
        else {
            response = await postProcedureConversation(executionId, version, elementId, conversation);
            commit("addElementConversation", {elementId: elementId, conversation: response});
            let firstComment = Object.keys(response.comments);
            commit("addConversationExpandEdit", {commentId: firstComment[0]});
        }
    },
    async deleteConversation({commit, dispatch, rootState}, {executionId, elementId, conversationId, version, type}) {
        if(version == -1) {
            await deleteExecutionConversation(executionId, elementId, conversationId);
        }
        else {
            await deleteProcedureConversation(executionId, version, elementId, conversationId);
            commit("deleteElementConversation", {elementId: elementId, conversationId: conversationId});
        }
    },
    async postComment({commit, rootState}, {executionId, elementId, conversationId, comment, version}) {
        let response;
        if(version == -1) {
            response = await postExecutionComment(executionId, elementId, conversationId, comment);
        }
        else {
            response = await postProcedureComment(executionId, version, elementId, conversationId, comment);
            commit("addElementConversationComment", {elementId: elementId, conversationId: conversationId, comment: response});
        }
    },
    async editComment({commit, rootState}, {executionId, elementId, conversationId, commentId, comment, version}) {
        let response;
        if(version == -1) {
            response = await editExecutionComment(executionId, elementId, conversationId, commentId, comment);
        }
        else {
            response = await editProcedureComment(executionId, version, elementId, conversationId, commentId, comment);
            commit("editElementConversationComment", {elementId: elementId, conversationId: conversationId, commentId: commentId, comment: response});
        }
    },
    async deleteComment({commit, rootState}, {executionId, elementId, conversationId, commentId, version}) {
        if(version == -1){
            await deleteExecutionComment(executionId, elementId, conversationId, commentId);
        }
        else {
            await deleteProcedureComment(executionId, version, elementId, conversationId, commentId);
            commit("deleteElementConversationComment", {elementId: elementId, conversationId: conversationId, commentId: commentId});
        }
    },
    
    async fetchComments({commit, rootState}, {elementId}) {
        const executionId = rootState.execution.executionId;
        const comments = await getComments(executionId, elementId);
        commit("setElementComments", {elementId: elementId, comments: comments});
    },
    async deleteExecutionFile({rootState}, {fileId}) {
        const executionId = rootState.execution.executionId;
        await deleteExecutionFile(executionId, fileId);
    },
    async deleteProcedureElementFile({rootState}, {elementId, fileId}) {
        const procedureId = rootState.authoring.procedureId;
        await deleteProcedureElementFile(procedureId, elementId, fileId);
    },
    async deleteExecutionElementFile({rootState}, {elementId, fileId}) {
        const executionId = rootState.execution.executionId;
        await deleteExecutionElementFile(executionId, elementId, fileId);
    },
    async deleteExecutionConversationCommentFile({rootState}, {elementId, conversationId, commentId, fileId}) {
        const executionId = rootState.execution.executionId;
        await deleteExecutionConversationCommentFile(executionId, elementId, conversationId, commentId, fileId);
    },
    async deleteProcedureConversationCommentFile({rootState}, {version, elementId, conversationId, commentId, fileId}) {
        const procedureId = rootState.authoring.procedureId;
        await deleteProcedureConversationCommentFile(procedureId, version, elementId, conversationId, commentId, fileId);
    },
    clearExpandedEdit({commit}) {
        commit("removeConversationExpandEdit");
    },
    "SOCKET_execution-event"({commit, state}, socket_data) {
        let params = socket_data.params;
        let request = socket_data.request_body;
        let response = socket_data.response_body;

        switch(socket_data.event) {
        case "element_update_conversation": {
            commit("editElementConversation", {elementId: params.elem_id, conversationId: params.conversation_id, conversation: response});
            break;
        }
        case "element_add_comment": {
            commit("addElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, comment: response});
            break;
        }
        case "element_add_conversation": {
            commit("addElementConversation", {elementId: params.elem_id, conversation: response});
            let firstComment = Object.keys(response.comments);
            commit("addConversationExpandEdit", {commentId: firstComment[0]});
            break;
        }
        case "element_update_comment": {
            commit("editElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, commentId: params.comment_id, comment: response});
            break;
        }
        case "element_delete_comment": {
            commit("deleteElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, commentId: params.comment_id});
            break;
        }
        case "element_delete_conversation": {
            commit("deleteElementConversation", {elementId: params.elem_id, conversationId: params.conversation_id});
            break;
        }
        }
        
    },
    "SOCKET_AS_RUN_execution-event"({commit, state}, socket_data) {
        let params = socket_data.params;
        let request = socket_data.request_body;
        let response = socket_data.response_body;

        switch(socket_data.event) {
        case "element_add_conversation": {
            commit("addElementConversation", {elementId: params.elem_id, conversation: response});
            let firstComment = Object.keys(response.comments);
            commit("addConversationExpandEdit", {commentId: firstComment[0]});
            break;
        }
        case "element_update_conversation": {
            commit("editElementConversation", {elementId: params.elem_id, conversationId: params.conversation_id, conversation: response});
            break;
        }
        case "element_update_comment": {
            commit("editElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, commentId: params.comment_id, comment: response});
            break;
        }
        case "element_add_comment": {
            commit("addElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, comment: response});
            break;
        }
        case "element_delete_comment": {
            commit("deleteElementConversationComment", {elementId: params.elem_id, conversationId: params.conversation_id, commentId: params.comment_id});
            break;
        }
        case "element_delete_conversation": {
            commit("deleteElementConversation", {elementId: params.elem_id, conversationId: params.conversation_id});
            break;
        }
        }
    }
};

const mutations = {
    setConversations(state, {conversations}) {
        state.conversations = {
            ...state.conversations, 
            ...conversations
        };

        // console.log('setConversations state.conversations');
        // console.log(JSON.stringify(state.conversations, 0, 2));
    },    
    setElementConversations(state, {elementId, conversations}) {
        let tmp = {};

        conversations.forEach(conversation => {
            let tmpComments = {};
            conversation.comments.forEach(comment => {
                tmpComments[comment.comment_id] = comment;
            });

            tmp[conversation.conversation_id] = {
                ...conversation,
                comments: tmpComments
            };
        });

        state.conversations = {
            ...state.conversations, 
            [elementId]: tmp
        };
        // console.log('setElementConversations state.conversations');
        // console.log(JSON.stringify(state.conversations, 0, 2));
    },
    addElementConversation(state, {elementId, conversation}) {
        Vue.set(state.conversations[elementId], conversation.conversation_id, conversation);
        // Vue.delete(state.conversations[elementId][conversation.conversation_id], 'comments');
        let tmpComments = state.conversations[elementId][conversation.conversation_id].comments;
        Vue.set(state.conversations[elementId][conversation.conversation_id], 'comments', {});
        tmpComments.forEach(comment => {
            Vue.set(state.conversations[elementId][conversation.conversation_id].comments, comment.comment_id, comment);
        });
    },
    editElementConversation(state, {elementId, conversationId, conversation}) {
        Vue.set(state.conversations[elementId][conversationId], 'type', conversation.type);
        Vue.set(state.conversations[elementId][conversationId], 'status', conversation.status);
    },
    deleteElementConversation(state, {elementId, conversationId}) {
        Vue.delete(state.conversations[elementId], conversationId);
    },
    addElementConversationComment(state, {elementId, conversationId, comment}) {
        Vue.set(state.conversations[elementId][conversationId].comments, comment.comment_id, comment);
        Vue.set(state, 'expandedComment', comment.comment_id);
    },
    editElementConversationComment(state, {elementId, conversationId, commentId, comment}) {
        Vue.set(state.conversations[elementId][conversationId].comments, commentId, comment);
    },
    deleteElementConversationComment(state, {elementId, conversationId, commentId}) {
        // state.conversations[elementId][conversationId].comments[commentId].splice(-1, 1);
        Vue.delete(state.conversations[elementId][conversationId].comments, commentId);
    },
    addConversationExpandEdit(state, {commentId}) {
        Vue.set(state, 'expandedComment', commentId);
    },
    removeConversationExpandEdit(state) {
        Vue.set(state, 'expandedComment', '');
    },
    setElementComments(state, {elementId, comments}) {
        state.comments =  {...state.comments, [elementId]: comments};
    },
    addElementComment(state, {elementId, comment}) {
        state.comments[elementId].push(comment);
    },
    updateElementComment(state, {elementId, comment}) {
        state.comments[elementId].splice(-1, 1, comment);
    },
    deleteLastElementComment(state, {elementId}) {
        state.comments[elementId].splice(-1, 1);
    },
    setCurrEditCommentId(state, {elementId, commentId}) {
        state.currEditCommentIds = {...state.currEditCommentIds, [elementId]: commentId};
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

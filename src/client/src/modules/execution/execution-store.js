import venueApi from "../../api/venue";
import procedureApi from "../../api/procedures";
import {
    haltExecution,
    deleteExecutionElement,
    executeElement,
    postExecution,
    pauseExecution,
    prepareReExecuteElement,
    patchExecution,
    searchExecution,
    getExecutionElements,
    moveExecutionElement,
    postExecutionElement,
    patchExecutionElement,
    postExecutionElementInput,
    copyExecutionElement,
    postExecutionStatus,
    postResumeExecution,
    postImportProcedure,
    postCallProcedure,
    postSuspendResume,
    justifyExecutionElement,
    bulkJustifyExecutionElements,
    bulkApproveExecutionElements,
    bulkDiscardExecutionElements,
    approveExecutionElement,
    discardExecutionElement,
    modifyExecutionElement,
    clearBreakPoints,
    getExecution,
    autoExecuteElement,
    patchViStatusStep,
    multiCopyExecutionElement,
    multiMoveExecutionElement,
    overrideStepStatus,
    updateOverrideStepStatus,
    discardOverrideStepStatus,
    fetchTimeReferences,
    refreshExecution,
} from "../../api/execution";
import { slimElement, deepCopy, isUndefinedOrNull, setScrollToElementIdFunc, pageElementsFunc, 
    hasAdditionalElementsBeforeFunc, hasAdditionalElementsAfterFunc, getFilteredElementIds, getFilteredElementsFunc,
    resetCustomScriptEntry, getOutlineStructureFunc, toggleOutlineCollapsedFunc, addCopyElemIds, removeCopyElemIds,
    addCopyElemIdsRange, removeCopyElemIdsRange, loadCopyParams, setCopyParams, getDefaultCopyParams,
    getUsername, toggleOutlineCollapsedAllFunc, diffElems, handleErrorNotification, getDefaultSearchResult
} from "../../modules/common/utils";
import { getElementPath } from "../common/elem_types";
import _ from 'lodash';
import Vue from 'vue';

// initial state
const initialState = () => {
    return {
        isPending: false,
        venue: {
            venue_status: {}
        },
        execution: undefined,
        executionId: undefined,
        
        // follow mode of automatic execution. 
        // Save it separatedly from execution since this is not stored in core/archive
        follow: false,
        
        mode: 'execution',

        loadingVenueDetails: false,
        // stores all the elements we get back from the server
        elements: {},
        // stores view state for elements
        elementsViewState: {},
        // stores view state for entries
        entriesViewState: {},
        // stores numeric display order of elements
        elementIds: [],
        // ids of filtered elements by comment types
        filteredElementIds: [],        

        // supports loading indicator when running an element
        updatingElementInput: false,

        notificationMessage: {timestamp: '', msg: ''},         // error message that came via Web socket
        procedurePreview: {},
        // VI Step
        selectedVisStepElementId: null,
        // Scrolling
        viewportPageSize: 1,
        viewportSize: 20,
        viewportTopPointer: 0,     // Index of step in elements referenced by first step in viewport
        scrollToElement: {
            timestamp: '',   // timestamp is used to trigger watch event even when the same element is selected
            elementId: ''
        },
        // Filter toggle
        elemFilters: {
            comment: false,
            activityReport: false,
            dataReview: false,
            resolved: false,
            unresolved: false,
            redline: false,
            blueline: false,
            tag_ids: [],
            filterElementIdMap: {},
            filterElementName: ''
        },
        // Outline Precomputed
        outlinePrecomputed: {},
        // Spinner
        importingProcedure: false,
        callProcedureRedirectUrl: '',
        creatingElement: false,
        movingElement: false,
        copyingElement: false,
        reloadProcedureOutline: {},
        // Tagging
        tags: [],
        // Search
        searchResult: getDefaultSearchResult(),
        // Outline Follow
        outlineFollow: false,
        copyParams: getDefaultCopyParams(),
        replaceElementSource: {},
        // Temporarily store selected vis
        selectedViMap: {},
        kickedOut: false,
        // to highlight redline/blueline input fields
        elemModificationMap: {},
        // Show Modal For Bulk Redline Justification
        procedureModificationModal: false,
        bulkJustificationModalMessage: '',
        redlineElementIds: [],
        // Bulk Redline elements
        bulkRedlineElementIds: [],
        dataInitialized: false
    };
};


const state = initialState();

const getters = {
    dataInitialized: state => state.dataInitialized,
    reloadProcedureOutline: state => state.reloadProcedureOutline,
    procedureDetails: () => { return {}; },  // Just to match the method in authoring-store
    execution: state => state.execution,
    pageTitle: function(state, getters) {
        if (getters.mode === 'execution') {
            return 'Execution (TC)';           
        } else {
            if (getters.executionOpen) {
                return 'Execution (Watch)';              
            } else {
                return 'Execution: As Run';                
            }            
        }
    },    
    follow: state => state.follow,
    isPending: state => state.isPending,
    mode: state => state.mode,
    editMode: state => state.mode === 'execution',
    timeReferences: state => state.timeReferences,
    outlineFollow: state => state.outlineFollow,
    testConductor: function(state, getters) {
        if(getters.venue && getters.venue.venue_status) {
            return getters.venue.venue_status.test_conductor;                    
        } else {
            return '';
        }
    },
    isAuthoringMode: function(state) {
        return false;
    },
    isTestConductor: function(state, getters) {
        const username = getUsername();
        return username === getters.testConductor;
    },
    testConductors: function(state) {
        return state.execution && state.execution.test_conductors ? state.execution.test_conductors : [];
    },
    isOneOfTestConductors: function(state, getters) {
        const username = getUsername();
        return getters.testConductors.includes(username);
    },
    participants: function(state) {
        return state.execution && state.execution.participants ? state.execution.participants : [];
    },
    canParticipate: function(state, getters) {
        const username = getUsername();
        if (username === getters.testConductor) {
            return true;
        } else {
            return getters.participants.includes(username);
        }
    },
    canBulkRedline: function(state, getters) {
        if(getters.isTestConductor || getters.canParticipate || getters.canApproveRedline) {
            return true;
        } else {
            return false;
        }
    },
    canBulkRedlineElement: function(state, getters) { 
        return (elementId) => {
            // TC and approvers can always select 
            if (getters.canApproveRedline) { 
                return true; 
            } 
            // participant can select only unapproved redlines 
            if (getters.canParticipate) { 
                return getters.executionRedlineInputKey(elementId, "approval.status") !== "APPROVED";
            } // other users cannot 
            return false; 
        };
    },
    redlineApprovers: function(state) {
        return state.execution && state.execution.redline_approvers ? state.execution.redline_approvers : [];
    },
    canApproveRedline: function(state, getters) {
        const username = getUsername();
        if (username === getters.testConductor) {
            return true;
        } else {
            return getters.redlineApprovers.includes(username);
        }
    },
    kickedOut: function(state) {
        return state.kickedOut;
    },
    isSelectedViId: function(state) {
        return (viId) => {
            return state.selectedViMap.hasOwnProperty(viId);
        };
    },
    venue: state => state.venue,
    element: state => elementId => state.elements[elementId],
    elements: function(state, getters, rootState) {
        return getFilteredElementsFunc(state);
    },
    elementsAll: state => state.elementIds.map(id => state.elements[id]),
    elementIds: state => state.elementIds,
    searchResult: state => state.searchResult,
    filteredElementIds: state => state.filteredElementIds,    
    filteredElementIdMap: function(state) {
        const map = {};
        for (const filteredElementId of state.filteredElementIds) {
            map[filteredElementId] = filteredElementId;
        }
        return map;
    },
    elementsByParent: function(state) {
        return parentId => state.elementIds.map(id => state.elements[id]).filter((el) => el.parent_id === parentId);
    },
    selectedElementsByParent: function(state) {
        return ({parentId, elementId}) => {
            let elems = state.elements[elementId].execution_user_input.elements
                .filter((el) => el.parent_id === parentId && el.selected === true);
            // console.log(`selectedElementsByParent parentId: ${parentId}`);
            // console.log(`selectedElementsByParent elems: ${elems}`);
            return elems;
        };
    },
    selectedElementIdsByParent: function(state) {
        return ({parentId}) => {
            return state.elements[parentId].execution_user_input.elements.filter((child) => {
                return child.selected;
            }).map((child) => {
                return child.elem_id;
            });
        };
    },
    procedurePreviewRootElements: function(state) {
        return (elementId) => {
            if(state.procedurePreview[elementId]) {
                let prElementId = state.procedurePreview[elementId];
                return Object.entries(state.elements).map(
                    (elemArray) => elemArray[1]
                ).filter(
                    (elem) => prElementId.includes(elem.elem_id) && elem.parent_id === ""
                );
            }

            return [];
        };
    },
    procedurePreviewElementIds: function(state) {
        let elementIds = [];
        Object.entries(state.procedurePreview).map(
            (prArray) => prArray[1]
        ).forEach(
            (elemIdsArray) => elemIdsArray.forEach( (elemId) => {
                elementIds.push(elemId);
            })
        );
        return elementIds;
    },
    nestedChildIds: function(state) {
        return function(elementId) {
            let elementsToCheck = [state.elements[elementId]];
            let childElements = [];
            let currentElement;
            while (elementsToCheck.length) {
                currentElement = elementsToCheck.pop();
                let children = state.elementIds.map(id => state.elements[id]).filter((el) => el.parent_id === currentElement.elem_id);
                elementsToCheck = elementsToCheck.concat(children);
                childElements.push(currentElement.elem_id);
            }
            return childElements;
        };
    },
    parentIdsByChild: function(state) {
        return (childId, stopAtId='') => {
            if(state.elements[childId]) {
                let accumulatedParentIds = [];
                let currentParentId = state.elements[childId].parent_id;
                let shouldStop = currentParentId === stopAtId;
                while (currentParentId && !shouldStop) {
                    accumulatedParentIds.push(currentParentId);
                    currentParentId = state.elements[currentParentId].parent_id;
                    shouldStop = currentParentId === stopAtId;
                }
                return accumulatedParentIds;
            }

            return [];
        };
    },
    parentsByChild: function(state, getters) {
        return (childId, stopAtId='') => {
            return getters.parentIdsByChild(childId, stopAtId).map((id) => state.elements[id]);
        };
    },

    currentStepId: state => state.execution ? state.execution.current_step_id : '',
    parentExecutionId: state => state.execution ? state.execution.parent_execution_id : '',
    executionId: state => state.executionId,
    procedureTagSelections: state => (elementId) => {
        const procedureTagSelections = _.get(state.elements[elementId].execution_user_input, 'tag_selections') || [];
        return procedureTagSelections;
    },
    executionInput: state => (elementId) => state.elements[elementId].execution_user_input,
    executionRedlineInput: state => (elementId) => state.elements[elementId].procedure_modification,
    executionRedlineInputKey: state => (elementId, keyString) => _.get(state.elements[elementId].procedure_modification, keyString),
    executionOpen: state => {
        // return true if the execution has not been closed
        let isOpen = true;
        const execution_status = state.execution ? state.execution.status : '';      
        switch (execution_status) {
        case "SUSPENDED":
        case "CLOSED":
        case "IN_REVIEW":
        case "FINALIZED":
            isOpen = false;
            break;
        default:
            isOpen = true;
        }
        return isOpen;
    },
    executionFinalized: state => {
        const execution_status = state.execution ? state.execution.status : '';      
        return execution_status === 'FINALIZED';
    },
    executionHasBeenClosed: state => {
        // return true if the execution has been closed
        const execution_status = state.execution ? state.execution.status : '';
        return ['CLOSED', 'IN_REVIEW', 'FINALIZED'].includes(execution_status);
    },
    executionInputKey: state => (elementId, keyString) => _.get(state.elements[elementId].execution_user_input, keyString),
    executionInputEntriesArrayFilter: state => (elementId, keys) => {
        if(state.elements[elementId]) {
            let values = [];
            _.forEach(state.elements[elementId].execution_user_input.entries, entry => {
                let values_inner = [];
                // from perspective of keys pick out values from entries preserving order
                _.forEach(keys, key => {
                    // push value as string delimited by comma if array
                    if(entry[key] instanceof Array)
                        values_inner.push(entry[key].join(","));
                    else
                        values_inner.push(entry[key]);
                });
                values.push(values_inner);
            });
            return values;
        } else return [];
    },
    executionInputCustomScriptEntriesArrayFilter: state => (elementId, keys) => {
        if(state.elements[elementId]) {
            let values = [];
            _.forEach(state.elements[elementId].execution_user_input.entries, entry => {
                let values_inner = [];
                // from perspective of keys pick out values from entries preserving order
                _.forEach(keys, key => {
                    const correspondingEntryInput = entry.entry_inputs.find(entry_input => entry_input.name == key);
                    if (correspondingEntryInput) {
                        if (correspondingEntryInput.hasOwnProperty('value')) {
                            values_inner.push(correspondingEntryInput.value);
                        } else {
                            values_inner.push(null);
                        }
                    }
                });
                values.push(values_inner);
            });
            return values;
        } else return [];
    },
    executionInputEntryKey: state => (elementId, index, keyString) => _.get(state.elements[elementId].execution_user_input.entries[index], keyString),
    executionInputChildIndexById: state => (elementId, childId) => _.findIndex(state.elements[elementId].execution_user_input.elements, {"elem_id": childId}),

    executionMetaData: state => (elementId) => _.get(state.elements[elementId].execution, 'meta_data'),
    executionMetaDataKey: state => (elementId, keyString) => _.get(state.elements[elementId].execution.meta_data, keyString),
    executionResultsKey: state => (elementId, keyString) => _.get(state.elements[elementId].execution.results, keyString),
    executionResultsEntryKey: state => (elementId, entryIndex, keyString) => _.get(state.elements[elementId].execution.results.entries[entryIndex], keyString),
    executionResultsEntry: state => (elementId, entryIndex) => state.elements[elementId].execution.results.entries[entryIndex],
    
    notificationMessage: state => state.notificationMessage,

    numEntries: state => elementId => {
        if (state.elements[elementId].execution_user_input === undefined)
            return 0;
        return state.elements[elementId].execution_user_input.entries ? state.elements[elementId].execution_user_input.entries.length : 0;
    },
    venueKey: state => (keyString) => { return _.get(state.venue.venue_status, keyString); },
    elementKey: state => (elementId, keyString) => _.get(state.elements[elementId], keyString),
    elementViewState: state => (elementId) => state.elementsViewState[elementId],
    entryViewState: state => (elementId, index) => state.entriesViewState[elementId][index],
    elementViewStateKey: state => (elementId, keyString) => state.elementsViewState[elementId][keyString],
    directionalUnExecutedElement: state => (elementId, direction) => {
        // determine element position in elementIds state array
        let elementPos = state.elementIds.indexOf(elementId);
        let idsToCheck = [];

        // grabs elementIds before or after elementPos
        if(direction === "before") {
            idsToCheck = state.elementIds.slice(0, elementPos);
        } else {
            idsToCheck = state.elementIds.slice(elementPos + 1);
        }

        // return elementId for the first element that has NOT been executed, otherwise false
        return idsToCheck.find(function(idToCheck) {
            // explicitly check for false to avoid matching undefined
            if(state.elements[idToCheck]["executed"] === false)
                return idToCheck;
        });
    },

    getProcedurePreviewByElementId: (state) => (elementId) => state.procedurePreview[elementId],

    selectedFlightDictionaryVersion: (state) => {
        return (state.execution && state.execution.flight_dictionary_version) ? state.execution.flight_dictionary_version : '';
    },
    selectedSseDictionaryVersion: (state) => {
        return (state.execution && state.execution.sse_dictionary_version) ? state.execution.sse_dictionary_version : '';
    },

    tag: state => (tagId) => state.tags.filter(tag => tag.tag_id === tagId)[0],
    tags: state => () => state.tags,

    // VI Step
    selectedVisStepElementId: (state) => state.selectedVisStepElementId,
    getVisByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.execution_user_input.vis`, []),
    getStepsByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.execution_user_input.steps`, []),
    getStepResultsByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.execution.results.steps`, []),
    allSelectedVis: (state, getters) => {
        const elements = getters.elementsAll;
        if(!elements) { return []; }
        return Object.values(elements.filter((element) => element.step_type === "VERIFICATION_ITEM")
            .reduce(
                (accu, element) => {
                    element.execution_user_input.vis.forEach((vi) => {
                        if(!accu.hasOwnProperty(vi.vi_id)) { accu[vi.vi_id] = vi; }
                    });
                    return accu;
                },
                {}
            ));
    },
    dataPaths: function(state) {
        const dataPaths = [];
        if (state.elements) {
            for (const element of Object.values(state.elements)) {
                if (element.step_type === 'GDS_MANUAL') {
                    if (element.execution_user_input && element.execution_user_input.entries) {
                        for (const entry of element.execution_user_input.entries) {
                            if (entry.data_path && !dataPaths.includes(entry.data_path)) {
                                dataPaths.push(entry.data_path);
                            }
                        }
                    }
                }
            }
        }
        return dataPaths;
    },

    // Scrolling
    viewportTopPointer: (state) => state.viewportTopPointer,  
    scrollToElement: (state) => state.scrollToElement,
    hasAdditionalElementsBefore: function(state, getters, rootState) {
        return hasAdditionalElementsBeforeFunc(state);
    },
    hasAdditionalElementsAfter: function(state, getters, rootState) {
        return hasAdditionalElementsAfterFunc(state);
    },
    // Procedure Workflow Toggle State
    commentFilter: (state) => state.elemFilters.comment,
    activityReportFilter: (state) => state.elemFilters.activityReport,
    dataReviewFilter: (state) => state.elemFilters.dataReview,
    resolvedFilter: (state) => state.elemFilters.resolved,
    unresolvedFilter: (state) => state.elemFilters.unresolved,
    redlineFilter: (state) => state.elemFilters.redline,
    bluelineFilter: (state) => state.elemFilters.blueline,
    anyFilter: (state) => state.elemFilters.comment || state.elemFilters.dataReview || state.elemFilters.activityReport || state.elemFilters.resolved || state.elemFilters.unresolved || state.elemFilters.redline || state.elemFilters.blueline,

    // Outline
    fetchOutlinePrecomputed: state => {
        return state.outlinePrecomputed ? state.outlinePrecomputed : {};
    },

    modStyle: (state) => (elementId, fieldPath, isInput=true) => {
        const elemMod = state.elemModificationMap[elementId];
        const hasElemMod = elemMod && Object.keys(elemMod).length > 0;
        const fullFieldPath = isInput ? `execution_user_input.${fieldPath}` : fieldPath;

        if (hasElemMod) {
            const modType = elemMod[fullFieldPath];
            if (modType === 'A') {
                return 'mod-added';
            } else if (modType === 'D') {
                return 'mod-deleted';
            } else if (modType === 'CD') {
                return 'mod-changed-del';
            } else if (modType === 'CA') {
                return 'mod-changed-add';
            } else {
                return '';
            }
        } else {
            return '';
        }
    },

    elemDiffsShown: (state) => (elementId) => {
        const elemMod = state.elemModificationMap[elementId];
        return elemMod ? true : false;
    },

    // Spinner
    importingProcedure: state => {
        return state.importingProcedure;
    },
    callProcedureRedirectUrl: state => {
        return state.callProcedureRedirectUrl;
    },
    creatingElement: state => {
        return state.creatingElement;
    },
    movingElement: state => {
        return state.movingElement;
    },
    copyingElement: state => {
        return state.copyingElement;
    },
    updatingElementInput: state => {
        return state.updatingElementInput;
    },
    // copy operation
    copyParams: state => {
        return state.copyParams;
    },
    copyElemIdMap: state => {
        return (state.copyParams && state.copyParams.copyElemIdMap) ? state.copyParams.copyElemIdMap : {};
    },
    // ids of elements selected
    selectedElementIds: state => {
        // no need to sort element ids because backend will sort elem ids according to the elements order
        if (state.copyParams && state.copyParams.copyElemIdMap) {
            return Object.keys(state.copyParams.copyElemIdMap);
        } else {
            return [];
        }
    },
    // ids of elements that can be copied into this execution
    selectedElementIdsForCopy: (state, getters) => {
        return getters.selectedElementIds;
    },
    // ids of selected elements of this execution
    selectedElementIdsForThis: state => {
        if (state.copyParams && state.copyParams.copyElemIdMap && state.copyParams.execution_id === state.executionId) {
            return Object.keys(state.copyParams.copyElemIdMap);
        } else {
            return [];
        }
    },
    selectedElementIdsForMove: (state, getters) => {
        return getters.selectedElementIdsForThis;
    },
    hasSelectedElements: (state, getters) => {
        return getters.selectedElementIds.length > 0;
    },
    hasSelectedElementsToCopy: (state, getters) => {
        return getters.selectedElementIdsForCopy.length > 0;
    },
    hasSelectedElementsForThis: (state, getters) => {
        return getters.selectedElementIdsForThis.length > 0;
    },
    hasSelectedElementsToMove: (state, getters) => {
        return getters.selectedElementIdsForMove.length > 0;
    },
    selectedElement: (state) => (elementId) => {
        return (state.copyParams && state.copyParams.copyElemIdMap) ?
            state.copyParams.copyElemIdMap.hasOwnProperty(elementId) : false;
    },
    replaceElementSource: state => {
        return state.replaceElementSource;
    },
    hasReplaceElementSource: state => {
        return Object.keys(state.replaceElementSource).length > 0;
    },
    procedureModificationModal: state => state.procedureModificationModal,
    redlineElementIds: state => state.redlineElementIds,
    bulkJustificationModalMessage: state => state.bulkJustificationModalMessage,
    bulkRedlineElementIds: state => state.bulkRedlineElementIds,
};

/* istanbul ignore next */
const actions = {
    setBooleanKey({commit}, {key, bool}) {
        commit('setBooleanKey', {key: key, bool: bool});
    },
    setOutlineFollow({commit}, follow) {
        commit("setOutlineFollow", follow);
    },
    setPending({commit}, busy) {
        commit("setPending", busy);
    },
    setMode({commit}, {mode}) {
        commit("setMode", {mode: mode});
    },
    setViewportTopPointer({commit}, {index}) {
        commit('setStateKey', {key: 'viewportTopPointer', val: index});
    },
    async fetchExecution({commit}, executionId){
        const execution = await getExecution(executionId);
        commit("receiveExecution", {executionId});
        commit("receiveExecutionObj", execution);
        return execution;
    },
    async createExecution({commit}, {venueId}) {
        try {
            return await postExecution({venueId});
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async refreshExecution({commit}, executionId) {
        try {
            return await refreshExecution(executionId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async populateTimeReferences({commit, getters}) {
        const executionId = getters.executionId;

        const timeReferences = await fetchTimeReferences(executionId);
        commit("receiveTimeReferences", timeReferences);
        return timeReferences;
    },
    async fetchVenue({commit}, venueId) {
        commit("setBooleanKey", {key: "loadingVenueDetails", bool: true});
        try {
            const venue = await venueApi.getVenue(venueId);
            commit("receiveVenue", venue);
            commit("setBooleanKey", {key: "loadingVenueDetails", bool: false});
        } catch (error) {
            console.error(`Venue not found: ${error}`);
            commit("setBooleanKey", {key: "loadingVenueDetails", bool: false});
        }
    },
    async fetchProcedureVersion({commit}, {procedureId, version}) {
        commit("setBooleanKey", {key: "loadingProcedureDetails", bool: true});
        return procedureApi.getProcedureVersion(procedureId, version);
    },
    async fetchElements({commit, getters, rootState, dispatch}, {executionId}) {
        commit("setPending", true);
        const { elements, error } = await getExecutionElements(executionId);
        if (error) {
            commit('receiveFeedback', {type: 'error', errorObj: {message: 'Failed to get execution elements. Reload the page.', details: [error.message]}});
        } else {
            const elem_ids = elements.map(element => element.elem_id);           
            commit("receiveElements", {elements, detailLevel: 2, numbers: [], elementIds: elem_ids, rootState});
            const tagMap = {};
            for (const element of elements) {
                if (element.elem_type === 'PROCEDURE_SECTION') {
                    if (element.execution_user_input && element.execution_user_input.tag_selections) {
                        for (const tag_selection of element.execution_user_input.tag_selections) {
                            tagMap[tag_selection.tag_id] = tag_selection;
                        }
                    }   
                }
            }
            const tag_selections = Object.values(tagMap);
            if (tag_selections.length > 0) {
                dispatch('addExecutionTags', {tags: tag_selections}, {root: true});
            }
        }
        commit("setPending", false);

        return elements;
    },
    toggleExecutionFollow({commit}, follow) {
        commit("setExecutionFollow", {follow: follow});
    },        
    async scrollElements({commit}, {scrollDirection}) {
        commit("pageElements", {scrollDirection: scrollDirection});
    },    
    async createElement({commit, getters, rootState}, {elementType, insertAfterId, level}) {
        commit("setBooleanKey", {key: "creatingElement", bool: true});
        await postExecutionElement(getters.executionId, elementType, insertAfterId, level,
            () => {},
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit("setBooleanKey", {key: "creatingElement", bool: false});
    },
    async moveElement({commit, getters, rootState}, {insertAfterId, elementId, level}) {
        commit('setBooleanKey', {key: 'movingElement', bool: true});
        await moveExecutionElement(getters.executionId, elementId, insertAfterId, level,
            () => {},
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit('setBooleanKey', {key: 'movingElement', bool: false});
    },
    async copyElement({commit, getters, rootState}, {insertAfterId, elementId, level}) {
        commit('setBooleanKey', {key: 'copyingElement', bool: true});
        await copyExecutionElement(getters.executionId, elementId, insertAfterId, level,
            () => {},
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
        commit('setBooleanKey', {key: 'copyingElement', bool: false});
    },
    async multiCopyElement({commit, getters, rootState}, {
        executionId,
        elementIds,
        insertAfterId,
        level,
        sourceExecutionId,
        sourceProcedureId,
        sourceProcedureVersion
    }) {
        commit('setBooleanKey', {key: 'copyingElement', bool: true});
        await multiCopyExecutionElement({
            executionId,
            elementIds,
            insertAfterId,
            level,
            sourceExecutionId,
            sourceProcedureId,
            sourceProcedureVersion
        },
        () => {},
        (error) => {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        });
        commit('setBooleanKey', {key: 'copyingElement', bool: false});
    },
    async multiMoveElement({commit, getters, rootState}, {
        executionId,
        elementIds,
        insertAfterId,
        level,
        sourceExecutionId,
        sourceProcedureId,
        sourceProcedureVersion
    }) {
        commit('setBooleanKey', {key: 'movingElement', bool: true});
        await multiMoveExecutionElement({
            executionId,
            elementIds,
            insertAfterId,
            level,
            sourceExecutionId,
            sourceProcedureId,
            sourceProcedureVersion
        },
        () => {},
        (error) => {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        });
        commit('setBooleanKey', {key: 'movingElement', bool: false});
    },
    async moveEntry({commit, getters, state}, {insertAfterIndex, draggedEntryIndex, elementId}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        insertAfterIndex = parseInt(insertAfterIndex);
        draggedEntryIndex = parseInt(draggedEntryIndex);
        const insertionIndex = draggedEntryIndex > insertAfterIndex ? insertAfterIndex + 1 : insertAfterIndex;

        const elementPath = getElementPath(state.elements[elementId]);
        let input = deepCopy(state.elements[elementId].execution_user_input);
        const entryToMove = input.entries.splice(draggedEntryIndex, 1)[0];
        input.entries.splice(insertionIndex, 0, entryToMove);

        let payload = input;
        try {
            await postExecutionElementInput(getters.executionId, elementPath, elementId, payload);
            commit("moveEntryViewState", { insertAfterIndex, draggedEntryIndex, elementId });
        } catch (error) {
            const messageObj = {
                message: 'Error when saving step input. The change may NOT have been saved in the server. RELOAD THE PAGE TO CHECK.',
                details: [_.unescape(`${error}`)]
            };
            commit('receiveFeedback', {type: 'error', messageObj: messageObj});
        }
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async removeElement({commit, getters, rootState}, {elementId}) {
        try {
            await deleteExecutionElement(getters.executionId, elementId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async discardRedlineElement({commit, getters, rootState}, {elementId}) {
        await discardExecutionElement(getters.executionId, elementId,
            () => {},
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
    },
    async modifyElement({commit, getters, rootState}, {elementId}) {
        // Note copyingElement flag is used since modify will create a copy of the original step
        commit('setBooleanKey', {key: 'copyingElement', bool: true});
        try {
            await modifyExecutionElement(getters.executionId, elementId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit('setBooleanKey', {key: 'copyingElement', bool: false});
    },
    async clearBreakPoints({commit, getters}) {
        await clearBreakPoints(getters.executionId,
            (data) => {},
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async updateElement({commit, getters}, {elementPath, elementId, element}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        const payload = element;
        try {
            await patchExecutionElement(getters.executionId, elementPath, elementId, payload);
        } catch (error) {
            const messageObj = {
                message: 'Error when saving step. The change may NOT have been saved in the server. RELOAD THE PAGE TO CHECK.',
                details: [_.unescape(`${error}`)]
            };
            commit('receiveFeedback', {type: 'error', messageObj: messageObj});
        }
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async executeElement({commit, getters}, {elementId}) {
        commit("setElementViewStateKey", {elementId, key: "loading", val: true});
        commit("initElementExecution", elementId);
        try {
            await executeElement(getters.executionId, elementId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit("setElementViewStateKey", {elementId, key: "loading", val: false});
    },
    async overrideStepStatus({commit, getters}, {elementId, justification}) {
        commit("setElementViewStateKey", {elementId, key: "loading", val: true});
        try {
            await overrideStepStatus(getters.executionId, elementId, justification);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit("setElementViewStateKey", {elementId, key: "loading", val: false});
    },
    async updateOverrideStepStatus({commit, getters}, {elementId, justification}) {
        commit("setElementViewStateKey", {elementId, key: "loading", val: true});
        try {
            await updateOverrideStepStatus(getters.executionId, elementId, justification);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit("setElementViewStateKey", {elementId, key: "loading", val: false});
    },
    async discardOverrideStepStatus({commit, getters}, {elementId}) {
        commit("setElementViewStateKey", {elementId, key: "loading", val: true});
        try {
            await discardOverrideStepStatus(getters.executionId, elementId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit("setElementViewStateKey", {elementId, key: "loading", val: false});
    },
    async prepareReExecuteElement({commit, getters}, {elementId}) {
        commit("setElementViewStateKey", {elementId, key: "loading", val: true});
        await prepareReExecuteElement(getters.executionId, elementId,
            ({data}) => {
                // do nothing
                // response is handled asynchronously via Websocket message
                // because the event needs to be handled each time a step is executed again
                // during automatic execution
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
        commit("setElementViewStateKey", {elementId, key: "loading", val: false});
    },
    async saveExecution({commit, getters}, executionPayload){
        // Update only fields that have been changed.
        // This avoids race condition when UI events try to update execution status in backend.
        await patchExecution(getters.executionId, executionPayload);
    },
    async setSseDictionaryVersion({commit, getters}, dictionaryVersion){
        await patchExecution(getters.executionId, {'sse_dictionary_version': dictionaryVersion},
            ({data}) => { 
                commit('receiveExecutionObj', data);
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async setFlightDictionaryVersion({commit, getters}, dictionaryVersion){
        await patchExecution(getters.executionId, {'flight_dictionary_version': dictionaryVersion},
            ({data}) => { 
                commit('receiveExecutionObj', data);
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async search({commit, getters}, {searchPayload}) {
        await searchExecution(getters.executionId, searchPayload, 
            (data) => {
                commit('receiveSearch', data);
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    clearSearchResults({commit}) {
        commit('clearSearchResults');
    },
    async saveElementInput({commit, getters}, {elementPath, elementId, input}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        let payload = state.elements[elementId].execution_user_input;
        if (input) {
            payload = {...payload, ...input};
        }
        try {
            await postExecutionElementInput(getters.executionId, elementPath, elementId, payload);
        } catch (error) {
            const messageObj = {
                message: 'Error when saving step input. The change may NOT have been saved in the server. RELOAD THE PAGE TO CHECK.',
                details: [_.unescape(`${error}`)]
            };
            commit('receiveFeedback', {type: 'error', messageObj: messageObj});
        }
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },

    async saveJustificationElement({commit, getters}, {elementId, justificationInput}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        await justifyExecutionElement(getters.executionId, elementId, justificationInput,
            () => {},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async saveBulkJustificationElements({commit, getters}, {bulkJustificationInput}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        let payload = {
            elem_ids: getters.redlineElementIds,
            justification_input: bulkJustificationInput
        };
        await bulkJustifyExecutionElements(getters.executionId, payload,
            ()=>{},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async saveBulkRedlineJustificationChanges({commit, getters}, {payload}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        await bulkJustifyExecutionElements(getters.executionId, payload,
            ()=>{},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async saveBulkRedlineApprovalChanges({commit, getters}, {payload}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        await bulkApproveExecutionElements(getters.executionId, payload,
            ()=>{},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async saveBulkRedlineDiscardChanges({commit, getters}, {payload}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        await bulkDiscardExecutionElements(getters.executionId, payload,
            ()=>{},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async saveApprovalElement({commit, getters}, {elementId, approvalInput}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        await approveExecutionElement(getters.executionId, elementId, approvalInput,
            () => {},
            (error) => { commit('receiveFeedback', {type: 'error', errorObj: error}); }
        );
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async closeExecution({commit}, {executionId}) {
        try {
            const response = await postExecutionStatus(executionId, 'CLOSED', '');
            return response.status === 200;  // abstract status check here, bool check higher up
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async suspendExecution({commit}, {executionId}) {
        try {
            const response = await postExecutionStatus(executionId, "SUSPENDED", "");
            return response;
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async resumeExecution({commit}, {executionId, venueId}) {
        try {
            const response = await postResumeExecution(executionId, venueId);
            return response;
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async changeExecutionStatus({dispatch}, {executionId, status, comment}) {
        const response = await postExecutionStatus(executionId, status, comment);
        dispatch("fetchExecution", executionId);
        return response.status === 200;  // abstract status check here, bool check higher up
    },
    async runExecution({commit, state}) {
        if (state.executionId && state.execution && state.execution.status === 'IDLE') {
            if (state.execution.mode === 'AUTO') {
                try {
                    await autoExecuteElement(state.executionId);
                } catch (error) {
                    commit('receiveFeedback', {type: 'error', errorObj: error});
                }
            } else if (state.execution.mode === 'MANUAL') {
                try {
                    await executeElement(state.executionId, '');
                } catch (error) {
                    commit('receiveFeedback', {type: 'error', errorObj: error});
                }
            }
        } else {
            console.warn(`Execution is not in IDLE status. Cannot run it again.`);
        }
    },
    async setPauseExecution({commit, state}) {
        try {
            await pauseExecution(state.executionId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async abortExecution({commit, state}) {
        await haltExecution(state.executionId, () => {
            console.log("There was an error aborting this execution.");
        });
    },
    async importProcedure({commit, getters, state, rootState, dispatch}, {elementId, callable}) {
        commit("setBooleanKey", {key: "importingProcedure", bool: true});

        if (callable) {
            const { execution, error } = await postCallProcedure(state.executionId, elementId);
            if (error) {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        } else {
            const { elements, error } = await postImportProcedure(state.executionId, elementId);
            if (error) {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }       
        }

        commit("setBooleanKey", {key: "importingProcedure", bool: false});
    },
    async suspendResume({commit, getters, state, rootState, dispatch}, targetExecutionId) {
        const { execution, error } = await postSuspendResume(state.executionId, targetExecutionId);
        if (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
            return {error: error};
        } else {
            return {execution: execution};
        }
    },
    "SOCKET_execution-event"({commit, getters, state, rootState, dispatch}, socket_data) {
        const user_name = socket_data.user_name;
        const status_code = socket_data.status_code;
        const params = socket_data.params;
        const request = socket_data.request_body;
        const response = socket_data.response_body;

        // always show any error
        if (handleErrorNotification(status_code, response, commit)) return;

        switch(socket_data.event) {
        case "post_execution_message": {
            // This case is used only to handle display any info/error.
            handleExecutionMessage(request.msg, request.level, commit);
            break;
        }
        // Execute Element
        case "execution_compute_element":
        case "update_step_result": {
            const step = state.elements[params.elem_id];
            if (!step) {
                console.warn(`update_step_result. step was not found in UI. execution_id: ${params.execution_id} elem_id: ${params.elem_id}`);
            }
            
            const number = step.number;
            const current_time_updated = step.execution && step.execution.meta_data ?  step.execution.meta_data.time_updated : '';
            const current_status = step.execution && step.execution.meta_data ?  step.execution.meta_data.status : '';
            const time_updated = response.execution && response.execution.meta_data ? response.execution.meta_data.time_updated : '';
            const new_status = response.execution && response.execution.meta_data ? response.execution.meta_data.status : '';

            console.log(`update_step_result. execution_id: ${params.execution_id} number: ${number} elem_id: ${params.elem_id} ` + 
                `time_updated: ${time_updated} current_time_updated: ${current_time_updated} current_status: ${current_status} new_status: ${new_status}`);
            
            if (outdatedStepEvent(time_updated, current_time_updated)) {
                console.warn(`update_step_result. outdated results. execution_id: ${params.execution_id} number: ${number} elem_id: ${params.elem_id} ` +
                    `time_updated: ${time_updated} current_time_updated: ${current_time_updated} current_status: ${current_status} new_status: ${new_status}`);
                break;
            }

            // check this only for EXECUTED steps. Exclude COMPUTED steps. 
            // For execution page, this is not strictly necessary because the status of step is changed to RUNNING, which is not done for watcher's page. 
            // But doing this check does not hurt.
            if (step.executable === 'EXECUTED') {
                if(isStepCompleted(step)) {
                    console.warn(`update_step_result. step already completed. execution_id: ${params.execution_id} number: ${number} elem_id: ${params.elem_id} ` +
                        `time_updated: ${time_updated} current_time_updated: ${current_time_updated} current_status: ${current_status} new_status: ${new_status}`);
                    break;
                }
            }
            // throttle update of step status while it is running to avoid UI performance issue and web socket disconnection
            // for wait eha and verify eha steps.
            if (new_status === 'RUNNING') {
                if (step.step_type === 'WAIT_EHA' || step.step_type === 'VERIFY_EHA') {
                    if (current_time_updated && time_updated) {
                        const current_milisecs = Date.parse(current_time_updated);
                        const new_milisecs = Date.parse(time_updated);
                        if (Number.isInteger(current_milisecs) && Number.isInteger(new_milisecs)) {
                            // ignore update within 1 second
                            let elapsed_milisecs = new_milisecs - current_milisecs;
                            if (elapsed_milisecs < 1000) {
                                console.log(`Step update is less than 1000 milisecs. Skip. elapsed_milisecs: ${elapsed_milisecs}`);
                                break;
                            }
                        }
                    }
                }
            }
            // make noise on error
            const ingeniumMute = localStorage.getItem("ingeniumMute");
            if (ingeniumMute === "false") {
                switch(new_status) {
                case "ERROR": {
                    if(localStorage.getItem("ingeniumTriggerAudioOn") !== null && JSON.parse(localStorage.getItem("ingeniumTriggerAudioOn")).includes('ON_ERROR')) {
                        let audio = new Audio('/static/step_error.mp3');
                        audio.play();
                        let n = 0;
                        let title = document.title;
                        let interval = setInterval(function() {
                            if(document.title == 'ERROR') {
                                document.title = title;
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            } else {
                                document.title = 'ERROR';
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon_error.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            if(++n == 4)
                                window.clearInterval(interval);
                        }, 500);
                    }
                    break;
                }
                case "PASS": {
                    if(localStorage.getItem("ingeniumTriggerAudioOn") !== null && JSON.parse(localStorage.getItem("ingeniumTriggerAudioOn")).includes('ON_PASS')) {
                        let audio = new Audio('/static/step_pass.mp3');
                        audio.play();
                        let n = 0;
                        let title = document.title;
                        let interval = setInterval(function() {
                            if(document.title == 'PASS') {
                                document.title = title;
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            } else {
                                document.title = 'PASS';
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon_error.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            if(++n == 4)
                                window.clearInterval(interval);
                        }, 500);
                    }
                    break;
                }
                case "FAIL": {
                    if(localStorage.getItem("ingeniumTriggerAudioOn") !== null && JSON.parse(localStorage.getItem("ingeniumTriggerAudioOn")).includes('ON_FAIL')) {
                        let audio = new Audio('/static/step_fail.mp3');
                        audio.play();
                        let n = 0;
                        let title = document.title;
                        let interval = setInterval(function() {
                            if(document.title == 'FAIL') {
                                document.title = title;
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            } else {
                                document.title = 'FAIL';
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon_error.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            if(++n == 4)
                                window.clearInterval(interval);
                        }, 500);
                    }
                    break;
                }
                }
            }

            if (status_code === 200) {
                if (response.execution && response.execution.meta_data) {
                    commit("updateElementWebsocketsMetaData", {
                        elementId: params.elem_id,
                        value: response.execution.meta_data
                    });
                } else {
                    console.warn(`update_step_result. step execution meta data was not found. elem_id: ${params.elem_id}`);
                }

                // if there's results available update them too
                if(response.execution.results && response.execution.results) {
                    commit("updateElementWebsocketsResults", {
                        elementId: params.elem_id,
                        value: response.execution.results
                    });
                } else {
                    console.warn(`update_step_result. step execution results were not found. elem_id: ${params.elem_id}`);
                }
            }
            break;
        }
        case "run_execution": {
            // no nothing.
            break;            
        }
        case "override_step": 
        case "update_override_step": 
        case "discard_override_step": { 
            const step = state.elements[params.elem_id]; 
            if (!step) { 
                console.warn(`${socket_data.event}. step was not found in UI. execution_id: ${params.execution_id} elem_id: ${params.elem_id}`); 
                break; 
            } 
            if (status_code === 200) { 
                if (response.execution && response.execution.meta_data) { 
                    commit("updateElementWebsocketsMetaData", { elementId: params.elem_id, value: response.execution.meta_data }); 
                } else { 
                    console.warn(`${socket_data.event}. step execution meta data was not found. elem_id: ${params.elem_id}`); 
                } 
            } 
            break; 
        }
        case "create_new_run": {
            commit("updateElementExecution", {
                elementId: response.elem_id,
                execution: response.execution,
                executed: response.executed,
                execution_user_input: response.execution_user_input,
                run_records: response.run_records
            });
            break;
        }
        case "pause_execution":
        case "halt_execution": {
            // When execution is halted, execution status and current_step_id will be updated 
            // when the result of the halted step result is reported.
            // To avoid race condition, update only execution status.
            if (response.status) {
                commit("receiveExecutionObj", {'status': response.status});
            }
            break;
        }
        // Update Execution Status
        case "update_execution_status": {
            // the response has the complete execution info
            commit("receiveExecutionObj", response);
            break;
        }
        case "update_execution": {
            const ingeniumMute = localStorage.getItem("ingeniumMute");
            if (ingeniumMute === "false") {
                if(response.mode == "AUTO" && request.status == "IDLE") {
                    if(localStorage.getItem("ingeniumTriggerAudioOn") !== null && JSON.parse(localStorage.getItem("ingeniumTriggerAudioOn")).includes('ON_PAUSE')) {
                        let audio = new Audio('/static/step_pause.mp3');
                        audio.play();
                        let n = 0;
                        let title = document.title;
                        let interval = setInterval(function() {
                            if(document.title == 'PAUSE') {
                                document.title = title;
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            } else {
                                document.title = 'PAUSE';
                                let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                                link.type = 'image/png';
                                link.rel = 'shortcut icon';
                                link.href = '/static/images/favicon_error.png';
                                document.getElementsByTagName('head')[0].appendChild(link);
                            }
                            if(++n == 4)
                                window.clearInterval(interval);
                        }, 500);
                    }
                }
            }

            if (state.follow) {
                if (response.current_step_id && (response.current_step_id !== state.execution.current_step_id)) {
                    commit('setScrollToElementId', {id: response.current_step_id});
                }
            }
            commit("receiveExecutionObj", response);
            if (state.mode === 'execution' && !getters.canParticipate && !getters.canApproveRedline) {
                commit("setKickedOut", {kickedOut: true});
            }
            break;
        }

        case "import_procedure_section": {
            const elements = response;
            const elem_ids = [...state.elementIds];
            const imported_elem_ids = response.map(element => element.elem_id);

            insertElemIds(elem_ids, imported_elem_ids);
            commit("receiveElements", {elements: elements, detailLevel: 2, numbers: [], elementIds: elem_ids, rootState});
        
            const tag_selections = getters.executionInputKey(params.elem_id, 'tag_selections');

            // It is ok to add all tags regardless of selected flag because tag info is used
            // only to find the name of tag in execution
            dispatch('addExecutionTags', {tags: tag_selections}, {root: true});                     
            break;
        }
        case "call_procedure_section": {
            commit("setCallProcedureRedirectUrl", {key: "callProcedureRedirectUrl", value: response.execution_id});
            break;
        }
        case "suspend_resume_execution": {
            commit("setCallProcedureRedirectUrl", {key: "callProcedureRedirectUrl", value: response.execution_id});
            break;
        }
        // Add Redline Step
        case "execution_modify_element": {
            commit("receiveElement", {element: response.elem, detailLevel: 3, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            // pop up the dialog only for the user who initiated the redline/blueline
            if (user_name && (user_name === getUsername())) {
                const newElemIds = [response.elem.elem_id];
                const {redlineCreated, redlineIds, justificationMessage} = checkRedlineStatus(state, newElemIds, response.numbers);
                commit("toggleProcedureModificationModal", redlineCreated);
                commit("saveRedlineElementIds", redlineIds);
                commit("saveBulkJustificationModalMessage", justificationMessage);
                if (response.elem) {
                    dispatch("toggleRedlineDiffElement", {modifyingElementId: response.elem.elem_id});
                }
            }

            break;
        }
        // Execution Justify Element
        case "execution_approve_element":
        case "execution_justify_element": {
            commit("receiveElement", {element: response, detailLevel: null, numbers: null, elementIds: null, rootState});
            break;
        }
        // Refresh execution
        // Execution Bulk Approve Element
        // Execution Bulk Justify Element
        case "refresh_execution":
        case "execution_bulk_approve":
        case "execution_bulk_justify": {
            const elements = response;
            const elem_ids = [...state.elementIds];
            commit("receiveElements", {elements: elements, detailLevel: null, numbers: [], elementIds: elem_ids, rootState});
            break;
        }
        // Execution Bulk Discard Element
        // Execution Discard Element
        case "execution_discard_element":
        case "execution_discard_elements": {
            commit("discardElement", { numbers: response.numbers, elementIds: response.elem_ids, rootState });
            commit("refreshBulkRedlineElementIds");
            break;
        }
        // Copy Execution Element
        case "copy_execution_element": {
            commit("receiveElements", {elements: response.elements, detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            // pop up the dialog only for the user who initiated the redline/blueline
            if (user_name && (user_name === getUsername())) {
                const newElemIds = response.elements.map((element => element.elem_id));
                const {redlineCreated, redlineIds, justificationMessage} = checkRedlineStatus(state, newElemIds, response.numbers);
                commit("toggleProcedureModificationModal", redlineCreated);
                commit("saveRedlineElementIds", redlineIds);
                commit("saveBulkJustificationModalMessage", justificationMessage);
            }

            break;
        }
        // Move Execution Element
        case "move_execution_element": {
            commit("receiveElements", {elements: [], detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, parentIds: response.parent_ids, rootState});
            break;
        }
        // Remove BreakPoints
        case "remove_break_points": {
            commit("setElementBreakpoints", response);
            break;
        }
        // Create Step
        case "create_gds_step":
        case "create_section":
        case "create_paragraph":
        case "create_procedure_section":
        case "create_get_config_step":
        case "create_venue_config_step":
        case "create_environment_step":
        case "create_update_config_step":
        case "create_check_config_step":
        case "create_graph_eha_step":
        case "create_query_evr_step":
        case "create_verify_eha_step":
        case "create_wait_eha_step":
        case "create_wait_evr_step":
        case "create_list_data_products_step":
        case "create_wait_data_products_step":
        case "create_time_reference_step":
        case "create_cmd_step":
        case "create_cmd_file_step":
        case "create_cmd_scmf_step":
        case "create_cmd_sse_step":
        case "create_bus_1553_step":
        case "create_custom_script_step":
        case "create_manual_input_step":
        case "create_manual_eip_step":
        case "create_manual_verification_step":
        case "create_analysis_step":
        case "create_wait_step":
        case "create_toc_step":
        case "create_vi_step":
        case "create_vi_status_step": {
            commit("receiveElement", {element: response.elem, detailLevel: 3, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            // pop up the dialog only for the user who initiated the redline/blueline
            if (user_name && (user_name === getUsername())) {
                const newElemIds = [response.elem.elem_id];
                const {redlineCreated, redlineIds, justificationMessage} = checkRedlineStatus(state, newElemIds, response.numbers);
                commit("toggleProcedureModificationModal", redlineCreated);
                commit("saveRedlineElementIds", redlineIds);
                commit("saveBulkJustificationModalMessage", justificationMessage);
            }
            break;
        }
        // Delete Step
        case "execution_delete_element": {
            commit("deleteElement", {numbers: response.numbers, elementIds: response.elem_ids, rootState});
            if (user_name && (user_name === getUsername())) {
                const deletedElemIds = [params.elem_id];
                const {redlineCreated, redlineIds, justificationMessage} = checkRedlineStatus(state, deletedElemIds, response.numbers);
                commit("toggleProcedureModificationModal", redlineCreated);
                commit("saveRedlineElementIds", redlineIds);
                commit("saveBulkJustificationModalMessage", justificationMessage);
            }
            break;
        }
        // Edit Step Input
        case "update_GDS_step_input":
        case "update_procedure_section_input":
        case "update_get_config_step_input":
        case "update_venue_config_step_input":
        case "update_environment_step_input":
        case "update_update_config_step_input":
        case "update_check_config_step_input":
        case "update_graph_eha_step_input":
        case "update_query_evr_step_input":
        case "update_verify_eha_step_input":
        case "update_wait_eha_step_input":
        case "update_list_data_products_step_input":
        case "update_wait_data_products_step_input":
        case "update_time_reference_step_input":
        case "update_wait_evr_step_input":
        case "update_cmd_step_input":
        case "update_cmd_file_step_input":
        case "update_cmd_scmf_step_input":
        case "update_cmd_sse_step_input":
        case "update_bus_1553_step_input":
        case "update_custom_script_step_input":            
        case "update_manual_eip_step_input":
        case "update_manual_input_step_input":
        case "update_manual_verification_step_input":
        case "update_wait_step_input":
        case "update_toc_step_input":
        case "update_vi_step_input":
        case "update_vi_status_step_input": {
            commit("updateElementInputWS", {
                elementId: params.elem_id,
                value: request
            });
            dispatch('refreshElemModificationMap', {elementId: params.elem_id});
            break;
        }

        // Update Element
        case "update_gds_step":
        case "update_section":
        case "update_paragraph":
        case "update_procedure_section":
        case "update_get_config_step":
        case "update_venue_config_step":
        case "update_environment_step":
        case "update_update_config_step":
        case "update_check_config_step":
        case "update_graph_eha_step":
        case "update_query_evr_step":
        case "update_verify_eha_step":
        case "update_wait_eha_step":
        case "update_wait_evr_step":
        case "update_list_data_products_step":
        case "update_wait_data_products_step":
        case "update_time_reference_step":
        case "update_cmd_step":
        case "update_cmd_file_step":
        case "update_cmd_scmf_step":
        case "update_cmd_sse_step":
        case "update_bus_1553_step":
        case "update_custom_script_step":
        case "update_manual_input_step":
        case "update_manual_eip_step":
        case "update_manual_verification_step":
        case "update_analysis_step":
        case "update_wait_step":
        case "update_toc_step":
        case "update_vi_step":
        case "update_vi_status_step": {
            commit("receiveElement", {
                element: response,
                numbers: null, 
                elementIds: null, 
                rootState
            });
            dispatch('refreshElemModificationMap', {elementId: params.elem_id});
            break;
        }
        }
    },
    "SOCKET_AS_RUN_execution-event"({commit, getters, state, dispatch, rootState}, socket_data) {
        const status_code = socket_data.status_code;
        const params = socket_data.params;
        const request = socket_data.request_body;
        const response = socket_data.response_body;

        // for watcher, always show any error
        if (handleErrorNotification(status_code, response, commit)) return;

        switch(socket_data.event) {
        case "post_execution_message": {
            // This case is used only to handle display any info/error.
            handleExecutionMessage(request.msg, request.level, commit);
            break;
        }
        // Execute Element
        case "execution_compute_element":
        case "update_step_result": {
            const step = state.elements[params.elem_id];
            if (!step) {
                console.warn(`update_step_result. step was not found in UI. execution_id: ${params.execution_id} elem_id: ${params.elem_id}`);
                break;
            }
            
            const number = step.number;
            const current_time_updated = step.execution && step.execution.meta_data ?  step.execution.meta_data.time_updated : '';
            const current_status = step.execution && step.execution.meta_data ?  step.execution.meta_data.status : '';
            const time_updated = request.meta_data ? request.meta_data.time_updated : '';
            const new_status = request.meta_data ? request.meta_data.status : '';
                        
            if (outdatedStepEvent(time_updated, current_time_updated)) {
                console.warn(`update_step_result. outdated results. execution_id: ${params.execution_id} number: ${number} elem_id: ${params.elem_id} ` +
                    `time_updated: ${time_updated} current_time_updated: ${current_time_updated} current_status: ${current_status} new_status: ${new_status}`);
                break;
            }

            // check this only for EXECUTED steps. Exclude COMPUTED steps. 
            // When a step is executed again, a new run is created. But this is not true for COMPUTED steps such as VI Status. 
            // If VI Status step is executed again, the step will be already in completed status in Vue state in watcher's page. 
            if (step.executable === 'EXECUTED') {
                if(isStepCompleted(step)) {
                    console.warn(`update_step_result. step already completed. execution_id: ${params.execution_id} number: ${number} elem_id: ${params.elem_id} ` +
                        `time_updated: ${time_updated} current_time_updated: ${current_time_updated} current_status: ${current_status} new_status: ${new_status}`);
                    break;
                }
            }
            
            if (new_status === 'RUNNING') {
                if (current_time_updated && time_updated) {
                    const current_milisecs = Date.parse(current_time_updated);
                    const new_milisecs = Date.parse(time_updated);
                    if (Number.isInteger(current_milisecs) && Number.isInteger(new_milisecs)) {
                        // ignore update within 1 second
                        let elapsed_milisecs = new_milisecs - current_milisecs;
                        if (elapsed_milisecs < 1000) {
                            console.log(`elapsed_milisecs is less than 1000 milisecs. Skip. elapsed_milisecs: ${elapsed_milisecs}`);
                            break;
                        }
                    }
                }
            }         

            if (status_code === 200) {
                if (response.execution && response.execution.meta_data) {
                    commit("updateElementWebsocketsMetaData", {
                        // keyString: "execution.meta_data",
                        elementId: params.elem_id,
                        value: response.execution.meta_data
                    });
                } else {
                    console.warn(`update_step_result. step execution meta data was not found. elem_id: ${params.elem_id}`);
                }

                // if there's results available update them too
                if(response.execution.results && response.execution.results) {
                    commit("updateElementWebsocketsResults", {
                        elementId: params.elem_id,
                        value: response.execution.results
                    });
                } else {
                    console.warn(`update_step_result. step execution results were not found. elem_id: ${params.elem_id}`);
                }       
            }
            break;
        }
        case "run_execution": {
            // no nothing.
            break;            
        }
        case "override_step": 
        case "update_override_step": 
        case "discard_override_step": { 
            const step = state.elements[params.elem_id]; 
            if (!step) { 
                console.warn(`${socket_data.event}. step was not found in UI. execution_id: ${params.execution_id} elem_id: ${params.elem_id}`); 
                break; 
            } 
            if (status_code === 200) { 
                if (response.execution && response.execution.meta_data) { 
                    commit("updateElementWebsocketsMetaData", { elementId: params.elem_id, value: response.execution.meta_data }); 
                } else { 
                    console.warn(`${socket_data.event}. step execution meta data was not found. elem_id: ${params.elem_id}`); 
                } 
            } 
            break; 
        }
        case "create_new_run": {
            commit("updateElementExecution", {
                elementId: response.elem_id,
                execution: response.execution,
                executed: response.executed,
                execution_user_input: response.execution_user_input,
                run_records: response.run_records
            });
            break;
        }        
        case "pause_execution":
        case "halt_execution": {
            // When execution is halted, execution status and current_step_id will be updated 
            // when the result of the halted step result is reported.
            // To avoid race condition, update only execution status.
            if (response.status) {
                commit("receiveExecutionObj", {'status': response.status});
            }
            break;
        }
        // Update Execution Status
        case "update_execution_status": {
            // the response has the complete execution info
            commit("receiveExecutionObj", response);
            break;
        }
        // Step Finishes Execution
        case "update_execution": {
            if (state.follow) {
                if (response.current_step_id && (response.current_step_id !== state.execution.current_step_id)) {
                    commit('setScrollToElementId', {id: response.current_step_id});
                }
            }
            commit("receiveExecutionObj", response);
            break;
        }
        // Import Run Procedure
        case "import_procedure_section": {
            const elem_ids = [...state.elementIds];
            const imported_elem_ids = response.map(element => element.elem_id);
            insertElemIds(elem_ids, imported_elem_ids);
            commit("receiveElements", {elements: response, detailLevel: 2, numbers: [], elementIds: elem_ids, rootState});

            const tag_selections = getters.executionInputKey(params.elem_id, 'tag_selections');

            // It is ok to add all tags regardless of selected flag because tag info is used
            // only to find the name of tag in execution
            dispatch('addExecutionTags', {tags: tag_selections}, {root: true});
            break;
        }
        //Call Procedure Section
        case "call_procedure_section": {
            commit("setCallProcedureRedirectUrl", {key: "callProcedureRedirectUrl", value: response.execution_id});
            break;
        }
        //Suspend Resume Execution
        case "suspend_resume_execution": {
            commit("setCallProcedureRedirectUrl", {key: "callProcedureRedirectUrl", value: response.execution_id});
            break;
        }
        // Add Redline Step
        case "execution_modify_element": {
            commit("receiveElement", {element: response.elem, detailLevel: 3, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }
        // Execution Justify Element
        case "execution_approve_element":
        case "execution_justify_element": {
            commit("receiveElement", {element: response, detailLevel: null, numbers: null, elementIds: null, rootState});
            break;
        }
        // Refresh execution
        // Execution Bulk Approve Element
        // Execution Bulk Justify Element
        case "refresh_execution":
        case "execution_bulk_approve":
        case "execution_bulk_justify": {
            const elements = response;
            const elem_ids = [...state.elementIds];
            commit("receiveElements", {elements: elements, detailLevel: null, numbers: [], elementIds: elem_ids, rootState});
            break;
        }
        // Execution Discard Element
        // Execution Bulk Discard Element
        case "execution_discard_element":
        case "execution_discard_elements": {
            commit("discardElement", {numbers: response.numbers, elementIds: response.elem_ids, rootState});
            commit("refreshBulkRedlineElementIds");
            break;
        }
        // Copy Execution Element
        case "copy_execution_element": {
            commit("receiveElements", {elements: response.elements, detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }
        // Move Execution Element
        case "move_execution_element": {
            commit("receiveElements", {elements: [], detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, parentIds: response.parent_ids, rootState});
            break;
        }
        // Remove BreakPoints
        case "remove_break_points": {
            commit("setElementBreakpoints", response);
            break;
        }

        // Create Step
        case "create_gds_step":
        case "create_section":
        case "create_paragraph":
        case "create_procedure_section":
        case "create_get_config_step":
        case "create_venue_config_step":
        case "create_environment_step":
        case "create_update_config_step":
        case "create_check_config_step":
        case "create_graph_eha_step":
        case "create_query_evr_step":
        case "create_verify_eha_step":
        case "create_wait_eha_step":
        case "create_wait_evr_step":
        case "create_list_data_products_step":
        case "create_wait_data_products_step":
        case "create_time_reference_step":
        case "create_cmd_step":
        case "create_cmd_file_step":
        case "create_cmd_scmf_step":
        case "create_cmd_sse_step":
        case "create_bus_1553_step":
        case "create_custom_script_step":
        case "create_manual_input_step":
        case "create_manual_eip_step":
        case "create_manual_verification_step":
        case "create_analysis_step":
        case "create_wait_step":
        case "create_toc_step":
        case "create_vi_step":
        case "create_vi_status_step": {
            commit("receiveElement", {element: response.elem, detailLevel: 3, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }
        // Delete Step
        case "execution_delete_element": {
            commit("deleteElement", {numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }
        // Edit Step Input
        case "update_GDS_step_input":
        case "update_procedure_section_input":
        case "update_get_config_step_input":
        case "update_venue_config_step_input":
        case "update_environment_step_input":
        case "update_update_config_step_input":
        case "update_check_config_step_input":
        case "update_graph_eha_step_input":
        case "update_query_evr_step_input":
        case "update_verify_eha_step_input":
        case "update_wait_eha_step_input":
        case "update_list_data_products_step_input":
        case "update_wait_data_products_step_input":
        case "update_time_reference_step_input":
        case "update_wait_evr_step_input":
        case "update_cmd_step_input":
        case "update_cmd_file_step_input":
        case "update_cmd_scmf_step_input":
        case "update_cmd_sse_step_input":
        case "update_bus_1553_step_input":
        case "update_custom_script_step_input":            
        case "update_manual_eip_step_input":
        case "update_manual_input_step_input":
        case "update_manual_verification_step_input":
        case "update_wait_step_input":
        case "update_toc_step_input":
        case "update_vi_step_input":
        case "update_vi_status_step_input": {
            commit("updateElementInputWS", {
                elementId: params.elem_id,
                value: request
            });
            dispatch('refreshElemModificationMap', {elementId: params.elem_id});
            break;
        }

        // Update Element
        case "update_gds_step":
        case "update_section":
        case "update_paragraph":
        case "update_procedure_section":
        case "update_get_config_step":
        case "update_venue_config_step":
        case "update_environment_step":
        case "update_update_config_step":
        case "update_check_config_step":
        case "update_graph_eha_step":
        case "update_query_evr_step":
        case "update_verify_eha_step":
        case "update_wait_eha_step":
        case "update_wait_evr_step":
        case "update_list_data_products_step":
        case "update_wait_data_products_step":
        case "update_time_reference_step":
        case "update_cmd_step":
        case "update_cmd_file_step":
        case "update_cmd_scmf_step":
        case "update_cmd_sse_step":
        case "update_bus_1553_step":
        case "update_custom_script_step":
        case "update_manual_input_step":
        case "update_manual_eip_step":
        case "update_manual_verification_step":
        case "update_analysis_step":
        case "update_wait_step":
        case "update_toc_step":
        case "update_vi_step":
        case "update_vi_status_step": {
            commit("receiveElement", {
                element: response,
                detailLevel: null,
                numbers: null, 
                elementIds: null, 
                rootState
            });
            dispatch('refreshElemModificationMap', {elementId: params.elem_id});
            break;
        }
        }
    },
    async switchExecutionMode({commit}, {executionId, mode}) {
        const response = await patchExecution(executionId, {
            mode: mode
        });
        commit("setExecutionMode", response.data);
    },
    async updateAutoExecutionParams({commit}, {executionId, _params}) {
        await patchExecution(executionId, _params);
    },
    async updateCurrentElement({commit, dispatch}, {executionId, element}) {
        // get step title and number from object
        const response = await patchExecution(executionId, {
            current_step_id: element.elem_id,
            current_step_title: element.title,
            current_step_number: element.number
        });

        if (response && response.data && response.data.current_step_id) {
            dispatch("toggleRedlineDiffElement", {modifyingElementId: response.data.current_step_id});
        }
    },
    editElementArray({commit}, {elementId, position, keyString, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveElementArrayValue", {elementId, position, keyString, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editEntryArray({commit}, {elementId, entryIndex, targetIndex, keyString, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveEntryArrayValue", {elementId, entryIndex, targetIndex, keyString, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editElementInput({commit}, {elementId, keyString, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveElementInput", {elementId, keyString, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editCustomScriptInput({commit}, {elementId, index, key, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveCustomScriptInput", {elementId, index, key, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editCustomScriptEntryInput({commit}, {elementId, entry_index, input_index, key, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveCustomScriptEntryInput", {elementId, entry_index, input_index, key, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editRedlineInput({commit}, {elementId, keyString, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveRedlineInput", {elementId, keyString, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editEntries({commit}, {elementId, value, level}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        if(value && value.length > 0)
            commit("receiveEntries", {elementId, value, level});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editCustomScriptEntries({commit}, {elementId, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        if(value && value.length > 0)
            commit("receiveCustomScriptEntries", {elementId, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editEntryInput({commit}, {elementId, index, key, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveEntryInput", {elementId, index, key, value});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editRunProcedureElementSelectionMass({commit}, { runProcedureElementId, elements, tagSelections }) {
        commit("setBooleanKey", {key: "updatingElementInput", bool: true});
        commit("receiveRunProcedureElementInputs", {
            elementId: runProcedureElementId,
            elements: elements,
            tagSelections: tagSelections
        });
        commit("setBooleanKey", {key: "updatingElementInput", bool: false});
    },
    createEntryInput({commit, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].execution_user_input.entries);

        // Make a new copy from the api template
        let newEntry = deepCopy(state.elements[elementId].specification.execution_user_input.entries[0]);
        // For custom script, the api spec is generic. Instead, use the selected entry as a template.
        if (state.elements[elementId].step_type === 'CUSTOM_SCRIPT') {
            newEntry = deepCopy(state.elements[elementId].execution_user_input.entries[refIndex]);
            resetCustomScriptEntry(newEntry);
        }
        // Insert a fresh entry after the index it came from (ref index)
        entries.splice(refIndex + 1, 0, newEntry);

        const input = {entries: entries};
        dispatch("saveElementInput", {elementPath, elementId, input});

        commit('createEntryViewState', {elementId, refIndex});
    },
    copyEntryInput({commit, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].execution_user_input.entries);

        // Make a new copy from the ref index in entries array
        const copyEntry = deepCopy(state.elements[elementId].execution_user_input.entries[refIndex]);
        // Insert a copied entry after the index it came from (ref index)
        entries.splice(refIndex + 1, 0, copyEntry);

        const input = {entries: entries};
        dispatch("saveElementInput", {elementPath, elementId, input});
        commit('copyEntryViewState', {elementId, refIndex});
    },
    deleteEntryInput({commit, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].execution_user_input.entries);
        entries.splice(refIndex, 1);

        const input = {entries: entries};
        dispatch("saveElementInput", {elementPath, elementId, input});

        commit('deleteEntryViewState', {elementId, refIndex});
    },
    setElementViewStateDetailLevel({commit, getters}, {elementId, detailLevel}) {
        commit("setBooleanKey", {key: "updatingElementContainer", bool: true});
        const elementIdsToToggle = getters.nestedChildIds(elementId);
        elementIdsToToggle.forEach(function(elementId) {
            commit("setElementViewStateDetailLevel", {elementId, detailLevel});
            const entryIdsToToggle = state.entriesViewState[elementId];
            if (entryIdsToToggle) {
                for (let refIndex = 0; refIndex < entryIdsToToggle.length; refIndex++) {
                    commit("setEntryViewStateDetailLevel", {elementId, detailLevel, refIndex});
                }
            }
        });
        commit("setBooleanKey", {key: "updatingElementContainer", bool: false});
    },
    setEntryViewStateDetailLevel({commit}, {elementId, refIndex, detailLevel}) {
        commit("setEntryViewStateDetailLevel", {elementId, refIndex, detailLevel});
    },
    toggleFeedbackModal({commit}, value) {
        commit("toggleFeedbackModal", value);
    },
    resetRunProcedureInput({commit}, {elementId, tagSelections}) {
        commit("resetRunProcedureInput", {elementId, tagSelections});
    },
    resetState({commit}) {
        commit("resetState");
    },


    // VI Step
    deleteViFromDeclareStep({commit, getters}, {vi}) {
        const elementId = getters.selectedVisStepElementId;
        commit("deleteViFromStep", {elementId: elementId, vi: vi});
    },
    setVisDeclareStep({commit, getters}) {
        const elementId = getters.selectedVisStepElementId;
        commit("setVisDeclareStep", {elementId: elementId});
    },
    addSelectedViId({commit}, {vi}) {
        commit("addSelectedViId", { vi: vi });
    },
    removeSelectedViId({commit}, {vi}) {
        commit("removeSelectedViId", { vi: vi });
    },
    removeViIds({commit}, {vis}) {
        commit("removeViIds", {vis});
    },
    setSelectedViIds({commit}, {vis}) {
        commit("setSelectedViIds", {vis});
    },
    addSelectedViIds({commit}, {vis}) {
        commit("addSelectedViIds", {vis});
    },
    async setVisToStatusStep({commit, getters}) {
        const elementId = getters.selectedVisStepElementId;
        const payload = {
            execution_user_input: {
                vis: Object.values(state.selectedViMap),
                steps: [ ...getters.getStepsByElementId(elementId) ],
            }
        };
        await patchViStatusStep(getters.executionId, elementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async deleteViFromStatusStep({commit, getters}, {vi, elementId=null}) {
        elementId = elementId ? elementId : getters.selectedVisStepElementId;
        const visOriginal = getters.getVisByElementId(elementId);
        const visToReplace = visOriginal.filter((curVi) => curVi.vi_id !== vi.vi_id);
        if (visOriginal.length !== visToReplace.length) {
            const payload = {
                execution_user_input: {
                    vis: visToReplace,
                    steps: [ ...getters.getStepsByElementId(elementId) ],
                }
            };
            await patchViStatusStep(getters.executionId, elementId, payload,
                () => {},
                (error) => console.log(error),
            );
        }
    },
    setSelectedVisStepElementId({commit}, {elementId}) {
        commit("setSelectedVisStepElementId", {elementId: elementId});
    },
    async addStepToStatusStep({commit, getters}, {elementId, title, number}) {
        const selectedVisStepElementId = getters.selectedVisStepElementId;
        const step = {
            elem_id: elementId,
            title: title,
            number: number
        };
        const payload = {
            execution_user_input: {
                vis: [ ...getters.getVisByElementId(selectedVisStepElementId) ],
                steps: [ ...getters.getStepsByElementId(selectedVisStepElementId), step ],
            }
        };
        await patchViStatusStep(getters.executionId, selectedVisStepElementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async deleteStepFromStep({commit, getters}, {elementId, elem_id}) {
        const payload = {
            execution_user_input: {
                vis: [ ...getters.getVisByElementId(elementId) ],
                steps: getters.getStepsByElementId(elementId).filter((step) => step.elem_id !== elem_id),
            }
        };
        await patchViStatusStep(getters.executionId, elementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async deleteAllStepsFromStep({commit, getters}) {
        const selectedVisStepElementId = getters.selectedVisStepElementId;
        const payload = {
            execution_user_input: {
                vis: getters.getVisByElementId(selectedVisStepElementId),
                steps: [],
            }
        };
        await patchViStatusStep(getters.executionId, selectedVisStepElementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async addAllStepsToStep({commit, getters}) {
        const selectedVisStepElementId = getters.selectedVisStepElementId;
        const steps = getters.elements
            .filter((element) => element.elem_type === "STEP" && element.step_type !== "VERIFICATION_ITEM")
            .map((element) => {
                return {
                    elem_id: element.elem_id,
                    title: element.title,
                    number: element.number
                };
            });
        const payload = {
            execution_user_input: {
                vis: getters.getVisByElementId(selectedVisStepElementId),
                steps: steps
            }
        };
        await patchViStatusStep(getters.executionId, selectedVisStepElementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    
    // Scrolling
    editScrollToElementId({commit}, {id}) {
        commit('setScrollToElementId', {id: id});
    },
    resetScrollToElementId({commit}) {
        commit('setScrollToElementId', '');
    },

    // Workflow Toggle
    toggleElemFilter({commit, getters, rootState}, filter) {
        commit('elemFiltersMutate', {
            rootState,
            filter
        });
    },

    setElemFilter({commit, getters, rootState}, {filter, value}) {
        commit('setElemFiltersMutate', { 
            rootState, 
            filter,
            value
        });
    },

    // Outline
    toggleOutlineCollapsed({commit}, {elementId}) {
        commit('toggleOutlineCollapsed', {elementId});
    },

    toggleOutlineCollapsedAll({commit}, bool) {
        commit('toggleOutlineCollapsedAll', bool);
    },


    // Copy Elements
    addCopyElemId({commit}, {elementId}) {
        commit('addCopyElemId', {elementId});
    },
    removeCopyElemId({commit}, {elementId}) {
        commit('removeCopyElemId', {elementId});
    },
    addElemIdRange({commit}, {elementId}) {
        commit('addElemIdRange', {elementId});
    }, 
    setCopyParams({commit}, {copyParams}) {
        commit('setCopyParams', {copyParams});
    },
    loadElementSelections: function({commit}) {
        commit('loadElementSelections');
    },
    resetElementSelections({commit}) {
        commit('resetElementSelections');
    },
    loadReplaceElementSource({commit}) {
        // do nothing for execution
    },

    // Cut Elements
    addCutElemId({commit}, {elementId}) {
        commit('addCutElemId', {elementId});
    },
    removeCutElemId({commit}, {elementId}) {
        commit('removeCutElemId', {elementId});
    },
    addCutElemIdRange({commit}, {elementId}) {
        commit('addCutElemIdRange', {elementId});
    },
    removeCutElemIdRange({commit}, {elementId}) {
        commit('removeCutElemIdRange', {elementId});
    },
    toggleProcedureModificationModal({commit}, value) {
        commit("toggleProcedureModificationModal", value);
    },
    //Bulk redline elements 
    saveBulkRedlineElementIds({commit}, value) {
        commit("saveBulkRedlineElementIds", value);
    },
    //
    toggleRedlineDiffElement({commit, getters, state}, {modifyingElementId}) {
        let found = false;
        let originalElementId = '';
        if (state.elemModificationMap[modifyingElementId]) {
            // reset
            commit("setElemModificationMap", {});
        } else {
            const modifyingElement = state.elements[modifyingElementId];
            if (modifyingElement) {
                for (const elementId of state.elementIds) {
                    const element = state.elements[elementId];
                    if (element && element.procedure_modification_status === 'MODIFIED' && 
                        element.elem_type === modifyingElement.elem_type &&
                        element.step_type === modifyingElement.step_type) 
                    {
                        originalElementId = elementId;
                    }
    
                    if (elementId === modifyingElementId) {
                        found = true;
                        break;
                    }
                }
                if (originalElementId && found) {
                    const elemModificationMap = {};
                    if (originalElementId && 
                        state.elements[originalElementId] &&
                        state.elements[originalElementId].procedure_modification_status === 'MODIFIED' &&
                        modifyingElementId && 
                        state.elements[modifyingElementId]  &&
                        (state.elements[modifyingElementId].procedure_modification_status === 'MODIFYING_OLD' ||
                        state.elements[modifyingElementId].procedure_modification_status === 'MODIFYING'
                        ))
                    {
                        const modifiedElement = state.elements[originalElementId];
                        const modifyingElement = state.elements[modifyingElementId];
                        const {elemDiff1, elemDiff2, isSame} = 
                            diffElems(modifiedElement.step_type, 
                                _.cloneDeep(modifiedElement.execution_user_input), 
                                _.cloneDeep(modifyingElement.execution_user_input),
                                modifiedElement.title,
                                modifyingElement.title,
                                modifiedElement.description,
                                modifyingElement.description,
                            );

                        //console.log(`elemDiff1: ${JSON.stringify(elemDiff1, 0, 2)}`);
                        //console.log(`elemDiff2: ${JSON.stringify(elemDiff2, 0, 2)}`);
                        elemModificationMap[originalElementId] = elemDiff1;
                        elemModificationMap[modifyingElementId] = elemDiff2;
                        commit("setElemModificationMap", elemModificationMap);
                    }
                }
            }
        }
    },
    refreshElemModificationMap({commit, getters, state}, {elementId}) {
        if (state.elemModificationMap[elementId]) {
            let modifiedElement = null;
            let modifyingElement = null;
            for (const elem_id in state.elemModificationMap) {
                const elem = state.elements[elem_id];
                if (elem && elem.procedure_modification_status === 'MODIFIED') {
                    modifiedElement = elem;
                    break;
                }
            }
            for (const elem_id in state.elemModificationMap) {
                const elem = state.elements[elem_id];
                if (elem && (elem.procedure_modification_status === 'MODIFYING_OLD' || 
                    elem.procedure_modification_status === 'MODIFYING'))
                {
                    modifyingElement = elem;
                    break;
                }
            }
            if (modifiedElement && modifyingElement) {
                const elemModificationMap = {};
                const {elemDiff1, elemDiff2, isSame} = 
                    diffElems(modifiedElement.step_type, 
                        _.cloneDeep(modifiedElement.execution_user_input), 
                        _.cloneDeep(modifyingElement.execution_user_input),
                        modifiedElement.title,
                        modifyingElement.title,
                        modifiedElement.description,
                        modifyingElement.description,
                    );

                // console.log(`elemDiff1: ${JSON.stringify(elemDiff1, 0, 2)}`);
                // console.log(`elemDiff2: ${JSON.stringify(elemDiff2, 0, 2)}`);

                elemModificationMap[modifiedElement.elem_id] = elemDiff1;
                elemModificationMap[modifyingElement.elem_id] = elemDiff2;
                commit("setElemModificationMap", elemModificationMap);
            }
        }
    },
};

const mutations = {
    setPending(state, busy) {
        state.isPending = busy;
    },
    setOutlineFollow(state, follow) {
        state.outlineFollow = follow;
    },
    setMode(state, {mode}) {
        state.mode = mode;
    },
    receiveNotification(state, notificationMessage) {
        state.notificationMessage = notificationMessage;
    },
    resetState(state) {
        Object.assign(state, initialState());
    },
    setStateKey(state, {key, val}) {
        state[key] = val;
    },
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },
    setCallProcedureRedirectUrl(state, {key, value}){
        console.log(`setCallProcedureRedirectUrl key: ${key} value: ${value} current: ${state[key]}`);
        state[key] = value;
    },
    setElementViewStateKey(state, {elementId, key, val}) {
        state.elementsViewState[elementId][key] = val;
    },
    setExecutionMode(state, {mode}) {
        state.execution.mode = mode;
    },
    setExecutionFollow(state, {follow}) {
        state.follow = follow;
    },    
    receiveVenue(state, venue) {
        state.venue = venue;
    },
    receiveExecutionObj(state, execution) {
        state.execution = { ...state.execution, ...execution };
    },
    receiveTimeReferences(state, timeReferences) {
        Vue.set(state, 'timeReferences', timeReferences);
    },
    receiveTags(state, tags) {
        state.tags = tags;
    },
    updateExecutionStatus(state, status) {
        state.execution.status = status;
    },
    receiveExecution(state, {executionId}) {
        state.executionId = executionId;
    },
    resetElementsState(state) {
        state.elementIds = [];
        state.filteredElementIds = [];
        state.elements = {};
        state.elementsViewState = {};
        state.entriesViewState = {};
    },
    receiveElement(state, {element, detailLevel, numbers, elementIds, rootState}) {
        // If element does not have parent_id (for example when an element was updated),
        // use the current parent_id
        if (!element.hasOwnProperty('parent_id')) {
            const parent_id = state.elements[element.elem_id] ? state.elements[element.elem_id].parent_id : '';
            element.parent_id = parent_id;
        }

        // This function is used when an element is added
        const slimmedElement = slimElement(element);
        const elementsObj = {...state.elements, [element.elem_id]: slimmedElement};
        const conversationsObj = {...rootState.comments.conversations};
        
        // When processing Websocket messages, elementIds may not be available.
        if (numbers !== null) {
            updateNumbers(elementsObj, numbers);
        }

        if (!conversationsObj.hasOwnProperty(element.elem_id)) {
            conversationsObj[element.elem_id] = {};
        }
        
        // When processing Websocket messages (for example, when an update was updated), elementIds may not be available. 
        // Use elementIds from the current state to make sure outline is updated (ING-3790)
        if (elementIds === null || elementIds === undefined) {
            elementIds = state.elementIds;
        }

        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, elementsObj, elementIds);
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        state.elementIds = elementIds;
        state.filteredElementIds = filteredElementIds;
        state.outlinePrecomputed = outlinePrecomputed;
    
        state.elements = elementsObj;

        if (detailLevel) {
            // update detail level only if detailLevel was specified
            state.elementsViewState = { ...state.elementsViewState, [element.elem_id]: {
                detailLevel: detailLevel,
                loading: false
            }};

            // If element has entries, create a state object for each
            const entriesViewStateArr = [];
            if (element.execution_user_input && element.execution_user_input.entries) {
                // Loop over each entry and spawn a default state
                element.execution_user_input.entries.forEach(() => {
                    entriesViewStateArr.push({detailLevel: detailLevel});
                });
                state.entriesViewState = {...state.entriesViewState, [element.elem_id]: entriesViewStateArr};
            }
        }
        
        rootState.comments.conversations = conversationsObj;
    },
    receiveSearch(state, searchResult) {
        const matchMap = {};
        for (const match of searchResult.matches) {
            let key = `${match.elem_id}:${match.field_path}`;
            matchMap[key] = match;
        }
        searchResult.matchMap = matchMap;
        delete searchResult.matches;
        state.searchResult = searchResult;
    },
    clearSearchResults(state) {
        state.searchResult = getDefaultSearchResult();
    },
    receiveElements(state, {elements, detailLevel, numbers, elementIds, parentIds, rootState}) {
        const elementsObj = {...state.elements};
        const elementsViewStateObj = {...state.elementsViewState};
        const entriesViewStateObj = {...state.entriesViewState};
        const conversationsObj = {...rootState.comments.conversations};
        
        for (const element of elements) {
            // If element does not have parent_id (for example when an element was bulk modified),
            // use the current parent_id
            if (!element.hasOwnProperty('parent_id') && parentIds === undefined) {
                const parent_id = state.elements[element.elem_id] ? state.elements[element.elem_id].parent_id : '';
                element.parent_id = parent_id;
            }
            
            if(elementsObj[element.elem_id]) {
                // Make copy of element data and update it without triggering state change.
                // elements will be updated later in a batch.
                elementsObj[element.elem_id] = Object.assign({}, elementsObj[element.elem_id], slimElement(element));
            }
            else {
                elementsObj[element.elem_id] = slimElement(element);
                if (detailLevel) {
                    elementsViewStateObj[element.elem_id] = {detailLevel: detailLevel, loading: false};
                }
            }

            if (detailLevel) {
                if(element.execution_user_input && element.execution_user_input.entries) {
                    entriesViewStateObj[element.elem_id] = [];
                    element.execution_user_input.entries.forEach(() => {
                        entriesViewStateObj[element.elem_id].push({detailLevel: detailLevel});
                    });
                }
            }
            
            if (!conversationsObj.hasOwnProperty(element.elem_id)) {
                conversationsObj[element.elem_id] = {};
            }
        }
        
        updateNumbers(elementsObj, numbers);
        updateParentIds(elementsObj, elementIds, parentIds);
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, elementsObj, elementIds);
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);

        state.elementIds = elementIds;
        state.filteredElementIds = filteredElementIds;
        state.elements = elementsObj;
        state.elementsViewState = elementsViewStateObj;
        state.entriesViewState = entriesViewStateObj;
        state.outlinePrecomputed = outlinePrecomputed;
        
        rootState.comments.conversations = conversationsObj;
    },
    pageElements(state, {scrollDirection}) {
        pageElementsFunc(state, {scrollDirection});
    },    
    initElementExecution(state, elementId) {
        let execution = state.elements[elementId].execution;
        if (execution.meta_data) {
            execution.meta_data.status = 'RUNNING';
        } else {
            execution.meta_data = {
                status: "RUNNING",
                status_message: "",
                error: "",
                test_conductor: "",
                time_completed: "",
                time_started: "",
                time_updated: ""
            };
    
            state.elements[elementId] = {
                ...state.elements[elementId],
                execution: execution
            };
        }
    },
    updateElementExecution(state, {elementId, execution={}, executed, execution_user_input={}, run_records}) {
        // ensure we don't overwrite existing state with undefined values (error case)
        executed = executed !== undefined ? executed : state.elements[elementId].executed;
        run_records = run_records !== undefined ? run_records : state.elements[elementId].run_records;

        state.elements[elementId] = {
            ...state.elements[elementId],
            executed: executed,
            execution: execution,
            execution_user_input: execution_user_input,
            run_records: run_records
        };
        
        // make sure to update outline
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, state.elements, state.elementIds);
        state.outlinePrecomputed = outlinePrecomputed; 
    },
    setElementBreakpoints(state, elements) {
        const elementsObj = {...state.elements};
        for (const element of elements) {
            if (elementsObj.hasOwnProperty(element.elem_id)) {
                elementsObj[element.elem_id].break_point = element.break_point;
            }
        }
        state.elements = elementsObj;

        let outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, state.elements, state.elementIds);

        state.outlinePrecomputed = Object.assign({}, state.outlinePrecomputed, outlinePrecomputed);
    },
    updateElementInputWS(state, {elementId, value}) {
        state.elements[elementId].execution_user_input = value;
        if(state.elements[elementId].elem_type === 'PROCEDURE_SECTION') {
            state.reloadProcedureOutline = {elementId: elementId};
        }
    },
    updateElementWebsocketsMetaData(state, {elementId, value}) {
        if (state.elements[elementId]['execution'] && state.elements[elementId]['execution']['meta_data']) {
            // Update values in place since "status" is used as property of Outline component, 
            // which is a Vue functional component. This will make status of step updated in outline.
            Object.assign(state.elements[elementId]['execution']['meta_data'], value);
        } else {
            state.elements[elementId].execution = {...state.elements[elementId]['execution'], meta_data: value};
        }

        state.elements[elementId].executed = true;
    },
    updateElementWebsocketsResults(state, {elementId, value}) {
        if (state.elements[elementId]['execution'] && state.elements[elementId]['execution']['results']) {
            // Update values in place since "status" is used as property of Outline component, 
            // which is a Vue functional component. This will make status of step updated in outline.
            Object.assign(state.elements[elementId]['execution']['results'], value);
        } else {
            state.elements[elementId].execution = {...state.elements[elementId]['execution'], results: value};
        }
    },
    discardElement(state, {numbers, elementIds, rootState}) {
        const elementsObj = {};
        const elementsViewStateObj = {};
        const entriesViewStateObj = {};
        for (const elementId of elementIds) {
            if (state.elements.hasOwnProperty(elementId)) {
                elementsObj[elementId] = state.elements[elementId];
                elementsViewStateObj[elementId] = state.elementsViewState[elementId];
                entriesViewStateObj[elementId] = state.entriesViewState[elementId];
 
            }
        }        
        if (numbers) {
            for (let i=0; i < numbers.length; i++) {
                let number = numbers[i];                   
                // If DELETED redline is discarded, the element will be returned as ORIGINAL
                if (elementsObj.hasOwnProperty(number.elem_id) && number.procedure_modification_status === 'ORIGINAL') {
                // reset procedure_modification here since it is not possible to reset this by combining
                // the original step and response from the API
                    elementsObj[number.elem_id]['procedure_modification'] = {};
                }
            }
        }
        updateNumbers(elementsObj, numbers);
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, elementsObj, elementIds);
        state.elementsViewState = elementsViewStateObj;
        state.entriesViewState = entriesViewStateObj;
        state.outlinePrecomputed = outlinePrecomputed;
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        state.elementIds = elementIds;
        state.filteredElementIds = filteredElementIds;
        state.elements = elementsObj;
    },
    deleteElement(state, {numbers, elementIds, rootState}) {
        const elementsObj = {};
        const elementsViewStateObj = {};
        const entriesViewStateObj = {};
        for (const elementId of elementIds) {
            if (state.elements.hasOwnProperty(elementId)) {
                elementsObj[elementId] = state.elements[elementId];
                elementsViewStateObj[elementId] = state.elementsViewState[elementId];
                entriesViewStateObj[elementId] = state.entriesViewState[elementId];
 
            }
        }
        updateNumbers(elementsObj, numbers);
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, elementsObj, elementIds);
        state.elementsViewState = elementsViewStateObj;
        state.entriesViewState = entriesViewStateObj;
        state.outlinePrecomputed = outlinePrecomputed;
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        state.elementIds = elementIds;
        state.filteredElementIds = filteredElementIds;
        state.elements = elementsObj;
    },
    receiveElementArrayValue(state, {elementId, keyString, value, position}) {
        // Vuex wraps array methods for reactivity.
        // Replacing an index does NOT trigger an update - a splice is required.
        // https://vuejs.org/v2/guide/list.html#Caveats

        const targetArray = _.get(state.elements[elementId].execution_user_input, keyString);
        // if value is undefined or null, or is an empty string: remove index from existing array
        if (isUndefinedOrNull(value) || value === '') {
            targetArray.splice(position, 1);
        } else {
            targetArray.splice(position, 1, value);
        }
    },
    receiveEntryArrayValue(state, {elementId, keyString, entryIndex, value, targetIndex}) {
        // Vuex wraps array methods for reactivity.
        // Replacing an index does NOT trigger an update - a splice is required.
        // https://vuejs.org/v2/guide/list.html#Caveats

        const targetArray = _.get(state.elements[elementId].execution_user_input.entries[entryIndex], keyString);
        // if value is undefined or null, remove index from existing array
        if (isUndefinedOrNull(value)) {
            targetArray.splice(targetIndex, 1);
        } else {
            targetArray.splice(targetIndex, 1, value);
        }
    },
    receiveElementKeyValue(state, {elementId, keyString, value}) {
        _.set(state.elements[elementId], keyString, value);

        let contItr = true;
        let path = [elementId];
        let startElement = state.elements[elementId];

        while(contItr) {
            if(startElement.parent_id != '') {
                path = [startElement.parent_id, ...path];
                startElement = state.elements[startElement.parent_id];
            } else contItr = false;
        }

        // console.log(`Path: ${path.join('.children.')}[${keyString}]: ${value}`);
        _.set(state.outlinePrecomputed, `${path.join('.children.')}[${keyString}]`, value);
        // Vue.set(state.outlinePrecomputed[`${path.join('.children.')}`], keyString, value);
    },
    receiveExecutionKeyValue(state, {keyString, value}) {
        _.set(state.execution, keyString, value);
    },
    receiveElementInput(state, {elementId, keyString, value}) {
        _.set(state.elements[elementId].execution_user_input, keyString, value);
    },
    receiveElementSpecification(state, {elementId, keyString, value}) {
        _.set(state.elements[elementId].specification.execution_user_input, keyString, value);
    },
    receiveRedlineInput(state, {elementId, keyString, value}) {
        _.set(state.elements[elementId].procedure_modification, keyString, value);
    },
    receiveEntries(state, {elementId, value, level}) {
        let detailLevel = level ? level : 2;
        let entriesViewStateObj = {};
        _.set(state.elements[elementId].execution_user_input, 'entries', value);

        // loop through all entries and set their level to 2 by default
        if(state.elements[elementId].execution_user_input && state.elements[elementId].execution_user_input.entries) {
            entriesViewStateObj[elementId] = [];
            state.elements[elementId].execution_user_input.entries.forEach(() => entriesViewStateObj[elementId].push({detailLevel: detailLevel}));
        }

        // Set execution_user_input.entries
        if(!_.isEmpty(entriesViewStateObj)) {
            state.entriesViewState = Object.assign({}, state.entriesViewState, entriesViewStateObj);
        }
    },
    receiveCustomScriptEntries(state, {elementId, value}) {
        let elementsObj = { ...state.elements };
        let entriesViewStateObj = { ...state.entriesViewState };
        entriesViewStateObj[elementId] = [];

        let element = elementsObj[elementId];

        let entries = element.execution_user_input.entries;
        let entry0 = entries[0];
        let newEntries = [];

        for (const [irow, rowObj] of value.entries()) {
            let entry = irow < entries.length ? _.cloneDeep(entries[irow]) : _.cloneDeep(entry0);

            for (const [key, val] of Object.entries(rowObj)) {
                let icol = entry.entry_inputs.findIndex(entry_input => entry_input.name === key);
                if (icol >= 0) {
                    entry.entry_inputs[icol].value = val;
                } else {
                    console.warn(`entry input field was not found. key: ${key} value: ${val}`);
                }
            }
            newEntries.push(entry);

            entriesViewStateObj[elementId].push({detailLevel: 2});
        }

        element.execution_user_input.entries = newEntries;

        state.elements = elementsObj;
        state.entriesViewState = entriesViewStateObj;
    },
    receiveEntryInput(state, {elementId, index, key, value}) {
        const entry = state.elements[elementId].execution_user_input.entries[index];
        entry[key] = value;
        state.elements[elementId].execution_user_input.entries.splice(index, 1, entry);
    },
    receiveCustomScriptInput(state, {elementId, index, key, value}) {
        const input = state.elements[elementId].execution_user_input.inputs[index];
        input[key] = value;
        state.elements[elementId].execution_user_input.inputs.splice(index, 1, input);
    },
    receiveCustomScriptEntryInput(state, {elementId, entry_index, input_index, key, value}) {
        const input = state.elements[elementId].execution_user_input.entries[entry_index].entry_inputs[input_index];
        input[key] = value;
        state.elements[elementId].execution_user_input.entries[entry_index].entry_inputs.splice(input_index, 1, input);
    },
    receiveRunProcedureElementInput(state, {elementId, index, element, keyString, value}) {
        // if the element doesn't exist add it first, splice for reactivity
        if(index === -1) {
            // update index to be where the new element will go, so it can be updated below
            index = state.elements[elementId].execution_user_input.elements.length;
            state.elements[elementId].execution_user_input.elements.splice(index, element);
        }
        element = Object.assign({}, element, {[keyString]: value});
        state.elements[elementId].execution_user_input.elements.splice(index, 1, element);
    },
    receiveRunProcedureElementInputs(state, {elementId, elements, tagSelections}) {
        state.elements[elementId].execution_user_input.elements = elements;
        state.elements[elementId].execution_user_input.tag_selections = tagSelections;
    },
    createEntryViewState(state, {elementId, refIndex}) {
        // Insert new entry state
        state.entriesViewState[elementId].splice(refIndex + 1, 0, {detailLevel: 3});
    },
    copyEntryViewState(state, {elementId, refIndex}) {
        state.entriesViewState[elementId].splice(refIndex + 1, 0, {detailLevel: 3});
    },
    deleteEntryViewState(state, {elementId, refIndex}) {
        state.entriesViewState[elementId].splice(refIndex, 1);
    },
    moveEntryViewState(state, {insertAfterIndex, draggedEntryIndex, elementId}) {
        insertAfterIndex = parseInt(insertAfterIndex);
        draggedEntryIndex = parseInt(draggedEntryIndex);
        const insertionIndex = insertAfterIndex + 1;

        // Set view state
        let entryViewStates = state.entriesViewState[elementId];
        const viewStateToMove = entryViewStates[draggedEntryIndex];
        entryViewStates.splice(insertionIndex, 0, viewStateToMove);
        const spliceIndex = draggedEntryIndex > insertionIndex ? draggedEntryIndex + 1 : draggedEntryIndex;
        entryViewStates.splice(spliceIndex, 1);
    },
    setElementViewStateDetailLevel(state, {elementId, detailLevel}) {
        state.elementsViewState[elementId].detailLevel = detailLevel;
    },
    setEntryViewStateDetailLevel(state, {elementId, refIndex, detailLevel}) {
        state.entriesViewState[elementId][refIndex].detailLevel = detailLevel;
    },
    resetRunProcedureInput(state, {elementId, tagSelections}) {
        const newElem = {...state.elements[elementId]};
        newElem.execution_user_input.elements = [];
        newElem.execution_user_input.tag_selections = tagSelections;
        state.elements[elementId] = newElem;
    },
    setProcedurePreviewElement(state, {rootElementId, elementId, isParent=false}) {
        // Set procedure preview state
        if(state.procedurePreview[rootElementId]) {  // rootElementId already exists
            if(!state.procedurePreview[rootElementId].includes(elementId)) {
                if(isParent) {
                    state.procedurePreview[rootElementId].push(elementId);
                }
                else {
                    state.procedurePreview[rootElementId].unshift(elementId);
                }
            }
        }
        else {  // new rootElementId
            state.procedurePreview = {...state.procedurePreview, [rootElementId]: [elementId]};
        }
    },

    // VI Step
    setSelectedVisStepElementId(state, {elementId}) {
        state.selectedVisStepElementId = elementId;
    },
    addSelectedViId(state, {vi}) {
        const viIdMap = {...state.selectedViMap};
        viIdMap[vi.vi_id] = vi;
        state.selectedViMap = viIdMap;    
    },
    removeSelectedViId(state, {vi}) {
        const viIdMap = {...state.selectedViMap};
        delete viIdMap[vi.vi_id];
        state.selectedViMap = viIdMap;
    },
    removeViIds(state, {vis}) {
        const viIdMap = {...state.selectedViMap};
        for (const vi of vis) {
            delete viIdMap[vi.vi_id];
        }
        state.selectedViMap = viIdMap;
    },
    setSelectedViIds(state, {vis}) {
        const viIdMap = {};
        for (const vi of vis) {
            viIdMap[vi.vi_id] = vi;
        }
        state.selectedViMap = viIdMap;
    },
    addSelectedViIds(state, {vis}) {
        const viIdMap = {...state.selectedViMap};
        for (const vi of vis) {
            viIdMap[vi.vi_id] = vi;
        }
        state.selectedViMap = viIdMap;
    },
    deleteViFromStep(state, {elementId, vi}) {
        const deleteIndex = state.elements[elementId].execution_user_input.vis.findIndex((viObj) => viObj.vi_id === vi.vi_id);
        state.elements[elementId].execution_user_input.vis.splice(deleteIndex, 1);
    },
    setVisDeclareStep(state, {elementId}) {
        state.elements[elementId].execution_user_input.vis = Object.values(state.selectedViMap);
    },
    deleteStepFromStep(state, {elementId, elem_id}) {
        const deleteIndex = state.elements[elementId].execution_user_input.steps.findIndex((step) => step.elem_id === elem_id);
        state.elements[elementId].execution_user_input.steps.splice(deleteIndex, 1);
    },

    // Scrolling
    setScrollToElementId(state, {id}) {
        setScrollToElementIdFunc(state, {id});
    },

    // Outline
    toggleOutlineCollapsed(state, {elementId}) {
        toggleOutlineCollapsedFunc(state, {elementId});    
    },

    toggleOutlineCollapsedAll(state, bool) {
        // create a new outline structure for a bulk state change that does not result in slow rendering
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, state.elements, state.elementIds);
        toggleOutlineCollapsedAllFunc(state, outlinePrecomputed, bool);    
    },

    // Workflow Toggle
    elemFiltersMutate(state, {rootState, filter}) {
        // call another mutator from a mutator
        this.commit('setElemFiltersMutate', {rootState, filter, value: !state.elemFilters[filter]});
    },

    setElemFiltersMutate(state, {rootState, filter, value}) {
        Vue.set(state.elemFilters, filter, value);

        const elementIds = state.elementIds;
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        state.filteredElementIds = filteredElementIds;
        state.viewportTopPointer = 0;
    },

    // copy operation    
    addCopyElemId(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        addCopyElemIds(elementId, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    removeCopyElemId(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        removeCopyElemIds(elementId, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    addElemIdRange(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        addCopyElemIdsRange(elementId, state.elementIds, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    setCopyParams: function(state, {copyParams}) {
        state.copyParams = copyParams;
        setCopyParams(copyParams);
    },
    resetElementSelections(state) {
        state.copyParams = getDefaultCopyParams();
        setCopyParams(state.copyParams);
    },

    loadElementSelections: function() {
        state.copyParams = loadCopyParams();
    },

    // move/cut operations
    addCutElemId(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        addCopyElemIds(elementId, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    removeCutElemId(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        removeCopyElemIds(elementId, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    addCutElemIdRange(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        addCopyElemIdsRange(elementId, state.elementIds, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    removeCutElemIdRange(state, {elementId}) {
        const copyParams = deepCopy(state.copyParams);
        removeCopyElemIdsRange(elementId, state.elementIds, state.outlinePrecomputed, copyParams.copyElemIdMap);
        state.copyParams = copyParams;
    },
    setKickedOut: function(state, {kickedOut}) {
        state.kickedOut = kickedOut;
    },
    setElemModificationMap: function(state, elemModificationMap) {
        state.elemModificationMap = elemModificationMap;
    },
    toggleProcedureModificationModal(state, value) {
        state.procedureModificationModal = value;
    },
    saveRedlineElementIds(state, value) {
        state.redlineElementIds = value;
    },
    saveBulkJustificationModalMessage(state, value) {
        state.bulkJustificationModalMessage = value;
    },
    saveBulkRedlineElementIds(state, value) {
        state.bulkRedlineElementIds = value;
    },
    refreshBulkRedlineElementIds(state) {
        let updatedRedlineElementIds = [];
        for (const elem_id of state.bulkRedlineElementIds) {
            if (state.elementIds.includes(elem_id)) { 
                updatedRedlineElementIds.push(elem_id); 
            } 
        }
        state.bulkRedlineElementIds = updatedRedlineElementIds;
    }
};

export default {
    state,
    getters,
    mutations,
    actions
};

/**
 * returns true if the new timestamp is outdated
 * 
 * @param {String} timestamp
 * @param {String} currentTimestamp 
 */
function outdatedStepEvent(timestamp, currentTimestamp) {
    if (timestamp) {
        return timestamp < currentTimestamp;
    } else {
        return false;
    }
}

/**
 * return true if step status is one of PASS, FAIL or ERROR
 * 
 * @param {Object} step 
 */
function isStepCompleted(step) {
    if(step) {
        if (step.execution && step.execution.meta_data && step.execution.meta_data.status) {
            const status = step.execution.meta_data.status;
            return status === 'PASS' || status === 'FAIL' || status === 'ERROR';
        } else {
            return false;
        }
    } else {
        return false;
    }
}


function insertElemIds(elementIds, importedElementIds) {
    // console.log(`insertElemIds elementIds: ${JSON.stringify(elementIds, 0, 2)}`);
    // console.log(`insertElemIds importedElementIds: ${JSON.stringify(importedElementIds, 0, 2)}`);
    if (importedElementIds.length < 2)
    {
        // No processing needed unless importedElementIds include procedure section and at least one child element
        return;
    }
    let procedureSectionElemId = importedElementIds[0];

    let idx = elementIds.findIndex((elem_id) => elem_id == procedureSectionElemId);
    // console.log(`insertElemIds idx: ${idx}`);
    if (idx > -1) {
        // move imported elements right after the procedure section element
        elementIds.splice(idx, 1, ...importedElementIds);
    } else {
        console.log(`WARN: procedure section was not found. elem_id: ${procedureSectionElemId}`);
    }
}


function updateNumbers(elementsObj, numbers) {
    numbers.forEach(elementData => {
        if(elementsObj[elementData.elem_id]) {
            // Make copy of element data and update it without triggering state change.
            // elementData may include number and procedure_modification_status
            elementsObj[elementData.elem_id] = {...elementsObj[elementData.elem_id], ...elementData};
        }
        else {
            console.log(`WARN: updateNumbers element not found. elem_id: ${elementData.elem_id}`);
        }            
    });    
}

function updateParentIds(elementsObj, elementIds, parentIds) {
    if (elementIds && parentIds) {
        for (const [i, elem_id] of elementIds.entries()) {
            if (elementsObj[elem_id]) {
                let parent_id = parentIds[i];
                // Make copy of element data and update it without triggering state change.
                elementsObj[elem_id] = {...elementsObj[elem_id], parent_id};
            } else {
                console.log(`WARN: updateParentIds element not found. elem_id: ${elem_id}`);                
            }
        }
    }
}

function handleExecutionMessage(msg, level, commit) {
    let timestamp = (new Date()).toISOString();
    let notificationMessage = {
        timestamp: timestamp,
        msg: msg,
        level: level,
    };
    commit('receiveNotification', notificationMessage);
}

function getOutlineStructure(outlinePrecomputed, elementObjs, elementIds) {
    return getOutlineStructureFunc(outlinePrecomputed, elementObjs, elementIds);
}

/**
 * Gather data when redline/blueline elements are created
 * @param object state vuex state
 * @param string[] elem_ids ids of elements that were modified/added/deleted as redline/blueline 
 * @param object[] numbers numbers data from API call
 * @returns 
 */
function checkRedlineStatus(state, elem_ids, numbers) {
    const redlineItems = [];

    for (const item of numbers) {
        if (elem_ids.includes(item.elem_id)) {            
            if (['MODIFYING', 'DELETED', 'ADDED'].includes(item.procedure_modification_status)) {
                const title = state.elements[item.elem_id] ? state.elements[item.elem_id].title : '';
                redlineItems.push({
                    ...item,
                    title: title
                });
            }
        }
    }
    const redlineIds = redlineItems.map(redlineItem => redlineItem.elem_id);
    const redlineCreated = redlineItems.length > 0;

    const justificationMessage = constructJustificationModalMessage(redlineItems);

    return {redlineCreated, redlineIds, justificationMessage};
}

function constructJustificationModalMessage(redlineItems) {
    let justificationModalMessage = '';

    if (redlineItems.length === 1) {
        const number = redlineItems[0].number;
        const title = redlineItems[0].title;
        const modificationStatus = redlineItems[0].procedure_modification_status;
        justificationModalMessage = `Apply the following Redline/Blueline (${modificationStatus}) justification to ${number}: ${title ? title: "No Title"}`;
    } else if (redlineItems.length > 1) {
        const firstNumber = redlineItems[0].number;
        const lastNumber = redlineItems[redlineItems.length-1].number;
        const modificationStatus = redlineItems[0].procedure_modification_status;
        justificationModalMessage = `Apply the following Redline/Blueline (${modificationStatus}) justification to ${redlineItems.length} steps ${firstNumber} ~ ${lastNumber}`;
    }

    return justificationModalMessage;
}

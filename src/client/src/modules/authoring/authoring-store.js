import {
    copyProcedureElement,
    deleteProcedureElement,
    getProcedure,
    getProcedureVersions,
    getProcedureElements,
    getProcedureVersion,
    lockProcedure,
    searchProcedure,
    replaceProcedure,
    moveProcedureElement,
    patchProcedureElement,
    postReplaceProcedureElement,
    postProcedureElement,
    postProcedureElementInput,
    postProcedureVersion,
    patchProcedureVersion,
    postProcedureVersionStatus,
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
} from "../../api/authoring";

import {getExecutionElement} from "../../api/execution";

import procedureApi from "../../api/procedures";
import dictionaryApi from "../../api/dictionary";
import {
    slimElement, deepCopy, isUndefinedOrNull, setScrollToElementIdFunc, 
    pageElementsFunc, hasAdditionalElementsBeforeFunc, hasAdditionalElementsAfterFunc, 
    getFilteredElementIds, getFilteredElementsFunc, getUsername, resetCustomScriptEntry,
    getOutlineStructureFunc, toggleOutlineCollapsedFunc, addCopyElemIds, removeCopyElemIds,
    addCopyElemIdsRange, removeCopyElemIdsRange, setCopyParams, loadCopyParams, loadReplaceElementSource, getDefaultCopyParams, 
    toggleOutlineCollapsedAllFunc, handleErrorNotification, getDefaultSearchResult
} from "../../modules/common/utils";
import { getElementPath } from "../common/elem_types";
import _ from 'lodash';
import Vue from 'vue';
import {commonDateTime} from '../common/filters';

// initial state
const initialState = () => {
    return {
        isPending: false,
        execution: {},

        // procedures
        authoringProcedures: [],
        authoringProcedureVersions: [],
        authoringProcedureVersionsCount: 0,
        authoringProcedureVersionsWorkingVersion: null,
        authoringProceduresCount: 0,
        importResponse: {},
        procedureId: null,
        procedureVersion: null,
        procedureDetails: {},
        authoringProcedureIndex: -1,
        authoringProcedureVersionIndex: -1,
        currentProcedureDeleted: false,
        mode: 'authoring',
        editMode: false,

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
        updatingElementInput: false,
        // VI Step
        selectedViStepElementId: null,
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
            activityReport: false,   // this is not used for authoring. keep it since comments store expects this.
            dataReview: false,        // this is not used for authoring. keep it since comments store expects this.
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
        procedureNotFound: false,
        // Spinner
        loadingProcedure: false,
        importingProcedure: false,
        creatingElement: false,
        movingElement: false,
        copyingElement: false,
        creatingProcedureVersion: false,
        reloadProcedureOutline: {},    // this is not used for authoring. keep it since run procedure step expects this.
        // Search
        searchResult: getDefaultSearchResult(),
        copyParams: getDefaultCopyParams(),
        replaceElementSource: {},
        // Temporarily store selected vis
        selectedViMap: {},
        // Store Validation structure from backend
        validationItems: [],
        dataInitialized: false,
        // These are not used for authoring
        procedureModificationModal: false,
        bulkJustificationModalMessage: '',
    };
};

const state = initialState();

const getters = {
    isPending: state => state.isPending,
    dataInitialized: state => state.dataInitialized,
    reloadProcedureOutline: state => state.reloadProcedureOutline,
    execution: state => state.execution,
    validationItems: state => state.validationItems,

    // Procedures
    authoringProcedures: state => state.authoringProcedures,
    authoringProcedure: state => (procedureId=null) => {
        // Lookup procedure first by procedure index, then by procedure ID
        let retVal = null;
        if (state.authoringProcedureIndex >= 0) {
            retVal = state.authoringProcedures[state.authoringProcedureIndex];
        }
        else if (procedureId && state.authoringProcedures.length) {
            retVal = state.authoringProcedures.find(procedure => procedure.procedure_id === procedureId);
        }
        return retVal;
    },
    authoringProcedureIndex: state => state.authoringProcedureIndex,
    authoringProceduresCount: state => state.authoringProceduresCount,
    authoringProcedureVersionsCount: state => state.authoringProcedureVersionsCount,
    authoringProcedureVersions: state => state.authoringProcedureVersions,
    authoringProcedureVersionsWorkingVersion: state => state.authoringProcedureVersionsWorkingVersion,
    currentProcedureDeleted: state => state.currentProcedureDeleted,
    procedureId: state => {
        return state.procedureId;
    },
    procedureVersion: state => state.procedureVersion,
    procedureDetails: state => {
        return state.procedureDetails;
    },
    mode: state => state.mode,
    isAuthoringMode: function(state) {
        return true;
    },
    editMode: state => state.editMode,
    timeReferences: state => state.timeReferences,
    
    isWorkingCopy: function(state) {
        return state.procedureVersion == '0';
    },

    executionFinalized: state => {
        return false;
    },

    isSelectedViId: function(state) {
        return (viId) => {
            return state.selectedViMap.hasOwnProperty(viId);
        };
    },    
    
    pageTitle: function(state, getters) {    
        if (getters.isWorkingCopy) {
            if (getters.editMode) {
                return `Procedure Edit: ${getters.procedureDetails.title} (Working Version)`;
            } else {
                return `Procedure Review: ${getters.procedureDetails.title} (Working Version)`;
            }
        } else {
            return `Procedure Review: ${getters.procedureDetails.title} (Version ${getters.procedureVersion})`;
        }
    },

    element: state => elementId => state.elements[elementId],
    elements: function(state, getters, rootState) {
        return getFilteredElementsFunc(state);
    },
    elementsAll: state => state.elementIds.map(id => state.elements[id]),
    elementIds: state => state.elementIds,
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
    searchResult: state => state.searchResult,
    selectedElementsByParent: function(state) {
        return ({parentId, elementId}) => {
            return state.elements[elementId].authoring_user_input.elements
                .filter((el) => el.parent_id === parentId && el.selected === true);
        };
    },

    selectedElementIdsByParent: function(state) {
        return ({parentId}) => {
            return state.elements[parentId].authoring_user_input.elements.map(child => {
                if(child.selected === true)
                    return child.elem_id;
            });
        };
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
    parentExecutionId: state => '',
    procedureTagSelections: state => (elementId) => _.get(state.elements[elementId].authoring_user_input, 'tag_selections') || [],
    executionInput: state => (elementId) => state.elements[elementId].authoring_user_input,
    executionInputKey: state => (elementId, keyString) => _.get(state.elements[elementId].authoring_user_input, keyString),
    executionInputEntriesArrayFilter: state => (elementId, keys) => {
        if(state.elements[elementId]) {
            let values = [];
            _.forEach(state.elements[elementId].authoring_user_input.entries, entry => {
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
            _.forEach(state.elements[elementId].authoring_user_input.entries, entry => {
                let values_inner = [];
                // from perspective of keys pick out values from entries preserving order
                _.forEach(keys, key => {
                    const correspondingEntryInput = entry.entry_inputs.find(entry_input => entry_input.name == key);
                    values_inner.push(correspondingEntryInput.value);
                });
                values.push(values_inner);
            });
            return values;
        } else return [];
    },
    executionInputEntryKey: state => (elementId, index, keyString) => _.get(state.elements[elementId].authoring_user_input.entries[index], keyString),
    executionInputChildIndexById: state => (elementId, childId) => _.findIndex(state.elements[elementId].authoring_user_input.elements, {"elem_id": childId}),
    executionMetaData: state => (elementId) => _.get(state.elements[elementId].execution, 'meta_data'),
    executionMetaDataKey: state => (elementId, keyString) => _.get(state.elements[elementId].execution.meta_data, keyString),

    numEntries: state => elementId => {
        if (!state.elements[elementId].authoring_user_input)
            return 0;
        return state.elements[elementId].authoring_user_input.entries ? state.elements[elementId].authoring_user_input.entries.length : 0;
    },
    venueKey: state => (keyString) => _.get(state.venue, keyString),
    elementKey: state => (elementId, keyString) => state.elements[elementId][keyString],
    elementViewState: state => (elementId) => state.elementsViewState[elementId],

    entryViewState: state => (elementId, index) => state.entriesViewState[elementId][index],
    elementViewStateKey: state => (elementId, keyString) => state.elementsViewState[elementId][keyString],
    procedurePreviewElementIds: () => [],
    procedureTagsObj: state => {
        const obj = {};
        for (const tag of state.procedureDetails.tags) {
            obj[tag.tag_id] = tag;
        }
        return obj;
    },

    // VI Step
    selectedVisStepElementId: (state) => state.selectedViStepElementId,
    getVisByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.authoring_user_input.vis`, []),
    getStepsByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.authoring_user_input.steps`, []),
    // There is no results during authoring. Use authoring_user_input instead.
    getStepResultsByElementId: (state) => (elementId) => _.get(state.elements, `${elementId}.authoring_user_input.steps`, []),
    allSelectedVis: (state, getters) => {
        const elements = getters.elementsAll;
        const vi_map = {};

        if (elements) {
            for (const element of elements) {
                if (element.step_type === 'VERIFICATION_ITEM') {
                    if (element.authoring_user_input && element.authoring_user_input.vis) {
                        for (const vi of element.authoring_user_input.vis) {
                            if (!vi_map.hasOwnProperty(vi.vi_id)) {
                                vi_map[vi.vi_id] = vi;                                
                            }
                        }
                    }
                }
            }
        }
        return Object.values(vi_map);
    },
    allVis: (state, getters) => {
        const elements = getters.elementsAll;
        const vi_map = {};

        if (elements) {
            for (const element of elements) {
                if (element.step_type === 'VERIFICATION_ITEM' || element.step_type === 'VERIFICATION_ITEM_STATUS') {
                    if (element.authoring_user_input && element.authoring_user_input.vis) {
                        for (const vi of element.authoring_user_input.vis) {
                            if (!vi_map.hasOwnProperty(vi.vi_id)) {
                                vi_map[vi.vi_id] = vi;                                
                            }
                        }
                    }
                }
            }
        }
        return Object.values(vi_map);
    },
    allCustomScripts: (state, getters) => {
        const elements = getters.elementsAll;
        const script_map = {};

        if (elements) {
            for (const element of elements) {
                if (element.step_type === 'CUSTOM_SCRIPT') {
                    if (element.authoring_user_input && element.authoring_user_input.script_id) {
                        if (!script_map.hasOwnProperty(element.authoring_user_input.script_id)) {
                            script_map[element.authoring_user_input.script_id] = element.authoring_user_input;                                
                        }
                    }
                }
            }
        }
        return Object.values(script_map);
    },
    dataPaths: function(state) {
        const dataPaths = [];
        if (state.elements) {
            for (const element of Object.values(state.elements)) {
                if (element.step_type === 'GDS_MANUAL') {
                    if (element.authoring_user_input && element.authoring_user_input.entries) {
                        for (const entry of element.authoring_user_input.entries) {
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
    tagsFilter: (state) => state.elemFilters.tag_ids,
    procedureStepFilter: (state) => state.elemFilters.procedureStep,
    filterElementName: (state) => state.elemFilters.filterElementName,

    // Outline
    fetchOutlinePrecomputed: state => {
        return state.outlinePrecomputed ? state.outlinePrecomputed : {};
    },
    procedureNotFound: state => {
        return state.procedureNotFound;
    },

    // Spinner
    loadingProcedure: state => {
        return state.loadingProcedure;
    },
    importingProcedure: state => {
        return state.importingProcedure;
    },
    importedProcedureId: state => {
        return state.importResponse.procedure_info ? state.importResponse.procedure_info.procedure_id : '';
    },
    importedVersions: state => {
        return state.importResponse.version_infos ? state.importResponse.version_infos.map(version_info => version_info.version) : [];
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
    creatingProcedureVersion: state => {
        return state.creatingProcedureVersion;
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
    // ids of elements that can be copied into this procedure
    selectedElementIdsForCopy: (state, getters) => {
        return getters.selectedElementIds;
    },
    // ids of selected elements of this procedure version
    selectedElementIdsForThis: (state) => {
        if (state.copyParams && state.copyParams.copyElemIdMap && state.copyParams.procedure_id === state.procedureId && state.copyParams.procedure_version === parseInt(state.procedureVersion)) {
            return Object.keys(state.copyParams.copyElemIdMap);
        } else {
            return [];
        }
    },
    // ids of elements that can be moved into this procedure
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
    selectedFlightDictionaryVersion: (state) => {
        return (state.procedureDetails && state.procedureDetails.flight_dictionary_version) ? state.procedureDetails.flight_dictionary_version : '';
    },
    selectedSseDictionaryVersion: (state) => {
        return (state.procedureDetails && state.procedureDetails.sse_dictionary_version) ? state.procedureDetails.sse_dictionary_version : '';
    },
    isTestConductor: function(state, getters) {
        return false;
    },  
    canParticipate: function(state, getters) {
        return true;
    },
    modStyle: (state) => (elementId, fieldPath, isInput=true) => {
        return '';
    },
    procedureModificationModal: state => state.procedureModificationModal,
    bulkJustificationModalMessage: state => state.bulkJustificationModalMessage,
};

/* istanbul ignore next */
const actions = {
    setBooleanKey({commit}, {key, bool}) {
        commit('setBooleanKey', {key: key, bool: bool});
    },
    setPending({commit}, busy) {
        commit("setPending", busy);
    },
    setProcedureId({commit}, {procedureId}) {
        commit('setProcedureId', {procedureId: procedureId});
    },
    setViewportTopPointer({commit}, {index}) {
        commit('setStateKey', {key: 'viewportTopPointer', val: index});
    },
    async fetchAuthoringProcedures({commit}, {limit, offset, filters, sort, sortBy}) {
        const { procedures, total } = await procedureApi.getProcedures({
            limit: limit, offset: offset, filters: filters,
            sort: sort, sortBy: sortBy
        });
        
        //REFORMATING TIME_SAVED 
        procedures.forEach(procedure => {
            procedure.time_saved = commonDateTime(procedure.time_saved);
        });

        commit('receiveAuthoringProcedures', {procedures: procedures, total: total});
    },
    async fetchAuthoringProcedureByProcedureId({commit}, {procedureId}) {
        commit('setBooleanKey', {key: 'loadingProcedure', bool: true});
        const procedure = await procedureApi.getProcedure(procedureId);
        if (procedure.error) {
            commit('setBooleanKey', {key: 'procedureNotFound', bool: true});
            commit('setBooleanKey', {key: 'loadingProcedure', bool: false});
        } else {
            commit('setAuthoringProcedureIndex', {index: 0});
            commit('receiveAuthoringProcedures', {procedures: [procedure], total: 1});
            commit('setBooleanKey', {key: 'loadingProcedure', bool: false});
        }
        
    },
    async fetchAuthoringProcedureVersions({commit}, {procedureId, limit=null, offset=null}) {
        commit('setBooleanKey', {key: 'loadingProcedure', bool: true});
        const versionsData = await getProcedureVersions(procedureId, limit, offset);

        //REFORMATING TIME_SAVED
        versionsData.versions.forEach(version => {
            version.time_saved = commonDateTime(version.time_saved);
        });

        commit('receiveAuthoringProcedureVersions', {versions: versionsData.versions, total: versionsData.total});
        commit('setBooleanKey', {key: 'loadingProcedure', bool: false});
    },
    async fetchAuthoringProcedureVersionsWorkingVersion({commit}, {procedureId}) {
        commit('setBooleanKey', {key: 'loadingProcedure', bool: true});
        let workingVersion = await getProcedureVersion(procedureId, 0);
        workingVersion.time_saved = commonDateTime(workingVersion.time_saved);  // REFORMATING TIME_SAVED

        commit('receiveAuthoringProcedureVersionsWorkingVersion', {version: workingVersion});
        commit('setBooleanKey', {key: 'loadingProcedure', bool: false});
    },
    async addProcedureTag({commit}, {procedureId, tag}) {
        await procedureApi.createProcedureTag(procedureId, tag);
        // websocket is used to update vuex state
    },
    async removeProcedureTag({commit}, {procedureId, tagId}) {
        await procedureApi.deleteProcedureTag(procedureId, tagId);
        // websocket is used to update vuex state
    },
    async editProcedureTag({commit}, {procedureId, tag}) {
        await procedureApi.editProcedureTag(procedureId, tag.tag_id, tag);
        // websocket is used to update vuex state
    },
    async addProcedureElementTag({commit}, {procedureId, elementId, tagId}) {
        await procedureApi.createProcedureElementTag(procedureId, elementId, tagId);
        // websocket is used to update vuex state
    },
    async removeProcedureElementTag({commit}, {procedureId, elementId, tagId}) {
        await procedureApi.deleteProcedureElementTag(procedureId, elementId, tagId);
        // websocket is used to update vuex state
    },
    setAuthoringProcedureIndex({commit}, {index}) {
        commit('setAuthoringProcedureIndex', {index: index});
    },
    setAuthoringProcedureVersionIndex({commit}, {index}) {
        commit('setAuthoringProcedureVersionIndex', {index: index});
    },
    async createProcedure({commit}, {title, institutionalId, description}) {
        const procedure = await createProcedure(title, institutionalId, description);
        return procedure !== null;
    },
    async updateProcedure({commit}, {procedureId, title=null, institutionalId=null, description=null, author=null, hazardous=null, procedureType=null, labels=null}) {
        const response = await updateProcedure(procedureId, title, institutionalId, description, author, hazardous, procedureType, labels);
        if (response.status === 204) {
            commit('updateAuthoringProcedure', {
                title: title, institutionalId: institutionalId,
                description: description, author: author, hazardous: hazardous, 
                procedureType: procedureType,
                labels: labels
            });
        }
    },
    async populateTimeReferences({commit, getters}) {
        const version = getters.procedureVersion;
        const procedureId = getters.procedureId;

        const timeReferences = await fetchTimeReferences(procedureId, version);
        commit("receiveTimeReferences", timeReferences);
        return timeReferences;
    },
    async updateProcedureVersionStatus({commit}, {procedureId, version, action, institutionalReleaseId=null}) {
        const data = {action: action};
        if (institutionalReleaseId !== null) {
            data.institutional_release_id = institutionalReleaseId;
        }
        await postProcedureVersionStatus(procedureId, version, data,
            (response) => {
                commit('updateProcedureVersion', {
                    status: response.data.status,
                    institutionalReleaseId: response.data.institutional_release_id,
                });
            },
            (error) => {
                console.log(error);
            }
        );
    },
    async updateProcedureVersionMetaData({getters, dispatch}, {procedureId, version, versionDescription, institutionalReleaseId}){
        const data = {version_description: versionDescription, institutional_release_id: institutionalReleaseId};
        await patchProcedureVersion(procedureId, version, data,
            () => {
                dispatch("fetchAuthoringProcedureVersions", {procedureId: getters.procedureId});
            },
            (error) => {
                console.log(error);
            }
        );
    },
    async search({commit, getters}, {version, searchPayload}) {
        await searchProcedure(getters.procedureId, version, searchPayload, 
            (data) => {
                data.matches = data.matches.map(match => ({
                    ...match, replaced: false
                }));
                commit('receiveSearch', data);
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    clearSearchResults({commit}) {
        commit('clearSearchResults');
    },
    async replaceMatches({commit, getters}, {replacePayload}) {
        // 
        await replaceProcedure(getters.procedureId, replacePayload, 
            (replacements) => {
                commit('updateReplacedFields', {replacements});
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async importProcedureVersion({commit}, {procedureId, formData}) {
        commit('setBooleanKey', {key: 'importingProcedure', bool: true});
        await importProcedureVersion(procedureId, formData,
            (response) => {
                commit('receiveImportResponse', {importResponse: response});
            },
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit('setBooleanKey', {key: 'importingProcedure', bool: false});
    },
    async importProcedureVersions({commit}, {formData}) {
        commit('setBooleanKey', {key: 'importingProcedure', bool: true});
        await importProcedureVersions(formData,
            (response) => {
                commit('receiveImportResponse', {importResponse: response});
            },
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit('setBooleanKey', {key: 'importingProcedure', bool: false});
    },
    async deleteProcedure({commit}, {procedureId}) {
        if (procedureId) {
            const response = await deleteProcedure(procedureId);
            if (response.status === 204) {
                commit('setCurrentProcedureDeleted', {currentProcedureDeleted: true});
            }
        }
    },
    async deleteProcedureVersion({commit, getters, dispatch}, {procedureId, version}) {
        await deleteProcedureVersion(procedureId, version,
            () => {
                dispatch("fetchAuthoringProcedureVersions", {procedureId: getters.procedureId});
            },
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
    },
    updateCurrentProcedureDeleted({commit}, {currentProcedureDeleted}) {
        commit("setCurrentProcedureDeleted", {currentProcedureDeleted: currentProcedureDeleted});
    },
    setEditMode({commit}, {editMode}) {
        commit("setEditMode", {editMode: editMode});
    },
    async lockProcedure({commit}, {procedureId}) {
        const lockedBy = getUsername();
        await lockProcedure(procedureId, lockedBy,
            () => commit('updateAuthoringProcedure', {lockedBy: lockedBy}),
            (error) => console.log(error),
        );
    },
    async unlockProcedure({commit}, {procedureId}) {
        await unlockProcedure(procedureId,
            () => commit('updateAuthoringProcedure', {lockedBy: ''}),
            (error) => console.log(error),
        );
    },
    async fetchProcedureVersion({commit}, {procedureId, version}) {
        const procedureDetails = await getProcedure(procedureId);
        const procedureDetailsVersion = await getProcedureVersion(procedureId, version);
        commit("receiveProcedureVersion", {procedureId, version});
        commit("mergeReceiveProcedureDetails", {procedureDetails, procedureDetailsVersion});
    },
    async fetchElements({commit, getters, rootState}, {procedureId, version}) {
        commit("setPending", true);
        const { elements, error } = await getProcedureElements(procedureId, version);
        if(error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        } else {
            const elem_ids = elements.map(element => element.elem_id);             
            commit("receiveElements", {elements, detailLevel: 2, numbers: [], elementIds: elem_ids, rootState});
        }
        commit("setPending", false);
        return elements;
    },
    async scrollElements({commit}, {scrollDirection}) {
        commit("pageElements", {scrollDirection: scrollDirection});
    },
    async createProcedureVersion({commit, getters, dispatch}, versionDescription) {
        commit("setBooleanKey", {key: "creatingProcedureVersion", bool: true});
        try {
            await postProcedureVersion(getters.procedureId, versionDescription);
            dispatch("fetchAuthoringProcedureVersions", {procedureId: getters.procedureId});
            const procedureInfo = await getProcedure(getters.procedureId);
            commit('receiveProcedureInfo', procedureInfo);
            commit('receiveFeedback', {type: 'success', messageObj: {message: 'New Version Created!', procedureId: getters.procedureId, version: procedureInfo.current_version}});  
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
        commit("setBooleanKey", {key: "creatingProcedureVersion", bool: false});
    },
    async createElement({commit, getters, rootState}, {elementType, insertAfterId, level}) {
        commit("setBooleanKey", {key: "creatingElement", bool: true});
        await postProcedureElement(getters.procedureId, elementType, insertAfterId, level,
            () => {},
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit("setBooleanKey", {key: "creatingElement", bool: false});
    },
    async moveElement({commit, getters, rootState}, {insertAfterId, elementId, level}) {
        commit('setBooleanKey', {key: 'movingElement', bool: true});
        await moveProcedureElement(getters.procedureId, elementId, insertAfterId, level,
            () => {},
            (error) => {
                commit('receiveFeedback', {type: 'error', errorObj: error});
            }
        );
        commit("setBooleanKey", {key: "movingElement", bool: false});
    },
    async copyElement({commit, getters, rootState}, {insertAfterId, elementId, level}) {
        commit('setBooleanKey', {key: 'copyingElement', bool: true});
        await copyProcedureElement(getters.procedureId, elementId, insertAfterId, level,
            () => {},
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
        commit('setBooleanKey', {key: 'copyingElement', bool: false});
    },
    async revertElements({commit, getters, dispatch}, {sourceProcedureId, sourceVersion}) {
        await revertProcedure(getters.procedureId, sourceProcedureId, sourceVersion, 
            (response) => commit('receiveFeedback', {type: 'success', messageObj: {message: `The working copy of ${getters.procedureId} was reverted`, 
                procedureId: getters.procedureId, version: 0}}),
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async multiCopyElement({commit, getters, rootState}, {
        executionId: procedureId,    // caller (DropPlaceHolder) passes procedureID as executionId. rename it to procedureId.
        elementIds,
        insertAfterId,
        level,
        sourceExecutionId,
        sourceProcedureId,
        sourceProcedureVersion
    }) {
        commit('setBooleanKey', {key: 'copyingElement', bool: true});
        await multiCopyProcedureElement({
            procedureId,
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
        executionId: procedureId,    // caller (DropPlaceHolder) passes procedureID as executionId. rename it to procedureId.
        elementIds,
        insertAfterId,
        level,
        sourceExecutionId,
        sourceProcedureId,
        sourceProcedureVersion
    }) {
        commit('setBooleanKey', {key: 'movingElement', bool: true});
        await multiMoveProcedureElement({
            procedureId,
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
        let input = deepCopy(state.elements[elementId].authoring_user_input);
        const entryToMove = input.entries.splice(draggedEntryIndex, 1)[0];
        input.entries.splice(insertionIndex, 0, entryToMove);

        let payload = input;
        try {
            await postProcedureElementInput(getters.procedureId, elementPath, elementId, payload);
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
            await deleteProcedureElement(getters.procedureId, elementId);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
        }
    },
    async updateElement({commit, getters}, {elementPath, elementId, element}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        const payload = element;
        try {
            await patchProcedureElement(getters.procedureId, elementPath, elementId, payload);
        } catch (error) {
            const messageObj = {
                message: 'Error when saving step. The change may NOT have been saved in the server. RELOAD THE PAGE TO CHECK.',
                details: [_.unescape(`${error}`)]
            };
            commit('receiveFeedback', {type: 'error', messageObj: messageObj});
        }
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    async replaceElement({commit, getters}, {elementId, replaceElementPayload}) {
        await postReplaceProcedureElement(getters.procedureId, elementId, replaceElementPayload, 
            () => {},
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async saveElementInput({commit, getters}, {elementPath, elementId, input}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        let payload = state.elements[elementId].authoring_user_input;
        if (input) {
            payload = {...payload, ...input};
        }
        try {
            await postProcedureElementInput(getters.procedureId, elementPath, elementId, payload);
        } catch (error) {
            const messageObj = {
                message: 'Error when saving step input. The change may NOT have been saved in the server. RELOAD THE PAGE TO CHECK.',
                details: [_.unescape(`${error}`)]
            };
            commit('receiveFeedback', {type: 'error', messageObj: messageObj});
        }
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
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
    editEntries({commit}, {elementId, value, level}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        if(value && value.length > 0)
            commit("receiveEntries", {elementId, value, level});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
    },
    editEntryInput({commit}, {elementId, index, key, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        commit("receiveEntryInput", {elementId, index, key, value});
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
    editCustomScriptEntries({commit}, {elementId, value}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});
        if(value && value.length > 0)
            commit("receiveCustomScriptEntries", {elementId, value});
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
    createEntryInput({commit, state, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].authoring_user_input.entries);

        // Make a new copy from the api template
        let newEntry = deepCopy(state.elements[elementId].specification.authoring_user_input.entries[0]);
        // For custom script, the api spec is generic. Instead, use the selected entry as a template.
        if (state.elements[elementId].step_type === 'CUSTOM_SCRIPT') {
            newEntry = deepCopy(state.elements[elementId].authoring_user_input.entries[refIndex]);
            resetCustomScriptEntry(newEntry);
        }
        // Insert a fresh entry after the index it came from (ref index)
        entries.splice(refIndex + 1, 0, newEntry);

        const input = {entries: entries};
        dispatch("saveElementInput", {elementPath, elementId, input});

        commit('createEntryViewState', {elementId, refIndex});
    },
    copyEntryInput({commit, state, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].authoring_user_input.entries);

        // Make a new copy from the ref index in entries array
        const copyEntry = deepCopy(state.elements[elementId].authoring_user_input.entries[refIndex]);
        // Insert a copied entry after the index it came from (ref index)
        entries.splice(refIndex + 1, 0, copyEntry);
    
        const input = {entries: entries};
        dispatch("saveElementInput", {elementPath, elementId, input});
        
        commit('copyEntryViewState', {elementId, refIndex});
    },
    deleteEntryInput({commit, dispatch}, {elementId, refIndex, elementPath}) {
        const entries = deepCopy(state.elements[elementId].authoring_user_input.entries);
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
    resetRunProcedureInput({commit}, {elementId, tagSelections}) {
        commit("resetRunProcedureInput", {elementId, tagSelections});
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
            authoring_user_input: {
                vis: Object.values(state.selectedViMap),
                steps: [ ...getters.getStepsByElementId(elementId) ],
            }
        };
        await patchViStatusStep(getters.procedureId, elementId, payload,
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
                authoring_user_input: {
                    vis: visToReplace,
                    steps: [ ...getters.getStepsByElementId(elementId) ],
                }
            };
            await patchViStatusStep(getters.procedureId, elementId, payload,
                () => {},
                (error) => console.log(error)
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
            authoring_user_input: {
                vis: [ ...getters.getVisByElementId(selectedVisStepElementId) ],
                steps: [ ...getters.getStepsByElementId(selectedVisStepElementId), step ],
            }
        };
        await patchViStatusStep(getters.procedureId, selectedVisStepElementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async deleteStepFromStep({commit, getters}, {elementId, elem_id}) {
        const payload = {
            authoring_user_input: {
                vis: [ ...getters.getVisByElementId(elementId) ],
                steps: getters.getStepsByElementId(elementId).filter((step) => step.elem_id !== elem_id),
            }
        };
        await patchViStatusStep(getters.procedureId, elementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async deleteAllStepsFromStep({commit, getters}) {
        const selectedVisStepElementId = getters.selectedVisStepElementId;
        const payload = {
            authoring_user_input: {
                vis: getters.getVisByElementId(selectedVisStepElementId),
                steps: [],
            }
        };
        await patchViStatusStep(getters.procedureId, selectedVisStepElementId, payload,
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
            authoring_user_input: {
                vis: getters.getVisByElementId(selectedVisStepElementId),
                steps: steps
            }
        };
        await patchViStatusStep(getters.procedureId, selectedVisStepElementId, payload,
            () => {},
            (error) => console.log(error),
        );
    },
    async validateProcedureElements({getters, dispatch, commit}, update) {
        const vis = getters.allVis;
        const vi_ids = vis.map(vi => vi.vi_id);
        const res_vis = await dictionaryApi.getVIsBulk(vi_ids);
        const ref_vis = res_vis.data;
        const ref_vi_map = {};
        for (const ref_vi of ref_vis) {
            ref_vi_map[ref_vi.vi_id] = ref_vi;
        }

        const scripts = getters.allCustomScripts;
        const script_ids = scripts.map(script => script.script_id);
        const res_scripts = await dictionaryApi.getCustomScriptsBulk(script_ids);
        const ref_scripts = res_scripts.data;
        const ref_script_map = {};
        for (const ref_script of ref_scripts) {
            ref_script_map[ref_script.script_id] = ref_script;
        }

        const selected_vis = [];
        const selected_scripts = [];

        for (const vi of vis) {
            if (ref_vi_map.hasOwnProperty(vi.vi_id)) {
                selected_vis.push(ref_vi_map[vi.vi_id]);
            }
        }

        for (const script of scripts) {
            if (ref_script_map.hasOwnProperty(script.script_id)) {
                selected_scripts.push(ref_script_map[script.script_id]);
            }
        }
        
        const validation_input = {
            update: update,
            vis: selected_vis,
            scripts: selected_scripts
        };

        await validateProcedureVersion(getters.procedureId, getters.procedureVersion, validation_input,
            ({data}) => {
                commit('receiveValidation', {
                    update: validation_input.update, 
                    validationItems: data.validation_items,
                    elementId: null,   // to validate all elements
                });

                // Note: updating elements is handled by Web Socket
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async validateProcedureElement({getters, dispatch, commit, rootState}, elementId) {
        const vis = getters.allVis;
        const vi_ids = vis.map(vi => vi.vi_id);
        const res_vis = await dictionaryApi.getVIsBulk(vi_ids);
        const ref_vis = res_vis.data;
        const ref_vi_map = {};
        for (const ref_vi of ref_vis) {
            ref_vi_map[ref_vi.vi_id] = ref_vi;
        }

        const scripts = getters.allCustomScripts;
        const script_ids = scripts.map(script => script.script_id);
        const res_scripts = await dictionaryApi.getCustomScriptsBulk(script_ids);
        const ref_scripts = res_scripts.data;
        const ref_script_map = {};
        for (const ref_script of ref_scripts) {
            ref_script_map[ref_script.script_id] = ref_script;
        }

        const selected_vis = [];
        const selected_scripts = [];

        for (const vi of vis) {
            if (ref_vi_map.hasOwnProperty(vi.vi_id)) {
                selected_vis.push(ref_vi_map[vi.vi_id]);
            }
        }

        for (const script of scripts) {
            if (ref_script_map.hasOwnProperty(script.script_id)) {
                selected_scripts.push(ref_script_map[script.script_id]);
            }
        }
        
        const validation_input = {
            update: true,
            vis: selected_vis,
            scripts: selected_scripts
        };

        const refresh_response = await validateProcedureElement(getters.procedureId, validation_input, elementId,
            ({data}) => {
                commit('receiveValidation', {
                    update: validation_input.update,
                    validationItems: data.validation_items,
                    elementId: elementId,
                });
                // Note: updating elements is handled by Web Socket
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async saveExecution({commit, getters}, executionPayload){
        // The Authoring patch call does not allow selected dictionaries to be saved, so this method is blank
    },
    async setSseDictionaryVersion({commit, getters, dispatch}, dictionaryVersion){
        const version = getters.procedureVersion;
        await patchProcedureVersion(getters.procedureId, version, {'sse_dictionary_version': dictionaryVersion},
            () => { 
                dispatch('fetchProcedureVersion', {procedureId: getters.procedureId, version: version});
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },
    async setFlightDictionaryVersion({commit, getters, dispatch}, dictionaryVersion){
        const version = getters.procedureVersion;
        await patchProcedureVersion(getters.procedureId, version, {'flight_dictionary_version': dictionaryVersion},
            () => { 
                dispatch('fetchProcedureVersion', {procedureId: getters.procedureId, version: version});
            },
            (error) => commit('receiveFeedback', {type: 'error', errorObj: error})
        );
    },


    // Scrolling
    editScrollToElementId({commit}, {id}) {
        commit('setScrollToElementId', {id: id});
    },
    resetScrollToElementId({commit}) {
        commit('setScrollToElementId', '');
    }, 

    async fetchRunProcedureOutlineSelectedSteps({commit, getters, rootState}, { procedureId, version, runProcedureElementId, executionId}) {
        const isAuthoring = !executionId;

        const element = isAuthoring
            ? await procedureApi.getProcedureElement(procedureId, runProcedureElementId)
            : await getExecutionElement(executionId, runProcedureElementId);

        if (isAuthoring && element && element.authoring_user_input) {
            const runProcedureStepName = `"${element.number}: ${element.title}" (${procedureId}: v${version})`;

            const selectedStepIds = element.authoring_user_input.elements
                .filter(element => element.selected)
                .map(element => element.elem_id);

            commit('elemFiltersRunProcedureElementsMutate', { 
                rootState,
                runProcedureStepFilter: { 
                    title: runProcedureStepName,
                    elementIds: selectedStepIds 
                }
            });
        }

        if (!isAuthoring && element && element.execution_user_input) {
            const runProcedureStepName = `"${element.number}: ${element.title}" (${procedureId}: v${version})`;

            const selectedStepIds = element.execution_user_input.elements
                .filter(element => element.selected)
                .map(element => element.elem_id);

            commit('elemFiltersRunProcedureElementsMutate', { 
                rootState,
                runProcedureStepFilter: { 
                    title: runProcedureStepName,
                    elementIds: selectedStepIds 
                }
            });
        }
    },

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

    toggleTagFilter({commit, getters, rootState}, tagName) {
        commit('elemFiltersTagMutate', {
            rootState,
            procedureTags: getters.procedureDetails.tags, 
            tagName
        });
    },

    // Outline
    toggleOutlineCollapsed({commit}, {elementId}) {
        commit('toggleOutlineCollapsed', {elementId});
    },

    toggleOutlineCollapsedAll({commit}, bool) {
        commit('toggleOutlineCollapsedAll', bool);
    },
   
    // Copy Multiple
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
        commit('loadReplaceElementSource');
    },

    // Cut Multiple
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

    resetImportResponse({commit}){
        commit('resetImportResponse');
    },
    "SOCKET_PROCEDURE_procedure-event"({commit, state, rootState}, socket_data) {
        const status_code = socket_data.status_code;
        const params = socket_data.params;
        const request = socket_data.request_body;
        const response = socket_data.response_body;

        // Note that error notification is not really used for authoring page.
        // This is here to stop further WS message handling when an API call fails.
        if (handleErrorNotification(status_code, response, commit)) return;

        switch(socket_data.event) {
        
        // Create Step
        case "procedure_create_section":
        case "procedure_create_paragraph":
        case "procedure_create_procedure_section":
        case "create_procedure_manual_input_step":
        case "create_procedure_manual_eip_step":
        case "create_procedure_venue_config_step":
        case "create_procedure_environment_step":
        case "create_procedure_gds_step":
        case "create_procedure_get_config_step":
        case "create_procedure_update_config_step":
        case "create_procedure_check_config_step":
        case "create_procedure_graph_eha_step":
        case "create_procedure_query_evr_step":
        case "create_procedure_verify_eha_step":
        case "create_procedure_wait_eha_step":
        case "create_procedure_wait_evr_step":
        case "create_procedure_bus_1553_step":
        case "create_procedure_list_data_products_step":
        case "create_procedure_time_reference_step":
        case "create_procedure_wait_data_products_step":
        case "create_procedure_cmd_step":
        case "create_procedure_cmd_file_step":
        case "create_procedure_cmd_scmf_step":            
        case "create_procedure_cmd_sse_step":
        case "create_procedure_custom_script_step":
        case "create_procedure_manual_verification_step":
        case "create_procedure_wait_step":
        case "create_procedure_toc_step":
        case "create_procedure_vi_step":
        case "create_procedure_vi_status_step": {
            commit("receiveElement", {element: response.elem, detailLevel: 3, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }

        // Copy Procedure Element
        case "procedure_copy_element": {
            commit("receiveElements", {elements: response.elements, detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }
        // Move Execution Element
        case "procedure_move_element": {
            // use L2 view for copied elements
            commit("receiveElements", {elements: [], detailLevel: 2, numbers: response.numbers, elementIds: response.elem_ids, parentIds: response.parent_ids, rootState});
            break;
        }
        // Delete Step
        case "procedure_delete_element": {
            commit("deleteElement", {elementId: params.elem_id, numbers: response.numbers, elementIds: response.elem_ids, rootState});
            break;
        }

        // Edit Step Input
        case "procedure_update_procedure_section_input":
        case "update_procedure_manual_input_step_input":
        case "update_procedure_manual_eip_step_input":
        case "update_procedure_venue_config_step_input":
        case "update_procedure_environment_step_input":
        case "update_procedure_gds_step_input":
        case "update_procedure_get_config_step_input":
        case "update_procedure_update_config_step_input":
        case "update_procedure_check_config_step_input":
        case "update_procedure_graph_eha_step_input":
        case "update_procedure_query_evr_step_input":
        case "update_procedure_verify_eha_step_input":
        case "update_procedure_wait_eha_step_input":
        case "update_procedure_wait_evr_step_input":
        case "update_procedure_bus_1553_step_input":
        case "update_procedure_list_data_products_step_input":
        case "update_procedure_time_reference_step_input":
        case "update_procedure_wait_data_products_step_input":
        case "update_procedure_cmd_step_input":
        case "update_procedure_cmd_file_step_input":
        case "update_procedure_cmd_scmf_step_input":            
        case "update_procedure_cmd_sse_step_input":
        case "update_procedure_custom_script_step_input":
        case "update_procedure_manual_verification_step_input":
        case "update_procedure_wait_step_input":
        case "update_procedure_vi_step_input":
        case "update_procedure_vi_status_step_input":
        case "": {
            commit("updateElementInputWS", {
                elementId: params.elem_id,
                value: request
            });
            break;
        }

        // Procedure and element tags
        case "procedure_create_tag": {
            commit('receiveProcedureTags', response);
            break;
        }
        case "procedure_update_tag": {
            commit('receiveProcedureTags', response);
            commit('updateOutline');
            break;
        }
        case "procedure_delete_tag": {
            commit('receiveProcedureTags', response.tags);
            commit('receiveProcedureElementsTags', response.elems);
            commit('updateOutline');
            break;
        }
        case "procedure_element_apply_tag": {
            commit('receiveProcedureElementsTags', response);
            commit('updateOutline');
            break;
        }
        case "procedure_element_remove_tag": {
            commit('receiveProcedureElementsTags', response);
            commit('updateOutline');
            break;
        }

        // Update Element
        case "procedure_update_element":
        case "procedure_update_step":
        case "procedure_update_section":
        case "procedure_update_procedure_section":
        case "procedure_update_paragraph":
        case "update_procedure_manual_input_step":
        case "update_procedure_manual_eip_step":
        case "update_procedure_venue_config_step":
        case "update_procedure_environment_step":
        case "update_procedure_gds_step":
        case "update_procedure_get_config_step":
        case "update_procedure_update_config_step":
        case "update_procedure_check_config_step":
        case "update_procedure_graph_eha_step":
        case "update_procedure_query_evr_step":
        case "update_procedure_verify_eha_step":
        case "update_procedure_wait_eha_step":
        case "update_procedure_wait_evr_step":
        case "update_procedure_bus_1553_step":
        case "update_procedure_list_data_products_step":
        case "update_procedure_time_reference_step":
        case "update_procedure_wait_data_products_step":
        case "update_procedure_cmd_step":
        case "update_procedure_cmd_file_step":
        case "update_procedure_cmd_scmf_step":
        case "update_procedure_cmd_sse_step":
        case "update_procedure_custom_script_step":
        case "update_procedure_manual_verification_step":
        case "update_procedure_analysis_step":
        case "update_procedure_wait_step":
        case "update_procedure_toc_step":
        case "update_procedure_vi_step":
        case "update_procedure_vi_status_step": 
        case "procedure_replace_element": {
            commit("receiveElement", {
                element: response,
                numbers: null, 
                elementIds: null, 
                rootState
            });
            break;
        }
        case "validate_procedure_version":
        case "validate_procedure_element": {
            if (response.elements) {
                commit('receiveOnlyElements', {
                    elements: response.elements,
                });
            }
            break;
        }
        }
    }
};

const mutations = {
    setPending(state, busy) {
        state.isPending = busy;
    },
    receiveNotification(state, notificationMessage) {
        // Not needed for procedure. Do nothing
        // state.notificationMessage = notificationMessage;
    },
    receiveImportResponse(state, {importResponse}) {
        state.importResponse = importResponse;
    },
    setProcedureId(state, {procedureId}) {
        state.procedureId = procedureId;
    },
    setStateKey(state, {key, val}) {
        state[key] = val;
    },
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },
    updateReplacedFields(state, {replacements}) {
        if (replacements.length > 0) {
            const elementsObj = _.cloneDeep(state.elements);
            const searchResultObj = _.cloneDeep(state.searchResult);    
            for (const replacement of replacements) {
                let elem_id = replacement.elem_id;
                let field_path = replacement.field_path;
                let key = `${elem_id}:${field_path}`;
    
                let match = searchResultObj.matchMap[key];
                if (match) {
                    match.replaced = true;
                } else {
                    console.error(`match to be updated was not found. elem_id ${elem_id} field_path: ${field_path}`);
                }
            }
    
            for (const replacement of replacements) {
                let elem_id = replacement.elem_id;
                let number = replacement.number;
                let field_path = replacement.field_path;
                let field_value = replacement.field_value;
                let elem = elementsObj[elem_id];
    
                if (elem) {
                    if (_.get(elem, field_path, undefined) === undefined) {
                        console.error(`field to be updated was not found. elem_id ${elem_id} number: ${number} field_path: ${field_path}`);
                    } else {
                        _.set(elem, field_path, field_value);
                    }
                } else {
                    console.error(`element to be updated was not found. elem_id ${elem_id} number: ${number} field_path: ${field_path}`);
                }
            }
            state.searchResult = searchResultObj;
            state.elements = elementsObj;
            state.outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, state.elements, state.elementIds);
        }
    },
    setElementViewStateKey(state, {elementId, key, val}) {
        state.elementsViewState[elementId][key] = val;
    },
    receiveAuthoringProcedures(state, {procedures, total}) {
        state.authoringProcedures =  [...procedures];
        state.authoringProceduresCount = total;
    },
    receiveAuthoringProcedureVersions(state, {versions, total}) {
        state.authoringProcedureVersions = [...versions];
        state.authoringProcedureVersionsCount = total;
    },
    receiveAuthoringProcedureVersionsWorkingVersion(state, {version}) {
        state.authoringProcedureVersionsWorkingVersion = version;
    },
    setAuthoringProcedureIndex(state, {index}) {
        state.authoringProcedureIndex = index;
    },
    setAuthoringProcedureVersionIndex(state, {index}) {
        state.authoringProcedureVersionIndex = index;
    },
    setCurrentProcedureDeleted(state, {currentProcedureDeleted}) {
        state.currentProcedureDeleted = currentProcedureDeleted;
    },
    receiveProcedureVersion(state, {procedureId, version}) {
        state.procedureId = procedureId;
        state.procedureVersion = version;
    },
    receiveTimeReferences(state, timeReferences) {
        Vue.set(state, 'timeReferences', timeReferences);
    },
    receiveProcedureInfo(state, procedureInfo) {
        state.procedureDetails = {...state.procedureDetails, ...procedureInfo};
    },
    mergeReceiveProcedureDetails(state, {procedureDetails, procedureDetailsVersion}) {
        state.procedureDetails = Object.assign(procedureDetails, procedureDetailsVersion);
    },
    receiveProcedureTags(state, tags) {
        Vue.set(state.procedureDetails, 'tags', tags);
    },
    receiveProcedureElementsTags(state, elemTagInfos) {
        const elementsObj = _.cloneDeep(state.elements);
        for (const elemTagInfo of elemTagInfos) {
            let elem = elementsObj[elemTagInfo.elem_id];
            if (elem) {
                elem.tag_ids = elemTagInfo.tag_ids;
            }
        }
        state.elements = elementsObj;
    },
    setEditMode(state, {editMode}) {
        state.editMode = editMode;  
    },
    updateOutline(state) {
        state.outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, state.elements, state.elementIds);
    },
    receiveElement(state, {element, detailLevel, numbers, elementIds, rootState}) {
        // if detailLevel is not specified, keep the current level
        if (!detailLevel) {
            if (state.elementsViewState && state.elementsViewState[element.elem_id]) {
                detailLevel = state.elementsViewState[element.elem_id].detailLevel;
            }
        }

        // If element does not have parent_id (for example when an element was updated),
        // use the current parent_id
        if (!element.hasOwnProperty('parent_id')) {
            const parent_id = state.elements[element.elem_id] ? state.elements[element.elem_id].parent_id : '';
            element.parent_id = parent_id;
        }

        const slimmedElement = slimElement(element);
        const elementsObj = {...state.elements, [element.elem_id]: slimmedElement};
        const conversationsObj = {...rootState.comments.conversations};
                
        if (numbers !== null) {
            updateNumbers(elementsObj, numbers);
        }
        
        // If element has >= 1 entries, create a state object for each
        const entriesViewStateArr = [];
        if(element.authoring_user_input && element.authoring_user_input.entries) {
            // Loop over each entry and spawn a default state
            element.authoring_user_input.entries.forEach(() => {
                entriesViewStateArr.push({detailLevel: detailLevel});
            });
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
        state.elementsViewState = { ...state.elementsViewState, [element.elem_id]: {
            detailLevel: detailLevel,
            loading: false
        }};
        state.entriesViewState = {...state.entriesViewState, [element.elem_id]: entriesViewStateArr};
        
        rootState.comments.conversations = conversationsObj;
    },
    receiveElements(state, {elements, detailLevel, numbers, elementIds, parentIds, rootState}) {
        const elementsObj = {...state.elements};
        const elementsViewStateObj = {...state.elementsViewState};
        const entriesViewStateObj = {...state.entriesViewState};
        const conversationsObj = {...rootState.comments.conversations};
        
        elements.forEach(element => {
            if(elementsObj[element.elem_id]) {
                // Make copy of element data and update it without triggering state change.
                // elements will be updated later in a batch.
                elementsObj[element.elem_id] = Object.assign({}, elementsObj[element.elem_id], slimElement(element));
            }
            else {
                elementsObj[element.elem_id] = slimElement(element);
                elementsViewStateObj[element.elem_id] = {detailLevel: detailLevel, loading: false};
            }

            if(element.authoring_user_input && element.authoring_user_input.entries) {
                entriesViewStateObj[element.elem_id] = [];
                element.authoring_user_input.entries.forEach(() => {
                    entriesViewStateObj[element.elem_id].push({detailLevel: detailLevel});
                });
            }
            
            if (!conversationsObj.hasOwnProperty(element.elem_id)) {
                conversationsObj[element.elem_id] = {};
            }            
        });
        
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
    receiveOnlyElements(state, {elements}) {
        const elementsObj = {...state.elements};

        elements.forEach(element => {
            if(elementsObj[element.elem_id]) {
                // Make copy of element data and update it without triggering state change.
                // elements will be updated later in a batch.
                elementsObj[element.elem_id] = Object.assign({}, elementsObj[element.elem_id], slimElement(element));
            }
            else {
                elementsObj[element.elem_id] = slimElement(element);
            }     
        });
        
        state.elements = elementsObj;
    },
    updateElementInputWS(state, {elementId, value}) {
        state.elements[elementId].authoring_user_input = value;
        if(state.elements[elementId].elem_type === 'PROCEDURE_SECTION') {
            state.reloadProcedureOutline = {elementId: elementId};
        }    
    },
    receiveSearch(state, searchResult) {
        const matchMap = {};
        for (const match of searchResult.matches) {
            let key = `${match.elem_id}:${match.field_path}`;
            matchMap[key] = match;
        }
        // use map to improve lookup performance
        searchResult.matchMap = matchMap;
        delete searchResult.matches;
        state.searchResult = searchResult;
    },
    clearSearchResults(state) {
        state.searchResult = getDefaultSearchResult();
    },
    pageElements(state, {scrollDirection}) {
        pageElementsFunc(state, {scrollDirection});
    },
    deleteElement(state, {elementId, numbers, elementIds, rootState}) {
        const elementsObj = {...state.elements};
        const elementsViewStateObj = {...state.elementsViewState};
        const entriesViewStateObj = {...state.entriesViewState};
        
        delete elementsObj[elementId];
        delete elementsViewStateObj[elementId];
        delete entriesViewStateObj[elementId];
        
        updateNumbers(elementsObj, numbers);
        const outlinePrecomputed = getOutlineStructure(state.outlinePrecomputed, elementsObj, elementIds);
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        
        state.elementIds = elementIds;
        state.filteredElementIds = filteredElementIds;
        state.elements = elementsObj;
        state.elementsViewState = elementsViewStateObj;
        state.entriesViewState = entriesViewStateObj;
        state.outlinePrecomputed = outlinePrecomputed;
    },
    receiveElementArrayValue(state, {elementId, keyString, value, position}) {
        // Vuex wraps array methods for reactivity.
        // Replacing an index does NOT trigger an update - a splice is required.
        // https://vuejs.org/v2/guide/list.html#Caveats

        const targetArray = _.get(state.elements[elementId].authoring_user_input, keyString);
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

        const targetArray = _.get(state.elements[elementId].authoring_user_input.entries[entryIndex], keyString);
        // if value is undefined or null, remove index from existing array
        if (isUndefinedOrNull(value)) {
            targetArray.splice(targetIndex, 1);
        } else {
            targetArray.splice(targetIndex, 1, value);
        }
    },
    receiveElementKeyValue(state, {elementId, keyString, value}) {
        // traverse up through elements assembling path, and then update outline store
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

        _.set(state.outlinePrecomputed, `${path.join('.children.')}[${keyString}]`, value);
    },
    receiveElementInput(state, {elementId, keyString, value}) {
        // Vue.set(state.elements[elementId].authoring_user_input, keyString, value);
        // _.set(state.elements[elementId].authoring_user_input, keyString, Object.assign({}, value));
        _.set(state.elements[elementId].authoring_user_input, keyString, value);
    },
    receiveValidation(state, {update, validationItems, elementId}) {
        if (update) {
            if (elementId) {
                for (const validationItem of state.validationItems) {
                    if (!validationItem.user_action_msg && validationItem.elem_id === elementId) {
                        validationItem.updated = true;
                    }
                }
            } else {
                // For update all
                for (const validationItem of state.validationItems) {
                    if (!validationItem.user_action_msg) {
                        // For items that can be updated, set the flag
                        validationItem.updated = true;
                    }
                }
            }

        } else {
            // Load refresh items for initial validation with no update.
            for (const validationItem of validationItems) {
                // Updated field does not exist in backend.
                // Set it to use only in UI.
                validationItem.updated = false;
            }
            state.validationItems = validationItems;
        }
    },
    receiveEntries(state, {elementId, value, level}) {
        let detailLevel = level ? level : 2;
        let entriesViewStateObj = {};
        _.set(state.elements[elementId].authoring_user_input, 'entries', value);

        // loop through all entries and set their level to 2 by default
        if(state.elements[elementId].authoring_user_input && state.elements[elementId].authoring_user_input.entries) {
            entriesViewStateObj[elementId] = [];
            state.elements[elementId].authoring_user_input.entries.forEach(() => entriesViewStateObj[elementId].push({detailLevel: detailLevel}));
        }

        // Set authoring_user_input.entries
        if(!_.isEmpty(entriesViewStateObj)) {
            state.entriesViewState = Object.assign({}, state.entriesViewState, entriesViewStateObj);
        }
    },
    receiveEntryInput(state, {elementId, index, key, value}) {
        const entry = state.elements[elementId].authoring_user_input.entries[index];
        entry[key] = value;
        state.elements[elementId].authoring_user_input.entries.splice(index, 1, entry);
    },
    receiveCustomScriptEntries(state, {elementId, value, level}) {
        let elementsObj = { ...state.elements };
        let entriesViewStateObj = { ...state.entriesViewState };
        entriesViewStateObj[elementId] = [];

        let element = elementsObj[elementId];

        let entries = element.authoring_user_input.entries;
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

        element.authoring_user_input.entries = newEntries;

        state.elements = elementsObj;
        state.entriesViewState = entriesViewStateObj;
    },
    receiveCustomScriptInput(state, {elementId, index, key, value}) {
        const input = state.elements[elementId].authoring_user_input.inputs[index];
        input[key] = value;
        state.elements[elementId].authoring_user_input.inputs.splice(index, 1, input);
    },
    receiveCustomScriptEntryInput(state, {elementId, entry_index, input_index, key, value}) {
        const input = state.elements[elementId].authoring_user_input.entries[entry_index].entry_inputs[input_index];
        input[key] = value;
        state.elements[elementId].authoring_user_input.entries[entry_index].entry_inputs.splice(input_index, 1, input);
    },
    receiveRunProcedureElementInput(state, {elementId, index, element, keyString, value}) {
        // if the element doesn't exist add it first, splice for reactivity
        if(index === -1) {
            // update index to be where the new element will go, so it can be updated below
            index = state.elements[elementId].authoring_user_input.elements.length;
            state.elements[elementId].authoring_user_input.elements.splice(index, element);
        }
        element = Object.assign({}, element, {[keyString]: value});
        state.elements[elementId].authoring_user_input.elements.splice(index, 1, element);
    },
    receiveRunProcedureElementInputs(state, {elementId, elements, tagSelections}) {
        state.elements[elementId].authoring_user_input.elements = elements;
        state.elements[elementId].authoring_user_input.tag_selections = tagSelections;
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
        newElem.authoring_user_input.elements = [];
        newElem.authoring_user_input.tag_selections = tagSelections;
        state.elements[elementId] = newElem;
    },
    updateAuthoringProcedure(state, {institutionalId=null, title=null, description=null, lockedBy=null, author=null, hazardous=null, procedureType=null, labels=null}) {
        if (state.authoringProcedureIndex !== null && !isNaN(state.authoringProcedureIndex) &&
            state.authoringProcedureIndex >= 0 && state.authoringProcedureIndex < state.authoringProcedures.length) {
            const updatedFields = {};
            if (institutionalId !== null) {
                updatedFields.institutional_id = institutionalId;
            }
            if (title !== null) {
                updatedFields.title = title;
            }
            if (description !== null) {
                updatedFields.description = description;
            }
            if (lockedBy !== null) {
                updatedFields.locked_by = lockedBy;
            }
            if (author !== null) {
                updatedFields.author = author;
            }
            if (hazardous !== null) {
                updatedFields.hazardous = hazardous;
            }
            if (procedureType != null) {
                updatedFields.procedure_type = procedureType;
            }
            if (labels != null) {
                updatedFields.labels = labels;
            }
            Vue.set(state.authoringProcedures, state.authoringProcedureIndex, {
                ...state.authoringProcedures[state.authoringProcedureIndex],
                ...updatedFields
            });
        }
    },
    updateProcedureVersion(state, {institutionalReleaseId=null, status=null}) {
        const updatedFields = {};
        if (institutionalReleaseId !== null) {
            updatedFields.institutional_release_id = institutionalReleaseId;
        }
        if (status !== null) {
            updatedFields.status = status;
        }
        Vue.set(state.authoringProcedureVersions, state.authoringProcedureVersionIndex, {
            ...state.authoringProcedureVersions[state.authoringProcedureVersionIndex],
            ...updatedFields
        });
    },

    // VI Step
    setSelectedVisStepElementId(state, {elementId}) {
        state.selectedViStepElementId = elementId;
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
        const deleteIndex = state.elements[elementId].authoring_user_input.vis.findIndex((viObj) => viObj.vi_id === vi.vi_id);
        state.elements[elementId].authoring_user_input.vis.splice(deleteIndex, 1);
    },
    setVisDeclareStep(state, {elementId}) {
        state.elements[elementId].authoring_user_input.vis = Object.values(state.selectedViMap);
    },
    deleteStepFromStep(state, {elementId, elem_id}) {
        const deleteIndex = state.elements[elementId].authoring_user_input.steps.findIndex((step) => step.elem_id === elem_id);
        state.elements[elementId].authoring_user_input.steps.splice(deleteIndex, 1);
    },
    deleteAllStepsFromStep(state, {elementId}) {
        state.elements[elementId].authoring_user_input.steps = [];
    },
    replaceAllStepsFromStep(state, {elementId, steps}) {
        state.elements[elementId].authoring_user_input.steps = [ ...steps ];
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

    elemFiltersTagMutate(state, {rootState, procedureTags, tagName}) {
        let tag_id = null;
        for (const procedureTag of procedureTags) {
            if (procedureTag.name === tagName) {
                tag_id = procedureTag.tag_id;
                break;
            }
        }
        if (tag_id) {
            if (state.elemFilters.tag_ids.includes(tag_id)) {
                const tag_ids = [...state.elemFilters.tag_ids];
                tag_ids.splice(tag_ids.indexOf(tag_id), 1);
                state.elemFilters.tag_ids = tag_ids;
            } else {
                state.elemFilters.tag_ids = [...state.elemFilters.tag_ids, tag_id];
            }
        }
        
        const elementIds = state.elementIds;
        const filteredElementIds = getFilteredElementIds(elementIds, state, rootState);
        state.filteredElementIds = filteredElementIds;
        state.viewportTopPointer = 0;
    },

    elemFiltersRunProcedureElementsMutate(state, {rootState, runProcedureStepFilter}) {
        Vue.set(state.elemFilters, 'filterElementName', runProcedureStepFilter.title);
        const filterElementIdMap = {};
        for (const elementId of runProcedureStepFilter.elementIds) {
            filterElementIdMap[elementId] = elementId;
        }
        // need to turn off step filter so that only selected elements are displayed
        Vue.set(state.elemFilters, 'step', false);
        Vue.set(state.elemFilters, 'filterElementIdMap', filterElementIdMap);
        
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
    loadReplaceElementSource: function() {
        state.replaceElementSource = loadReplaceElementSource();
    },
    resetImportResponse: function() {
        state.importResponse = {};
    },

    // move operations
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
};

export default {
    state,
    getters,
    mutations,
    actions
};

function updateNumbers(elementsObj, numbers) {
    numbers.forEach(elementData => {
        if(elementsObj[elementData.elem_id]) {
            // Make copy of element data and update it without triggering state change.
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


function getOutlineStructure(outlinePrecomputed, elementObjs, elementIds) {
    return getOutlineStructureFunc(outlinePrecomputed, elementObjs, elementIds);
}

import procedureApi from "../../../../api/procedures";
import _ from 'lodash';

// initial state
const state = {
    procedures: [],
    procedureCount: 0,
    procedureVersions: {},
    tagSelectionsObj: {},
    // store procedure outlines we get from the server
    procedureOutlines: {},
    procedureOutlineIds: {},
    executionTags: {},
    
    // cache of procedure structure
    // Example:
    // A
    // B
    //  C
    //  D
    //   E
    //   F
    //   G
    // [
    //   {A: { parent_ids: [], child_ids: []}},
    //   {B: { parent_ids: [], child_ids: [C, D, E, F, G]}},
    //   {C: { parent_ids: [B], child_ids: []}},
    //   {D: { parent_ids: [B], child_ids: [E, F, G]}},
    //   {E: { parent_ids: [D, B], child_ids: []}},
    //   {F: { parent_ids: [D, B], child_ids: []}},
    //   {G: { parent_ids: [D, B], child_ids: []}},
    // ]
    
    procedureOutlineStructures: {}
};

const getters = {
    procedures: state => state.procedures,
    procedureCount: state => state.procedureCount,
    procedureVersions: state => (procedureId) => state.procedureVersions[procedureId],
    procedureOutlineElements: state => (elementId) => state.procedureOutlines[elementId],
    selectedStepIds: function(state) {
        return function(runProcedureElementId) {
            let elem_ids = [];
            const outlineObj = state.procedureOutlines[runProcedureElementId];
            for (const elem_id in outlineObj) {
                if(outlineObj[elem_id].selected === true) {
                    elem_ids.push(elem_id);
                }
            }
            return elem_ids;
        }; 
    },
    runProcedureTagSelections: function(state) {
        return function(runProcedureElementId) {
            return state.tagSelectionsObj[runProcedureElementId];
        };
    },     
    selectedSteps: function(state) {
        return function(runProcedureElementId) {
            let elems = [];
            const outlineObj = state.procedureOutlines[runProcedureElementId];
            for (const elem_id in outlineObj) {
                if(outlineObj[elem_id].selected === true) {
                    elems.push(outlineObj[elem_id]);
                }
            }
            return elems;
        };
    },   
    procedureOutlineElementSelections: function(state) {
        return function(elementId) {
            return Object.keys(state.procedureOutlines[elementId]).map(id => {
                return {
                    elem_id: state.procedureOutlines[elementId][id].elem_id,
                    selected: state.procedureOutlines[elementId][id].selected
                };
            });
        };
    },
    procedureOutlineElementsByParent: function(state) {
        return function({runProcedureElementId, elementId}) {
            let elementsObj = {};
            if (state.procedureOutlines[runProcedureElementId] && 
                state.procedureOutlineStructures[runProcedureElementId] &&
                state.procedureOutlineStructures[runProcedureElementId][elementId]) {
                elementsObj = _.pick(state.procedureOutlines[runProcedureElementId],
                    state.procedureOutlineStructures[runProcedureElementId][elementId].child_ids);
            }
            // console.log(`elementId: ${elementId} child_ids: ${Object.keys(elementsObj)}`);
            return elementsObj;
        };
    },
    executionTags: function(state) {
        return state.executionTags;
    },
    procedureSelectedOutlineElementsByParent: function(state, getters) {
        return function({runProcedureElementId, elementId}) {
            const elementsObj = getters.procedureOutlineElementsByParent({
                runProcedureElementId: runProcedureElementId,
                elementId: elementId
            });
            return Object.values(elementsObj).filter((elem) => elem.selected);            
        };
    },
    selectedTagIds: function(state) {
        return function({runProcedureElementId}) {
            if (state.tagSelectionsObj[runProcedureElementId]) {
                return state.tagSelectionsObj[runProcedureElementId].filter(tag => tag.selected).map(tag => tag.tag_id);            
            } else {
                return [];
            }            
        };
    },
    isSelected: function(state) {
        return function({runProcedureElementId, elementId}) {
            if (state.procedureOutlines[runProcedureElementId] && state.procedureOutlines[runProcedureElementId][elementId]) {
                return state.procedureOutlines[runProcedureElementId][elementId].selected === true;
            } else {
                console.warn(`element not found. runProcedureElementId: ${runProcedureElementId} elementId: ${elementId}`);
                return false;
            }
        };
    },
    isSelectable: function(state, getters) {
        return function({runProcedureElementId, elementId}) {
            const outlineObj = state.procedureOutlines[runProcedureElementId];
            if (outlineObj && outlineObj[elementId]) {
                const selectedTagIds = getters.selectedTagIds({runProcedureElementId});
                const tag_ids = outlineObj[elementId].tag_ids ? outlineObj[elementId].tag_ids : [];
                if (_.difference(tag_ids, selectedTagIds).length > 0) {
                    return false;
                } else {
                    return true;
                }
            } else {
                console.warn(`element not found. runProcedureElementId: ${runProcedureElementId} elementId: ${elementId}`);
                return false;
            }
        };
    },    
    procedureOutlineParentElementIds: function(state) {
        return function(runProcedureElementId, elementId) {
            const ancestors = [];
            let element = state.procedureOutlines[runProcedureElementId][elementId];
            while (element.parent_id !== "") {
                element = state.procedureOutlines[runProcedureElementId][element.parent_id];
                ancestors.push(element);
            }
            return ancestors.map((el) => el.elem_id);
        };
    },
    procedureOutlineNestedElementIds: function(state, getters) {
        return function(runProcedureElementId, elementId) {
            const procedureElements = state.procedureOutlines[runProcedureElementId];
            let elementsToCheck = [procedureElements[elementId]];
            let childElements = [];
            let currentElement;
            while (elementsToCheck.length) {
                currentElement = elementsToCheck.pop();
                let children = getters.procedureOutlineElementsByParent({
                    runProcedureElementId: runProcedureElementId,
                    elementId: currentElement.elem_id
                });
                elementsToCheck = elementsToCheck.concat(children);
                childElements.push(currentElement);
            }
            return childElements.map((el) => el.elem_id);
        };
    },
};

/* istanbul ignore next */
const actions = {
    initializeProcedureState({commit}, procedureId) {
        commit("initializeProcedureState", {procedureId});
    },
    selectAll({commit, getters}, {runProcedureElementId}) {
        commit("selectAllItems", {runProcedureElementId, getters});
    },
    unselectAll({commit}, {runProcedureElementId}) {
        commit("unselectAllItems", {runProcedureElementId});
    },
    updateRunProcedureTagSelections({commit}, { runProcedureElementId, tagSelections }) {
        commit("setRunProcedureTagSelections", {runProcedureElementId, tagSelections});
    },    
    toggleStep({commit, getters}, {runProcedureElementId, elementId}) {
        // getters is passed as an argument since it is not automatically passed in to mutator
        commit("toggleStep", {runProcedureElementId, elementId, getters});
    },
    toggleTag({commit, getters}, {runProcedureElementId, tagId, selected}) {
        commit("toggleTag", {runProcedureElementId, tagId, selected, getters});
    },
    addExecutionTags({commit}, {tags}) {
        commit("addExecutionTags", {tags});
    },
    async fetchProcedures({commit}, options) {
        commit("setBooleanKey", {key: "loadingProcedures", bool: true});
        const { procedures, total } = await procedureApi.getProcedures(options);
        commit("receiveProcedures", { procedures, total });
        commit("setBooleanKey", {key: "loadingProcedures", bool: false});
    },
    async fetchProcedureVersions({commit}, {procedureId, options}) {
        // console.log('procedureId: ', procedureId);
        // console.log('options: ', options);
        commit("setBooleanKey", {key: "loadingProcedureVersions", bool: true});
        const { versions, total } = await procedureApi.getProcedureVersions(procedureId, options);
        commit("receiveProcedureVersions", { procedureId, versions, total });
        commit("setBooleanKey", {key: "loadingProcedureVersions", bool: false});
    },
    async fetchRunProcedureOutline({commit, rootState}, {elementId, procedureId, version}) {
        commit('setBooleanKey', {key: 'updatingElementInput', bool: true});

        const warnings = [];
        let outline = [];
        try {
            outline = await procedureApi.getProcedureOutline(procedureId, version);
        } catch (error) {
            commit('receiveFeedback', {type: 'error', errorObj: error});
            return warnings;
        }

        const outlineObj = {};
        const idArray = [];
        const outlineStructure = {};
        
        // for elements at root
        outlineStructure[''] = {parent_ids: [], child_ids: []};
        // for the rest
        for (const element of outline) {
            outlineObj[element.elem_id] = element;
            idArray.push(element.elem_id);
            
            // placeholder values
            outlineStructure[element.elem_id] = {parent_ids: [], child_ids: []};
        }
        
        // collect parent_ids and child_ids
        for (const element of outline) {
            const elem_id = element.elem_id;
            const structure = outlineStructure[elem_id];
            
            if (structure) {
                let parent_id = element.parent_id;
                let parent = outlineObj[parent_id];
                
                // find child first since parent will be updated for parents below
                if (outlineStructure[parent_id]) {
                    outlineStructure[parent_id].child_ids.push(elem_id);
                } else {
                    const msg = `parent element was not found. procedure_id: ${procedureId} version: ${version} number: ${element.number} title: ${element.title} elem_id: ${elem_id} parent_id: ${parent_id}`;
                    console.warn(msg);
                    warnings.push(msg);
                }   
                
                // find parents
                while (parent) {
                    structure.parent_ids.push(parent_id);
                    parent_id = parent.parent_id;
                    parent = outlineObj[parent_id];
                }            
            }
        }
        
        /////
        let elements = [];
        if (rootState.execution && rootState.execution.elements[elementId]) {
            elements = rootState.execution.elements[elementId].execution_user_input.elements.filter((el) => el.selected === true);
        } else if (rootState.authoring && rootState.authoring.elements[elementId]) {
            elements = rootState.authoring.elements[elementId].authoring_user_input.elements.filter((el) => el.selected === true);
        }
        else {
            const msg = `user input was not found. elementId: ${elementId}`;
            console.warn(msg);
            warnings.push(msg);
        }
        
        // if there are selected elements saved in step, select only them in selection dialog
        if (elements.length > 0) {
            // unselect all before setting selected ones
            for (const elem_id in outlineObj) {
                outlineObj[elem_id].selected = false;
            }
            
            for (const element of elements) {
                if (element.selected) {
                    let elem_id = element.elem_id;
                    if (outlineObj[elem_id]) {
                        outlineObj[elem_id].selected = true;
                    } else {
                        const msg = `element was not found. procedure_id: ${procedureId} version: ${version} number: ${element.number} title: ${element.title} elem_id: ${elem_id}`;
                        console.warn(msg);
                        warnings.push(msg);
                    }
                }
            }
        }

        commit("receiveProcedureOutline", {elementId, outlineObj, idArray, outlineStructure});
        commit('setBooleanKey', {key: 'updatingElementInput', bool: false});
        return warnings;
    },
    setSelectedSteps({commit, getters, state, dispatch}, { runProcedureElementId }) {
        let elements = getters.selectedSteps(runProcedureElementId);
        let tagSelections = getters.runProcedureTagSelections(runProcedureElementId);

        dispatch("editRunProcedureElementSelectionMass", { runProcedureElementId, elements, tagSelections });
    },
};

const mutations = {
    setBooleanKey(state, {key, bool}) {
        state[key] = bool;
    },
    addExecutionTags(state, {tags}) {
        const tagMap = {};
        for (const tag of tags) {
            tagMap[tag.tag_id] = tag;
        }
        state.executionTags = {...state.executionTags, ...tagMap};
    },
    initializeProcedureState(state, {procedureId}) {
        // setup state so nested keys are reactive when data is fetched from the server
        // and getters never encounter undefined data for objects under dynamic keys
        state.procedureVersions = {
            ...state.procedureVersions,
            [procedureId]: {versions: [], total: 0}
        };
    },
    selectAllItems(state, {runProcedureElementId, getters}) {
        const outlineObj = _.cloneDeep(state.procedureOutlines[runProcedureElementId]);
        for (const elem_id in outlineObj) {
            const selectable = getters.isSelectable({runProcedureElementId: runProcedureElementId, elementId: elem_id});
            if (selectable) {
                outlineObj[elem_id].selected = true;
            }
        }

        state.procedureOutlines = {
            ...state.procedureOutlines,
            [runProcedureElementId]: outlineObj
        };
    },
    unselectAllItems(state, {runProcedureElementId}) {
        const outlineObj = _.cloneDeep(state.procedureOutlines[runProcedureElementId]);
        for (const elem_id in outlineObj) {
            outlineObj[elem_id].selected = false;
        }

        state.procedureOutlines = {
            ...state.procedureOutlines,
            [runProcedureElementId]: outlineObj
        };
    },
    setRunProcedureTagSelections(state, {runProcedureElementId, tagSelections}) {
        state.tagSelectionsObj = {
            ...state.tagSelectionsObj,
            [runProcedureElementId]: tagSelections
        };
    },    
    toggleStep(state, {runProcedureElementId, elementId, getters}) {
        const outlineObj = _.cloneDeep(state.procedureOutlines[runProcedureElementId]);
        if (outlineObj[elementId]) {
            const selected = !outlineObj[elementId].selected;
            outlineObj[elementId].selected = selected;
            
            const outlineStructure = state.procedureOutlineStructures[runProcedureElementId];
            if (outlineStructure) {
                const structureObj = outlineStructure[elementId];
                if (structureObj) {
                    const descendant_ids = [];
                    collectDescendantElements(outlineStructure, outlineObj, elementId, descendant_ids);
                    descendant_ids.forEach(elem_id => {
                        if (selected) {
                            const selectable = getters.isSelectable({runProcedureElementId: runProcedureElementId, elementId: elem_id});
                            if (selectable) {
                                // select descendant only when it is selectable
                                outlineObj[elem_id].selected = selected;                                
                            }
                        } else {
                            // de-select all descendants
                            outlineObj[elem_id].selected = selected;
                        }
                    });
                    // if selected is true, need to select parents
                    if (selected) {
                        structureObj.parent_ids.forEach(elem_id => {
                            outlineObj[elem_id].selected = selected;
                        });
                    }
                } else {
                    console.warn(`structureObj was not found. runProcedureElementId: ${runProcedureElementId} elementId: ${elementId}`);
                }
            } else {
                console.warn(`outlineStructure was not found. runProcedureElementId: ${runProcedureElementId}`);
            }
        } else {
            console.warn(`element was not found. elementId: ${elementId}`);
        }
        state.procedureOutlines = {
            ...state.procedureOutlines,
            [runProcedureElementId]: outlineObj
        };
    },
    toggleTag(state, {runProcedureElementId, tagId, selected, getters}) {
        // Note: tagId is not used because we check all tags
        const outlineObj = _.cloneDeep(state.procedureOutlines[runProcedureElementId]);
        if (outlineObj) {
            for (const elementId in outlineObj) {
                let outline = outlineObj[elementId];
                if (selected) {
                    const outlineStructure = state.procedureOutlineStructures[runProcedureElementId];
                    if (outlineStructure) {
                        const structureObj = outlineStructure[elementId];
                        if (structureObj) {
                            if (outline.tag_ids && (outline.tag_ids.length > 0)) {
                                const selectable = getters.isSelectable({runProcedureElementId, elementId});
                                if (selectable) {
                                    outlineObj[elementId].selected = true;
                                    structureObj.parent_ids.forEach(elem_id => {
                                        outlineObj[elem_id].selected = true;
                                    });
                                }                                 
                            }
                        } else {
                            console.warn(`structureObj was not found. runProcedureElementId: ${runProcedureElementId} elementId: ${elementId}`);
                        }                        
                        
                    } else {
                        console.warn(`outlineStructure was not found. runProcedureElementId: ${runProcedureElementId}`);
                    }
                } else {
                    const selectable = getters.isSelectable({runProcedureElementId, elementId});
                    if (!selectable) {
                        outlineObj[elementId].selected = false;                                
                    }                    
                }
            }
        } else {
            console.warn(`outline was not found. elementId: ${runProcedureElementId}`);
        }
        
        state.procedureOutlines = {
            ...state.procedureOutlines,
            [runProcedureElementId]: outlineObj
        };
    },
    receiveProcedures(state, {procedures, total}) {
        state.procedures = procedures;
        state.procedureCount = total;
    },
    receiveProcedureVersions(state, {procedureId, versions, total}) {
        state.procedureVersions = {
            ...state.procedureVersions,
            [procedureId]: {versions: versions, total: total}
        };
    },
    receiveProcedureOutline(state, {elementId, outlineObj, idArray, outlineStructure}) {
        state.procedureOutlines = {
            ...state.procedureOutlines,
            [elementId]: outlineObj
        };
        
        state.procedureOutlineIds = {
            ...state.procedureOutlineIds,
            [elementId]: idArray
        };        
                
        state.procedureOutlineStructures = {
            ...state.procedureOutlineStructures,
            [elementId]: outlineStructure
        };
    }
};

function collectDescendantElements(outlineStructure, outlineObj, elem_id, descendant_ids) {      
    if (outlineStructure[elem_id]) {
        outlineStructure[elem_id].child_ids.forEach(child_id => {
            if (outlineObj[child_id]) {
                descendant_ids.push(child_id); 
                collectDescendantElements(outlineStructure, outlineObj, child_id, descendant_ids);                    
            }
        });
    }
} 

export default {
    state,
    getters,
    mutations,
    actions
};

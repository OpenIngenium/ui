import jwt_decode from "jwt-decode";
import axios from "axios";
import { textToColor } from "./hash-colors";
import _ from 'lodash';

export function getTagColor(tagId, tags){    
    if (tags.hasOwnProperty(tagId)) {
        return textToColor(tags[tagId].name).background;
    } else {
        console.warn(`missing tagId: ${tagId}`);
        return '';
    }
}

export const INGENIUM_COPY = 'ingenium-copy';

export function getDefaultCopyParams(copyParams) {
    return {copyElemIdMap: {}};
}

export function setCopyParams(copyParams) {
    saveToLocalStorage(INGENIUM_COPY, copyParams);
}

export function loadCopyParams() {
    return loadFromLocalStorage(INGENIUM_COPY, {});
}

export function loadReplaceElementSource() {
    const copyParams = loadFromLocalStorage(INGENIUM_COPY, null);
    let replaceElementSource = {};
    if (copyParams && copyParams.execution_id != '' && Object.values(copyParams.copyElemIdMap).length == 1) {
        replaceElementSource = {
            execution_id: copyParams.execution_id,
            elem_id: Object.values(copyParams.copyElemIdMap).pop()
        };
    }
    return replaceElementSource;
}

export function saveToLocalStorage(itemName, value) {
    window.localStorage.setItem(itemName, JSON.stringify(value));
}

export function loadFromLocalStorage(itemName, defaultValue) {
    const itemStr = localStorage.getItem(itemName);
    if (itemStr) {
        try {
            return JSON.parse(itemStr);
        } catch (error) {
            return defaultValue;
        }
    } else {
        return null;
    }
}


//periodically checks that Vue request header is synced with refresh updates
export function updateRequestHeader() {
    setInterval(() => {
        const jwt = getJwt();
        if (jwt) {
            const cookieJwt = "Bearer " + jwt;
            if (cookieJwt !== axios.defaults.headers.common["Authorization"]) {
                axios.defaults.headers.common["Authorization"] = cookieJwt;
            }
        }
    }, 20000);        
}

export const getJwt = function() {
    let cookieVal = document.cookie.match('(^|;)\\s*access_token\\s*=\\s*([^;]+)');
    return cookieVal ? cookieVal.pop() : '';
};

export const getCookieValue = function(a) {
    const b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
};

export function isLoggedIn() {
    const jwt = getJwt();
    const expiration = jwt !== '' ? jwt_decode(jwt).exp : 0;
    if(expiration == 0) return false;
    const now = Math.floor(Date.now()/1000);
   
    return expiration - now > 0;
}

export function getUsername() {
    const jwt = getJwt();
    return jwt !== '' ? jwt_decode(jwt).username : '';
}

export function getRoles() {
    const jwt = getJwt();
    return jwt !== '' ? jwt_decode(jwt).roles : [];
}

export function getUserScopes() {
    const jwt = getJwt();
    return jwt !== '' ? jwt_decode(jwt).scopes : [];
}

export function isAdmin() {
    const scopes = getUserScopes();
    const scopeNames = scopes.map(scope => scope.scope);
    return scopeNames.includes('admin');
}

export function upperCase(str) {
    return isUndefinedOrNull(str) ? str : str.toUpperCase();
}

export function isUndefinedOrNull(any) {
    return (typeof any === "undefined" || any == null);
}

export function toSnakeCase(word) {
    if (!word) { return; }
    let upperChars = word.match(/([A-Z])/g);
    if (! upperChars) {
        return word;
    }

    let str = word.toString();
    for (let i = 0, n = upperChars.length; i < n; i++) {
        str = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
    }

    if (str.slice(0, 1) === '_') {
        str = str.slice(1);
    }

    return str;
}

export function toCamelCase(s){
    return s.replace(/(_\w)/g, function(m){return m[1].toUpperCase();});
}

export function slimElement(element) {
    // slim down element to what we need to avoid reactivity bloat
    const elementKeys = [
        "description",
        "run_records",
        "execution",
        "elem_id",
        "elem_type",
        "executed",
        "execution",
        "execution_id",
        "authoring_user_input",
        "execution_user_input",
        "number",
        "parent_id",
        "specification",
        "step_type",
        "title",
        "files",
        "procedure_modification",
        "procedure_modification_status",
        "run_for_score",
        "procedure_title",
        "procedure_section_id",
        "used_procedures",
        "preview",
        "imported",
        "procedure_id",
        "version_id",
        "executable",
        "verifiable",
        "break_point",
        "tag_ids",
        "callable",
        "child_execution_id"
    ];

    return elementKeys.reduce((obj, key) => ({ ...obj, [key]: element[key] }), {});
}

// Returns a deep copy of an object
// NOTE: doesn't copy object methods
export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function parseAxiosError(error) {
    if (error.response && error.response.data) {
        return error.response.data;
    } else {
        return {'message': error.message};
    }
}


export function setScrollToElementIdFunc(state, {id}) {
    const numElemsBefore = state.viewportSize % 2 === 0 ? (state.viewportSize/2) : Math.floor(state.viewportSize/2);
    const numElemsAfter = state.viewportSize % 2 === 0 ? (state.viewportSize/2 - 1) : Math.floor(state.viewportSize/2);
    
    let idx = -1;
    for (let i = 0; i < state.filteredElementIds.length; i++) {
        if (id === state.filteredElementIds[i]) {
            idx = i;
            break;
        }
    }
    
    if (idx > -1) {
        const topLimit = 0;
        const bottomLimit = state.filteredElementIds.length-1;
        const beyondTop = (idx-numElemsBefore) < 0;
        const beyondBottom = (idx+numElemsAfter+1) > state.filteredElementIds.length;
        if (beyondTop && beyondBottom) {
            state.viewportTopPointer = topLimit;
        } else if (beyondTop) {
            // set top location first
            state.viewportTopPointer = topLimit;
        } else if (beyondBottom) {
            // set bottom location first
            state.viewportTopPointer = Math.max(bottomLimit - state.viewportSize + 1, topLimit);
        } else {
            state.viewportTopPointer = idx - numElemsBefore;                
        }
        
        // timestamp is used to trigger watch event even when the same element is selected
        state.scrollToElement = {
            timestamp: (new Date()).toISOString(),
            elementId: id
        };
    }
    else {
        console.warn(`setScrollToElementId element not found. id: ${id}`);
    }
}

export function pageElementsFunc(state, {scrollDirection}) {
        
    let numOfElems = state.filteredElementIds.length;        

    console.assert(state.filteredElementIds.length > state.viewportSize, 'Not enough number of elements for scroll');

    if (scrollDirection === 'up') {
        if ((state.viewportTopPointer - state.viewportPageSize) < 0) {
            state.viewportTopPointer = 0;
        }
        else {
            state.viewportTopPointer = state.viewportTopPointer - state.viewportPageSize;
        }
    }
    else if (scrollDirection === 'down') {
        if ((state.viewportTopPointer + state.viewportSize + state.viewportPageSize) > numOfElems) {
            state.viewportTopPointer = numOfElems - state.viewportSize;
        }
        else {
            state.viewportTopPointer = state.viewportTopPointer + state.viewportPageSize;
        }
    } else {
        console.warn(`unrecognized scrollDirection: ${scrollDirection}`);
    }

}

export function hasProcedureModification(elem) {
    if (elem.procedure_modification_status === 'MODIFYING' || 
        elem.procedure_modification_status === 'MODIFYING_OLD' || 
        elem.procedure_modification_status === 'MODIFIED' ||
        elem.procedure_modification_status === 'ADDED' || 
        elem.procedure_modification_status === 'DELETED') {  
        return true;
    } else {
        return false;
    }
}

export function isRedlineElement(elem) {
    if (hasProcedureModification(elem)) {
        if (elem.procedure_modification && elem.procedure_modification.justification) {
            return elem.procedure_modification.justification.modification_type === 'REDLINE';
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export function elemContainsTag(elem, tag_ids) {
    if (elem && elem.tag_ids) { 
        for (const tag_id of elem.tag_ids) {
            if (tag_ids.includes(tag_id)) {
                return true; 
            } 
        } 
    } 
    return false;
}

export function isBluelineElement(elem) {
    if (hasProcedureModification(elem)) {
        if (elem.procedure_modification && elem.procedure_modification.justification) {
            return elem.procedure_modification.justification.modification_type === 'BLUELINE';
        } else {
            return false;
        }
    } else {
        return false;
    }
}

export function hasAnyFilter(elemFilters) {
    return (elemFilters.tag_ids && elemFilters.tag_ids.length > 0) || elemFilters.comment || elemFilters.activityReport || elemFilters.dataReview || elemFilters.unresolved || 
    elemFilters.resolved || elemFilters.redline || elemFilters.blueline;
}

export function checkShowElement(elementId, elem, elemConversations, elemFilters) {
    if (elementId) {
        // For the preview of procedure import
        if (Object.keys(elemFilters.filterElementIdMap).length > 0) {
            return elemFilters.filterElementIdMap.hasOwnProperty(elementId);
        }

        if (!hasAnyFilter(elemFilters)) {
            return true;
        }

        if(elemFilters.tag_ids && elemFilters.tag_ids.length > 0) {
            if (elemContainsTag(elem, elemFilters.tag_ids)) {
                return true;
            }
        }

        if (elemFilters.comment === true) {
            if (elemConversations) {
                for (let conversationId in elemConversations) {
                    let elemConversation = elemConversations[conversationId];
                    if (elemConversation.type === 'COMMENT') {
                        return true;
                    }                
                }
            }
        }
        
        if (elemFilters.activityReport === true) {
            if (elemConversations) {
                for (let conversationId in elemConversations) {
                    let elemConversation = elemConversations[conversationId];
                    if (elemConversation.type === 'ACTIVITY_REPORT_COMMENT') {
                        return true;
                    }                
                }
            }
        }
        
        if (elemFilters.dataReview === true) {
            if (elemConversations) {
                for (let conversationId in elemConversations) {
                    let elemConversation = elemConversations[conversationId];
                    if (elemConversation.type === 'DATA_REVIEW_COMMENT') {
                        return true;
                    }                
                }
            }
        }

        if (elemFilters.resolved === true) {
            if (elemConversations) {
                for (let conversationId in elemConversations) {
                    let elemConversation = elemConversations[conversationId];
                    if (elemConversation.status === 'RESOLVED') {
                        return true;
                    }                
                }
            }
        }
        
        if (elemFilters.unresolved === true) {
            if (elemConversations) {
                for (let conversationId in elemConversations) {
                    let elemConversation = elemConversations[conversationId];
                    if (elemConversation.status === 'UNRESOLVED') {
                        return true;
                    }                
                }
            }
        }

        if(elemFilters.redline === true) {
            if (isRedlineElement(elem)) {
                return true;
            }
        }

        if(elemFilters.blueline === true) {
            if (isBluelineElement(elem)) {
                return true;
            }
        }
    }

    return false;        
}

export function hasAdditionalElementsBeforeFunc(state) {
    let flag = false;
    
    for (let i = 0; i < state.filteredElementIds.length; i++) {
        if (i < state.viewportTopPointer) {
            flag = true;
            break;
        } else {
            break;
        }
    }
    return flag;
}

export function hasAdditionalElementsAfterFunc(state) {
    let flag = false;
    for (let i = state.filteredElementIds.length-1; i >= 0; i--) {
        if (i > (state.viewportTopPointer + state.viewportSize -1)) {
            flag = true;
            break;
        } else {
            break;
        }
    }
    return flag;
}

export function getFilteredElementIds(elementIds, state, rootState) {
    const elem_ids = [];
    for (let i = 0; i < elementIds.length; i++) {
        let elem_id = elementIds[i];
        let elem = state.elements[elem_id];
        if (elem_id) {
            if (checkShowElement(elem_id, elem, rootState.comments.conversations[elem_id], state.elemFilters)) {
                elem_ids.push(elem_id);
            }
        }
    }
    return elem_ids;
}

export function getFilteredElementsFunc(state) {
    const elems = [];
    for (let i = state.viewportTopPointer; i < state.filteredElementIds.length; i++) {
        let elem_id = state.filteredElementIds[i];
        if (elem_id) {
            let elem = state.elements[elem_id];
            elems.push(elem);
        }
        if (elems.length == state.viewportSize) {
            break;
        }
    }
    return elems;
}

export function resetCustomScriptEntry(entry) {
    if (entry.entry_inputs) {
        entry.entry_inputs.forEach((entry_input) => {
            entry_input.value = entry_input.default_value || '';
        });
    }
    if (entry.entry_outputs) {
        entry.entry_outputs.forEach((entry_output) => {
            delete entry_output.value;
        });
    }
    if (entry.entry_output_array) {
        entry.entry_output_array.outputs = [];
    }                             
}

export function forceFileDownload(response, filename) {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.click();
    window.URL.revokeObjectURL(url);
}

export function constructCollapseMap(parent, collapseMap) {
    for (const [key, item] of Object.entries(parent)) {
        if (item.hasOwnProperty('collapsed')) {
            collapseMap[key] = item.collapsed;
        }
        if (item.hasOwnProperty('children')) {
            constructCollapseMap(item.children, collapseMap);
        }
    }
}

export function collapseToggle(parent, bool) {
    for (const [key, item] of Object.entries(parent)) {     
        if ((item.elem_type=='SECTION' || item.elem_type == 'PROCEDURE_SECTION')) {
            item.collapsed=bool;
        }
        if (item.hasOwnProperty('children')) {
            collapseToggle(item.children, bool);
        }
    }
    return parent;
}

export function getOutlineStructureFunc(outlinePrecomputed, elementObjs, elementIds) {
    // outlinePrecomputed is the current state. This is need to preserve the current collapse state
    // of outlines
    const outlineStructure = {};
    const elemMap = {};
    const collapseMap = {};
    constructCollapseMap(outlinePrecomputed, collapseMap);

    elementIds.forEach(elementId => {
        const element = elementObjs[elementId];
        let parentId = element['parent_id'];

        if (parentId) {
            let outlineParentItem = elemMap[parentId];
            if (outlineParentItem) {
                let outlineItem = {...element, 'children': {}};
                outlineItem.collapsed = collapseMap.hasOwnProperty(outlineItem.elem_id) ? 
                    collapseMap[outlineItem.elem_id] : false;
                outlineParentItem.children[elementId] = outlineItem;
                elemMap[elementId] = outlineItem;              
            } else {
                console.log('getOutlineStructure parent not found. number:', element.number);
            }
        } else {
            // elements at root
            let outlineItem = {...element, 'children': {}};
            outlineItem.collapsed = collapseMap.hasOwnProperty(outlineItem.elem_id) ? 
                collapseMap[outlineItem.elem_id] : false;

            outlineStructure[elementId] = outlineItem;
            elemMap[elementId] = outlineItem;
        }
    });

    //for (const [key, child] of Object.entries(outlineStructure)) {
    //    printOutlineItem(key, child);
    //}
    // console.log('getOutlineStructure outlineStructure: ', JSON.stringify(outlineStructure, 0, 2));

    return outlineStructure;
}

export function toggleOutlineCollapsedAllFunc(state, outlinePrecomputedObj, bool) {
    state.outlinePrecomputed = collapseToggle(outlinePrecomputedObj, bool);
}

export function toggleOutlineCollapsedFunc(state, {elementId}) {
    const outlinePrecomputedObj = { ...state.outlinePrecomputed };

    const outline = getOutline(outlinePrecomputedObj, elementId);
    if (outline) {
        outline.collapsed = !outline.collapsed;
    } else {
        console.error(`Outline was not found. elementId: ${elementId}`);
    }
    state.outlinePrecomputed = outlinePrecomputedObj;
}

export function getOutline(outlinePrecomputed, elementId) {
    if (outlinePrecomputed.hasOwnProperty(elementId)) {
        return outlinePrecomputed[elementId];
    } else {
        for (const outlineItem of Object.values(outlinePrecomputed)) {
            let outline = getOutlineFromItem(outlineItem, elementId);
            if (outline) return outline;
        }
    }
}

export function getOutlineFromItem(outlineItem, elementId) {
    if (outlineItem.elem_id === elementId) {
        return outlineItem;
    }
    if (outlineItem.children) {
        for (const item of Object.values(outlineItem.children)) {
            let outline = getOutlineFromItem(item, elementId);
            if (outline) return outline;
        }
    }
}

export function printOutlineItem(key, outlineItem) {
    console.log(`number: ${outlineItem.number} title: ${outlineItem.title} elem_id: ${outlineItem.elem_id} key: ${key}`);
    if (outlineItem.children) {
        for (const [key, child] of Object.entries(outlineItem.children)) {
            printOutlineItem(key, child);
        }
    }
}

export function getSectionChildElemIds(element, elementIds) {
    if (element.elem_type === 'SECTION') {
        if (element.children) {
            for (const child of Object.values(element.children)) {
                elementIds.push(child.elem_id);
                getSectionChildElemIds(child, elementIds);
            }
        }
    }
}

export function addCopyElemIds(elementId, outlinePrecomputed, copyElemIdMap) {
    const element = getOutline(outlinePrecomputed, elementId);
    if (element) {
        copyElemIdMap[elementId] = elementId;
        const childElementIds = [];
        getSectionChildElemIds(element, childElementIds);
        for (const childElementId of childElementIds) {
            copyElemIdMap[childElementId] = childElementId;
        }
    }
}

export function removeCopyElemIds(elementId, outlinePrecomputed, copyElemIdMap) {
    const element = getOutline(outlinePrecomputed, elementId);
    if (element) {
        delete copyElemIdMap[elementId];
        const childElementIds = [];
        getSectionChildElemIds(element, childElementIds);
        for (const childElementId of childElementIds) {
            delete copyElemIdMap[childElementId];
        }
    }
}

export function addCopyElemIdsRange(elementId, elementIds, outlinePrecomputed, copyElemIdMap) {
    const copyElemIdMapKeys = Object.keys(copyElemIdMap);
    const elementIndex = elementIds.indexOf(elementId);
    const lastElementIndex = copyElemIdMapKeys.length > 0 ? elementIds.indexOf(copyElemIdMapKeys.pop()) : -1;

    if (lastElementIndex === -1) {
        // no current selection, just select this one
        addCopyElemIds(elementId, outlinePrecomputed, copyElemIdMap);
    } else if (elementIndex > lastElementIndex) {
        // add elements after the last selected element up to the currently selected element
        for (let i = lastElementIndex + 1; i <= elementIndex; i++) {
            addCopyElemIds(elementIds[i], outlinePrecomputed, copyElemIdMap);
        }
    } else {
        // add elements from the currently selected element up to before the last selected element
        for (let i = elementIndex; i < lastElementIndex; i++) {
            addCopyElemIds(elementIds[i], outlinePrecomputed, copyElemIdMap);
        }
    }
}

export function removeCopyElemIdsRange(elementId, elementIds, outlinePrecomputed, copyElemIdMap) {
    const copyElemIdMapKeys = Object.keys(copyElemIdMap);
    const elementIndex = elementIds.indexOf(elementId);
    const lastElementIndex = copyElemIdMapKeys.length > 0 ? elementIds.indexOf(copyElemIdMapKeys.pop()) : -1;

    if (lastElementIndex === -1) {
        // no current selection, just remove this one
        removeCopyElemIds(elementId, outlinePrecomputed, copyElemIdMap);
    } else if (elementIndex > lastElementIndex) {
        // remove elements after the last selected element up to the currently selected element
        for (let i = lastElementIndex + 1; i <= elementIndex; i++) {
            removeCopyElemIds(elementIds[i], outlinePrecomputed, copyElemIdMap);
        }
    } else {
        // remove elements from the currently selected element up to before the last selected element
        for (let i = elementIndex; i < lastElementIndex; i++) {
            removeCopyElemIds(elementIds[i], outlinePrecomputed, copyElemIdMap);
        }
    }
}

export const FROALA_COLORS = [
    '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', 
    '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0', 'REMOVE'
];

export const FROALA_TOOLBAR_BUTTONS = {
    moreText: {
        buttons: ['undo', 'redo', 'textColor', 
            'strikeThrough', 'backgroundColor', 'subscript', 'superscript'],
        align: 'left',
        buttonsVisible: 2
    },
    moreParagraph: {
        buttons: ['fontFamily', 'fontSize', 'bold', 'italic', 'underline', 'indent', 'outdent', 'align', 'formatOL', 'formatUL', 
            'formatOLSimple', 'alignJustify', 'lineHeight', 'quote', 'clearFormatting'],
        align: 'left',
        buttonsVisible: 10
    },
    moreRich: {
        buttons: ['insertTable', 'insertLink', 'insertImage', 'insertFile', 'specialCharacters', 'insertHR'],
        align: 'left',
        buttonsVisible: 0
    }
};

export const FROALA_FONTS = {
    "Arial,Helvetica,sans-serif": 'Arial',
    "Roboto,sans-serif": 'Roboto',
    "Oswald,sans-serif": 'Oswald',
    "Montserrat,sans-serif": 'Montserrat',
    "'Open Sans Condensed',sans-serif": 'Open Sans Condensed',
    "'IBM Plex Mono', monospace": 'IBM Plex Mono',
    "'Courier Prime', monospace": 'Courier'
};


function diffObjs(obj1, obj2) {
    const objDiff1 = {};
    const objDiff2 = {};

    for (const key in obj1) {
        const val1 = obj1[key];
        if (obj2.hasOwnProperty(key)) {
            const val2 = obj2[key];
            if (!_.isEqual(val1, val2)) {
                objDiff1[key] = 'CD';
                objDiff2[key] = 'CA';
            }
        } else {
            objDiff1[key] = 'D';
        }
    }
    for (const key in obj2) {
        if (!obj1.hasOwnProperty(key)) {
            objDiff2[key] = 'A';
        }
    }
    const isSameObj = Object.keys(objDiff1).length === 0 && Object.keys(objDiff2).length === 0;
    return {objDiff1, objDiff2, isSameObj};
}

function diffEntries(entries1, entries2) {
    const entriesDiff1 = {};
    const entriesDiff2 = {};

    const match12 = {};
    const match21 = {};

    const changeMap = {};

    let i1Cur = 0;
    let i2Cur = 0;
    let i1 = 0;
    let i2 = 0;
    for (i1=0; i1 < entries1.length; i1++) {
        for (let i2=i2Cur; i2 < entries2.length; i2++) {
            if (_.isEqual(entries1[i1], entries2[i2])) {
                match12[`${i1}`] = i2;
                match21[`${i2}`] = i1;
                i2Cur = i2 + 1;
                break;
            }
        }
    }

    let m1 = 0;
    let m2 = 0;
    i1Cur = 0;
    i2Cur = 0;
    let key1 = `${i1Cur}`;
    let key2 = `${i2Cur}`;

    while (i1Cur < entries1.length || i2Cur < entries2.length) {
        if (match12.hasOwnProperty(key1)) {
            m2 = match12[key1];
            while (i2Cur < m2 && i2Cur < entries2.length) {
                entriesDiff2[`entries.${key2}`] = 'A';
                i2Cur++;
                key2 = `${i2Cur}`;
            }
            i1Cur++; key1 = `${i1Cur}`; i2Cur++; key2 = `${i2Cur}`;
        } else {
            if (match21.hasOwnProperty(key2)) {
                m1 = match21[key2];
                while (i1Cur < m1 && i1Cur < entries1.length) {
                    entriesDiff1[`entries.${key1}`] = 'D';
                    i1Cur++;
                    key1 = `${i1Cur}`;
                }
                i1Cur++; key1 = `${i1Cur}`; i2Cur++; key2 = `${i2Cur}`;
            } else {
                if (i1Cur < entries1.length) {
                    if (i2Cur < entries2.length) {
                        changeMap[key1] = i2Cur;
                        // Do not set changed flag at the entry level since the change is tracked at the field level.
                        // entriesDiff1[`entries.${key1}`] = 'CD';

                        const {objDiff1, objDiff2, isSameObj} = diffObjs(entries1[i1Cur], entries2[i2Cur]);
                        for (const [entryKey1, diffType] of Object.entries(objDiff1)) {
                            const fieldKey1 = `entries.${key1}.${entryKey1}`;
                            entriesDiff1[fieldKey1] = diffType;
                        }
                        for (const [entryKey2, diffType] of Object.entries(objDiff2)) {
                            const fieldKey2 = `entries.${key2}.${entryKey2}`;
                            entriesDiff2[fieldKey2] = diffType;
                        }

                    } else {
                        entriesDiff1[`entries.${key1}`] = 'D';
                    }
                }

                if (i2Cur < entries2.length) {
                    if (i1Cur < entries1.length) {
                        changeMap[key1] = i2Cur;
                        // Do not set changed flag at the entry level since the change is tracked at the field level.
                        // entriesDiff2[`entries.${key2}`] = 'CA';

                        const {objDiff1, objDiff2, isSameObj} = diffObjs(entries1[i1Cur], entries2[i2Cur]);
                        for (const [entryKey1, diffType] of Object.entries(objDiff1)) {
                            const fieldKey1 = `entries.${key1}.${entryKey1}`;
                            entriesDiff1[fieldKey1] = diffType;
                        }
                        for (const [entryKey2, diffType] of Object.entries(objDiff2)) {
                            const fieldKey2 = `entries.${key2}.${entryKey2}`;
                            entriesDiff2[fieldKey2] = diffType;
                        }
                    } else {
                        entriesDiff2[`entries.${key2}`] = 'A';
                    }
                }

                i1Cur++; key1 = `${i1Cur}`; i2Cur++; key2 = `${i2Cur}`;
            }
        }
    }

    const entriesSame = Object.keys(entriesDiff1).length === 0 && Object.keys(entriesDiff2).length === 0;

    return {entriesDiff1, entriesDiff2, changeMap, entriesSame};
}

export function diffElems(stepType, input1, input2, title1, title2, description1, description2) {
    const elemDiff1 = {};
    const elemDiff2 = {};

    // Convert the input format of custom script to a schema that
    // is similar to regular steps so that we can use the same diff logic.
    if (stepType === 'CUSTOM_SCRIPT') {
        const inputObj1 = {};
        if (input1.inputs) {
            for (const input of input1.inputs) {
                inputObj1[input['name']] = input['value'];
            }
        }
        input1.inputs = inputObj1;

        const inputObj2 = {};
        if (input2.inputs) {
            for (const input of input2.inputs) {
                inputObj2[input['name']] = input['value'];
            }
        }
        input2.inputs = inputObj2;
        
        const entries1 = [];
        if (input1.entries) {
            for (const entry of input1.entries) {
                const entryObj = {};
                if (entry.entry_inputs) {
                    for (const entry_input of entry.entry_inputs) {
                        entryObj[entry_input['name']] = entry_input['value'];
                    }
                }
                entries1.push(entryObj);
            }
        }
        input1.entries = entries1;

        const entries2 = [];
        if (input2.entries) {
            for (const entry of input2.entries) {
                const entryObj = {};
                if (entry.entry_inputs) {
                    for (const entry_input of entry.entry_inputs) {
                        entryObj[entry_input['name']] = entry_input['value'];
                    }
                }
                entries2.push(entryObj);
            }
        }
        input2.entries = entries2;
    }

    // perform diff
    for (const key in input1) {
        if (key === 'entries') {
            if (input2.hasOwnProperty(key)) {
                const {entriesDiff1, entriesDiff2, changeMap, entriesSame} = 
                    diffEntries(input1.entries, input2.entries);
                
                for (const key1 in entriesDiff1) {
                    elemDiff1[`execution_user_input.${key1}`] = entriesDiff1[key1];
                }
                for (const key2 in entriesDiff2) {
                    elemDiff2[`execution_user_input.${key2}`] = entriesDiff2[key2];
                }
            } else {
                elemDiff1[`execution_user_input.${key}`] = 'D';
            }
        } else if (stepType === 'CUSTOM_SCRIPT' && key === 'inputs') {
            const {objDiff1, objDiff2, isSameObj} = diffObjs(input1.inputs, input2.inputs);
            for (const [entryKey1, diffType] of Object.entries(objDiff1)) {
                const fieldKey1 = `execution_user_input.inputs.${entryKey1}`;
                elemDiff1[fieldKey1] = diffType;
            }
            for (const [entryKey2, diffType] of Object.entries(objDiff2)) {
                const fieldKey2 = `execution_user_input.inputs.${entryKey2}`;
                elemDiff2[fieldKey2] = diffType;
            }
        } else if (stepType === 'ENVIRONMENT_MANUAL' && (key === 'temperature' || key === 'humidity')) {
            const fieldObj1 = input1[key];
            if (input2.hasOwnProperty(key)) {
                const fieldObj2 = input2[key];
                const {objDiff1, objDiff2, isSameObj} = diffObjs(fieldObj1, fieldObj2);
                for (const [subKey1, diffType] of Object.entries(objDiff1)) {
                    const fieldKey1 = `execution_user_input.${key}.${subKey1}`;
                    elemDiff1[fieldKey1] = diffType;
                }
                for (const [subKey2, diffType] of Object.entries(objDiff2)) {
                    const fieldKey2 = `execution_user_input.${key}.${subKey2}`;
                    elemDiff2[fieldKey2] = diffType;
                }
            }
        } else {
            const val1 = input1[key];
            if (input2.hasOwnProperty(key)) {
                const val2 = input2[key];
                if (!_.isEqual(val1, val2)) {
                    elemDiff1[`execution_user_input.${key}`] = 'CD';
                    elemDiff2[`execution_user_input.${key}`] = 'CA';
                }
            } else {
                elemDiff1[`execution_user_input.${key}`] = 'D';
            }
        }
    }
    for (const key in input2) {
        if (!input1.hasOwnProperty(key)) {
            elemDiff2[`execution_user_input.${key}`] = 'A';
        }
    }
    
    if (title1 != title2) {
        elemDiff1['title'] = 'CD';
        elemDiff2['title'] = 'CA';
    }
    if (description1 != description2) {
        elemDiff1['description'] = 'CD';
        elemDiff2['description'] = 'CA';
    }

    const isSame = Object.keys(elemDiff1).length === 0 && Object.keys(elemDiff2).length === 0;

    return {elemDiff1, elemDiff2, isSame};
}

/**
 * helper to handle axios connection timeout
 * See https://axios-http.com/docs/cancellation
 * 
 * @param {number} timeoutMs 
 * @returns 
 */
export function newAbortSignal(timeoutMs) {
    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), timeoutMs || 0);
  
    return abortController.signal;
}


export function handleErrorNotification(status_code, response, commit) {
    if (status_code < 200 || status_code >= 300) {
        let message = (response && response.message) ? response.message : 'Unknown error';
        let details = (response && response.details) ? response.details : '';
        let timestamp = (new Date()).toISOString();
        let notificationMessage = {
            timestamp: timestamp,
            msg: `${message} Details: ${details}`,
            level: 'ERROR',
        };
        commit('receiveNotification', notificationMessage);
        return true;
    } else {
        return false;
    }
}

export function getDefaultSearchResult() {
    return {
        search_for: '',
        match_case: false,
        match_whole_word: false,
        matchMap: {},    // use object to make lookup fast
        total_count: 0
    };
}
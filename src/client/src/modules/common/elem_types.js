import { deepCopy } from "./utils";

export function getElementCategories() {
    return deepCopy([
        'Organization',
        'V&V',
        'Venues',
        'Telemetry',
        'Commands',
        'Manual'
    ]);
}

const elementMap = {
    // BEGIN ORGANIZATION
    'SECTION': {
        name: 'SECTION',
        displayName: 'Section',
        paletteGroup: 'Organization',
        comp: 'section-element',
        category: 'organization',
        path: 'sections',
        isNestable: true
    },
    'PROCEDURE_SECTION': {
        name: 'PROCEDURE_SECTION',
        displayName: 'Procedure',
        paletteGroup: 'Organization',
        comp: 'run-procedure-element',
        category: 'organization',
        path: 'procedure_sections',
        isNestable: true
    },
    'PARAGRAPH': {
        name: 'PARAGRAPH',
        displayName: 'Paragraph',
        paletteGroup: 'Organization',
        comp: 'paragraph-element',
        category: 'organization',
        path: 'paragraphs',
        isNestable: false
    },
    // BEGIN NON-EXECUTABLE
    'VERIFICATION_ITEM': {
        name: 'VERIFICATION_ITEM',
        displayName: 'Verification Item',
        paletteGroup: 'V&V',
        comp: 'verification-item-element',
        category: 'non_executable',
        path: 'vi_steps',
        isNestable: false
    },
    'VERIFICATION_ITEM_STATUS': {
        name: 'VERIFICATION_ITEM_STATUS',
        displayName: "Verification Item Status",
        paletteGroup: 'V&V',
        comp: 'verification-item-status-element',
        category: 'executable',
        path: 'vi_status_steps',
        isNestable: false
    },
    // BEGIN VENUE CONFIG
    'VENUE_CONFIG_MANUAL': {
        name: 'VENUE_CONFIG_MANUAL',
        displayName: 'Venue Configuration',
        paletteGroup: 'Venues',
        comp: 'venue-config-element',
        category: 'executable',
        path: 'venue_config_steps',
        isNestable: false
    },
    'VENUE_CONFIG_GET': {
        name: 'VENUE_CONFIG_GET',
        displayName: 'Get Configuration',
        paletteGroup: 'Venues',
        comp: 'get-venue-config-element',
        category: 'executable',
        path: 'get_config_steps',
        isNestable: false
    },
    'VENUE_CONFIG_UPDATE': {
        name: 'VENUE_CONFIG_UPDATE',
        displayName: 'Update Configuration',
        paletteGroup: 'Venues',
        comp: 'update-venue-config-element',
        category: 'executable',
        path: 'update_config_steps',
        isNestable: false
    },
    'VENUE_CONFIG_CHECK': {
        name: 'VENUE_CONFIG_CHECK',
        displayName: 'Check Configuration',
        paletteGroup: 'Venues',
        comp: 'check-venue-config-element',
        category: 'executable',
        path: 'check_config_steps',
        isNestable: false
    },
    // BEGIN TELEMETRY
    'QUERY_EVR': {
        name: 'QUERY_EVR',
        displayName: 'Query EVR',
        paletteGroup: 'Telemetry',
        comp: 'queryevr-element',
        category: 'executable',
        path: 'query_evr_steps',
        isNestable: false
    },
    'VERIFY_EHA': {
        name: 'VERIFY_EHA',
        displayName: 'Verify EHA',
        paletteGroup: 'Telemetry',
        comp: 'verify-eha-element',
        category: 'executable',
        path: 'verify_eha_steps',
        isNestable: false
    },
    'WAIT_EHA': {
        name: 'WAIT_EHA',
        displayName: 'Wait EHA',
        paletteGroup: 'Telemetry',
        comp: 'wait-eha-element',
        category: 'executable',
        path: 'wait_eha_steps',
        isNestable: false
    },
    'GRAPH_EHA': {
        name: 'GRAPH EHA',
        displayName: 'Graph EHA',
        paletteGroup: 'Telemetry',
        comp: 'graph-eha-element',
        category: 'executable',
        path: 'graph_eha_steps',
        isNestable: false
    },
    'WAIT_EVR': {
        name: 'WAIT_EVR',
        displayName: 'Wait EVR',
        paletteGroup: 'Telemetry',
        comp: 'wait-evr-element',
        category: 'executable',
        path: 'wait_evr_steps',
        isNestable: false
    },
    // BEGIN COMMANDS
    'CMD': {
        name: 'CMD',
        displayName: 'Cmd',
        paletteGroup: 'Commands',
        comp: 'cmd-element',
        category: 'executable',
        path: 'cmd_steps',
        isNestable: false
    },
    'CMD_FILE': {
        name: 'CMD_FILE',
        displayName: 'Cmd File',
        paletteGroup: 'Commands',
        comp: 'cmd-file-element',
        category: 'executable',
        path: 'cmd_file_steps',
        isNestable: false
    },
    'CMD_SCMF': {
        name: 'CMD_SCMF',
        displayName: 'Cmd SCMF',
        paletteGroup: 'Commands',
        comp: 'cmd-scmf-element',
        category: 'executable',
        path: 'cmd_scmf_steps',
        isNestable: false
    },
    'CMD_SSE': {
        name: 'CMD_SSE',
        displayName: 'Cmd SSE',
        paletteGroup: 'Commands',
        comp: 'cmd-sse-element',
        category: 'executable',
        path: 'cmd_sse_steps',
        isNestable: false
    },
    // BEGIN MANUAL
    'GDS_MANUAL': {
        name: 'GDS_MANUAL',
        displayName: 'Manual GDS',
        paletteGroup: 'Manual',
        comp: 'manual-gds-element',
        category: 'executable',
        path: 'gds_steps',
        isNestable: false
    },
    'MANUAL_INPUT': {
        name: 'MANUAL_INPUT',
        displayName: 'Manual Input',
        paletteGroup: 'Manual',
        comp: 'manual-input-element',
        category: 'executable',
        path: 'manual_input_steps',
        isNestable: false
    },
    'MANUAL_VERIFICATION': {
        name: 'MANUAL_VERIFICATION',
        displayName: 'Manual Verification',
        paletteGroup: 'Manual',
        comp: 'manual-verification-element',
        category: 'executable',
        path: 'manual_verification_steps',
        isNestable: false
    },
    'ENVIRONMENT_MANUAL': {
        name: 'ENVIRONMENT_MANUAL',
        displayName: 'Environment',
        paletteGroup: 'Manual',
        comp: 'environment-element',
        category: 'executable',
        path: 'environment_steps',
        isNestable: false
    },
    'WAIT': {
        name: 'WAIT',
        displayName: 'Wait',
        paletteGroup: 'Manual',
        comp: 'wait-element',
        category: 'executable',
        path: 'wait_steps',
        isNestable: false
    },
    'BUS_1553': {
        name: 'BUS_1553',
        displayName: 'Wait/Verify 1553',
        paletteGroup: 'Telemetry',
        comp: 'bus-1553-element',
        category: 'executable',
        path: 'bus_1553_steps',
        isNestable: false
    },
    'CUSTOM_SCRIPT': {
        name: 'CUSTOM_SCRIPT',
        displayName: 'Custom Script',
        paletteGroup: 'Commands',
        comp: 'custom-script-element',
        category: 'executable',
        path: 'custom_script_steps',
        isNestable: false
    },
    'MANUAL_EIP': {
        name: 'MANUAL_EIP',
        displayName: 'EIP',
        paletteGroup: 'Manual',
        comp: 'eip-element',
        category: 'executable',
        path: 'manual_eip_steps',
        isNestable: false
    },
    'WAIT_DATA_PRODUCTS': {
        name: 'WAIT_DATA_PRODUCTS',
        displayName: 'Wait DP',
        paletteGroup: 'Telemetry',
        comp: 'wait-dp-element',
        category: 'executable',
        path: 'wait_data_products_steps',
        isNestable: false
    },
    'LIST_DATA_PRODUCTS': {
        name: 'LIST_DATA_PRODUCTS',
        displayName: 'List DP',
        paletteGroup: 'Telemetry',
        comp: 'list-dp-element',
        category: 'executable',
        path: 'list_data_products_steps',
        isNestable: false
    },
    'TIME_REFERENCE': {
        name: 'TIME_REFERENCE',
        displayName: 'Time Reference',
        paletteGroup: 'Telemetry',
        comp: 'time-reference-element',
        category: 'executable',
        path: 'time_reference_steps',
        isNestable: false
    }
};

export function getElementDef(element) {
    switch(element.elem_type) {
    case 'SECTION':
    case 'PARAGRAPH':
    case 'PROCEDURE_SECTION':
        return deepCopy(elementMap[element.elem_type]);
    case 'STEP':
        return deepCopy(elementMap[element.step_type]);
    default:
        return null;
    }
}

export function elementsByPaletteGroup(paletteGroup) {
    const elemDefs = [];
    for (const elemDef of Object.values(elementMap)) {
        if (elemDef.paletteGroup === paletteGroup) {
            elemDefs.push(elemDef);
        }
    }
    const usedElemDefs = elemDefs.filter(elemDef => 
        !['Graph EHA', 'Get Configuration', 'Update Configuration', 'Check Configuration'].includes(elemDef.displayName));

    return deepCopy(usedElemDefs);
}

export function getElementDisplayName(element) {
    const elemDef = getElementDef(element);
    return elemDef ? elemDef.displayName : '';
}

export function getElementPath(element) {
    const elemDef = getElementDef(element);
    return elemDef ? elemDef.path : '';
}

export function elementMapByType(type) {
    return deepCopy(elementMap[type]);
}



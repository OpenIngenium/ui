import { deepCopy } from "./utils";

export function getElementCategories(builtInSteps, customSteps) {
    const builtInCategories = [...new Set(builtInSteps.map(step => step.palette_category))];
    const customCategories = [...new Set(customSteps.map(step => step.palette_category))];
    return deepCopy([...new Set([...builtInCategories, ...customCategories])].sort());
}

export function getElementDef(element, builtInSteps, customSteps) {
    
    const { all } = augmentStepsWithElementMap(builtInSteps, customSteps);
    let match = null;

    switch(element.elem_type) {
    case 'SECTION':
    case 'PARAGRAPH':
    case 'PROCEDURE_SECTION':
        match = all.find(step => step.step_type === element.elem_type);
        break;
    case 'STEP':
        if (element.step_type === 'CUSTOM_SCRIPT') {
            const scriptId = (element.execution_user_input && element.execution_user_input.script_id)
                || (element.authoring_user_input && element.authoring_user_input.script_id)
                || '';
            if (scriptId) {
                match = all.find(step => step.step_id === scriptId);
            }
        }
        if (!match && element.step_type) {
            match = all.find(step => step.step_type === element.step_type);
        }
        break;
    default:
        return null;
    }
    
    return match || null;
}

export function elementsByPaletteGroup(paletteGroup, builtInSteps, customSteps) {
    const elemDefs = [];

    // First augment all steps so they look like elementMap entries
    const { builtIn, custom } = augmentStepsWithElementMap(builtInSteps, customSteps);

    // Then filter by paletteGroup (which comes from palette_category)
    const builtInFiltered = builtIn.filter(step => step.paletteGroup === paletteGroup);
    const customFiltered = custom.filter(step => step.paletteGroup === paletteGroup);

    elemDefs.push(...builtInFiltered, ...customFiltered);

    return deepCopy(elemDefs);
}

export function getElementDisplayName(element, builtInSteps, customSteps) {

    const { all } = augmentStepsWithElementMap(builtInSteps, customSteps);

    let match = null;

    switch (element.elem_type) {
    case 'SECTION':
    case 'PARAGRAPH':
    case 'PROCEDURE_SECTION':
        match = all.find(step => step.step_type === element.elem_type);
        break;
      
    case 'STEP':
        // Match by script_id for custom steps, then fall back to step_type
        if (element.step_type === 'CUSTOM_SCRIPT') {
            const scriptId = (element.execution_user_input && element.execution_user_input.script_id)
                || (element.authoring_user_input && element.authoring_user_input.script_id)
                || '';
            if (scriptId) {
                return element.execution_user_input.script_display_name || element.authoring_user_input.script_display_name || 'Custom Script';
            }
        }
        if (!match && element.step_type) {
            match = all.find(step => step.step_type === element.step_type);
        }
        break;

    default:
        match = null;
    }
    return deepCopy((match && match.displayName) || '');
}

export function getElementPath(element, builtInSteps, customSteps) {
    const { all } = augmentStepsWithElementMap(builtInSteps, customSteps);
    
    let match = null;
    switch (element.elem_type) {
    case 'SECTION':
    case 'PARAGRAPH':
    case 'PROCEDURE_SECTION':
        match = all.find(step => step.step_type === element.elem_type);
        break;
        
    case 'STEP':
        // Match by script_id for custom steps, then fall back to step_type
        if (element.step_type === 'CUSTOM_SCRIPT') {
            const scriptId = (element.execution_user_input && element.execution_user_input.script_id)
                || (element.authoring_user_input && element.authoring_user_input.script_id)
                || '';
            if (scriptId) {
                return element.execution_user_input.script_path;
            }
        }
        if (!match && element.step_type) {
            match = all.find(step => step.step_type === element.step_type);
        }
        break;
        
    default:
        match = null;
    }
    
    return match ? match.path : '';
}

export function elementMapByType(type, builtInSteps, customSteps) {
    const { all } = augmentStepsWithElementMap(builtInSteps, customSteps);
    const match = all.find(step => step.step_type === type);
    return match ? deepCopy(match) : null;
}

export function augmentStepWithBuiltInElementMap(step) {
    const augmentedStep = { ...step };
    
    // Add missing fields if they don't exist
    if (!augmentedStep.name && augmentedStep.step_type) {
        augmentedStep.name = augmentedStep.step_type;
    }
    
    if (!augmentedStep.displayName) {
        augmentedStep.displayName = augmentedStep.step_display_name || augmentedStep.display_name || '';
    }
    
    if (!augmentedStep.paletteGroup && augmentedStep.palette_category) {
        augmentedStep.paletteGroup = augmentedStep.palette_category;
    }
    
    if (!augmentedStep.isNestable && augmentedStep.is_nestable) {
        augmentedStep.isNestable = augmentedStep.is_nestable;
    }
    
    return augmentedStep;
}

export function augmentStepWithCustomElementMap(step) {
    const augmentedStep = { ...step };
    // For custom steps, all are CUSTOM_SCRIPT type

    if (!augmentedStep.step_type) {
        augmentedStep.step_type = 'CUSTOM_SCRIPT';
    }

    // Name: use step_id if present, otherwise fall back to step_type
    if (!augmentedStep.name) {
        augmentedStep.name = 'CUSTOM_SCRIPT_DYNAMIC';
    }

    // Display name: always from step_display_name
    if (!augmentedStep.displayName) {
        augmentedStep.displayName = augmentedStep.step_display_name || '';
    }

    // Attach scriptMeta for passing through drag-and-drop and createElement
    if (!augmentedStep.scriptMeta) {
        augmentedStep.scriptMeta = {
            script_id: augmentedStep.step_id || '',
            script_name: augmentedStep.name || '',
            script_path: augmentedStep.step_path || '',
            script_display_name: augmentedStep.step_display_name || augmentedStep.displayName || '',
            script_hash: augmentedStep.step_hash || '',
            script_spec_hash: augmentedStep.spec_hash || ''
        };
    }

    // Palette group/category header from palette_category
    if (!augmentedStep.paletteGroup && augmentedStep.palette_category) {
        augmentedStep.paletteGroup = augmentedStep.palette_category;
    }

    if (!augmentedStep.isNestable && augmentedStep.is_nestable) {
        augmentedStep.isNestable = augmentedStep.is_nestable;
    }

    return augmentedStep;
}

export function augmentStepsWithElementMap(builtInSteps, customSteps) {
    const augmentedBuiltIn = (builtInSteps || []).map(step => augmentStepWithBuiltInElementMap(step));
    const augmentedCustom = (customSteps || []).map(step => augmentStepWithCustomElementMap(step));
    
    return {
        builtIn: augmentedBuiltIn,
        custom: augmentedCustom,
        all: [...augmentedBuiltIn, ...augmentedCustom]
    };
} 


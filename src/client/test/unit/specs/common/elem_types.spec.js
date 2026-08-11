import {
    getElementCategories,
    getElementDef,
    elementsByPaletteGroup,
    getElementDisplayName,
    getElementPath,
    elementMapByType,
    augmentStepWithBuiltInElementMap,
    augmentStepWithCustomElementMap,
    augmentStepsWithElementMap
} from "../../../../src/modules/common/elem_types";

const buildBuiltInSteps = () => ([
    {
        step_type: "SECTION",
        step_display_name: "Section",
        palette_category: "Organization",
        path: "sections",
        is_nestable: true
    },
    {
        step_type: "CMD_SSE",
        display_name: "Cmd SSE",
        palette_category: "Commands",
        path: "cmd_sse_steps"
    }
]);

const buildCustomSteps = () => ([
    {
        step_id: "script-1",
        step_display_name: "My Script",
        step_path: "custom_script_steps",
        palette_category: "Custom",
        step_hash: "h",
        spec_hash: "sh",
        is_nestable: false
    }
]);

describe("common/elem_types.js", () => {
    describe("getElementCategories", () => {
        it("returns the sorted union of built-in and custom palette categories", () => {
            const categories = getElementCategories(buildBuiltInSteps(), buildCustomSteps());
            expect(categories).toEqual(["Commands", "Custom", "Organization"]);
        });
    });

    describe("augmentStepWithBuiltInElementMap", () => {
        it("fills name, displayName, paletteGroup, and isNestable", () => {
            const [section] = buildBuiltInSteps();
            const augmented = augmentStepWithBuiltInElementMap(section);
            expect(augmented.name).toBe("SECTION");
            expect(augmented.displayName).toBe("Section");
            expect(augmented.paletteGroup).toBe("Organization");
            expect(augmented.isNestable).toBe(true);
        });

        it("falls back to display_name when step_display_name is missing", () => {
            const augmented = augmentStepWithBuiltInElementMap(buildBuiltInSteps()[1]);
            expect(augmented.displayName).toBe("Cmd SSE");
        });
    });

    describe("augmentStepWithCustomElementMap", () => {
        it("marks the step as CUSTOM_SCRIPT and builds scriptMeta", () => {
            const augmented = augmentStepWithCustomElementMap(buildCustomSteps()[0]);
            expect(augmented.step_type).toBe("CUSTOM_SCRIPT");
            expect(augmented.name).toBe("CUSTOM_SCRIPT_DYNAMIC");
            expect(augmented.displayName).toBe("My Script");
            expect(augmented.paletteGroup).toBe("Custom");
            expect(augmented.scriptMeta.script_id).toBe("script-1");
            expect(augmented.scriptMeta.script_path).toBe("custom_script_steps");
            expect(augmented.scriptMeta.script_display_name).toBe("My Script");
        });
    });

    describe("augmentStepsWithElementMap", () => {
        it("returns builtIn, custom, and combined all arrays", () => {
            const {builtIn, custom, all} = augmentStepsWithElementMap(buildBuiltInSteps(), buildCustomSteps());
            expect(builtIn.length).toBe(2);
            expect(custom.length).toBe(1);
            expect(all.length).toBe(3);
        });

        it("handles null inputs gracefully", () => {
            const {builtIn, custom, all} = augmentStepsWithElementMap(null, null);
            expect(builtIn).toEqual([]);
            expect(custom).toEqual([]);
            expect(all).toEqual([]);
        });
    });

    describe("getElementDef", () => {
        const builtIn = buildBuiltInSteps();
        const custom = buildCustomSteps();

        it("matches organizational elements by elem_type", () => {
            const def = getElementDef({elem_type: "SECTION"}, builtIn, custom);
            expect(def.step_type).toBe("SECTION");
        });

        it("matches a plain step by step_type", () => {
            const def = getElementDef({elem_type: "STEP", step_type: "CMD_SSE"}, builtIn, custom);
            expect(def.step_type).toBe("CMD_SSE");
        });

        it("matches a custom script by script_id", () => {
            const def = getElementDef({
                elem_type: "STEP",
                step_type: "CUSTOM_SCRIPT",
                execution_user_input: {script_id: "script-1"}
            }, builtIn, custom);
            expect(def.step_id).toBe("script-1");
        });

        it("returns null for unknown elem_type", () => {
            expect(getElementDef({elem_type: "MYSTERY"}, builtIn, custom)).toBeNull();
        });

        it("returns null for a step whose type has no match", () => {
            expect(getElementDef({elem_type: "STEP", step_type: "NOPE"}, builtIn, custom)).toBeNull();
        });
    });

    describe("getElementDisplayName", () => {
        const builtIn = buildBuiltInSteps();
        const custom = buildCustomSteps();

        it("returns the display name for organizational elements", () => {
            expect(getElementDisplayName({elem_type: "SECTION"}, builtIn, custom)).toBe("Section");
        });

        it("returns the display name for a plain step", () => {
            expect(getElementDisplayName({elem_type: "STEP", step_type: "CMD_SSE"}, builtIn, custom)).toBe("Cmd SSE");
        });

        it("returns the custom script display name from user input", () => {
            const name = getElementDisplayName({
                elem_type: "STEP",
                step_type: "CUSTOM_SCRIPT",
                execution_user_input: {script_id: "s", script_display_name: "Dynamic Name"}
            }, builtIn, custom);
            expect(name).toBe("Dynamic Name");
        });

        it("returns empty string for unknown elem_type", () => {
            expect(getElementDisplayName({elem_type: "MYSTERY"}, builtIn, custom)).toBe("");
        });
    });

    describe("getElementPath", () => {
        const builtIn = buildBuiltInSteps();
        const custom = buildCustomSteps();

        it("returns the path for organizational elements", () => {
            expect(getElementPath({elem_type: "SECTION"}, builtIn, custom)).toBe("sections");
        });

        it("returns the path for a plain step", () => {
            expect(getElementPath({elem_type: "STEP", step_type: "CMD_SSE"}, builtIn, custom)).toBe("cmd_sse_steps");
        });

        it("returns the custom script path from user input", () => {
            const path = getElementPath({
                elem_type: "STEP",
                step_type: "CUSTOM_SCRIPT",
                execution_user_input: {script_id: "s", script_path: "my/script/path"}
            }, builtIn, custom);
            expect(path).toBe("my/script/path");
        });

        it("returns empty string for unknown elem_type", () => {
            expect(getElementPath({elem_type: "MYSTERY"}, builtIn, custom)).toBe("");
        });
    });

    describe("elementMapByType", () => {
        it("returns a matching augmented step by type", () => {
            const map = elementMapByType("CMD_SSE", buildBuiltInSteps(), buildCustomSteps());
            expect(map.step_type).toBe("CMD_SSE");
            expect(map.name).toBe("CMD_SSE");
        });

        it("returns null when no step matches the type", () => {
            expect(elementMapByType("NOPE", buildBuiltInSteps(), buildCustomSteps())).toBeNull();
        });
    });

    describe("elementsByPaletteGroup", () => {
        it("filters built-in and custom steps by palette group", () => {
            const commands = elementsByPaletteGroup("Commands", buildBuiltInSteps(), buildCustomSteps());
            expect(commands.length).toBe(1);
            expect(commands[0].step_type).toBe("CMD_SSE");

            const customGroup = elementsByPaletteGroup("Custom", buildBuiltInSteps(), buildCustomSteps());
            expect(customGroup.length).toBe(1);
            expect(customGroup[0].step_id).toBe("script-1");
        });

        it("returns an empty array when no steps match", () => {
            expect(elementsByPaletteGroup("None", buildBuiltInSteps(), buildCustomSteps())).toEqual([]);
        });
    });
});

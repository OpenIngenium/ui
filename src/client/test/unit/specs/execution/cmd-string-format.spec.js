import {
    DEFAULT_CMD_STRING_FORMAT,
    flattenCmdArgs,
    parseCmdString,
    renderCmdString
} from "../../../../src/modules/elements/executable/cmd/cmd-string-format";

describe("cmd-string-format renderCmdString (configurable command-string format)", () => {

    // PWR_CTRL command with two regular arguments, matching the example documented in
    // src/server/.env.example (CMD_STRING_FORMAT).
    const stem = "PWR_CTRL";
    const args = [
        { argument_name: "SUBSYSTEM", argument_value: "SSPA" },
        { argument_name: "STATE", argument_value: "ON" }
    ];

    it("renders STEM only when there are no args", () => {
        const result = renderCmdString("{{STEM}}", stem, []);
        expect(result).toBe("PWR_CTRL");
    });

    it("treats '$' replacement patterns in argument values as literal text", () => {
        // '$&', '$`', "$'" and '$1' are special in String.replace replacement STRINGS -
        // argument values are user input and must be inserted verbatim.
        const dollarArgs = [
            { argument_name: "A", argument_value: "$&" },
            { argument_name: "B", argument_value: "$`x$'" }
        ];
        const format = "{{STEM}},{{#ARGS}}{{ARG_VALUE}}{{SEP}},{{/SEP}}{{/ARGS}}";
        expect(renderCmdString(format, stem, dollarArgs)).toBe("PWR_CTRL,$&,$`x$'");
    });

    it("renders a missing/undefined argument value as an empty string, not 'undefined'", () => {
        const sparseArgs = [{ argument_name: "A", argument_value: undefined }];
        expect(renderCmdString("{{STEM}},{{#ARGS}}{{ARG_VALUE}}{{/ARGS}}", stem, sparseArgs)).toBe("PWR_CTRL,");
    });

    it("legacy-compatible default format joins args with a leading comma via {{SEP}}", () => {
        const format = DEFAULT_CMD_STRING_FORMAT;
        expect(renderCmdString(format, stem, args)).toBe("PWR_CTRL,SSPA,ON");
        expect(renderCmdString(format, stem, [])).toBe("PWR_CTRL");
    });

    it("PRE_ARGS/POST_ARGS only render when arguments are present", () => {
        const format = "{{STEM}} {{PRE_ARGS}}{ {{/PRE_ARGS}}{{#ARGS}}\"{{ARG_NAME}}\": \"{{ARG_VALUE}}\"{{SEP}}, {{/SEP}}{{/ARGS}}{{POST_ARGS}} }{{/POST_ARGS}}";
        expect(renderCmdString(format, stem, args)).toBe("PWR_CTRL { \"SUBSYSTEM\": \"SSPA\", \"STATE\": \"ON\" }");
        expect(renderCmdString(format, stem, [])).toBe("PWR_CTRL ");
    });

    it("joins args with a comma+space separator via {{SEP}}, {{/SEP}}", () => {
        const result = renderCmdString("{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}}, {{/SEP}}{{/ARGS}}", stem, args);
        expect(result).toBe("PWR_CTRL SSPA, ON");
    });

    it("supports arbitrary literal text inside {{SEP}}...{{/SEP}} (e.g. ' | ')", () => {
        const result = renderCmdString("{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}} | {{/SEP}}{{/ARGS}}", stem, args);
        expect(result).toBe("PWR_CTRL SSPA | ON");
    });

    it("supports a single space as the separator via {{SEP}} {{/SEP}}", () => {
        const result = renderCmdString("{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}} {{/SEP}}{{/ARGS}}", stem, args);
        expect(result).toBe("PWR_CTRL SSPA ON");
    });

    it("renders a JSON-shaped format using {{ARG_NAME}} and {{ARG_VALUE}}", () => {
        const format = "{{STEM}} { {{#ARGS}}\"{{ARG_NAME}}\": \"{{ARG_VALUE}}\"{{SEP}}, {{/SEP}}{{/ARGS}} }";
        const result = renderCmdString(format, stem, args);
        expect(result).toBe("PWR_CTRL { \"SUBSYSTEM\": \"SSPA\", \"STATE\": \"ON\" }");
    });

    it("treats an unclosed/absent {{SEP}} as no separator (items concatenated as-is)", () => {
        const result = renderCmdString("{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{/ARGS}}", stem, args);
        expect(result).toBe("PWR_CTRL SSPAON");
    });

    it("renders {{ARG_NAME}}={{ARG_VALUE}} pairs with no join separator", () => {
        const result = renderCmdString("{{STEM}}{{#ARGS}} {{ARG_NAME}}={{ARG_VALUE}}{{/ARGS}}", stem, args);
        expect(result).toBe("PWR_CTRL SUBSYSTEM=SSPA STATE=ON");
    });
});

describe("cmd-string-format flattenCmdArgs", () => {
    it("orders regular args first, then flattened repeat-arg sections", () => {
        const regular = [{ argument_name: "A", argument_value: "1" }];
        const repeats = [
            [{ argument_name: "R", argument_value: "2" }],
            [{ argument_name: "R", argument_value: "3" }]
        ];
        expect(flattenCmdArgs(regular, repeats).map(a => a.argument_value)).toEqual(["1", "2", "3"]);
    });

    it("tolerates undefined collections", () => {
        expect(flattenCmdArgs(undefined, undefined)).toEqual([]);
    });
});

describe("cmd-string-format parseCmdString (inverse of renderCmdString)", () => {
    const stem = "PWR_CTRL";
    const args = [
        { argument_name: "SUBSYSTEM", argument_value: "SSPA" },
        { argument_name: "STATE", argument_value: "ON" }
    ];
    const argValues = args.map(a => a.argument_value);

    it("round-trips the legacy-compatible default comma format, with and without args", () => {
        const format = DEFAULT_CMD_STRING_FORMAT;

        expect(parseCmdString(format, renderCmdString(format, stem, args)))
            .toEqual({ command_stem: stem, cmdArgs: argValues });
        expect(parseCmdString(format, renderCmdString(format, stem, [])))
            .toEqual({ command_stem: stem, cmdArgs: [] });
    });

    it("round-trips a comma+space separator format", () => {
        const format = "{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}}, {{/SEP}}{{/ARGS}}";
        expect(parseCmdString(format, renderCmdString(format, stem, args)))
            .toEqual({ command_stem: stem, cmdArgs: argValues });
    });

    it("round-trips a single-space separator format", () => {
        const format = "{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}} {{/SEP}}{{/ARGS}}";
        expect(parseCmdString(format, renderCmdString(format, stem, args)))
            .toEqual({ command_stem: stem, cmdArgs: argValues });
    });

    it("round-trips a pipe-separated format", () => {
        const format = "{{STEM}} {{#ARGS}}{{ARG_VALUE}}{{SEP}} | {{/SEP}}{{/ARGS}}";
        expect(parseCmdString(format, renderCmdString(format, stem, args)))
            .toEqual({ command_stem: stem, cmdArgs: argValues });
    });

    it("round-trips the JSON-shaped format (wrapped {{ARG_NAME}}/{{ARG_VALUE}} template), with and without args", () => {
        const format = "{{STEM}} {{PRE_ARGS}}{ {{/PRE_ARGS}}{{#ARGS}}\"{{ARG_NAME}}\": \"{{ARG_VALUE}}\"{{SEP}}, {{/SEP}}{{/ARGS}}{{POST_ARGS}} }{{/POST_ARGS}}";

        expect(parseCmdString(format, renderCmdString(format, stem, args)))
            .toEqual({ command_stem: stem, cmdArgs: argValues });
        // zero-arg case renders "PWR_CTRL " (trailing space, no braces) - only trimmed by
        // setCommandString, not renderCmdString itself, so verify that trimmed input too
        expect(parseCmdString(format, renderCmdString(format, stem, []).trim()))
            .toEqual({ command_stem: stem, cmdArgs: [] });
    });

    it("falls back to treating the whole string as the stem when there is no delimiter between STEM and the first arg (unrecoverable boundary)", () => {
        const format = "{{STEM}}{{#ARGS}}{{ARG_VALUE}}{{SEP}} {{/SEP}}{{/ARGS}}";
        const rendered = renderCmdString(format, stem, args); // "PWR_CTRLSSPA ON"
        expect(parseCmdString(format, rendered)).toEqual({ command_stem: rendered, cmdArgs: [] });
    });

    it("falls back to a single merged argument when there is no {{SEP}} between args, even though the stem boundary is known", () => {
        // PRE_ARGS gives us a recoverable stem boundary, but the ARGS loop has no {{SEP}},
        // so individual arguments get concatenated with nothing between them.
        const format = "{{STEM}}{{PRE_ARGS}} {{/PRE_ARGS}}{{#ARGS}}{{ARG_NAME}}={{ARG_VALUE}}{{/ARGS}}";
        const rendered = renderCmdString(format, stem, args); // "PWR_CTRL SUBSYSTEM=SSPASTATE=ON"
        const result = parseCmdString(format, rendered);
        expect(result.command_stem).toBe(stem);
        expect(result.cmdArgs.length).toBe(1);
    });
});

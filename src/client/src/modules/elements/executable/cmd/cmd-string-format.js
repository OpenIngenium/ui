/**
 * Configurable command-string format shared by every CMD "Lookup" builder
 * (CmdEntry.vue and CustomScriptInputArg.vue). The format string comes from the server
 * (CMD_STRING_FORMAT -> templateLocals -> head.ejs -> window.cmdStringFormat); see
 * docs/Configuration.md.
 *
 * Supported tokens:
 *   {{STEM}}                       - command stem
 *   {{PRE_ARGS}}...{{/PRE_ARGS}}   - only rendered when arguments are present
 *   {{POST_ARGS}}...{{/POST_ARGS}} - only rendered when arguments are present
 *   {{#ARGS}}...{{/ARGS}}          - repeated once per argument (regular args followed by
 *                                    flattened repeat-arg sections, in that order)
 *   {{ARG_NAME}}/{{ARG_VALUE}}     - current argument's name/value (inside the ARGS loop)
 *   {{SEP}}...{{/SEP}}             - (inside the ARGS loop) literal text joined BETWEEN
 *                                    arguments only (never before the first or after the last)
 *   everything else                - literal text
 */

// Replicates the legacy hardcoded behavior: STEM,arg1,arg2 (or just STEM when there are
// no arguments). Kept in sync with CMD_STRING_FORMAT in src/server/src/config/index.js.
export const DEFAULT_CMD_STRING_FORMAT = "{{STEM}}{{PRE_ARGS}},{{/PRE_ARGS}}{{#ARGS}}{{ARG_VALUE}}{{SEP}},{{/SEP}}{{/ARGS}}";

// Server-injected format, falling back to the legacy default when the page was not rendered
// by the Express server (unit tests, standalone client dev server).
export function getCmdStringFormat() {
    return (typeof window !== 'undefined' && window.cmdStringFormat) || DEFAULT_CMD_STRING_FORMAT;
}

// Flattens the two argument collections the cmd store exposes into the single ordered list
// the ARGS loop iterates over: regular arguments first, then repeat-arg sections.
export function flattenCmdArgs(args, repeatArgSections) {
    return (args || []).concat(
        (repeatArgSections || []).reduce((flat, section) => flat.concat(section), [])
    );
}

// Renders a token value as literal text: null/undefined become "", while falsy-but-valid
// values (0, false) are preserved.
function literal(value) {
    return (value === undefined || value === null) ? "" : String(value);
}

export function renderCmdString(format, stem, args) {
    const hasArgs = args.length > 0;

    let result = format.replace(/\{\{STEM\}\}/g, () => literal(stem));

    result = result.replace(/\{\{PRE_ARGS\}\}([\s\S]*?)\{\{\/PRE_ARGS\}\}/g, (match, content) => {
        return hasArgs ? content : "";
    });

    result = result.replace(/\{\{POST_ARGS\}\}([\s\S]*?)\{\{\/POST_ARGS\}\}/g, (match, content) => {
        return hasArgs ? content : "";
    });

    result = result.replace(/\{\{#ARGS\}\}([\s\S]*?)\{\{\/ARGS\}\}/g, (match, loopBody) => {
        let separator = "";
        let itemTemplate = loopBody;

        const sepMatch = loopBody.match(/\{\{SEP\}\}([\s\S]*?)\{\{\/SEP\}\}/);
        if (sepMatch) {
            separator = sepMatch[1];
            itemTemplate = itemTemplate.replace(sepMatch[0], "");
        }

        // Replacement FUNCTIONS (not strings) so that '$&', '$1', etc. in a
        // user-entered argument value are inserted literally rather than being
        // interpreted as replacement patterns.
        return args.map(arg => {
            return itemTemplate
                .replace(/\{\{ARG_NAME\}\}/g, () => literal(arg.argument_name))
                .replace(/\{\{ARG_VALUE\}\}/g, () => literal(arg.argument_value));
        }).join(separator);
    });

    return result;
}

// Given a per-argument item template (e.g. '"{{ARG_NAME}}": "{{ARG_VALUE}}"') and a
// rendered instance of it, extracts just the {{ARG_VALUE}} portion by converting the
// template into a regex (escaping literal text, turning {{ARG_NAME}}/{{ARG_VALUE}}
// into capture groups). Falls back to returning itemStr unchanged if the template has
// no {{ARG_VALUE}} token or doesn't match (e.g. the rendered text was altered).
export function extractArgValue(itemTemplate, itemStr) {
    const tokens = [...itemTemplate.matchAll(/\{\{(ARG_NAME|ARG_VALUE)\}\}/g)].map(m => m[1]);
    if (tokens.length === 0) return itemStr;

    const SENTINEL_NAME = "\u0000N\u0000";
    const SENTINEL_VALUE = "\u0000V\u0000";
    const pattern = itemTemplate
        .replace(/\{\{ARG_NAME\}\}/g, SENTINEL_NAME)
        .replace(/\{\{ARG_VALUE\}\}/g, SENTINEL_VALUE)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(new RegExp(SENTINEL_NAME, 'g'), "([\\s\\S]*?)")
        .replace(new RegExp(SENTINEL_VALUE, 'g'), "([\\s\\S]*?)");

    const match = itemStr.match(new RegExp(`^${pattern}$`));
    if (!match) return itemStr;

    const valueIndex = tokens.indexOf("ARG_VALUE");
    return valueIndex !== -1 ? match[valueIndex + 1] : itemStr;
}

// Inverse of renderCmdString: given the same format and a previously-rendered cmdString,
// recovers { command_stem, cmdArgs }. Extracts the literal text/tokens directly from the
// format (not the rendered string) and uses those to locate the stem/args boundary and the
// argument separator, instead of assuming a hardcoded comma. Also supports "wrapped value"
// per-argument templates (e.g. the JSON-ish '"{{ARG_NAME}}": "{{ARG_VALUE}}"' example) via
// extractArgValue above.
//
// Known limitations (falls back to a safe default instead of guessing):
//   - No literal text between {{STEM}} and the first argument (no {{PRE_ARGS}} block and
//     nothing else there either) - that boundary is unrecoverable.
//   - No {{SEP}}...{{/SEP}} inside {{#ARGS}} - individual argument boundaries are
//     unrecoverable.
export function parseCmdString(format, cmdString) {
    const stemIndex = format.indexOf("{{STEM}}");
    const afterStem = stemIndex !== -1 ? format.slice(stemIndex + "{{STEM}}".length) : format;

    const preArgsMatch = afterStem.match(/\{\{PRE_ARGS\}\}([\s\S]*?)\{\{\/PRE_ARGS\}\}/);
    const preArgsLiteral = preArgsMatch ? preArgsMatch[1] : "";

    // Literal text between {{STEM}} and the next {{PRE_ARGS}} or {{#ARGS}} tag -
    // always rendered, regardless of whether args are present.
    const nextTagIndex = afterStem.search(/\{\{(PRE_ARGS|#ARGS)\}\}/);
    const preStemLiteral = nextTagIndex !== -1 ? afterStem.slice(0, nextTagIndex) : "";

    const postArgsMatch = format.match(/\{\{POST_ARGS\}\}([\s\S]*?)\{\{\/POST_ARGS\}\}/);
    const postArgsLiteral = postArgsMatch ? postArgsMatch[1] : "";

    const argsLoopMatch = format.match(/\{\{#ARGS\}\}([\s\S]*?)\{\{\/ARGS\}\}/);
    const argsLoopBody = argsLoopMatch ? argsLoopMatch[1] : "";
    const sepMatch = argsLoopBody.match(/\{\{SEP\}\}([\s\S]*?)\{\{\/SEP\}\}/);
    const sepLiteral = sepMatch ? sepMatch[1] : "";
    const itemTemplate = sepMatch ? argsLoopBody.replace(sepMatch[0], "") : argsLoopBody;

    let remaining = cmdString;
    if (postArgsLiteral && remaining.endsWith(postArgsLiteral)) {
        remaining = remaining.slice(0, remaining.length - postArgsLiteral.length);
    }

    const boundaryLiteral = preStemLiteral + preArgsLiteral;
    if (!boundaryLiteral) {
        return { command_stem: remaining, cmdArgs: [] };
    }

    const boundaryIndex = remaining.indexOf(boundaryLiteral);
    if (boundaryIndex === -1) {
        // No args were rendered (e.g. zero-argument command)
        return { command_stem: remaining, cmdArgs: [] };
    }

    const command_stem = remaining.slice(0, boundaryIndex);
    const argsStr = remaining.slice(boundaryIndex + boundaryLiteral.length);

    if (!sepLiteral) {
        return {
            command_stem,
            cmdArgs: argsStr === "" ? [] : [extractArgValue(itemTemplate, argsStr)]
        };
    }

    const cmdArgs = argsStr.split(sepLiteral).map(itemStr => extractArgValue(itemTemplate, itemStr));
    return { command_stem, cmdArgs };
}

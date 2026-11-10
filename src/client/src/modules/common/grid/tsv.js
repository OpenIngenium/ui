// Spreadsheet clipboard interchange format (tab separated values).
//
// Excel and Google Sheets both place a `text/plain` flavour on the clipboard where
// cells are separated by TAB and rows by CRLF. A cell whose content contains a tab,
// a newline or a double quote is wrapped in double quotes, and literal double quotes
// inside such a cell are doubled (the RFC 4180 escaping rules applied to TSV).

const CELL_DELIMITER = "\t";
const ROW_DELIMITER = "\r\n";
const QUOTE = "\"";

export function toClipboardValue(value) {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
}

function needsQuoting(text) {
    return text.indexOf(CELL_DELIMITER) !== -1
        || text.indexOf("\n") !== -1
        || text.indexOf("\r") !== -1
        || text.indexOf(QUOTE) !== -1;
}

function serializeCell(value) {
    const text = toClipboardValue(value);
    if (!needsQuoting(text)) {
        return text;
    }
    return QUOTE + text.split(QUOTE).join(QUOTE + QUOTE) + QUOTE;
}

export function serializeTsv(rows) {
    if (!Array.isArray(rows)) {
        return "";
    }
    return rows
        .map(row => (Array.isArray(row) ? row : [row]).map(serializeCell).join(CELL_DELIMITER))
        .join(ROW_DELIMITER);
}

export function parseTsv(text) {
    if (text === null || text === undefined) {
        return [];
    }

    const input = String(text);
    if (input === "") {
        return [];
    }

    const rows = [];
    let row = [];
    let cell = "";
    let cellIsEmpty = true;
    let inQuotes = false;
    let index = 0;

    const endCell = () => {
        row.push(cell);
        cell = "";
        cellIsEmpty = true;
    };

    const endRow = () => {
        endCell();
        rows.push(row);
        row = [];
    };

    while (index < input.length) {
        const char = input[index];

        if (inQuotes) {
            if (char === QUOTE) {
                if (input[index + 1] === QUOTE) {
                    cell += QUOTE;
                    index += 2;
                    continue;
                }
                inQuotes = false;
                index += 1;
                continue;
            }
            cell += char;
            index += 1;
            continue;
        }

        if (char === QUOTE && cellIsEmpty) {
            inQuotes = true;
            cellIsEmpty = false;
            index += 1;
            continue;
        }

        if (char === CELL_DELIMITER) {
            endCell();
            index += 1;
            continue;
        }

        if (char === "\r" || char === "\n") {
            endRow();
            index += char === "\r" && input[index + 1] === "\n" ? 2 : 1;
            continue;
        }

        cell += char;
        cellIsEmpty = false;
        index += 1;
    }

    if (!(cell === "" && row.length === 0)) {
        endRow();
    }

    return rows;
}

export function normalizeMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
        return [];
    }
    const width = matrix.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0);
    return matrix.map(row => {
        const values = Array.isArray(row) ? row.slice() : [];
        while (values.length < width) {
            values.push("");
        }
        return values;
    });
}

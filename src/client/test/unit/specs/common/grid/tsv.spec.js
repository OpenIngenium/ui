import { serializeTsv, parseTsv, normalizeMatrix, toClipboardValue } from "../../../../../src/modules/common/grid/tsv";

describe("grid/tsv", () => {
    describe("serializeTsv", () => {
        it("joins cells with tabs and rows with CRLF", () => {
            expect(serializeTsv([["a", "b"], ["c", "d"]])).toBe("a\tb\r\nc\td");
        });

        it("renders null and undefined as empty cells", () => {
            expect(serializeTsv([[null, undefined, ""]])).toBe("\t\t");
        });

        it("renders numeric and boolean values as text", () => {
            expect(serializeTsv([[1, 2.5, true, false, 0]])).toBe("1\t2.5\ttrue\tfalse\t0");
        });

        it("quotes values containing a tab", () => {
            expect(serializeTsv([["a\tb", "c"]])).toBe("\"a\tb\"\tc");
        });

        it("quotes values containing newlines", () => {
            expect(serializeTsv([["line1\nline2"]])).toBe("\"line1\nline2\"");
        });

        it("quotes and doubles embedded quotes", () => {
            expect(serializeTsv([["say \"hi\""]])).toBe("\"say \"\"hi\"\"\"");
        });

        it("preserves unicode without quoting", () => {
            expect(serializeTsv([["µΩ±", "温度"]])).toBe("µΩ±\t温度");
        });

        it("returns an empty string for non-array input", () => {
            expect(serializeTsv(null)).toBe("");
        });
    });

    describe("parseTsv", () => {
        it("returns an empty matrix for empty input", () => {
            expect(parseTsv("")).toEqual([]);
            expect(parseTsv(null)).toEqual([]);
            expect(parseTsv(undefined)).toEqual([]);
        });

        it("parses an Excel style CRLF block", () => {
            expect(parseTsv("a\tb\r\nc\td")).toEqual([["a", "b"], ["c", "d"]]);
        });

        it("parses a Google Sheets style LF block", () => {
            expect(parseTsv("a\tb\nc\td")).toEqual([["a", "b"], ["c", "d"]]);
        });

        it("parses legacy CR only line endings", () => {
            expect(parseTsv("a\tb\rc\td")).toEqual([["a", "b"], ["c", "d"]]);
        });

        it("ignores a single trailing row delimiter", () => {
            expect(parseTsv("a\tb\r\n")).toEqual([["a", "b"]]);
            expect(parseTsv("a\tb\n")).toEqual([["a", "b"]]);
        });

        it("keeps intentional empty rows between content", () => {
            expect(parseTsv("a\n\nb")).toEqual([["a"], [""], ["b"]]);
        });

        it("preserves empty cells including leading and trailing ones", () => {
            expect(parseTsv("\ta\t")).toEqual([["", "a", ""]]);
        });

        it("parses quoted cells containing tabs", () => {
            expect(parseTsv("\"a\tb\"\tc")).toEqual([["a\tb", "c"]]);
        });

        it("parses quoted cells containing newlines", () => {
            expect(parseTsv("\"line1\nline2\"\tnext\r\nrow2\tx")).toEqual([["line1\nline2", "next"], ["row2", "x"]]);
        });

        it("parses doubled quotes inside a quoted cell", () => {
            expect(parseTsv("\"say \"\"hi\"\"\"\tb")).toEqual([["say \"hi\"", "b"]]);
        });

        it("treats a quote in the middle of a cell as a literal character", () => {
            expect(parseTsv("a\"b\tc")).toEqual([["a\"b", "c"]]);
        });

        it("parses a single cell without delimiters", () => {
            expect(parseTsv("hello")).toEqual([["hello"]]);
        });

        it("parses unicode content", () => {
            expect(parseTsv("µΩ±\t温度")).toEqual([["µΩ±", "温度"]]);
        });

        it("parses mixed empty and populated cells over multiple rows", () => {
            expect(parseTsv("1\t\t3\r\n\t5\t\r\n")).toEqual([["1", "", "3"], ["", "5", ""]]);
        });
    });

    describe("round trip", () => {
        it("survives tabs, newlines, quotes, unicode and empty cells", () => {
            const rows = [
                ["plain", "with\ttab", ""],
                ["multi\nline", "quote \"x\"", "µΩ±"],
                ["", "", "last"]
            ];
            expect(parseTsv(serializeTsv(rows))).toEqual(rows);
        });

        it("normalizes null cells to empty strings on the way back", () => {
            expect(parseTsv(serializeTsv([[null, 1]]))).toEqual([["", "1"]]);
        });
    });

    describe("normalizeMatrix", () => {
        it("pads ragged rows to the widest row", () => {
            expect(normalizeMatrix([["a"], ["b", "c"]])).toEqual([["a", ""], ["b", "c"]]);
        });

        it("returns an empty array for empty input", () => {
            expect(normalizeMatrix([])).toEqual([]);
            expect(normalizeMatrix(null)).toEqual([]);
        });
    });

    describe("toClipboardValue", () => {
        it("maps nullish values to an empty string", () => {
            expect(toClipboardValue(null)).toBe("");
            expect(toClipboardValue(undefined)).toBe("");
            expect(toClipboardValue(0)).toBe("0");
        });
    });
});

export const GridColumnType = {
    TEXT: "text",
    NUMERIC: "numeric",
    DROPDOWN: "dropdown"
};

export const GridSource = {
    LOAD: "load",
    EDIT: "edit",
    PASTE: "paste",
    FILL: "fill",
    CUT: "cut",
    ROW_ABOVE: "row_above",
    ROW_BELOW: "row_below",
    REMOVE_ROW: "remove_row",
    SILENT: "silent"
};

export const ContextMenuItem = {
    ROW_ABOVE: "row_above",
    ROW_BELOW: "row_below",
    REMOVE_ROW: "remove_row",
    COPY: "copy",
    CUT: "cut",
    PASTE: "paste"
};

export const CONTEXT_MENU_LABELS = {
    [ContextMenuItem.ROW_ABOVE]: "Insert row above",
    [ContextMenuItem.ROW_BELOW]: "Insert row below",
    [ContextMenuItem.REMOVE_ROW]: "Remove row",
    [ContextMenuItem.COPY]: "Copy",
    [ContextMenuItem.CUT]: "Cut",
    [ContextMenuItem.PASTE]: "Paste"
};

export const INVALID_CELL_CLASS = "orange-bg";

import {
    INGENIUM_COPY,
    getDefaultCopyParams,
    getDefaultSearchResult,
    setCopyParams,
    loadCopyParams,
    loadReplaceElementSource,
    saveToLocalStorage,
    loadFromLocalStorage,
    getJwt,
    getCookieValue,
    isLoggedIn,
    getUsername,
    getRoles,
    getUserScopes,
    isAdmin,
    upperCase,
    isUndefinedOrNull,
    toSnakeCase,
    toCamelCase,
    slimElement,
    deepCopy,
    parseAxiosError,
    setScrollToElementIdFunc,
    pageElementsFunc,
    hasProcedureModification,
    isRedlineElement,
    isBluelineElement,
    elemContainsTag,
    hasAnyFilter,
    checkShowElement,
    hasAdditionalElementsBeforeFunc,
    hasAdditionalElementsAfterFunc,
    getFilteredElementIds,
    getFilteredElementsFunc,
    resetCustomScriptEntry,
    constructCollapseMap,
    collapseToggle,
    getOutlineStructureFunc,
    toggleOutlineCollapsedAllFunc,
    toggleOutlineCollapsedFunc,
    getOutline,
    getOutlineFromItem,
    getSectionChildElemIds,
    addCopyElemIds,
    removeCopyElemIds,
    addCopyElemIdsRange,
    removeCopyElemIdsRange,
    handleErrorNotification,
    diffElems
} from "../../../../src/modules/common/utils";

// Build an unsigned JWT-like token whose payload can be decoded by jwt-decode.
function makeJwt(payload) {
    const b64 = (obj) => window.btoa(JSON.stringify(obj)).replace(/=+$/, "");
    return `${b64({alg: "HS256", typ: "JWT"})}.${b64(payload)}.sig`;
}

function setAccessTokenCookie(token) {
    document.cookie = `access_token=${token}`;
}

function clearAccessTokenCookie() {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

describe("common/utils.js", () => {
    afterEach(() => {
        window.localStorage.clear();
        clearAccessTokenCookie();
    });

    describe("string helpers", () => {
        it("isUndefinedOrNull detects undefined and null only", () => {
            expect(isUndefinedOrNull(undefined)).toBe(true);
            expect(isUndefinedOrNull(null)).toBe(true);
            expect(isUndefinedOrNull("")).toBe(false);
            expect(isUndefinedOrNull(0)).toBe(false);
            expect(isUndefinedOrNull("x")).toBe(false);
        });

        it("upperCase uppercases strings and passes through nullish", () => {
            expect(upperCase("abc")).toBe("ABC");
            expect(upperCase(undefined)).toBe(undefined);
            expect(upperCase(null)).toBe(null);
        });

        it("toSnakeCase converts camelCase to snake_case", () => {
            expect(toSnakeCase("camelCaseWord")).toBe("camel_case_word");
            expect(toSnakeCase("lowercase")).toBe("lowercase");
            expect(toSnakeCase("")).toBeUndefined();
        });

        it("toCamelCase converts snake_case to camelCase", () => {
            expect(toCamelCase("snake_case_word")).toBe("snakeCaseWord");
            expect(toCamelCase("plain")).toBe("plain");
        });
    });

    describe("object helpers", () => {
        it("deepCopy returns an equal but distinct object", () => {
            const src = {a: 1, b: {c: 2}};
            const copy = deepCopy(src);
            expect(copy).toEqual(src);
            expect(copy).not.toBe(src);
            expect(copy.b).not.toBe(src.b);
        });

        it("slimElement keeps only known keys", () => {
            const element = {elem_id: "1", title: "t", junk: "drop", number: "1-1"};
            const slim = slimElement(element);
            expect(slim.elem_id).toBe("1");
            expect(slim.title).toBe("t");
            expect(slim.number).toBe("1-1");
            expect(slim.hasOwnProperty("junk")).toBe(false);
        });

        it("parseAxiosError extracts response data or falls back to message", () => {
            expect(parseAxiosError({response: {data: {message: "boom"}}})).toEqual({message: "boom"});
            expect(parseAxiosError({message: "network"})).toEqual({message: "network"});
        });

        it("getDefaultCopyParams and getDefaultSearchResult return expected shapes", () => {
            expect(getDefaultCopyParams()).toEqual({copyElemIdMap: {}});
            const search = getDefaultSearchResult();
            expect(search.search_for).toBe("");
            expect(search.match_case).toBe(false);
            expect(search.matchMap).toEqual({});
            expect(search.total_count).toBe(0);
        });
    });

    describe("localStorage helpers", () => {
        it("saveToLocalStorage and loadFromLocalStorage round-trip JSON", () => {
            saveToLocalStorage("myKey", {a: 1});
            expect(loadFromLocalStorage("myKey", null)).toEqual({a: 1});
        });

        it("loadFromLocalStorage returns null when key missing", () => {
            expect(loadFromLocalStorage("missing", {fallback: true})).toBeNull();
        });

        it("loadFromLocalStorage returns default when stored value is invalid JSON", () => {
            window.localStorage.setItem("bad", "not json{");
            expect(loadFromLocalStorage("bad", "fallback")).toBe("fallback");
        });

        it("setCopyParams/loadCopyParams round-trip through INGENIUM_COPY", () => {
            setCopyParams({execution_id: "e1", copyElemIdMap: {a: "a"}});
            expect(loadCopyParams()).toEqual({execution_id: "e1", copyElemIdMap: {a: "a"}});
            expect(INGENIUM_COPY).toBe("ingenium-copy");
        });

        it("loadReplaceElementSource returns source only for a single copied element", () => {
            setCopyParams({execution_id: "e1", copyElemIdMap: {a: "a"}});
            expect(loadReplaceElementSource()).toEqual({execution_id: "e1", elem_id: "a"});

            setCopyParams({execution_id: "e1", copyElemIdMap: {a: "a", b: "b"}});
            expect(loadReplaceElementSource()).toEqual({});
        });
    });

    describe("jwt / auth helpers", () => {
        it("getJwt returns the token from the cookie or empty string", () => {
            expect(getJwt()).toBe("");
            const token = makeJwt({username: "alice"});
            setAccessTokenCookie(token);
            expect(getJwt()).toBe(token);
        });

        it("getCookieValue reads arbitrary cookie values", () => {
            document.cookie = "flavor=vanilla";
            expect(getCookieValue("flavor")).toBe("vanilla");
            expect(getCookieValue("does_not_exist")).toBe("");
        });

        it("getUsername/getRoles/getUserScopes decode the token payload", () => {
            const token = makeJwt({
                username: "alice",
                roles: ["operator"],
                scopes: [{scope: "admin"}]
            });
            setAccessTokenCookie(token);
            expect(getUsername()).toBe("alice");
            expect(getRoles()).toEqual(["operator"]);
            expect(getUserScopes()).toEqual([{scope: "admin"}]);
        });

        it("getUsername/getRoles/getUserScopes return defaults without a token", () => {
            expect(getUsername()).toBe("");
            expect(getRoles()).toEqual([]);
            expect(getUserScopes()).toEqual([]);
        });

        it("isAdmin is true only when an admin scope is present", () => {
            setAccessTokenCookie(makeJwt({scopes: [{scope: "admin"}]}));
            expect(isAdmin()).toBe(true);

            clearAccessTokenCookie();
            setAccessTokenCookie(makeJwt({scopes: [{scope: "viewer"}]}));
            expect(isAdmin()).toBe(false);
        });

        it("isLoggedIn reflects token expiration", () => {
            expect(isLoggedIn()).toBe(false);

            const future = Math.floor(Date.now() / 1000) + 3600;
            setAccessTokenCookie(makeJwt({exp: future}));
            expect(isLoggedIn()).toBe(true);

            clearAccessTokenCookie();
            const past = Math.floor(Date.now() / 1000) - 3600;
            setAccessTokenCookie(makeJwt({exp: past}));
            expect(isLoggedIn()).toBe(false);
        });
    });

    describe("procedure modification helpers", () => {
        it("hasProcedureModification detects modification statuses", () => {
            ["MODIFYING", "MODIFYING_OLD", "MODIFIED", "ADDED", "DELETED"].forEach((status) => {
                expect(hasProcedureModification({procedure_modification_status: status})).toBe(true);
            });
            expect(hasProcedureModification({procedure_modification_status: "NONE"})).toBe(false);
            expect(hasProcedureModification({})).toBe(false);
        });

        it("isRedlineElement/isBluelineElement inspect the justification type", () => {
            const redline = {
                procedure_modification_status: "MODIFYING",
                procedure_modification: {justification: {modification_type: "REDLINE"}}
            };
            const blueline = {
                procedure_modification_status: "MODIFYING",
                procedure_modification: {justification: {modification_type: "BLUELINE"}}
            };
            expect(isRedlineElement(redline)).toBe(true);
            expect(isBluelineElement(redline)).toBe(false);
            expect(isBluelineElement(blueline)).toBe(true);
            expect(isRedlineElement(blueline)).toBe(false);

            // No modification => false
            expect(isRedlineElement({procedure_modification_status: "NONE"})).toBe(false);
            // Modification but no justification => false
            expect(isRedlineElement({procedure_modification_status: "MODIFYING"})).toBe(false);
        });

        it("elemContainsTag checks tag membership", () => {
            expect(elemContainsTag({tag_ids: ["a", "b"]}, ["b"])).toBe(true);
            expect(elemContainsTag({tag_ids: ["a"]}, ["z"])).toBe(false);
            expect(elemContainsTag({}, ["a"])).toBe(false);
            expect(elemContainsTag(null, ["a"])).toBe(false);
        });
    });

    describe("filter helpers", () => {
        it("hasAnyFilter is true when any filter is active", () => {
            expect(hasAnyFilter({tag_ids: [], filterElementIdMap: {}})).toBeFalsy();
            expect(hasAnyFilter({tag_ids: ["a"]})).toBe(true);
            expect(hasAnyFilter({comment: true})).toBe(true);
            expect(hasAnyFilter({redline: true})).toBe(true);
        });

        it("checkShowElement returns true when no filters are active", () => {
            const filters = {filterElementIdMap: {}};
            expect(checkShowElement("e1", {}, {}, filters)).toBe(true);
        });

        it("checkShowElement honors filterElementIdMap", () => {
            const filters = {filterElementIdMap: {e1: true}};
            expect(checkShowElement("e1", {}, {}, filters)).toBe(true);
            expect(checkShowElement("e2", {}, {}, filters)).toBe(false);
        });

        it("checkShowElement matches on tag filters", () => {
            const filters = {filterElementIdMap: {}, tag_ids: ["t1"]};
            expect(checkShowElement("e1", {tag_ids: ["t1"]}, {}, filters)).toBe(true);
            expect(checkShowElement("e1", {tag_ids: ["other"]}, {}, filters)).toBe(false);
        });

        it("checkShowElement matches on conversation-based filters", () => {
            const conversations = {c1: {type: "COMMENT", status: "UNRESOLVED"}};
            expect(checkShowElement("e1", {}, conversations, {filterElementIdMap: {}, comment: true})).toBe(true);
            expect(checkShowElement("e1", {}, conversations, {filterElementIdMap: {}, unresolved: true})).toBe(true);
            expect(checkShowElement("e1", {}, conversations, {filterElementIdMap: {}, resolved: true})).toBe(false);
        });

        it("checkShowElement returns false without an elementId", () => {
            expect(checkShowElement(null, {}, {}, {filterElementIdMap: {}})).toBe(false);
        });

        it("getFilteredElementIds keeps only elements passing the filter", () => {
            const state = {
                elements: {
                    e1: {tag_ids: ["t1"]},
                    e2: {tag_ids: ["other"]}
                },
                elemFilters: {filterElementIdMap: {}, tag_ids: ["t1"]}
            };
            const rootState = {comments: {conversations: {}}};
            expect(getFilteredElementIds(["e1", "e2"], state, rootState)).toEqual(["e1"]);
        });
    });

    describe("viewport helpers", () => {
        const buildState = () => ({
            viewportSize: 3,
            viewportPageSize: 2,
            viewportTopPointer: 0,
            filteredElementIds: ["a", "b", "c", "d", "e", "f"],
            elements: {a: {}, b: {}, c: {}, d: {}, e: {}, f: {}},
            scrollToElement: null
        });

        it("setScrollToElementIdFunc positions the viewport and records the target", () => {
            const state = buildState();
            setScrollToElementIdFunc(state, {id: "e"});
            expect(state.viewportTopPointer).toBeGreaterThanOrEqual(0);
            expect(state.scrollToElement.elementId).toBe("e");
        });

        it("setScrollToElementIdFunc leaves state unchanged for unknown id", () => {
            const state = buildState();
            setScrollToElementIdFunc(state, {id: "zzz"});
            expect(state.scrollToElement).toBeNull();
        });

        it("pageElementsFunc scrolls up and down within bounds", () => {
            const state = buildState();
            state.viewportTopPointer = 3;
            pageElementsFunc(state, {scrollDirection: "up"});
            expect(state.viewportTopPointer).toBe(1);

            pageElementsFunc(state, {scrollDirection: "down"});
            expect(state.viewportTopPointer).toBe(3);

            // clamp at bottom
            pageElementsFunc(state, {scrollDirection: "down"});
            expect(state.viewportTopPointer).toBe(state.filteredElementIds.length - state.viewportSize);
        });

        it("hasAdditionalElementsBeforeFunc/AfterFunc detect off-screen elements", () => {
            const state = buildState();
            state.viewportTopPointer = 2;
            expect(hasAdditionalElementsBeforeFunc(state)).toBe(true);
            expect(hasAdditionalElementsAfterFunc(state)).toBe(true);

            state.viewportTopPointer = 0;
            expect(hasAdditionalElementsBeforeFunc(state)).toBe(false);
        });

        it("getFilteredElementsFunc returns a viewport-sized slice", () => {
            const state = buildState();
            const elems = getFilteredElementsFunc(state);
            expect(elems.length).toBe(state.viewportSize);
        });
    });

    describe("custom script + outline helpers", () => {
        it("resetCustomScriptEntry clears inputs/outputs to defaults", () => {
            const entry = {
                entry_inputs: [{value: "x", default_value: "d"}, {value: "y"}],
                entry_outputs: [{value: "out"}],
                entry_output_array: {outputs: [1, 2]}
            };
            resetCustomScriptEntry(entry);
            expect(entry.entry_inputs[0].value).toBe("d");
            expect(entry.entry_inputs[1].value).toBe("");
            expect(entry.entry_outputs[0].hasOwnProperty("value")).toBe(false);
            expect(entry.entry_output_array.outputs).toEqual([]);
        });

        it("constructCollapseMap collects collapsed flags recursively", () => {
            const parent = {
                s1: {collapsed: true, children: {s2: {collapsed: false}}}
            };
            const collapseMap = {};
            constructCollapseMap(parent, collapseMap);
            expect(collapseMap.s1).toBe(true);
            expect(collapseMap.s2).toBe(false);
        });

        it("collapseToggle sets collapsed on section elements recursively", () => {
            const parent = {
                s1: {
                    elem_type: "SECTION",
                    collapsed: false,
                    children: {s2: {elem_type: "PROCEDURE_SECTION", collapsed: false}}
                },
                st: {elem_type: "STEP"}
            };
            collapseToggle(parent, true);
            expect(parent.s1.collapsed).toBe(true);
            expect(parent.s1.children.s2.collapsed).toBe(true);
            expect(parent.st.collapsed).toBeUndefined();
        });

        it("getOutlineStructureFunc builds a nested structure with collapse state", () => {
            const elementObjs = {
                s1: {elem_id: "s1", parent_id: "", number: "1"},
                s2: {elem_id: "s2", parent_id: "s1", number: "1-1"}
            };
            const structure = getOutlineStructureFunc({}, elementObjs, ["s1", "s2"]);
            expect(structure.s1).toBeDefined();
            expect(structure.s1.children.s2).toBeDefined();
            expect(structure.s1.collapsed).toBe(false);
        });

        it("getOutline/getOutlineFromItem find nested outline items", () => {
            const outline = {
                s1: {elem_id: "s1", children: {s2: {elem_id: "s2", children: {}}}}
            };
            expect(getOutline(outline, "s1").elem_id).toBe("s1");
            expect(getOutline(outline, "s2").elem_id).toBe("s2");
            expect(getOutline(outline, "missing")).toBeUndefined();
            expect(getOutlineFromItem(outline.s1, "s2").elem_id).toBe("s2");
        });

        it("toggleOutlineCollapsedFunc toggles a single outline item", () => {
            const state = {
                outlinePrecomputed: {s1: {elem_id: "s1", collapsed: false, children: {}}}
            };
            toggleOutlineCollapsedFunc(state, {elementId: "s1"});
            expect(state.outlinePrecomputed.s1.collapsed).toBe(true);
        });

        it("toggleOutlineCollapsedAllFunc toggles all section items", () => {
            const state = {outlinePrecomputed: {}};
            const obj = {s1: {elem_type: "SECTION", collapsed: false, children: {}}};
            toggleOutlineCollapsedAllFunc(state, obj, true);
            expect(state.outlinePrecomputed.s1.collapsed).toBe(true);
        });

        it("getSectionChildElemIds collects descendant ids of a section", () => {
            const section = {
                elem_type: "SECTION",
                children: {
                    c1: {elem_id: "c1", elem_type: "STEP"},
                    c2: {
                        elem_id: "c2",
                        elem_type: "SECTION",
                        children: {c3: {elem_id: "c3", elem_type: "STEP"}}
                    }
                }
            };
            const ids = [];
            getSectionChildElemIds(section, ids);
            expect(ids).toContain("c1");
            expect(ids).toContain("c2");
            expect(ids).toContain("c3");
        });
    });

    describe("copy selection helpers", () => {
        // Outline whose top-level section has a child, for single add/remove.
        const outlineWithChild = {
            s1: {
                elem_id: "s1",
                elem_type: "SECTION",
                children: {c1: {elem_id: "c1", elem_type: "STEP"}}
            }
        };

        // Flat outline (no children) so range selection tracks ids cleanly.
        const flatOutline = {
            s1: {elem_id: "s1", elem_type: "SECTION", children: {}},
            s2: {elem_id: "s2", elem_type: "SECTION", children: {}},
            s3: {elem_id: "s3", elem_type: "SECTION", children: {}}
        };

        it("addCopyElemIds adds an element and its section children", () => {
            const map = {};
            addCopyElemIds("s1", outlineWithChild, map);
            expect(map.s1).toBe("s1");
            expect(map.c1).toBe("c1");
        });

        it("removeCopyElemIds removes an element and its children", () => {
            const map = {s1: "s1", c1: "c1"};
            removeCopyElemIds("s1", outlineWithChild, map);
            expect(map.hasOwnProperty("s1")).toBe(false);
            expect(map.hasOwnProperty("c1")).toBe(false);
        });

        it("addCopyElemIdsRange selects forward from the last selection", () => {
            const ids = ["s1", "s2", "s3"];
            const map = {};
            addCopyElemIds("s1", flatOutline, map);
            addCopyElemIdsRange("s3", ids, flatOutline, map);
            expect(map.s2).toBe("s2");
            expect(map.s3).toBe("s3");
        });

        it("addCopyElemIdsRange with no prior selection selects a single element", () => {
            const ids = ["s1", "s2", "s3"];
            const map = {};
            addCopyElemIdsRange("s2", ids, flatOutline, map);
            expect(map.s2).toBe("s2");
            expect(map.hasOwnProperty("s1")).toBe(false);
        });

        it("removeCopyElemIdsRange removes backward toward the last selection", () => {
            const ids = ["s1", "s2", "s3"];
            const map = {s1: "s1", s2: "s2", s3: "s3"};
            removeCopyElemIdsRange("s1", ids, flatOutline, map);
            expect(map.hasOwnProperty("s1")).toBe(false);
            expect(map.hasOwnProperty("s2")).toBe(false);
            expect(map.s3).toBe("s3");
        });
    });

    describe("notification + diff helpers", () => {
        it("handleErrorNotification commits on error status and returns true", () => {
            const commits = [];
            const commit = (type, payload) => commits.push({type, payload});
            const result = handleErrorNotification(500, {message: "boom", details: "d"}, commit);
            expect(result).toBe(true);
            expect(commits.length).toBe(1);
            expect(commits[0].type).toBe("receiveNotification");
            expect(commits[0].payload.level).toBe("ERROR");
        });

        it("handleErrorNotification does nothing for success status", () => {
            const commit = jasmine.createSpy("commit");
            expect(handleErrorNotification(200, {}, commit)).toBe(false);
            expect(commit).not.toHaveBeenCalled();
        });

        it("diffElems reports no diff for identical inputs", () => {
            const input = {foo: "bar"};
            const {isSame} = diffElems("CMD", deepCopy(input), deepCopy(input), "t", "t", "d", "d");
            expect(isSame).toBe(true);
        });

        it("diffElems reports changed/added/deleted fields and title", () => {
            const input1 = {foo: "bar", removeMe: 1};
            const input2 = {foo: "baz", addMe: 2};
            const {elemDiff1, elemDiff2, isSame} = diffElems("CMD", input1, input2, "t1", "t2", "d", "d");
            expect(isSame).toBe(false);
            expect(elemDiff1["execution_user_input.foo"]).toBe("CD");
            expect(elemDiff2["execution_user_input.foo"]).toBe("CA");
            expect(elemDiff1["execution_user_input.removeMe"]).toBe("D");
            expect(elemDiff2["execution_user_input.addMe"]).toBe("A");
            expect(elemDiff1.title).toBe("CD");
            expect(elemDiff2.title).toBe("CA");
        });
    });
});

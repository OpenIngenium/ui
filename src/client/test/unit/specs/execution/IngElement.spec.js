import { shallow } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import IngElement from "../../../../src/modules/elements/IngElement.vue";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop.js';
import nonExecutable from '../../../../src/modules/elements/non-executable/index';
import executionStore from "../../../../src/modules/execution/execution-store";
import executionNestableMixin from "../../../../src/modules/elements/mixins/execution-nestable-mixin";
import CommentsStore from "../../../../src/modules/common/comments-store";

const executionIngElement = Vue.component('ing-element', Vue.extend(executionNestableMixin).extend(IngElement));


const {
    elementsByParent,
    childIdsByParent,
    currentStepId,
    elementViewStateKey,
    elementKey,
    executionMetaDataKey,
    executionRedlineInputKey,
    directionalUnExecutedElement,
    procedureDetails,
    executionInputKey,
    modStyle,
} = executionStore.getters;

const {
    conversations,
} = CommentsStore.getters;

// TODO refactor to use createLocalVue
Vue.use(Vuex);
Vue.directive('drag-and-drop', DragAndDrop);
Vue.component('section-element', nonExecutable.SectionElement);
Vue.component('ing-spinner', sinon.stub());

describe("IngElement.vue", () => {
    let getters;
    let actions;
    let store;
    let $route;
    let stubs;

    beforeEach(() => {
        getters = {
            currentStepId,
            elementsByParent,
            childIdsByParent,
            elementViewStateKey,
            elementKey,
            executionMetaDataKey,
            executionRedlineInputKey,
            directionalUnExecutedElement,
            procedureDetails,
            conversations,
            executionInputKey,
            modStyle,
        };

        actions = {
            removeElement: sinon.spy(),
            setElementViewStateDetailLevel: sinon.spy()
        };

        store = new Vuex.Store({
            state: {
                activeExecutableElement: undefined,
                elemModificationMap: {},
                executionMetaDataKey: {
                    meta_data: {
                        status: "RUNNING",
                        status_message: "batman wuz here"
                    }
                },
                execution: {
                    meta_data: {
                        status: "RUNNING",
                        status_message: "batman wuz here"
                    },
                    venue: {
                        venue_status: {
                            execution_id: "abc123"
                        }
                    }
                },
                elementIds: [
                    "40d45377-6c30-426d-9d64-2c187d9854d1",
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9",
                    "6774195b-7b31-48f6-aeed-f440e5697c81"
                ],
                elements: {
                    "40d45377-6c30-426d-9d64-2c187d9854d1": {
                        description:"",
                        elem_id:"40d45377-6c30-426d-9d64-2c187d9854d1",
                        elem_type:"SECTION",
                        executed:undefined,
                        execution_id:"m2020-ingenium-10151",
                        execution_user_input:undefined,
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        number:"1-1",
                        parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        specification:undefined,
                        step_type:undefined,
                        title:"",
                        procedure_title:"",
                    },
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9": {
                        description:"",
                        elem_id:"8d09e115-e5e3-4dbb-becd-a61685e82aa9",
                        elem_type:"STEP",
                        executed:false,
                        execution_id:"m2020-ingenium-10151",
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        execution_user_input: undefined,
                        number:"1-2",
                        parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        specification: undefined,
                        step_type:"CMD_SSE",
                        title:"",
                        procedure_title:"",
                    },
                    "6774195b-7b31-48f6-aeed-f440e5697c81": {
                        description:"",
                        elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        elem_type:"SECTION",
                        executed:undefined,
                        execution_id:"abc123",
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        execution_user_input:undefined,
                        number:"1",
                        parent_id:"",
                        title:"",
                        procedure_title:"",
                    }
                },
                conversations: {
                    "40d45377-6c30-426d-9d64-2c187d9854d1": [],
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9": [],
                    "6774195b-7b31-48f6-aeed-f440e5697c81": [],
                },
                parentToChildren: {
                    "": [
                        {
                            description:"",
                            elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                            elem_type:"SECTION",
                            executed:undefined,
                            execution_id:"abc123",
                            execution: {
                                meta_data: {
                                    status: "RUNNING",
                                    status_message: "batman wuz here"
                                }
                            },
                            execution_user_input:undefined,
                            number:"1",
                            parent_id:"",
                            title:"",
                            procedure_title:"",
                        }
                    ],
                    "40d45377-6c30-426d-9d64-2c187d9854d1": [],
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9": [],
                    "6774195b-7b31-48f6-aeed-f440e5697c81": [
                        {
                            description:"",
                            elem_id:"40d45377-6c30-426d-9d64-2c187d9854d1",
                            elem_type:"SECTION",
                            executed:undefined,
                            execution_id:"m2020-ingenium-10151",
                            execution_user_input:undefined,
                            execution: {
                                meta_data: {
                                    status: "RUNNING",
                                    status_message: "batman wuz here"
                                }
                            },
                            number:"1-1",
                            parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                            specification:undefined,
                            step_type:undefined,
                            title:"",
                            procedure_title:"",
                        },
                        {
                            description:"",
                            elem_id:"8d09e115-e5e3-4dbb-becd-a61685e82aa9",
                            elem_type:"STEP",
                            executed:false,
                            execution_id:"m2020-ingenium-10151",
                            execution: {
                                meta_data: {
                                    status: "RUNNING",
                                    status_message: "batman wuz here"
                                }
                            },
                            execution_user_input: undefined,
                            number:"1-2",
                            parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                            specification: undefined,
                            step_type:"CMD_SSE",
                            title:"",
                            procedure_title:"",
                        }
                    ],
                },
                elementMap: {
                    'SECTION': {
                        name: 'SECTION',
                        displayName: 'Section',
                        paletteGroup: 'Organization',
                        comp: 'section-element',
                        category: 'organization',
                        path: 'sections',
                        isNestable: true
                    },
                    'CMD_SSE': {
                        name: 'CMD_SSE',
                        displayName: 'CmdSSE',
                        paletteGroup: 'Commands',
                        comp: undefined,
                        category: 'executable',
                        path: 'cmd_sse_steps',
                        isNestable: false
                    }
                },
                elementsViewState: {
                    "40d45377-6c30-426d-9d64-2c187d9854d1": {
                        loading: false
                    },
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9": {
                        loading: false
                    },
                    "6774195b-7b31-48f6-aeed-f440e5697c81": {
                        loading: false
                    },
                    "no kids here": {
                        loading: false
                    }
                },
                elementKey: {

                }
            },
            actions,
            getters
        });

        $route = {
            path: 'execute_spa/1/executionID/',
            params: {
                executionId: 'executionId'
            }
        };

        stubs = {
            'ing-redline': true,
            'font-awesome-icon': true,
            'execution-toolbar': true,
            'execution-status-dot': true,
            'ing-editable': true,
            'ing-comment-editor': true,
            'ing-comments': true,
            'view-state-buttons': true,
            'ing-editable-froala': true,
            'execution-step-error': true,
            'execution-status': true,
        };
    });

    it("Toggles the step view state", () => {
        const wrapper = shallow(executionIngElement, {
            propsData: {
                elementMap: {
                    name: 'SECTION',
                    displayName: 'Section',
                    paletteGroup: 'Organization',
                    comp: 'section-element',
                    category: 'organization',
                    path: 'sections',
                    isNestable: true
                },
                stepData: {
                    description:"",
                    elem_id:"8d09e115-e5e3-4dbb-becd-a61685e82aa9",
                    elem_type:"SECTION",
                    executed:undefined,
                    execution: {
                        meta_data: {
                            status: "RUNNING",
                            status_message: "batman wuz here"
                        }
                    },
                    execution_id:"abc123",
                    execution_user_input:undefined,
                    number:"1",
                    parent_id:"",
                    title:"",
                    procedure_title:"",
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        sinon.spy(wrapper.vm, 'setElementViewStateDetailLevel');

        wrapper.vm.setViewState(1);
        expect(wrapper.vm.setElementViewStateDetailLevel.calledOnce).toBeTruthy();
        expect(wrapper.vm.setElementViewStateDetailLevel.calledWith({elementId: "8d09e115-e5e3-4dbb-becd-a61685e82aa9", detailLevel: 1})).toBeTruthy();
        wrapper.vm.setViewState(2);
        expect(wrapper.vm.setElementViewStateDetailLevel.calledTwice).toBeTruthy();
        expect(wrapper.vm.setElementViewStateDetailLevel.calledWith({elementId: "8d09e115-e5e3-4dbb-becd-a61685e82aa9", detailLevel: 2})).toBeTruthy();
    });
    it("Triggers a step deletion on button click", () => {
        const wrapper = shallow(executionIngElement, {
            propsData: {
                elementMap: {
                    name: 'SECTION',
                    displayName: 'Section',
                    paletteGroup: 'Organization',
                    comp: 'section-element',
                    category: 'organization',
                    path: 'sections',
                    isNestable: true
                },
                stepData: {
                    description:"",
                    elem_id:"40d45377-6c30-426d-9d64-2c187d9854d1",
                    elem_type:"SECTION",
                    executed:undefined,
                    execution: {
                        meta_data: {
                            status: "RUNNING",
                            status_message: "batman wuz here"
                        }
                    },
                    execution_id:"abc123",
                    execution_user_input:undefined,
                    number:"1",
                    parent_id:"",
                    title:"",
                    procedure_title:"",
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        sinon.spy(wrapper.vm, 'removeElement');
        wrapper.vm.removeElementCallback();
        expect(wrapper.vm.removeElement.calledOnce).toBeTruthy();
    });

});

// NOTE: This block previously hung the whole prod suite. build() mounts the full
// IngElement; with vue-test-utils@beta.14 the real <ing-tag-inline> child rendered
// and entered an infinite Vue re-render loop (dev-mode has an update-loop guard;
// production does not, so it hung forever). Fixed by forcing explicit inert child
// stubs below, which is safe because these are vm-only (computed/method) assertions.
describe("IngElement.vue redline/consistency computeds", () => {
    const ELEM_ID = "computed-elem-1";
    const $route = {path: "execute_spa/1/executionID/", params: {executionId: "executionId"}};
    const inert = {render(h) { return h("div"); }};
    const stubs = {
        "ing-redline": inert, "font-awesome-icon": inert, "execution-toolbar": inert,
        "execution-status-dot": inert, "ing-editable": inert, "ing-conversations": inert,
        "view-state-buttons": inert, "ing-editable-froala": inert, "execution-step-error": inert,
        "execution-status": inert, "ing-tag-inline": inert, "ing-modal": inert,
        "ing-element": inert, "section-element": inert, "ing-spinner": inert
    };

    function build({keys = {}, redline = {}, step = {}, elementMap, mode = "execution", canParticipate = true} = {}) {
        const elementKeys = {
            procedure_title: "", procedure_modification_status: "NONE", number: "1",
            executed: false, executable: "", consistency_flag: "CONSISTENT", run_for_score: false,
            ...keys
        };
        const actionSpies = {
            setPending: sinon.spy(), toggleAllEntryViewState: sinon.spy(), updateElement: sinon.spy(),
            saveElementInput: sinon.spy(), setElementViewStateDetailLevel: sinon.spy(), modifyElement: sinon.spy(),
            addProcedureElementTag: sinon.spy(), removeProcedureElementTag: sinon.spy(), addCutElemId: sinon.spy(),
            addCopyElemId: sinon.spy(), removeCopyElemId: sinon.spy(), removeCutElemId: sinon.spy(),
            addElemIdRange: sinon.spy(), addCutElemIdRange: sinon.spy(), removeCutElemIdRange: sinon.spy(),
            setCopyParams: sinon.spy(), resetElementSelections: sinon.spy(), resetCutParams: sinon.spy(),
            saveBulkRedlineElementIds: sinon.spy(), toggleRedlineDiffElement: sinon.spy(),
            loadReplaceElementSource: sinon.spy(), replaceElement: sinon.spy(), hasSelectedElements: sinon.spy(),
            hasSelectedElementsForThis: sinon.spy(), fetchStepPaletteBuiltIn: sinon.spy(), fetchStepPaletteCustom: sinon.spy(),
            removeElement: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                elementKey: () => (id, key) => elementKeys[key],
                executionRedlineInputKey: () => (id, key) => redline[key],
                executionMetaDataKey: () => () => undefined,
                executionMetaData: () => () => ({}),
                conversations: () => () => ({}),
                modStyle: () => () => "",
                elementsByParent: () => () => [],
                elemDiffsShown: () => () => false,
                canBulkRedlineElement: () => () => true,
                elementViewStateKey: () => () => 1,
                elementViewState: () => () => ({detailLevel: 1}),
                executionInputKey: () => () => undefined,
                isPending: () => false,
                execution: () => ({status: "IDLE"}),
                currentStepId: () => "",
                mode: () => mode,
                canParticipate: () => canParticipate,
                isTestConductor: () => true,
                debugEnabled: () => false,
                anyFilter: () => false,
                hasReplaceElementSource: () => false,
                replaceElementSource: () => ({}),
                bulkRedlineElementIds: () => [],
                elemDiffs: () => ({}),
                copyParams: () => ({}),
                procedureDetails: () => ({}),
                procedureTagsObj: () => ({}),
                executionTags: () => ({}),
                stepPaletteBuiltIn: () => [],
                stepPaletteCustom: () => [],
                elementIds: () => [],
                copyElemIdMap: () => ({}),
                fetchOutlinePrecomputed: () => ({}),
                tag: () => () => ({})
            },
            actions: actionSpies
        });
        const wrapper = shallow(executionIngElement, {
            propsData: {
                elementMap: elementMap || {name: "STEP", displayName: "Step", category: "executable", comp: undefined, path: "steps", isNestable: false},
                stepData: {elem_id: ELEM_ID, elem_type: "STEP", execution_id: "exec1", execution: {meta_data: {}}, number: "1", parent_id: "", title: "", ...step}
            },
            provide: {mode},
            store,
            mocks: {$route},
            stubs
        });
        return {wrapper, actionSpies};
    }

    it("showModify is true only for ORIGINAL/MODIFIED", () => {
        expect(build({keys: {procedure_modification_status: "ORIGINAL"}}).wrapper.vm.showModify).toBe(true);
        expect(build({keys: {procedure_modification_status: "NONE"}}).wrapper.vm.showModify).toBe(false);
    });

    it("showRedBlue and showRedlineDiffToggle reflect modifying statuses", () => {
        const modifying = build({keys: {procedure_modification_status: "MODIFYING"}}).wrapper.vm;
        expect(modifying.showRedBlue).toBe(true);
        expect(modifying.showRedlineDiffToggle).toBe(true);
        expect(build({keys: {procedure_modification_status: "NONE"}}).wrapper.vm.showRedBlue).toBe(false);
    });

    it("showRedlineBulkSelection requires an active, unexecuted modification", () => {
        expect(build({keys: {procedure_modification_status: "ADDED"}}).wrapper.vm.showRedlineBulkSelection).toBe(true);
        expect(build({keys: {procedure_modification_status: "ORIGINAL"}}).wrapper.vm.showRedlineBulkSelection).toBe(false);
    });

    it("lockUnlockIcon depends on status and approval", () => {
        expect(build({keys: {procedure_modification_status: "NONE"}}).wrapper.vm.lockUnlockIcon).toBe(true);
        expect(build({keys: {procedure_modification_status: "MODIFYING"}, redline: {"approval.status": "APPROVED"}}).wrapper.vm.lockUnlockIcon).toBe(false);
    });

    it("clearForExecution reflects status and approval", () => {
        expect(build({keys: {procedure_modification_status: "NONE"}}).wrapper.vm.clearForExecution).toBe(true);
        expect(build({keys: {procedure_modification_status: "MODIFIED"}}).wrapper.vm.clearForExecution).toBe(false);
        expect(build({keys: {procedure_modification_status: "ADDED"}, redline: {"approval.status": "APPROVED"}}).wrapper.vm.clearForExecution).toBe(true);
    });

    it("approval-related computeds read the redline input", () => {
        const vm = build({redline: {"approval.status": "APPROVED", "justification.modification_type": "REDLINE"}}).wrapper.vm;
        expect(vm.showApprovalCheckmark).toBe(true);
        expect(vm.redBlueLineClass).toBe("redline");
        expect(vm.redBlueLine).toBe("Redline");
    });

    it("consistency flag computeds classify the flag", () => {
        const vm = build({keys: {consistency_flag: "SPEC_HASH_MISMATCHED"}}).wrapper.vm;
        expect(vm.showConsistencyFlag).toBe(true);
        expect(vm.consistencyFlagLabel).toBe("STEP MODIFIED");
        expect(vm.consistencyFlagClass).toBe("consistency-flag-error");
        expect(vm.consistencyFlagIconClass).toContain("glyphicon-warning-sign");
        expect(vm.showAutoSelectCustomScriptButton).toBe(true);
    });

    it("LEGACY consistency flag uses the warning class", () => {
        const vm = build({keys: {consistency_flag: "LEGACY"}}).wrapper.vm;
        expect(vm.consistencyFlagClass).toBe("consistency-flag-warning");
    });

    it("elementColor maps element category", () => {
        expect(build({elementMap: {category: "organization", comp: undefined, path: "s"}}).wrapper.vm.elementColor).toBe("#31708f");
        expect(build({elementMap: {category: "non_executable", comp: undefined, path: "s"}}).wrapper.vm.elementColor).toBe("#8a6d3b");
        expect(build({elementMap: {category: "executable", comp: undefined, path: "s"}}).wrapper.vm.elementColor).toBe("#3c763d");
    });

    it("noEntryElement recognizes entry-less step types", () => {
        expect(build({step: {step_type: "QUERY_EVR"}}).wrapper.vm.noEntryElement).toBe(true);
        expect(build({step: {step_type: "CMD_SSE"}}).wrapper.vm.noEntryElement).toBe(false);
    });

    it("isElementSection and redlinedProcedureSection reflect element type", () => {
        expect(build({step: {elem_type: "SECTION"}}).wrapper.vm.isElementSection).toBe(true);
        const rp = build({step: {elem_type: "PROCEDURE_SECTION", procedure_modification_status: "MODIFYING"}}).wrapper.vm;
        expect(rp.redlinedProcedureSection).toBe(true);
    });

    it("breakpointClass reflects an active breakpoint", () => {
        expect(build({step: {break_point: "ACTIVE"}}).wrapper.vm.breakpointClass).toContain("active_breakpoint");
        expect(build({step: {break_point: "NONE"}}).wrapper.vm.breakpointClass).toBe("step_breakpoint");
    });

    it("toggleRedBlue and toggleComments flip local flags", () => {
        const wrapper = build().wrapper;
        expect(wrapper.vm.showRedBlueline).toBe(false);
        wrapper.vm.toggleRedBlue();
        expect(wrapper.vm.showRedBlueline).toBe(true);
        wrapper.vm.toggleComments({y: 0});
        expect(wrapper.vm.showComments).toBe(true);
    });

    it("updateTitle and updateDescription dispatch updateElement", () => {
        const {wrapper, actionSpies} = build();
        wrapper.vm.updateTitle("New Title");
        wrapper.vm.updateDescription("New Desc");
        expect(actionSpies.updateElement.firstCall.args[1].element).toEqual({title: "New Title"});
        expect(actionSpies.updateElement.secondCall.args[1].element).toEqual({description: "New Desc"});
    });

    it("setBreakpoint toggles the breakpoint via updateElement", () => {
        const {wrapper, actionSpies} = build({step: {break_point: "NONE"}});
        wrapper.vm.setBreakpoint();
        expect(actionSpies.updateElement.lastCall.args[1].element).toEqual({break_point: "ACTIVE"});
    });

    it("toggleRedlineDiff dispatches toggleRedlineDiffElement", () => {
        const {wrapper, actionSpies} = build();
        wrapper.vm.toggleRedlineDiff();
        expect(actionSpies.toggleRedlineDiffElement.lastCall.args[1]).toEqual({modifyingElementId: ELEM_ID});
    });

    it("handleModify dispatches modifyElement and manages the lock", async() => {
        const {wrapper, actionSpies} = build();
        await wrapper.vm.handleModify();
        expect(actionSpies.modifyElement.lastCall.args[1]).toEqual({elementId: ELEM_ID});
        expect(wrapper.vm.lockModifyButton).toBe(false);
    });

    it("handleRedlineStepSelection adds the element to the bulk selection", () => {
        const {wrapper, actionSpies} = build();
        wrapper.vm.handleRedlineStepSelection();
        expect(actionSpies.saveBulkRedlineElementIds.lastCall.args[1]).toEqual([ELEM_ID]);
    });

    it("handleRemoveElement removes non-section elements immediately", async() => {
        const {wrapper, actionSpies} = build({step: {elem_type: "STEP"}});
        await wrapper.vm.handleRemoveElement(false);
        expect(actionSpies.removeElement.called).toBe(true);
    });

    it("handleRemoveElement asks for confirmation on sections", async() => {
        const {wrapper} = build({step: {elem_type: "SECTION"}});
        await wrapper.vm.handleRemoveElement(false);
        expect(wrapper.vm.confirmRemoveElement).toBe(true);
    });
});

import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import Vue from "vue";
import Vuex from "vuex";

import IngRedline from "../../../../src/modules/elements/IngRedline.vue";
import IngElement from "../../../../src/modules/elements/IngElement.vue";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop.js';
import nonExecutable from '../../../../src/modules/elements/non-executable/index';
import executionStore from "../../../../src/modules/execution/execution-store";
import executionNestableMixin from "../../../../src/modules/elements/mixins/execution-nestable-mixin";

const executionIngElement = Vue.component('ing-element', Vue.extend(executionNestableMixin).extend(IngElement));

const {
    elementsByParent,
    activeExecutableElement,
    elementViewStateKey,
    executionRedlineInputKey,
    elementKey,
    executionMetaDataKey,
    directionalUnExecutedElement,
} = executionStore.getters;

Vue.use(Vuex);
Vue.directive('drag-and-drop', DragAndDrop);
Vue.component('section-element', nonExecutable.SectionElement);
Vue.component('ing-spinner', sinon.stub());
Vue.component('ing-redline', IngRedline);

describe("IngRedline.vue", () => {
    let actions;
    let getters;
    let store;
    let $route;

    beforeEach(() => {
        getters = {
            activeExecutableElement,
            elementsByParent,
            elementViewStateKey,
            //ing-redline
            executionRedlineInputKey,
            elementKey,
            executionMetaDataKey,
            directionalUnExecutedElement
        };

        actions = {
            removeElement: sinon.spy(),
            setElementViewStateDetailLevel: sinon.spy(),
            //ing-redline
            saveJustificationElement: sinon.spy(),
            saveApproavalElement: sinon.spy(),
            discardRedlineElement: sinon.spy(),
        };

        store = new Vuex.Store({
            state: {
                activeExecutableElement: undefined,
                executionRedlineInputKey: undefined,
                elementKey: undefined,
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
                        executed:false,
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        execution_id:"m2020-ingenium-10151",
                        execution_user_input:{},
                        procedure_modification: {
                            approval: {
                                content: "nice!",
                                status: "APPROVED",
                                time_updated: "2018-12-17T19:40:42.838Z",
                                user_name: "batman"
                            },
                            justification: {
                                content: "looks good!",
                                modification_type: "BLUELINE",
                                time_updated: "2018-12-17T19:40:44.161Z",
                                user_name: "batman"
                            }
                        },
                        number:"1-1",
                        parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        specification: {},
                        step_type:"",
                        title:"",
                        run_for_score: true,
                        procedure_modification_status: "ORIGINAL",
                        procedure_title: "procedure_section 1",
                        procedure_section_id: "6774195b-7b31-48f6-aeed-f440e5697c81",
                    },
                    "8d09e115-e5e3-4dbb-becd-a61685e82aa9": {
                        description:"",
                        elem_id:"8d09e115-e5e3-4dbb-becd-a61685e82aa9",
                        elem_type:"STEP",
                        executed:false,
                        execution_id:"m2020-ingenium-10151",
                        execution_user_input: {},
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        number:"1-2",
                        parent_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        specification: {},
                        step_type:"CMD_SSE",
                        title:"",
                        procedure_modification: {
                            approval: {
                                content: "nice!",
                                status: "APPROVED",
                                time_updated: "2018-12-17T19:40:42.838Z",
                                user_name: "batman"
                            },
                            justification: {
                                content: "looks good!",
                                modification_type: "BLUELINE",
                                time_updated: "2018-12-17T19:40:44.161Z",
                                user_name: "batman"
                            }
                        },
                        run_for_score: true,
                        procedure_modification_status: "ORIGINAL",
                        procedure_title: "procedure_section 1",
                        procedure_section_id: "6774195b-7b31-48f6-aeed-f440e5697c81",
                    },
                    "6774195b-7b31-48f6-aeed-f440e5697c81": {
                        description:"",
                        elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        elem_type:"PROCEDURE_SECTION",
                        executed:false,
                        execution: {
                            meta_data: {
                                status: "RUNNING",
                                status_message: "batman wuz here"
                            }
                        },
                        execution_id:"abc123",
                        execution_user_input:{},
                        number:"1",
                        parent_id:"",
                        title:"procedure_section 1",
                        run_for_score: false,
                        procedure_modification_status: "NONE",
                    }
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
    });

    xit("shows redline vs blueline text", () => {
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
                    elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                    elem_type:"SECTION",
                    executed:false,
                    execution_id:"abc123",
                    execution_user_input:{},
                    number:"1",
                    parent_id:"",
                    title:"",
                    execution: {
                        meta_data: {
                            status: "RUNNING",
                            status_message: "batman wuz here"
                        }
                    },
                    procedure_modification: {
                        approval: {
                            content: "nice!",
                            status: "APPROVED",
                            time_updated: "2018-12-17T19:40:42.838Z",
                            user_name: "batman"
                        },
                        justification: {
                            content: "looks good!",
                            modification_type: "BLUELINE",
                            time_updated: "2018-12-17T19:40:44.161Z",
                            user_name: "batman"
                        }
                    },
                    run_for_score: true,
                    procedure_modification_status: "ORIGINAL",
                    procedure_title: "procedure_section 1",
                    procedure_section_id: "6774195b-7b31-48f6-aeed-f440e5697c81"
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: {
                "font-awesome-icon": true,
                "execution-toolbar": true,
                "execution-status-dot": true,
                "ing-editable": true,
                "ing-comment-editor": true,
                "ing-comments": true,
                "view-state-buttons": true,
                "ing-editable-froala": true,
                "execution-step-error": true,
                "execution-status": true,
            }
        });

        expect(wrapper.vm.showRedBlue).toBe(false);
    });

    xit("shows approve/reject and redline/blueline button", () => {
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
                    elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                    elem_type:"SECTION",
                    executed:true,
                    execution_id:"abc123",
                    execution_user_input:{},
                    number:"1",
                    parent_id:"",
                    title:"",
                    execution: {
                        meta_data: {
                            status: "RUNNING",
                            status_message: "batman wuz here"
                        }
                    },
                    procedure_modification: {
                        approval: {
                            content: "nice!",
                            status: "APPROVED",
                            time_updated: "2018-12-17T19:40:42.838Z",
                            user_name: "batman"
                        },
                        justification: {
                            content: "looks good!",
                            modification_type: "BLUELINE",
                            time_updated: "2018-12-17T19:40:44.161Z",
                            user_name: "batman"
                        }
                    },
                    run_for_score: true,
                    procedure_modification_status: "ORIGINAL",
                    procedure_title: "procedure_section 1",
                    procedure_section_id: "6774195b-7b31-48f6-aeed-f440e5697c81"
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: {
                "font-awesome-icon": true,
                "execution-toolbar": true,
                "execution-status-dot": true,
                "ing-editable": true,
                "ing-comment-editor": true,
                "ing-comments": true,
                "view-state-buttons": true,
                "ing-editable-froala": true,
                "execution-step-error": true,
                "execution-status": true,
            }
        });

        expect(wrapper.vm.isRedline).toBe(undefined);
    });
});

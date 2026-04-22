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
    currentStepId,
    elementViewStateKey,
    elementKey,
    executionMetaDataKey,
    executionRedlineInputKey,
    directionalUnExecutedElement,
    procedureDetails,
    executionInputKey,
    selectedCopyElement,
    selectedCutElement 
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
            elementViewStateKey,
            elementKey,
            executionMetaDataKey,
            executionRedlineInputKey,
            directionalUnExecutedElement,
            procedureDetails,
            conversations,
            executionInputKey,
            selectedCopyElement,
            selectedCutElement,
        };

        actions = {
            removeElement: sinon.spy(),
            setElementViewStateDetailLevel: sinon.spy()
        };

        store = new Vuex.Store({
            state: {
                activeExecutableElement: undefined,
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

    xit("renders the correct icon color", () => {
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
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        expect(wrapper.vm.elementColor).toEqual("#31708f");
        wrapper.setProps({
            elementMap: {
                name: 'STEP',
                displayName: 'Step',
                paletteGroup: 'Executable',
                comp: 'section-element',
                category: 'executable',
                path: 'steps',
                isNestable: false
            },
            stepData: {
                description:"",
                elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                elem_type:"STEP",
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
            }
        });
        expect(wrapper.vm.elementColor).toEqual("#3c763d");
        wrapper.setProps({
            elementMap: {
                name: 'STEP',
                displayName: 'Step',
                paletteGroup: 'Executable',
                comp: 'section-element',
                category: 'non_executable',
                path: 'steps',
                isNestable: false
            },
            stepData: {
                description:"",
                elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                elem_type:"STEP",
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
            }
        });
        expect(wrapper.vm.elementColor).toEqual("#8a6d3b");
    });

    xit("Renders nested elements", () => {
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
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        const steps = wrapper.findAll("li.step");
        expect(steps.length).toEqual(3);
        const nestedSteps = wrapper.find('ol.step_nested').findAll('li.step');
        expect(nestedSteps.length).toEqual(2);
    });
    xit("Renders nothing when a step has no children", () => {
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
                    elem_id:"no kids here",
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
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        const steps = wrapper.findAll("li.step");
        expect(steps.length).toEqual(1);
        const nestedSteps = wrapper.find('ol.step_nested').findAll('li.step');
        expect(nestedSteps.length).toEqual(0);
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

    xit("Copy button emits copyClicked event", () => {
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
                    elem_id:"no kids here",
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
                }
            },
            provide: {
                mode: "execution"
            },
            store,
            mocks: {$route},
            stubs: stubs,
        });
        wrapper.vm.copyElementContents('COPY');
        expect(wrapper.emitted('copyClicked')).toBeTruthy();
    });
});

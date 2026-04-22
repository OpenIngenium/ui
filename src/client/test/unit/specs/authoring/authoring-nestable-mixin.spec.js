import authoringNestableMixin from "../../../../src/modules/elements/mixins/authoring-nestable-mixin";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import IngElement from "../../../../src/modules/elements/IngElement.vue";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop';
import { shallow } from "@vue/test-utils";
import authoringStore from "../../../../src/modules/authoring/authoring-store";
import nonExecutable from '../../../../src/modules/elements/non-executable';

const authoringIngElement = Vue.component('ing-element', Vue.extend(authoringNestableMixin).extend(IngElement));

const {
    elementsByParent,
    elementViewStateKey,
    procedureDetails,
} = authoringStore.getters;

Vue.use(Vuex);
Vue.directive('drag-and-drop', DragAndDrop);
Vue.component('ing-spinner', sinon.stub());
Vue.component('section-element', nonExecutable.SectionElement);

function isUndefinedOrNull(any) {
    return (typeof any === "undefined" || any === null);
}

function createCustomEvent(type) {
    let event = new Event(type);
    event.dataTransfer = {
        data: {},
        setData: function(type, val) {
            // mock behavior of actual DataTransfer Obj
            if (isUndefinedOrNull(val)) {
                val = 'undefined';
            }
            this.data[type] = val;
        },
        getData: function(type) {
            return this.data[type];
        },
        setDragImage: function() {
            return;
        }
    };
    return event;
}

describe("authoring-nestable-mixin.vue", () => {
    let getters;
    let actions;
    let store;
    let $route;

    beforeEach(() => {
        getters = {
            elementsByParent,
            elementViewStateKey,
            procedureDetails,
        };

        actions = {
            setElementViewStateDetailLevel: sinon.stub()
        };

        store = new Vuex.Store({
            state: {
                procedureId: "m2020-1-abc",
                procedureVersion: 1,
                procedureDetails: {},
                elementIds: [
                    "6774195b-7b31-48f6-aeed-f440e5697c81",
                ],
                elements: {
                    "6774195b-7b31-48f6-aeed-f440e5697c81": {
                        description:"",
                        elem_id:"6774195b-7b31-48f6-aeed-f440e5697c81",
                        elem_type:"SECTION",
                        procedure_id:"abc123",
                        authoring_user_input:undefined,
                        number:"1",
                        parent_id:"",
                        title:"",
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
                    }
                },
                elementsViewState: {
                    "6774195b-7b31-48f6-aeed-f440e5697c81": {
                        loading: false
                    }
                }
            },
            actions,
            getters
        });
    });
});

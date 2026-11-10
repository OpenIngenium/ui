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

function jwt(payload) {
    const b64 = (obj) => window.btoa(JSON.stringify(obj)).replace(/=+$/, "");
    return `${b64({alg: "HS256", typ: "JWT"})}.${b64(payload)}.sig`;
}

describe("authoring-nestable-mixin (unit)", () => {
    const Host = {
        mixins: [authoringNestableMixin],
        props: {stepData: {type: Object, default: () => ({elem_id: "e1"})}},
        render(h) { return h("div"); }
    };

    function dropEvent({dropafterid, parentid, level, elemId, elementPath, copy}) {
        return {
            target: {getAttribute: (a) => ({dropafterid, parentid, level})[a]},
            dataTransfer: {getData: (k) => ({elemId, elementPath, copy})[k]}
        };
    }

    function build(overrides = {}) {
        const opts = {
            version: "0",
            query: {update: ""},
            lockedBy: undefined,
            builtIn: [{step_type: "PROCEDURE_SECTION"}],
            custom: [],
            ...overrides
        };
        const actions = {
            createElement: sinon.spy(),
            moveElement: sinon.spy(),
            copyElement: sinon.spy(),
            removeElement: sinon.spy(),
            fetchStepPaletteBuiltIn: sinon.spy(),
            fetchStepPaletteCustom: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                elementsByParent: () => () => [],
                procedureDetails: () => ({locked_by: opts.lockedBy}),
                stepPaletteBuiltIn: () => opts.builtIn,
                stepPaletteCustom: () => opts.custom
            },
            actions
        });
        const $route = {params: {version: opts.version, procedureId: "p1"}, query: opts.query};
        const wrapper = shallow(Host, {store, mocks: {$route}, propsData: {stepData: {elem_id: "e1"}}});
        return {wrapper, actions};
    }

    beforeEach(() => {
        document.cookie = `access_token=${jwt({username: "alice"})}`;
    });

    afterEach(() => {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    });

    it("workingCopy true only for version 0", () => {
        expect(build({version: "0"}).wrapper.vm.workingCopy).toBe(true);
        expect(build({version: "2"}).wrapper.vm.workingCopy).toBe(false);
    });

    it("isAllowEdit requires update query, working copy, and unlocked (or own lock)", () => {
        expect(build().wrapper.vm.isAllowEdit).toBe(true);
        expect(build({query: {}}).wrapper.vm.isAllowEdit).toBeFalsy();
        expect(build({lockedBy: "someone-else"}).wrapper.vm.isAllowEdit).toBe(false);
        expect(build({lockedBy: "alice"}).wrapper.vm.isAllowEdit).toBe(true);
    });

    it("canEdit/Delete/Move + disableFields derive from isAllowEdit", () => {
        const {wrapper} = build();
        expect(wrapper.vm.canEditElement).toBe(true);
        expect(wrapper.vm.canDeleteElement).toBe(true);
        expect(wrapper.vm.canMoveElement).toBe(true);
        expect(wrapper.vm.disableFields).toBe(false);
    });

    it("removeElementCallback removes when allowed", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.removeElementCallback();
        expect(actions.removeElement.called).toBe(true);
    });

    it("removeElementCallback is a no-op when not allowed", async() => {
        const {wrapper, actions} = build({query: {}});
        await wrapper.vm.removeElementCallback();
        expect(actions.removeElement.called).toBe(false);
    });

    it("getElementMap forces PROCEDURE_SECTION to non-nestable", () => {
        const {wrapper} = build();
        const map = wrapper.vm.getElementMap({elem_type: "PROCEDURE_SECTION"});
        expect(map.isNestable).toBe(false);
    });

    it("getElementMap returns null when no definition matches", () => {
        const {wrapper} = build();
        expect(wrapper.vm.getElementMap({elem_type: "MYSTERY"})).toBeNull();
    });

    it("elementDrop copies a dragged element when copy flag set", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.elementDrop(dropEvent({dropafterid: "a1", level: "0", elemId: "d1", copy: "true"}));
        expect(actions.copyElement.called).toBe(true);
    });

    it("elementDrop moves a dragged element without copy flag", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.elementDrop(dropEvent({dropafterid: "a1", level: "0", elemId: "d1"}));
        expect(actions.moveElement.called).toBe(true);
    });

    it("elementDrop ignores insertion after self", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.elementDrop(dropEvent({dropafterid: "d1", level: "0", elemId: "d1"}));
        expect(actions.moveElement.called).toBe(false);
    });

    it("elementDrop creates from a palette element path", async() => {
        const {wrapper, actions} = build();
        await wrapper.vm.elementDrop(dropEvent({dropafterid: "a1", level: "0", elementPath: "sections"}));
        expect(actions.createElement.called).toBe(true);
    });

    it("elementDrop does nothing when editing is not allowed", async() => {
        const {wrapper, actions} = build({query: {}});
        await wrapper.vm.elementDrop(dropEvent({dropafterid: "a1", level: "0", elemId: "d1"}));
        expect(actions.moveElement.called).toBe(false);
        expect(actions.copyElement.called).toBe(false);
    });
});

import asRunNestableMixin from "../../../../src/modules/elements/mixins/as-run-nestable-mixin";
import Vue from "vue";
import sinon from "sinon";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop.js';

Vue.directive('drag-and-drop', DragAndDrop);

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

describe("as-run-nestable-mixin.vue", () => {
    let wrapper;

    it("does not create new elements", () => {
        wrapper = new Vue({
            mixins: [ asRunNestableMixin ],
            methods: {
                moveElement: ()=>{},
                createElement: ()=>{},
                copyElement: ()=>{}
            },
            template:
                `<li v-drag-and-drop
                    v-on:drop="elementDrop"
                    class="drag-over">
                </li>`
        }).$mount();

        sinon.spy(wrapper,'createElement');
        sinon.spy(wrapper,'moveElement');
        sinon.spy(wrapper,'copyElement');
        expect(wrapper.createElement.callCount).toEqual(0);
        const event = createCustomEvent('drop');

        // element ID is not set
        event.dataTransfer.setData('elemId', null);
        event.dataTransfer.setData('elementPath', 'wait_steps');
        wrapper.$el.dispatchEvent(event);

        expect(wrapper.createElement.callCount).toEqual(0);
        expect(wrapper.moveElement.callCount).toEqual(0);
        expect(wrapper.copyElement.callCount).toEqual(0);
    });

    it("does not move elements within the canvas", () => {
        wrapper = new Vue({
            mixins: [ asRunNestableMixin ],
            methods: {
                moveElement: ()=>{},
                createElement: ()=>{},
                copyElement: ()=>{}
            },
            template:
                `<li v-drag-and-drop
                    v-on:drop="elementDrop"
                    class="drag-over">
                </li>`
        }).$mount();

        sinon.spy(wrapper,'createElement');
        sinon.spy(wrapper,'moveElement');
        sinon.spy(wrapper,'copyElement');
        expect(wrapper.moveElement.callCount).toEqual(0);

        const event = createCustomEvent('drop');
        event.dataTransfer.setData('elemId', '123');
        event.dataTransfer.setData('copy', null);
        wrapper.$el.dispatchEvent(event);

        expect(wrapper.createElement.callCount).toEqual(0);
        expect(wrapper.moveElement.callCount).toEqual(0);
        expect(wrapper.copyElement.callCount).toEqual(0);
    });

    it("does not allow elements to be copied", () => {
        wrapper = new Vue({
            mixins: [ asRunNestableMixin ],
            methods: {
                moveElement: ()=>{},
                createElement: ()=>{},
                copyElement: ()=>{}
            },
            template:
                `<li v-drag-and-drop
                    v-on:drop="elementDrop"
                    class="drag-over">
                </li>`
        }).$mount();

        sinon.spy(wrapper,'createElement');
        sinon.spy(wrapper,'moveElement');
        sinon.spy(wrapper,'copyElement');
        expect(wrapper.copyElement.callCount).toEqual(0);

        const event = createCustomEvent('drop');
        event.dataTransfer.setData('elemId', '123');
        event.dataTransfer.setData('copy', true);
        wrapper.$el.dispatchEvent(event);

        expect(wrapper.createElement.callCount).toEqual(0);
        expect(wrapper.copyElement.callCount).toEqual(0);
        expect(wrapper.moveElement.callCount).toEqual(0);
    });

});

import Vue from 'vue';
import sinon from "sinon";
import { DragAndDrop } from '../../../../src/modules/common/directives/DragAndDrop.js';

Vue.directive('drag-and-drop', DragAndDrop);

describe('Directive v-drag-and-drop', () => {
    let spy;

    beforeEach(() => {
        spy = sinon.spy();
    });

    it('should set element as draggable by default', () => {
        const vm = new Vue({
            template: `<div v-drag-and-drop="{ disabled: false }"></div>`
        }).$mount();
        expect(vm.$el.getAttribute('draggable')).toBe('true');
    });

    it('should allow draggable attr to be set', () => {
        const vm = new Vue({
            template: `<div v-drag-and-drop="{ targetOnly: true, disabled: false }"></div>`
        }).$mount();
        expect(vm.$el.getAttribute('draggable')).toBe(null);
    });

    it('should not bind any events or make element draggable when disabled', () => {
        const vm = new Vue({
            methods: {
                handleDragEvent: spy,
            },
            template:
                `<div v-drag-and-drop="{ disabled: true }"
                    v-on:dragover="handleDragEvent">
                </div>`
        }).$mount();
        expect(vm.$el.getAttribute('draggable')).toBe(null);
        let overEvent = new Event('dragover');
        vm.$el.dispatchEvent(overEvent);
        expect(vm.$el.classList).not.toContain('drag-over');

    });
});

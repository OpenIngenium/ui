import {  shallow, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import IngTableFilter from "../../../../src/modules/common/IngTableFilter.vue";

const localVue = createLocalVue();

describe("IngTableFilter.vue", () => {
    it("Triggers filter callbacks on search and clear button presses", () => {
        const wrapper = shallow(IngTableFilter, {
            localVue,
            data() {
                return {
                    filters: {}, 
                    showFilterDropdown: true,
                };
            },
            propsData: {
                columns:  [
                    { name: 'A', field: 'a', filterType: 'search' },
                    { name: 'B', field: 'b', filterType: 'selection', filterChoices: ['D','E','F'] },
                    { name: 'C', field: 'c' }
                ],
                filterCallback: sinon.stub(),
                displayFilterCallback: sinon.stub()
            }
        });
        sinon.spy(wrapper.vm, 'triggerFilterCallback');
        sinon.spy(wrapper.vm, 'clearFilters');

        const submitButton = wrapper.find('button[type="submit"]');
        const clearButton = wrapper.find('button.btn-danger');

        submitButton.trigger('click');
        expect(wrapper.vm.triggerFilterCallback.calledOnce).toBeTruthy();
        expect(wrapper.vm.clearFilters.calledOnce).toBeFalsy();

        clearButton.trigger('click');
        expect(wrapper.vm.triggerFilterCallback.calledTwice).toBeTruthy();
        expect(wrapper.vm.clearFilters.calledOnce).toBeTruthy();
    });

    it("Create a filter input for each filtered column", () => {
        const wrapper = shallow(IngTableFilter, {
            localVue,
            data() {
                return {
                    filters: {}, 
                    showFilterDropdown: true
                };
            },
            propsData: {
                columns:  [
                    { name: 'A', field: 'a', filterType: 'search' },
                    { name: 'B', field: 'b', filterType: 'selection', filterChoices: ['D','E','F'] },
                    { name: 'C', field: 'c', filterType: 'selection', filterChoices: [ 'D','E','F'] },
                ],
                filterCallback: sinon.stub(),
                displayFilterCallback: sinon.stub(),
            }
        });

        const searchElements = wrapper.findAll('li.filter-dropdown-element input');
        const selectionElements = wrapper.findAll('li.filter-dropdown-element select');
        expect(searchElements.length).toEqual(1);
        expect(selectionElements.length).toEqual(2);
    });
});

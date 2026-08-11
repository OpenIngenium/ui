import {  shallow, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import IngTableFilter from "../../../../src/modules/common/IngTableFilter.vue";

const localVue = createLocalVue();

const buildFilters = () => ({
    a: { name: 'A', field: 'a', filterType: 'search' },
    b: { name: 'B', field: 'b', filterType: 'selection', filterChoices: ['D', 'E', 'F'] },
    c: { name: 'C', field: 'c', filterType: 'selection', filterChoices: ['D', 'E', 'F'] }
});

describe("IngTableFilter.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("invokes setFilterValues on apply and clear button presses", () => {
        const setFilterValues = sinon.stub();
        wrapper = shallow(IngTableFilter, {
            localVue,
            data() {
                return {
                    showFilterDropdown: true
                };
            },
            propsData: {
                tableId: 'test-table',
                filters: buildFilters(),
                setFilterValues
            }
        });

        const submitButton = wrapper.find('button[type="submit"]');
        const clearButton = wrapper.find('button.btn-danger');

        submitButton.trigger('click');
        expect(setFilterValues.calledOnce).toBeTruthy();

        clearButton.trigger('click');
        expect(setFilterValues.calledTwice).toBeTruthy();
    });

    it("creates a filter input for each filter based on its filterType", () => {
        wrapper = shallow(IngTableFilter, {
            localVue,
            data() {
                return {
                    showFilterDropdown: true
                };
            },
            propsData: {
                tableId: 'test-table',
                filters: buildFilters(),
                setFilterValues: sinon.stub()
            }
        });

        const searchElements = wrapper.findAll('li.filter-dropdown-element input');
        const selectionElements = wrapper.findAll('li.filter-dropdown-element select');
        expect(searchElements.length).toEqual(1);
        expect(selectionElements.length).toEqual(2);
    });

    it("hides the filter control when there are no filters", () => {
        wrapper = shallow(IngTableFilter, {
            localVue,
            propsData: {
                tableId: 'test-table',
                filters: {},
                setFilterValues: sinon.stub()
            }
        });

        expect(wrapper.find('.filter-btn').exists()).toBe(false);
    });
});

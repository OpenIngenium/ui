import { mount, shallow } from "@vue/test-utils";
import sinon from "sinon";
import { createLocalVue } from "@vue/test-utils";
import IngTable from "../../../../src/modules/common/IngTable.vue";
import IngTableFilter from "../../../../src/modules/common/IngTableFilter.vue";
import CustomColumn from "../../fixtures/CustomColumn.vue";

const localVue = createLocalVue();
localVue.component('custom-column', CustomColumn);
localVue.component('ing-table-filter', IngTableFilter);

describe("IngTable.vue", () => {
    it("shows a message when no entries are available", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns: [
                    { name: 'Status', field: 'status' },
                ],
                data: []
            }
        });
        const emptyRow = wrapper.find("tbody tr td");
        expect(emptyRow.text()).toContain("There is no data to display.");
        const filterButton = wrapper.find("#filter-dropdown");
        expect(filterButton.exists()).toBe(false);

    });

    it("Shows the filter button if filterable columns exist", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [{ name: 'Status', field: 'status' },],
                data: []
            },
        });
        const filterButton = wrapper.find("#filter-dropdown");
        expect(filterButton.exists()).toBe(false);
    });

    xit("Fires a new search when filters are added", () => {
        const wrapper = mount(IngTable, {
            localVue,
            propsData: {
                columns:  [{ name: 'Status', field: 'status', filterType: 'search' }],
                data: [
                    { 'status': 'good.'},
                    { 'status': 'great.'},
                    { 'status': 'greatest.'},
                ],
                callback: () => {}
            }
        });
        sinon.spy(wrapper.vm, 'changeFilter');
        const filterButton = wrapper.find("#filter-dropdown");
        expect(filterButton.exists()).toBe(true);
        filterButton.trigger('click');

        const submitButton  = wrapper.find(".table-filter-dropdown button[type='submit']");
        submitButton.trigger('click');
        expect(wrapper.vm.changeFilter.calledOnce).toBeTruthy();
    });

    it("renders the correct number of rows", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'Status', field: 'status' },
                ],
                data: [
                    { 'status': 'good.'},
                    { 'status': 'great.'},
                    { 'status': 'greatest.'},
                ]
            }
        });
        const rows = wrapper.find("tbody").findAll('tr');
        expect(rows.length).toBe(3);
    });

    it("renders the correct number of columns", async() => {
        const wrapper = shallow(IngTable, {
            localVue,

        });
        let rows = wrapper.find("thead").findAll('th');
        expect(rows.length).toBe(0);
        wrapper.setProps({
            columns: [
                { name: 'A', field: 'a' },
                { name: 'B', field: 'b' }
            ]
        });
        await wrapper.vm.$nextTick();
        rows = wrapper.find("thead").findAll('th');
        expect(rows.length).toBe(2);
    });

    it("Only sorts on sortable columns", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'A', field: 'a' },
                    { name: 'B', field: 'b', sortable: true},
                    { name: 'C', field: 'c', sortable: true},
                ]
            }
        });
        const sortableCols = wrapper.find("thead").findAll('div.sortable');
        expect(sortableCols.length).toBe(2);
    });

    it("Displays a caret in the correct direction on the correct sort column", async() => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'A', field: 'a' },
                    { name: 'B', field: 'b', sortable: true},
                    { name: 'C', field: 'c', sortable: true},
                ],
                data: [
                    { a: 'a1', b: 'b1'},
                    { a: 'a2', b: 'b2'},
                    { a: 'a3', b: 'b3' }
                ],
                callback: () => {}
            }
        });
        sinon.spy(wrapper.vm, 'changeSort');

        const sortableCols = wrapper.find("thead").findAll('div.sortable');
        const firstCol = sortableCols.at(0);
        expect(firstCol.find('span.glyphicon-chevron-down').exists()).toBe(false);
        expect(wrapper.vm.sortCaretDirection).toBe('up');
        firstCol.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.sortCaretDirection).toBe('down');
        expect(firstCol.find('span.glyphicon-chevron-down').exists()).toBe(true);
        expect(wrapper.vm.changeSort.calledOnce).toBeTruthy();
    });

    it("Only filters on filterable columns", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'A', field: 'a' },
                    { name: 'B', field: 'b', filterType: 'string'},
                    { name: 'C', field: 'c', filterType: 'selection'},
                    { name: 'D', field: 'd', filterType: false},
                ],
                data: [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1'}
                ]
            },
        });
        const filterableColumns = wrapper.vm.filterableCols;
        expect(filterableColumns.length).toBe(2);
    });

    xit("Renders child templates and passes them row data.", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'A', field: 'a', component: 'custom-column' },
                    { name: 'B', field: 'b' }
                ],
                data: [
                    { a: 'a1', b: 'b1'}
                ]

            }
        });
        const componentText = wrapper.find("tbody").find('h4');
        expect(componentText.text()).toContain("a1");
    });

    it("Updates params and refetches data when pagination changes.", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            propsData: {
                columns:  [
                    { name: 'A', field: 'a' }
                ],
                data: [
                    { a: 'a1', b: 'b1'}
                ],
                callback: () => {}
            }
        });
        sinon.spy(wrapper.vm, 'triggerCallback');
        const params = {
            limit: 5,
            offset: 25
        };
        wrapper.vm.changeLimitOffsetFromPagination(params);

        expect(wrapper.vm.limit).toBe(5);
        expect(wrapper.vm.offset).toBe(25);
        expect(wrapper.vm.triggerCallback.calledOnce).toBeTruthy();

        const limitDropdown = wrapper.find('.limit-col select');
        limitDropdown.findAll('option').at(1).element.selected = true;
        limitDropdown.trigger('change');
        expect(wrapper.vm.limit).toBe(25);
        expect(wrapper.vm.triggerCallback.calledTwice).toBeTruthy();
    });

    it("Displays the correct entry range", () => {
        const wrapper = shallow(IngTable, {
            localVue,
            data: {
                offset: 0,
                limit: 10
            },
            propsData: {
                total: 8
            }
        });
        expect(wrapper.vm.startNum).toBe(1);
        expect(wrapper.vm.endNum).toBe(8);

        wrapper.setData({
            limit: 50,
            offset: 50
        });
        wrapper.setProps({
            total: 94
        });
        expect(wrapper.vm.startNum).toBe(51);
        expect(wrapper.vm.endNum).toBe(94);

        wrapper.setData({
            limit: 25,
            offset: 50
        });
        wrapper.setProps({
            total: 94
        });
        expect(wrapper.vm.startNum).toBe(51);
        expect(wrapper.vm.endNum).toBe(75);
    });
});

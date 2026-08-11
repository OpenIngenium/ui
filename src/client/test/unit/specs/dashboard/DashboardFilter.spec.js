import {shallowMount} from "@vue/test-utils";
import DashboardFilter from "../../../../src/modules/dashboard/DashboardFilter.vue";

function build(filters) {
    return shallowMount(DashboardFilter, {
        propsData: {
            filters,
            setFilterValues: () => {},
            clearFilter: () => {},
            tableId: "t1"
        },
        stubs: {"ing-table-filter": true}
    });
}

describe("DashboardFilter.vue", () => {
    it("activeFilters returns only filters with a value", () => {
        const wrapper = build({
            name: {name: "Name", field: "name", value: "abc"},
            status: {name: "Status", field: "status", value: ""},
            empty: null
        });
        const active = wrapper.vm.activeFilters;
        expect(active.length).toBe(1);
        expect(active[0].value).toBe("abc");
    });

    it("activeFilters is empty when nothing is set", () => {
        const wrapper = build({name: {name: "Name", field: "name", value: ""}});
        expect(wrapper.vm.activeFilters).toEqual([]);
    });
});

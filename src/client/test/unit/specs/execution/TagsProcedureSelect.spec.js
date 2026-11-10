import { shallowMount } from "@vue/test-utils";
import TagsProcedureSelect from "../../../../src/modules/elements/non-executable/run-procedure/TagsProcedureSelect.vue";

describe("TagsProcedureSelect.vue", () => {
    function build(tagSelections = []) {
        return shallowMount(TagsProcedureSelect, {
            propsData: {tagSelections},
            stubs: {"ing-table": true}
        });
    }

    it("defines the tag table columns", () => {
        const columns = build().vm.tableColumns;
        expect(columns.map((c) => c.field)).toEqual(["actions", "tag", "description"]);
    });

    it("passes the tag selections through to the table", () => {
        const selections = [{tag_id: "t1", selected: true}];
        expect(build(selections).vm.tagSelections).toEqual(selections);
    });

    it("re-emits table events as selectTag", () => {
        const wrapper = build();
        wrapper.vm.tableEvent({tag_id: "t1", selected: false});
        expect(wrapper.emitted("selectTag")[0][0]).toEqual({tag_id: "t1", selected: false});
    });
});

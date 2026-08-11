import { mount } from "@vue/test-utils";
import SelectTagCheckbox from "../../../../src/modules/elements/non-executable/run-procedure/SelectTagCheckbox.vue";

describe("SelectTagCheckbox.vue", () => {
    function build(data) {
        return mount(SelectTagCheckbox, {propsData: {data}});
    }

    it("binds the checkbox value and checked state to the tag data", () => {
        const input = build({tag_id: "t7", selected: true}).find("input");
        expect(input.attributes("value")).toBe("t7");
        expect(input.element.checked).toBe(true);
    });

    it("emits tableEvent with the tag id and checked state on change", () => {
        const wrapper = build({tag_id: "t7", selected: false});
        const input = wrapper.find("input");
        input.element.checked = true;
        input.trigger("change");
        expect(wrapper.emitted("tableEvent")[0][0]).toEqual({tag_id: "t7", selected: true});
    });

    it("emits selected false when unchecked", () => {
        const wrapper = build({tag_id: "t7", selected: true});
        const input = wrapper.find("input");
        input.element.checked = false;
        input.trigger("change");
        expect(wrapper.emitted("tableEvent")[0][0]).toEqual({tag_id: "t7", selected: false});
    });
});

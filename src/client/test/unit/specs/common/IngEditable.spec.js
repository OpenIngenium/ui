import {mount} from "@vue/test-utils";
import IngEditable from "../../../../src/modules/common/IngEditable.vue";

describe("IngEditable.vue", () => {
    it("inputStyle uses the color prop", () => {
        const wrapper = mount(IngEditable, {propsData: {value: "hello", color: "red"}});
        expect(wrapper.vm.inputStyle).toContain("color: red");
    });

    it("toggleEdit switches to editing and emits disableDragDrop", async() => {
        const wrapper = mount(IngEditable, {propsData: {value: "hello"}});
        wrapper.vm.toggleEdit();
        expect(wrapper.vm.editing).toBe(true);
        expect(wrapper.emitted("disableDragDrop")[0]).toEqual([true]);
        await wrapper.vm.$nextTick();
    });

    it("confirm trims the value, emits save, and exits editing", async() => {
        const wrapper = mount(IngEditable, {propsData: {value: "hello"}});
        wrapper.setData({editing: true});
        await wrapper.vm.$nextTick();
        wrapper.vm.$refs.editableValue.value = "  new title  ";
        wrapper.vm.confirm();
        expect(wrapper.emitted("save")[0]).toEqual(["new title"]);
        expect(wrapper.vm.editing).toBe(false);
    });

    it("renders a clickable prompt when the value is empty", () => {
        const wrapper = mount(IngEditable, {propsData: {value: ""}});
        expect(wrapper.text()).toContain("Click to Add Title");
    });
});

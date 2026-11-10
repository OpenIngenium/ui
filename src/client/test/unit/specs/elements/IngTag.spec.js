import {shallowMount} from "@vue/test-utils";
import IngTag from "../../../../src/modules/elements/IngTag.vue";

describe("IngTag.vue", () => {
    const data = {name: "SafetyCritical", description: "A tag"};

    it("tagStyle produces background and text colors derived from the name", () => {
        const wrapper = shallowMount(IngTag, {propsData: {data}});
        const style = wrapper.vm.tagStyle();
        expect(style).toContain("background-color:");
        expect(style).toContain("color:");
    });

    it("deleteTag emits deleteTag with the data", () => {
        const wrapper = shallowMount(IngTag, {propsData: {data, remove: true}});
        wrapper.vm.deleteTag();
        expect(wrapper.emitted("deleteTag")[0]).toEqual([data]);
    });

    it("renders the tag name", () => {
        const wrapper = shallowMount(IngTag, {propsData: {data}});
        expect(wrapper.text()).toContain("SafetyCritical");
    });
});

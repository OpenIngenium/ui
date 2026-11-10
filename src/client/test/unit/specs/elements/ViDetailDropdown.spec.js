import {shallowMount} from "@vue/test-utils";
import ViDetailDropdown from "../../../../src/modules/elements/non-executable/verification-item/ViDetailDropdown.vue";

describe("ViDetailDropdown.vue", () => {
    it("renders each key/value in the data object", () => {
        const wrapper = shallowMount(ViDetailDropdown, {propsData: {data: {name: "VI1", type: "TELEMETRY"}}});
        const text = wrapper.text();
        expect(text).toContain("name: VI1");
        expect(text).toContain("type: TELEMETRY");
    });
});

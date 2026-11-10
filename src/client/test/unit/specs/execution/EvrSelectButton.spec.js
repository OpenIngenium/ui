import {shallowMount} from "@vue/test-utils";
import EvrSelectButton from "../../../../src/modules/elements/executable/query-evr/EvrSelectButton.vue";

describe("EvrSelectButton.vue", () => {
    const data = {evr_name: "EVR_A", level: "DIAGNOSTIC"};

    it("type defaults to button", () => {
        const wrapper = shallowMount(EvrSelectButton, {propsData: {data}});
        expect(wrapper.vm.type).toBe("button");
    });

    it("selectEvrEvent packages the selection payload", () => {
        const wrapper = shallowMount(EvrSelectButton, {propsData: {data}});
        expect(wrapper.vm.selectEvrEvent).toEqual({
            action: "selectEvr",
            data: {evr_name: "EVR_A", level: "DIAGNOSTIC"}
        });
    });

    it("emits tableEvent with the payload on click", () => {
        const wrapper = shallowMount(EvrSelectButton, {propsData: {data}});
        wrapper.find("button").trigger("click");
        expect(wrapper.emitted("tableEvent")[0][0].action).toBe("selectEvr");
    });
});

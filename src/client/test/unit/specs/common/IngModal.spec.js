import {shallowMount} from "@vue/test-utils";
import IngModal from "../../../../src/modules/common/IngModal.vue";

describe("IngModal.vue", () => {
    it("calculatedModalContainerStyle returns fixed height when provided", () => {
        const wrapper = shallowMount(IngModal, {propsData: {fixedHeight: "400px"}});
        expect(wrapper.vm.calculatedModalContainerStyle).toEqual({height: "400px"});
    });

    it("calculatedModalContainerStyle is empty without a fixed height", () => {
        const wrapper = shallowMount(IngModal);
        expect(wrapper.vm.calculatedModalContainerStyle).toEqual({});
    });

    it("close emits a close event", () => {
        const wrapper = shallowMount(IngModal);
        wrapper.vm.close();
        expect(wrapper.emitted("close")).toBeTruthy();
    });
});

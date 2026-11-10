import {shallowMount} from "@vue/test-utils";
import ExecutionStatus from "../../../../src/modules/execution/ExecutionStatus.vue";

describe("ExecutionStatus.vue", () => {
    it("renders the status text", () => {
        const wrapper = shallowMount(ExecutionStatus, {propsData: {status: "Running step 3"}});
        expect(wrapper.text()).toContain("Executing: Running step 3");
    });

    it("toggleIcon runs without error", () => {
        const wrapper = shallowMount(ExecutionStatus, {propsData: {status: "x"}});
        expect(() => wrapper.vm.toggleIcon()).not.toThrow();
    });
});

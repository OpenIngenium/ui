import { shallow } from "@vue/test-utils";
import ExecutionStatusCheck from "../../../../src/modules/execution/ExecutionStatusCheck.vue";


describe("ExecutionStatusCheck.vue", () => {

    it("pass shows checkmark, fail shows xmark", async() => {
        const wrapper = shallow(ExecutionStatusCheck, {
            propsData: {
                executed: true,
                status: "PASS"
            }
        });

        const spanEl = wrapper.find("span.glyphicon");
        expect(spanEl.classes()).toContain("glyphicon-ok");

        wrapper.setProps({ status: "FAIL" });
        await wrapper.vm.$nextTick();
        expect(spanEl.classes()).toContain("glyphicon-remove");
    });

    it("shows correct statusColor based on componentType and status", async() => {
        const wrapper = shallow(ExecutionStatusCheck, {
            propsData: {
                executed: true,
                status: "ERROR"
            }
        });

        const spanEl = wrapper.find("span.glyphicon");
        expect(spanEl.classes()).toContain("red");

        wrapper.setProps({ componentType: "element", status: "PASS" });
        await wrapper.vm.$nextTick();
        expect(spanEl.classes()).toContain("green");

        wrapper.setProps({ status: "FAIL" });
        await wrapper.vm.$nextTick();
        expect(spanEl.classes()).toContain("orange");

        wrapper.setProps({ componentType: "entry", status: "FAIL" });
        await wrapper.vm.$nextTick();
        expect(spanEl.classes()).toContain("red");
    });

    it("does not display checkmark when status is blank", () => {
        const wrapper = shallow(ExecutionStatusCheck, {
            propsData: {
                executed: true,
                status: ""
            }
        });
        expect(wrapper.vm.shouldDisplay).toBeFalsy();
        // actual markup is commented out
        expect(wrapper.vm.$el.nodeName).toBe("#comment");
    });
});

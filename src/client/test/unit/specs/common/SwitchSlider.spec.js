import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import SwitchSlider from "../../../../src/modules/common/SwitchSlider.vue";


describe("SwitchSlider.vue", () => {

    it("displays default labels that can be overridden", async() => {
        const wrapper = shallow(SwitchSlider);
        const onLabelEl = wrapper.find(".bootstrap-switch-handle-on");
        const offLabelEl = wrapper.find(".bootstrap-switch-handle-off");
        expect(onLabelEl.text()).toContain("Hide");
        expect(offLabelEl.text()).toContain("Show");

        wrapper.setProps({ onLabel: "Active", offLabel: "Disabled" });
        await wrapper.vm.$nextTick();
        expect(onLabelEl.text()).toContain("Active");
        expect(offLabelEl.text()).toContain("Disabled");
    });

    it("clicking the component toggles the switch and calls the callback prop", () => {
        const callback = sinon.spy();
        const wrapper = shallow(SwitchSlider, { propsData: { callback }});

        expect(wrapper.vm.on).toBeFalsy();
        expect(callback.notCalled).toBeTruthy();

        wrapper.trigger("click");
        expect(wrapper.vm.on).toBeTruthy();
        expect(callback.calledOnce).toBeTruthy();
    });

});

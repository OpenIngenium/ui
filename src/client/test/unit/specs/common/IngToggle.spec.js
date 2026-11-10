import {shallowMount} from "@vue/test-utils";
import sinon from "sinon";
import IngToggle from "../../../../src/modules/common/IngToggle.vue";

function build(props = {}) {
    const clickHandler = sinon.spy();
    const wrapper = shallowMount(IngToggle, {
        propsData: {value: false, clickHandler, ...props}
    });
    return {wrapper, clickHandler};
}

describe("IngToggle.vue", () => {
    it("toggleClasses reflects the on/off value", () => {
        expect(build({value: true}).wrapper.vm.toggleClasses).toContain("btn-primary");
        expect(build({value: false}).wrapper.vm.toggleClasses).toContain("off");
    });

    it("toggleStyle sizes width to the longest label and appends customStyle", () => {
        const {wrapper} = build({onName: "Enabled", offName: "No", customStyle: "color: red;"});
        expect(wrapper.vm.toggleStyle).toContain(`width: ${12 * "Enabled".length}px`);
        expect(wrapper.vm.toggleStyle).toContain("color: red;");
    });

    it("onToggle invokes the click handler when enabled", () => {
        const {wrapper, clickHandler} = build();
        wrapper.vm.onToggle();
        expect(clickHandler.calledOnce).toBe(true);
    });

    it("onToggle does nothing when disabled", () => {
        const {wrapper, clickHandler} = build({disable: true});
        wrapper.vm.onToggle();
        expect(clickHandler.called).toBe(false);
    });
});

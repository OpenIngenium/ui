import { shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import FroalaEdit from "../../../../src/modules/common/FroalaEdit.vue";

describe("FroalaEdit.vue", () => {
    function build(props = {}) {
        return shallowMount(FroalaEdit, {
            propsData: {handleInputChange: sinon.spy(), ...props},
            stubs: {froala: true}
        });
    }

    it("exposes the base froala configuration", () => {
        const config = build().vm.froalaConfiguration;
        expect(config.key).toBeDefined();
        expect(config.linkAlwaysBlank).toBe(true);
    });

    it("merges the custom config over the base config", () => {
        const config = build({customConfig: {pastePlain: true, heightMin: 100}}).vm.froalaConfiguration;
        expect(config.pastePlain).toBe(true);
        expect(config.heightMin).toBe(100);
    });

    it("inputValue getter returns the content prop", () => {
        expect(build({content: "hello"}).vm.inputValue).toBe("hello");
    });

    it("inputValue setter calls handleInputChange", () => {
        const handleInputChange = sinon.spy();
        const wrapper = build({handleInputChange});
        wrapper.vm.inputValue = "changed";
        expect(handleInputChange.calledWith("changed")).toBe(true);
    });
});

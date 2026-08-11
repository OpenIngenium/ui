import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import ChooseViButton from "../../../../src/modules/elements/non-executable/verification-item/ChooseViButton.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build(selected = false) {
    const actions = {
        addSelectedViId: sinon.spy(),
        removeSelectedViId: sinon.spy()
    };
    const store = new Vuex.Store({
        getters: {
            selectedVisStepElementId: () => "step1",
            isSelectedViId: () => () => selected
        },
        actions
    });
    const wrapper = shallowMount(ChooseViButton, {
        localVue,
        store,
        propsData: {data: {vi_id: "vi1"}}
    });
    return {wrapper, actions};
}

describe("ChooseViButton.vue", () => {
    it("reflects selected state in label and class", () => {
        const {wrapper} = build(true);
        expect(wrapper.vm.isSelected).toBe(true);
        expect(wrapper.vm.btnClass).toBe("btn btn-success");
        expect(wrapper.text()).toBe("Unselect");
    });

    it("reflects unselected state", () => {
        const {wrapper} = build(false);
        expect(wrapper.vm.btnClass).toBe("btn btn-info");
        expect(wrapper.text()).toBe("Select");
    });

    it("handleClick adds when unselected", () => {
        const {wrapper, actions} = build(false);
        wrapper.vm.handleClick();
        expect(actions.addSelectedViId.called).toBe(true);
    });

    it("handleClick removes when selected", () => {
        const {wrapper, actions} = build(true);
        wrapper.vm.handleClick();
        expect(actions.removeSelectedViId.called).toBe(true);
    });
});

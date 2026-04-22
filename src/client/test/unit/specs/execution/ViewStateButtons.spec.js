import { shallow, createLocalVue } from "@vue/test-utils";
import ViewStateButtons from "../../../../src/modules/elements/ViewStateButtons.vue";

const localVue = createLocalVue();

describe("ViewStateBUttons.vue", () => {
    xit("emits a viewState change event", () => {
        const wrapper = shallow(ViewStateButtons, {
            localVue,
            propsData: {
                category: "executable",
            }
        });

        const viewStateButtons = wrapper.findAll(".toggle_button");
        viewStateButtons.at(0).trigger("click");
        viewStateButtons.at(1).trigger("click");
        viewStateButtons.at(2).trigger("click");
        expect(wrapper.emitted().setViewState.length).toEqual(3);

    });
});

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import IngDataGridInfo from "../../../../src/modules/common/IngDataGridInfo.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("IngDataGridInfo.vue", () => {
    function build(element) {
        const store = new Vuex.Store({
            getters: {
                elementKey: () => (elementId, key) => element[key]
            }
        });
        return shallowMount(IngDataGridInfo, {
            store,
            localVue,
            propsData: {elementId: "e1"}
        });
    }

    it("renders the element number and title", () => {
        const wrapper = build({number: "1.2", title: "Power Check", step_type: "MANUAL_STEP"});
        expect(wrapper.find(".step_number").text()).toBe("1.2");
        expect(wrapper.find(".step_title").text()).toBe("Power Check");
    });

    it("renders the titlecased step type with a data entries label", () => {
        const wrapper = build({number: "1", title: "t", step_type: "MANUAL_STEP"});
        expect(wrapper.find(".step_type_text").text()).toContain("(Data Entries)");
    });
});

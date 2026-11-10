import { mount } from "@vue/test-utils";
import ReportSubmittedModal from "../../../../src/modules/common/ReportSubmittedModal.vue";

describe("ReportSubmittedModal.vue", () => {
    function build(props) {
        return mount(ReportSubmittedModal, {
            propsData: props,
            stubs: {"ing-modal": {template: "<div><slot name=\"title\"/><slot name=\"body\"/><slot name=\"footer\"/></div>"}}
        });
    }

    it("renders nothing when show is false", () => {
        const wrapper = build({show: false, reportId: "r1"});
        expect(wrapper.html()).toBeFalsy();
    });

    it("renders the report id and default title when shown", () => {
        const wrapper = build({show: true, reportId: "r99"});
        expect(wrapper.text()).toContain("Report ID: r99");
        expect(wrapper.text()).toContain("Report Request Accepted");
    });

    it("renders an optional message when provided", () => {
        const wrapper = build({show: true, reportId: "r1", message: "custom note"});
        expect(wrapper.text()).toContain("custom note");
    });

    it("emits close when the confirm button is clicked", () => {
        const wrapper = build({show: true, reportId: "r1"});
        wrapper.find("button").trigger("click");
        expect(wrapper.emitted("close")).toBeTruthy();
    });
});

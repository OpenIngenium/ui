import { shallow } from "@vue/test-utils";
import { createLocalVue } from "@vue/test-utils";
import ExecutionStepError from "../../../../src/modules/execution/ExecutionStepError.vue";

const localVue = createLocalVue();


describe("ExecutionStepError.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("displays error source and http response from metaData when status is ERROR", () => {
        wrapper = shallow(ExecutionStepError, {
            localVue,
            propsData: {
                metaData: {
                    status: "ERROR",
                    error: {
                        error_type: "INGENIUM_SERVICE_ERROR",
                        error_source: "CORE",
                        http_code_at_source: "404",
                        message: "Call to core failed"
                    }
                }
            }
        });

        const errorType = wrapper.find(".error-type");
        expect(errorType.exists()).toBe(true);
        expect(errorType.text()).toContain("Source: CORE");
        expect(errorType.text()).toContain("HTTP Response: 404");
    });

    it("does not display the error type block when status is not an error", () => {
        wrapper = shallow(ExecutionStepError, {
            localVue,
            propsData: {
                metaData: {
                    status: "PASS",
                    error: {}
                }
            }
        });

        expect(wrapper.find(".error-type").exists()).toBe(false);
    });

    it("toggles detail visibility on click", () => {
        wrapper = shallow(ExecutionStepError, {
            localVue,
            propsData: {
                metaData: {
                    status: "ERROR",
                    error: {
                        error_type: "INGENIUM_SERVICE_ERROR",
                        error_source: "VENUE SERVICE",
                        http_code_at_source: "404",
                        message: "Call to venue_service failed: ",
                        details: ["this is some data\n blah blah"]
                    }
                }
            }
        });

        const collapse = wrapper.find(".error-collapse");
        expect(wrapper.vm.expanded).toBe(true);
        collapse.trigger('click');
        expect(wrapper.vm.expanded).toBe(false);
        collapse.trigger('click');
        expect(wrapper.vm.expanded).toBe(true);
    });

});



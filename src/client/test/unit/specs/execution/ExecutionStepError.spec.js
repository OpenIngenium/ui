import { shallow } from "@vue/test-utils";
import { createLocalVue } from "@vue/test-utils";
import ExecutionStepError from "../../../../src/modules/execution/ExecutionStepError.vue";

const localVue = createLocalVue();


describe("ExecutionStepError.vue", () => {

    it("should display data pass via props", () => {
        const wrapper = shallow(ExecutionStepError, {
            localVue,
            propsData: {
                data: {
                    error_type: "INGENIUM_SERVICE_ERROR",
                    error_source: "CORE",
                    http_code_at_source: "404"
                },
                elementId: 'test',
            }
        });

        const errorType = wrapper.find(".error-type");
        
        expect(errorType.text().split(' ').join('')).toBe("ErrorType:INGENIUM_SERVICE_ERROR\nSource:CORE,HTTPResponse:404");
    });

    it("should expand/collapse on click", () => {
        const wrapper = shallow(ExecutionStepError, {
            localVue,
            propsData: {
                data: {
                    error_type: "INGENIUM_SERVICE_ERROR",
                    message: "Call to venure_service failed: ",
                    error_source: "VENUE SERVICE",
                    http_code_at_source: "404", 
                    details: ["this is some data\n blah blah"],
                },
                elementId: "test" 
            },
            data: {
                expanded: false,
            }, 

        });
        const iconSpan = wrapper.find("i");
        iconSpan.trigger('click');
        expect(wrapper.vm.expanded).toBe(true);
    });

});



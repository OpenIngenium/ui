import {shallow} from "@vue/test-utils";
import faker from "faker";
import VersionSelectButton from "../../../../src/modules/reporting/ExecutionSelectButton.vue";

const executionId = faker.random.uuid();


describe("ExecutionSelectButton.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(VersionSelectButton, {
            propsData: {
                data: {
                    execution_id: executionId,
                }
            }
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("Make sure tableEvent gets emitted when clicked", () => {
        wrapper.trigger("click");
        let clickEvent = wrapper.emitted();
        expect('tableEvent' in clickEvent).toBe(true);
        expect(clickEvent.tableEvent[0][0].action).toBe('selectExecution');
        expect(clickEvent.tableEvent[0][0].data.executionId).toBe(executionId);

    });
});

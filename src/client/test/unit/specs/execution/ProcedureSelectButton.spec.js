import {shallow} from "@vue/test-utils";
import faker from "faker";
import ProcedureSelectButton from "../../../../src/modules/elements/non-executable/run-procedure/ProcedureSelectButton.vue";

const procedureId = faker.random.uuid();
const title = faker.random.words();

describe("ProcedureSelectButton.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(ProcedureSelectButton, {
            propsData: {
                data: {
                    procedure_id: procedureId,
                    title: title,
                }
            },
        });
    });

    it("Make sure tableEvent gets emitted when clicked", () => {
        wrapper.trigger('click');
        let clickEvent = wrapper.emitted();
        expect('tableEvent' in clickEvent).toBe(true);
        expect(clickEvent.tableEvent[0][0].action).toBe('selectProcedure');
        expect(clickEvent.tableEvent[0][0].data.procedure_id).toBe(procedureId);
        expect(clickEvent.tableEvent[0][0].data.title).toBe(title);
    });
});

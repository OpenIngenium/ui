import {shallow} from "@vue/test-utils";
import faker from "faker";
import VersionSelectButton from "../../../../src/modules/elements/non-executable/run-procedure/VersionSelectButton.vue";

const procedureId = faker.random.uuid();
const version = faker.random.number();

describe("VersionSelectButton.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(VersionSelectButton, {
            propsData: {
                data: {
                    procedure_id: procedureId,
                    version: version
                }
            }
        });
    });

    it("Make sure tableEvent gets emitted when clicked", () => {
        wrapper.trigger("click");
        let clickEvent = wrapper.emitted();
        expect('tableEvent' in clickEvent).toBe(true);
        expect(clickEvent.tableEvent[0][0].action).toBe('selectVersion');
        expect(clickEvent.tableEvent[0][0].data.procedure_id).toBe(procedureId);
        expect(clickEvent.tableEvent[0][0].data.version).toBe(version);
    });
});

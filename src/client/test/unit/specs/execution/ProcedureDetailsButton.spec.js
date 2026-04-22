import {shallow} from "@vue/test-utils";
import ProcedureDetailsButton from "../../../../src/modules/elements/non-executable/run-procedure/ProcedureDetailsButton.vue";
import * as faker from "faker";

describe("ProcedureDetailsButton.vue", () => {
    const title = faker.name.findName();
    const author = faker.name.findName();
    const procedure_id = faker.random.uuid();
    const institutional_id = faker.random.uuid();
    const current_version = faker.random.number();
    const created_at = faker.date.recent();
    const saved_at = faker.date.recent();
    const description = faker.random.words();

    let wrapper;
    const data = {
        title: title,
        author: author,
        procedure_id: procedure_id,
        institutional_id: institutional_id,
        current_version: current_version,
        created_at: created_at,
        saved_at: saved_at,
        description: description,
    };

    beforeEach(() => {
        wrapper = shallow(ProcedureDetailsButton, {
            propsData: {
                data: data
            },
        });
    });

    it("make sure props is successfully passed",() => {
        expect(wrapper.props().data.title).toBe(data.title);
        expect(wrapper.props().data.author).toBe(data.author);
        expect(wrapper.props().data.procedure_id).toBe(data.procedure_id);
        expect(wrapper.props().data.institutional_id).toBe(data.institutional_id);
        expect(wrapper.props().data.current_version).toBe(data.current_version);
        expect(wrapper.props().data.created_at).toBe(data.created_at);
        expect(wrapper.props().data.saved_at).toBe(data.saved_at);
        expect(wrapper.props().data.description).toBe(data.description);
    });
});

import {shallow} from "@vue/test-utils";
import faker from "faker";
import VersionDetailsButton from "../../../../src/modules/elements/non-executable/run-procedure/VersionDetailsButton.vue";

// Props
const propsData = {
    data: {
        version: faker.random.number(),
        version_id: faker.random.uuid(),
        version_author: faker.name.findName(),
        procedure_id: faker.random.uuid(),
        institutional_release_id: faker.random.uuid(),
        api_version: faker.random.number(),
        time_versioned: faker.date.recent(),
        time_saved: faker.date.recent(),
        version_description: faker.random.words(),
    }
};

// Stub components
const stubs = {
    IngPopover: true,
};

describe("Props are successfully passed", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(VersionDetailsButton, { propsData, stubs });
    });

    it("Version details", () => {
        expect(wrapper.props().data.version).toBe(propsData.data.version);
        expect(wrapper.props().data.version_id).toBe(propsData.data.version_id);
        expect(wrapper.props().data.version_author).toBe(propsData.data.version_author);
        expect(wrapper.props().data.procedure_id).toBe(propsData.data.procedure_id);
        expect(wrapper.props().data.institutional_release_id).toBe(propsData.data.institutional_release_id);
        expect(wrapper.props().data.api_version).toBe(propsData.data.api_version);
        expect(wrapper.props().data.time_versioned).toBe(propsData.data.time_versioned);
        expect(wrapper.props().data.time_saved).toBe(propsData.data.time_saved);
        expect(wrapper.props().data.version_description).toBe(propsData.data.version_description);
    });
});

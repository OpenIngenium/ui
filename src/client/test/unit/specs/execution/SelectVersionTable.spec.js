import {createLocalVue, shallow} from "@vue/test-utils";
import SelectVersionTable from "../../../../src/modules/elements/non-executable/run-procedure/SelectVersionTable.vue";
import ProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";
import Vuex from "vuex";
import faker from "faker";

// State
const procedureId = faker.random.uuid();
const state = {
    procedureVersions: {
        [procedureId]: {
            total: 18,
            versions: [],
        }
    }
};
for(let i = 0; i < 10; i++) {
    state.procedureVersions[procedureId].versions.push({ version_id: faker.random.uuid });
}

// Props
const propsData = { procedureId: procedureId };

// Getters
const getters = {
    procedureVersions: ProcedureStore.getters.procedureVersions,
};

// Actions
const actions = {
    fetchProcedureVersions: () => {},
};

// Localvue
const localVue = createLocalVue();
localVue.use(Vuex);

describe("SelectVersionTable.vue", () => {
    let store;
    let wrapper;

    beforeEach(() => {
        store = new Vuex.Store({ state, getters, actions });

        wrapper = shallow(SelectVersionTable, {
            store,
            localVue,
            propsData,
            stubs: {
                IngTable: true,
                VersionSelectButton: true,
                VersionDetailsButton: true,
            },
        });
    });

    it("setVersion emits setVersion event", () => {
        wrapper.vm.setVersion({customEvent: "this is custom event"});
        expect(wrapper.emitted().setVersion).toBeTruthy();
    });

    it("Pagination backward clicked", () => {
        spyOn(wrapper.vm, "paginationBackward");
        wrapper.find("i").trigger("click");
        expect(wrapper.vm.paginationBackward).toHaveBeenCalled();
    });

    it("Pagination forward clicked", () => {
        spyOn(wrapper.vm, "paginationForward");
        wrapper.findAll("i").at(1).trigger("click");
        expect(wrapper.vm.paginationForward).toHaveBeenCalled();
    });

    it("pagination forward and backward", () => {
        wrapper.vm.paginationForward();
        expect(wrapper.vm.pagination.page).toBe(2);
        wrapper.vm.paginationForward();
        expect(wrapper.vm.pagination.page).toBe(2);

        wrapper.vm.paginationBackward();
        expect(wrapper.vm.pagination.page).toBe(1);
        wrapper.vm.paginationBackward();
        expect(wrapper.vm.pagination.page).toBe(1);
    });
});

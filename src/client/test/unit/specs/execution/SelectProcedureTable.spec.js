import {createLocalVue, shallow} from "@vue/test-utils";
import SelectProcedureTable from "../../../../src/modules/elements/non-executable/run-procedure/SelectProcedureTable.vue";
import ProcedureStore from "../../../../src/modules/elements/non-executable/run-procedure/run-procedure-store";
import Vuex from "vuex";
import faker from "faker";

// Getters and actions
const {
    procedures,
    procedureCount
} = ProcedureStore.getters;
const getters = {
    procedures,
    procedureCount
};

// State
const procedureCountConst = 18;
const state = {
    procedureCount: procedureCountConst,
    procedures: [],
};
for(let i = 0; i < 10; i++) {
    state.procedures.push({
        author: faker.name.findName(),
        title: faker.random.words(),
        procedure_id: i,
    });
}

// Setup local vue to use vuex
const localVue = createLocalVue();
localVue.use(Vuex);

describe("SelectProcedureTable.vue", () => {
    let store;
    let wrapper;
    let actions;

    beforeEach(() => {
        actions = {
            fetchProcedures: () => {},
        };
        store = new Vuex.Store({
            state,
            getters,
            actions,
        });
        wrapper = shallow(SelectProcedureTable, {
            store,
            localVue,
            stubs: {
                'ing-table': true,
            },
        });
    });


    it("setProcedure emit event", () => {
        wrapper.vm.setProcedure({customEvent: "this is custom"});
        const emitted = wrapper.emitted();
        expect('setProcedure' in emitted).toBe(true);
        expect(emitted.setProcedure[0][0].customEvent).toBe('this is custom');
    });
});

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import SelectEvrTable from "../../../../src/modules/elements/executable/query-evr/SelectEvrTable.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("SelectEvrTable.vue", () => {
    function build({evrType = "SSE", sseVersion = "1.0", flightVersion = "2.0", evrs = []} = {}) {
        const actions = {
            fetchSseEvrs: sinon.spy(),
            fetchFlightEvrs: sinon.spy(),
            fetchEvrs: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                evrs: () => evrs,
                evrCount: () => evrs.length,
                selectedSseDictionaryVersion: () => sseVersion,
                selectedFlightDictionaryVersion: () => flightVersion
            },
            actions
        });
        const wrapper = shallowMount(SelectEvrTable, {
            store,
            localVue,
            propsData: {evrType},
            stubs: {"ing-table": true}
        });
        return {wrapper, actions};
    }

    it("fetches SSE EVRs on creation for an SSE table", () => {
        const {actions} = build({evrType: "SSE"});
        expect(actions.fetchSseEvrs.calledOnce).toBe(true);
        expect(actions.fetchFlightEvrs.called).toBe(false);
    });

    it("fetches FLIGHT EVRs on creation for a flight table", () => {
        const {actions} = build({evrType: "FLIGHT"});
        expect(actions.fetchFlightEvrs.calledOnce).toBe(true);
    });

    it("does not fetch when there is no dictionary version", () => {
        const {actions} = build({evrType: "SSE", sseVersion: null});
        expect(actions.fetchSseEvrs.called).toBe(false);
    });

    it("getDictionaryVersion reflects the evr type", () => {
        expect(build({evrType: "SSE", sseVersion: "9.9"}).wrapper.vm.getDictionaryVersion()).toBe("9.9");
        expect(build({evrType: "FLIGHT", flightVersion: "7.7"}).wrapper.vm.getDictionaryVersion()).toBe("7.7");
        expect(build({evrType: "SSE", sseVersion: null}).wrapper.vm.getDictionaryVersion()).toBe("None");
    });

    it("generateRows maps the evr getter into table rows", () => {
        const {wrapper} = build({evrs: [{evr_name: "EVR_A", evr_level: "DIAGNOSTIC", operations_category: "OPS", evr_description: "d", evr_message: "m"}]});
        const rows = wrapper.vm.generateRows();
        expect(rows[0].evr_name).toBe("EVR_A");
        expect(rows[0].evr_level).toBe("DIAGNOSTIC");
    });

    it("fetchEvrsCallback dispatches the type-specific fetch with paging", () => {
        const {wrapper, actions} = build({evrType: "FLIGHT"});
        wrapper.vm.fetchEvrsCallback({sortDirection: "desc", sortField: "evr_name", filters: {}, limit: 5, offset: 10});
        expect(actions.fetchFlightEvrs.lastCall.args[1].wild).toBe(true);
        expect(actions.fetchFlightEvrs.lastCall.args[1].offset).toBe(10);
    });

    it("selectEvr re-emits the custom event", () => {
        const {wrapper} = build();
        wrapper.vm.selectEvr({row: 1});
        expect(wrapper.emitted("selectEvr")[0][0]).toEqual({row: 1});
    });
});

import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import ExecutionHistoryTable from "../../../../src/modules/venue-detail/ExecutionHistoryTable.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("ExecutionHistoryTable.vue", () => {
    function build(executionElements = []) {
        const fetchExecutions = sinon.spy();
        const store = new Vuex.Store({
            getters: {
                executionElements: () => executionElements,
                totalExecutionElements: () => executionElements.length
            },
            actions: {fetchExecutions}
        });
        const wrapper = shallowMount(ExecutionHistoryTable, {
            store,
            localVue,
            propsData: {venueId: "v1"},
            stubs: {"ing-table": true}
        });
        return {wrapper, fetchExecutions};
    }

    it("fetches executions for the venue on creation", () => {
        const {fetchExecutions} = build();
        expect(fetchExecutions.calledOnce).toBe(true);
        expect(fetchExecutions.args[0][1]).toEqual({limit: 10, venueId: "v1"});
    });

    it("generateRows renders an execution link and maps fields", () => {
        const {wrapper} = build([{
            executionId: "e1", conductors: "Alice", timeStarted: "t0", timeCompleted: "t1",
            usedProcedures: "P1", description: "desc", status: "CLOSED"
        }]);
        const rows = wrapper.vm.generateRows();
        expect(rows[0].executionId).toContain("/execute/as_run/e1");
        expect(rows[0].conductors).toBe("Alice");
        expect(rows[0].status).toBe("CLOSED");
    });

    it("fetchExecutionsCallback forwards paging and filter params", () => {
        const {wrapper, fetchExecutions} = build();
        wrapper.vm.fetchExecutionsCallback({sortDirection: "asc", sortField: "status", filters: {}, limit: 25, offset: 50});
        const call = fetchExecutions.lastCall.args[1];
        expect(call).toEqual({venueId: "v1", limit: 25, offset: 50, sortField: "status", sortDirection: "asc", filters: {}});
    });
});

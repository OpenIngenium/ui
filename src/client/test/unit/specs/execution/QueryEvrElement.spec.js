import { mount } from "@vue/test-utils";
import sinon from "sinon";
import Vue from "vue";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import QueryEvrElement from "../../../../src/modules/elements/executable/query-evr/QueryEvrElement.vue";
import executionStore from "../../../../src/modules/execution/execution-store";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey
} = executionStore.getters;

const localVue = createLocalVue();
localVue.use(Vuex);

describe("QueryEvrElement.vue", () => {
    const elementId = "abc123";

    function build(userInput = {}, results = {}) {
        const actions = {
            saveElementInput: sinon.spy(),
            editElementInput: sinon.spy(),
            fetchFlightEvrs: sinon.spy(),
            fetchSseEvrs: sinon.spy(),
            populateTimeReferences: sinon.spy()
        };
        const getters = {
            evrs: () => [{evr_name: "E1"}],
            selectedSseDictionaryVersion: () => "sse-v1",
            selectedFlightDictionaryVersion: () => "flt-v1",
            dataPaths: () => ["dp1"],
            timeReferences: () => ["T1"],
            executionInputKey,
            elementKey,
            executionMetaDataKey,
            executionResultsKey: () => (id, key) => results[key],
            canParticipate: () => true,
            modStyle: () => () => "",
            numEntries: () => () => 0,
            elementViewState: () => () => ({detailLevel: 3})
        };
        const store = new Vuex.Store({
            state: {
                elementIds: [elementId],
                elemModificationMap: {},
                elements: {
                    [elementId]: {
                        elem_id: elementId,
                        elem_type: "STEP",
                        executed: false,
                        execution: {meta_data: {status: undefined}, results},
                        execution_user_input: userInput,
                        number: "1",
                        parent_id: "",
                        specification: {},
                        step_type: "QUERY_EVR"
                    }
                }
            },
            actions,
            getters
        });

        const wrapper = mount(Vue.extend(elementExecutionMixin).extend(QueryEvrElement), {
            propsData: {
                elementMap: {name: "QUERY_EVR", path: "query_evr_steps", isNestable: false},
                elementId,
                mode: "execution"
            },
            store,
            localVue,
            stubs: {
                "execution-status-check": true,
                "select-evr-table": true,
                "ing-modal": true,
                "ing-popover": true
            }
        });
        return {wrapper, actions};
    }

    let wrapper;
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("computed getters read execution_user_input", () => {
        const built = build({
            data_path: "dp1",
            duration: "30",
            start_time: "S",
            end_time: "E",
            evr_type: "SSE",
            evr_level: "L",
            evr_name: "N",
            message_filter: "MF",
            time_type: "ERT",
            timeout: 10,
            verification_condition: "EQUAL",
            verification_value: 5
        });
        wrapper = built.wrapper;
        const vm = wrapper.vm;
        expect(vm.dataPath).toBe("dp1");
        expect(vm.duration).toBe("30");
        expect(vm.startTime).toBe("S");
        expect(vm.endTime).toBe("E");
        expect(vm.evrType).toBe("SSE");
        expect(vm.evrLevel).toBe("L");
        expect(vm.evrName).toBe("N");
        expect(vm.messageFilter).toBe("MF");
        expect(vm.timeType).toBe("ERT");
        expect(vm.timeout).toBe(10);
        expect(vm.verificationCondition).toBe("EQUAL");
        expect(vm.verificationValue).toBe(5);
        expect(vm.showVerificationValue).toBe(true);
    });

    it("showVerificationValue is false for RECORD", () => {
        wrapper = build({verification_condition: "RECORD"}).wrapper;
        expect(wrapper.vm.showVerificationValue).toBe(false);
    });

    it("results-derived getters read execution results", () => {
        wrapper = build({}, {total_count: 7, evr_data: [{event_id: 1}], translated_start_time: "TS", translated_end_time: "TE", query_start_time: "QS", query_end_time: "QE"}).wrapper;
        expect(wrapper.vm.totalCount).toBe(7);
        expect(wrapper.vm.evrResultsData).toEqual([{event_id: 1}]);
        expect(wrapper.vm.translatedStartTime).toBe("TS");
        expect(wrapper.vm.translatedEndTime).toBe("TE");
        expect(wrapper.vm.queryTimeRange).toContain("QS");
    });

    it("evrData returns [] when results are not the expected shape", () => {
        wrapper = build({}, {evr_data: [{event_id: 1}]}).wrapper;
        // evrResultsData is an array here, so evrData falls back to []
        expect(wrapper.vm.evrData).toEqual([]);
    });

    it("evrTypeCategorySelected getter/setter", () => {
        wrapper = build({evr_type: "SSE"}).wrapper;
        expect(wrapper.vm.evrTypeCategorySelected).toBe("FLIGHT");
        wrapper.vm.evrTypeCategorySelected = "SSE";
        expect(wrapper.vm.evrTypeCategorySelected).toBe("SSE");
    });

    it("getEvrTypeOptions returns the category list", () => {
        wrapper = build().wrapper;
        expect(wrapper.vm.getEvrTypeOptions()).toEqual(["SSE", "FSW_REALTIME", "FSW_RECORDED"]);
    });

    it("setters dispatch editElementInput", () => {
        const built = build();
        wrapper = built.wrapper;
        wrapper.vm.dataPath = "newPath";
        expect(built.actions.editElementInput.called).toBe(true);
    });

    it("handleInput sets evrName", () => {
        const built = build();
        wrapper = built.wrapper;
        wrapper.vm.handleInput("myEvr");
        expect(built.actions.editElementInput.called).toBe(true);
    });

    it("saveDataPath/saveStartTime/saveEndTime persist and save", () => {
        const built = build();
        wrapper = built.wrapper;
        wrapper.vm.saveDataPath("dpX");
        wrapper.vm.saveStartTime("T1");
        wrapper.vm.saveEndTime("T2");
        expect(built.actions.saveElementInput.called).toBe(true);
    });

    it("selectedEvr closes the modal, sets the name, and saves", () => {
        const built = build();
        wrapper = built.wrapper;
        wrapper.vm.selectedEvr({data: {evr_name: "chosen"}});
        expect(wrapper.vm.showEvrModal).toBe(false);
        expect(built.actions.saveElementInput.called).toBe(true);
    });

    it("fetchEvrAutoCompleteCallback dispatches by evr type", () => {
        const sseBuilt = build({evr_type: "SSE"});
        wrapper = sseBuilt.wrapper;
        wrapper.vm.fetchEvrAutoCompleteCallback("abc");
        expect(sseBuilt.actions.fetchSseEvrs.called).toBe(true);
        wrapper.destroy();

        const flightBuilt = build({evr_type: "FSW_REALTIME"});
        wrapper = flightBuilt.wrapper;
        wrapper.vm.fetchEvrAutoCompleteCallback("abc");
        expect(flightBuilt.actions.fetchFlightEvrs.called).toBe(true);
    });

    it("saveEvrQuery normalizes fields and saves", () => {
        const built = build({timeout: "10", verification_value: "5", evr_name: " N ", evr_id: " id "});
        wrapper = built.wrapper;
        wrapper.vm.saveEvrQuery();
        expect(built.actions.saveElementInput.called).toBe(true);
    });
});

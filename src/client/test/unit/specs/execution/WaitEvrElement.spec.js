import { shallow, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import executionStore from "../../../../src/modules/execution/execution-store";
import WaitEvrElement from "../../../../src/modules/elements/executable/wait-evr/WaitEvrElement.vue";

const {
    executionInputKey,
    elementKey,
    executionMetaDataKey,
    numEntries
} = executionStore.getters;

const localVue = createLocalVue();
localVue.use(Vuex);

const ELEMENT_ID = "wait-evr-1";
const Composed = Vue.extend(elementExecutionMixin).extend(WaitEvrElement);

describe("WaitEvrElement.vue", () => {
    function build({input = {}, mode = "execution", results = {}} = {}) {
        const actions = {
            editElementInput: sinon.spy(),
            editElementArray: sinon.spy(),
            saveElementInput: sinon.spy(),
            saveRedlineInput: sinon.spy(),
            populateTimeReferences: sinon.spy()
        };
        const store = new Vuex.Store({
            state: {
                elementIds: [ELEMENT_ID],
                elements: {
                    [ELEMENT_ID]: {
                        elem_id: ELEMENT_ID,
                        elem_type: "STEP",
                        executed: false,
                        execution: {meta_data: {status: undefined}, results: {}},
                        execution_user_input: {data_path: "", start_time: "", lookback: "", timeout: "", entries: [], ...input},
                        number: "1",
                        parent_id: "",
                        specification: {},
                        step_type: "WAIT_EVR"
                    }
                }
            },
            getters: {
                executionInputKey,
                elementKey,
                executionMetaDataKey,
                numEntries,
                executionResultsKey: () => (elemId, key) => results[key],
                executionRedlineInputKey: () => () => undefined,
                canParticipate: () => true,
                dataPaths: () => ["SidaA", "SidaB"],
                timeReferences: () => ["T0", "T1"],
                modStyle: () => () => "",
                elementViewState: () => () => ({detailLevel: 3})
            },
            actions
        });
        const wrapper = shallow(Composed, {
            propsData: {
                elementMap: {name: "WAIT_EVR", path: "wait_evr_steps", isNestable: false},
                elementId: ELEMENT_ID,
                mode
            },
            store,
            localVue,
            stubs: {"execution-status-check": true, "entries-wrapper": true, "ing-data-entry": true}
        });
        return {wrapper, actions};
    }

    it("created() seeds the columnInfos for the data grid", () => {
        const vm = build().wrapper.vm;
        expect(vm.columnInfos.map((c) => c.name)).toContain("evr_type");
        expect(vm.columnInfos.find((c) => c.name === "verification_condition").enumValues).toEqual(["EXISTS", "DOES_NOT_EXIST"]);
    });

    it("input getters read the execution input", () => {
        const vm = build({input: {data_path: "SidaA", start_time: "T0", lookback: 30, timeout: 60}}).wrapper.vm;
        expect(vm.dataPath).toBe("SidaA");
        expect(vm.startTime).toBe("T0");
        expect(vm.lookback).toBe(30);
        expect(vm.timeout).toBe(60);
    });

    it("input setters dispatch editElementInput with the key", () => {
        const {wrapper, actions} = build();
        wrapper.vm.dataPath = "SidaB";
        wrapper.vm.startTime = "T1";
        wrapper.vm.lookback = 15;
        wrapper.vm.timeout = 90;
        const keys = actions.editElementInput.getCalls().map((c) => c.args[1].keyString);
        expect(keys).toEqual(["data_path", "start_time", "lookback", "timeout"]);
    });

    it("translatedStartTime and queryTimeRange read results in execution mode", () => {
        const vm = build({mode: "execution", results: {translated_start_time: "2024", query_start_time: "s", query_end_time: "e"}}).wrapper.vm;
        expect(vm.translatedStartTime).toBe("2024");
        expect(vm.queryTimeRange).toContain("Query Start: s");
    });

    it("translatedStartTime is empty outside execution/as-run", () => {
        const vm = build({mode: "authoring"}).wrapper.vm;
        expect(vm.translatedStartTime).toBe("");
        expect(vm.queryTimeRange).toBe("");
    });

    it("saveDataPath sets the data path and saves", () => {
        const {wrapper, actions} = build();
        wrapper.vm.saveDataPath("SidaA");
        expect(actions.editElementInput.lastCall.args[1]).toEqual({elementId: ELEMENT_ID, keyString: "data_path", value: "SidaA"});
        expect(actions.saveElementInput.called).toBe(true);
    });

    it("saveStartTime sets the start time and saves", () => {
        const {wrapper, actions} = build();
        wrapper.vm.saveStartTime("T1");
        const startCall = actions.editElementInput.getCalls().find((c) => c.args[1].keyString === "start_time");
        expect(startCall.args[1].value).toBe("T1");
        expect(actions.saveElementInput.called).toBe(true);
    });

    it("saveEvrWait coerces lookback/timeout to integers and saves", () => {
        const {wrapper, actions} = build({input: {lookback: "30", timeout: "60"}});
        wrapper.vm.saveEvrWait();
        const lookbackCall = actions.editElementInput.getCalls().find((c) => c.args[1].keyString === "lookback");
        expect(lookbackCall.args[1].value).toBe(30);
        expect(actions.saveElementInput.called).toBe(true);
    });

    it("handleDataEntryEvent re-emits the event", () => {
        const wrapper = build().wrapper;
        wrapper.vm.handleDataEntryEvent({type: "showModal", val: true});
        expect(wrapper.emitted("dataEntryEvent")[0][0]).toEqual({type: "showModal", val: true});
    });
});

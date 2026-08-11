import sinon from "sinon";
import evrStore from "../../../../src/modules/elements/executable/query-evr/evr-store";
import waitEhaStore from "../../../../src/modules/elements/executable/wait-eha/wait-eha-store";
import dictionaryApi from "../../../../src/api/dictionary";

describe("evr-store", () => {
    let stubs;
    let commits;
    let commit;

    beforeEach(() => {
        stubs = [];
        commits = [];
        commit = (type, payload) => commits.push({type, payload});
    });

    afterEach(() => {
        stubs.forEach((s) => s.restore());
    });

    it("getters expose evrs and count", () => {
        const state = {evrs: [{e: 1}], evrCount: 3};
        expect(evrStore.getters.evrs(state)).toEqual([{e: 1}]);
        expect(evrStore.getters.evrCount(state)).toBe(3);
    });

    it("mutations set boolean and receive evrs", () => {
        const state = {};
        evrStore.mutations.setBooleanKey(state, {key: "loadingEvrs", bool: true});
        expect(state.loadingEvrs).toBe(true);
        evrStore.mutations.receiveEvrs(state, {evrs: [{e: 1}], total: 2});
        expect(state.evrs).toEqual([{e: 1}]);
        expect(state.evrCount).toBe(2);
    });

    it("fetchFlightEvrs/fetchSseEvrs fetch and commit", async() => {
        stubs.push(sinon.stub(dictionaryApi, "getFlightEvrs").resolves({evrs: [{e: 1}], total: 1}));
        stubs.push(sinon.stub(dictionaryApi, "getSseEvrs").resolves({evrs: [{e: 2}], total: 1}));
        await evrStore.actions.fetchFlightEvrs({commit}, {});
        await evrStore.actions.fetchSseEvrs({commit}, {});
        const receives = commits.filter((c) => c.type === "receiveEvrs");
        expect(receives.length).toBe(2);
        expect(receives[0].payload).toEqual({evrs: [{e: 1}], total: 1});
    });
});

describe("wait-eha-store", () => {
    let stubs;
    let commits;
    let commit;

    beforeEach(() => {
        stubs = [];
        commits = [];
        commit = (type, payload) => commits.push({type, payload});
    });

    afterEach(() => {
        stubs.forEach((s) => s.restore());
    });

    it("getters expose ehas + keyed lookups", () => {
        const state = {
            ehas: [{c: 1}],
            ehaCount: 2,
            euPresents: {"T-v1-CH": true},
            enumerations: {"T-v1-CH": [{x: 1}]},
            ehaTypes: {"T-v1-CH": "TYPE"}
        };
        expect(waitEhaStore.getters.ehas(state)).toEqual([{c: 1}]);
        expect(waitEhaStore.getters.ehaCount(state)).toBe(2);
        expect(waitEhaStore.getters.euPresent(state)("T", "v1", "CH")).toBe(true);
        expect(waitEhaStore.getters.euPresent(state)("T", "v1", "NONE")).toBeNull();
        expect(waitEhaStore.getters.enumeration(state)("T", "v1", "CH")).toEqual([{x: 1}]);
        expect(waitEhaStore.getters.enumerations(state)).toEqual({"T-v1-CH": [{x: 1}]});
        expect(waitEhaStore.getters.ehaType(state)("T", "v1", "CH")).toBe("TYPE");
    });

    it("mutations set keyed maps", () => {
        const state = {euPresents: {}, enumerations: {}, ehaTypes: {}};
        waitEhaStore.mutations.receiveEhas(state, {ehas: [{c: 1}], total: 1});
        expect(state.ehas).toEqual([{c: 1}]);
        waitEhaStore.mutations.setEuPresents(state, {channelType: "T", dictionaryVersion: "v1", channelName: "CH", val: true});
        expect(state.euPresents["T-v1-CH"]).toBe(true);
        waitEhaStore.mutations.setEnumerations(state, {channelType: "T", dictionaryVersion: "v1", channelName: "CH", val: [1]});
        expect(state.enumerations["T-v1-CH"]).toEqual([1]);
        waitEhaStore.mutations.setEhasType(state, {channelType: "T", dictionaryVersion: "v1", channelName: "CH", val: "TYPE"});
        expect(state.ehaTypes["T-v1-CH"]).toBe("TYPE");
    });

    it("fetchFlightEhas/fetchSseEhas fetch and commit", async() => {
        stubs.push(sinon.stub(dictionaryApi, "getFlightEhas").resolves({ehas: [{c: 1}], total: 1}));
        stubs.push(sinon.stub(dictionaryApi, "getSseEhas").resolves({ehas: [{c: 2}], total: 1}));
        await waitEhaStore.actions.fetchFlightEhas({commit}, {});
        await waitEhaStore.actions.fetchSseEhas({commit}, {});
        expect(commits.filter((c) => c.type === "receiveEhas").length).toBe(2);
    });

    it("fetchFlightEhasEuPresentAndEhasType commits eu present + type", async() => {
        stubs.push(sinon.stub(dictionaryApi, "getFlightEhas").resolves({ehas: {eu_present: "Yes", eha_type: "TYPE"}}));
        await waitEhaStore.actions.fetchFlightEhasEuPresentAndEhasType(
            {commit, getters: {}},
            {channelType: "T", dictionaryVersion: "v1", channelName: "CH"}
        );
        const euCommit = commits.find((c) => c.type === "setEuPresents");
        expect(euCommit.payload.val).toBe(true);
        const typeCommit = commits.find((c) => c.type === "setEhasType");
        expect(typeCommit.payload.val).toBe("TYPE");
    });

    it("fetchSseEhasEuPresentAndEhasType commits eu present false when not Yes", async() => {
        stubs.push(sinon.stub(dictionaryApi, "getSseEhas").resolves({ehas: {eu_present: "No", eha_type: "T2"}}));
        await waitEhaStore.actions.fetchSseEhasEuPresentAndEhasType(
            {commit, getters: {}},
            {channelType: "T", dictionaryVersion: "v1", channelName: "CH"}
        );
        expect(commits.find((c) => c.type === "setEuPresents").payload.val).toBe(false);
    });

    it("fetchFlight1553EuEn commits eu present and enumerations", async() => {
        stubs.push(sinon.stub(dictionaryApi, "getFlight1553").resolves({mil1553: {eu_present: "Yes", enumerations: [{v: 1}]}}));
        await waitEhaStore.actions.fetchFlight1553EuEn(
            {commit, getters: {}},
            {channelType: "T", dictionaryVersion: "v1", channelName: "CH"}
        );
        expect(commits.find((c) => c.type === "setEuPresents").payload.val).toBe(true);
        expect(commits.find((c) => c.type === "setEnumerations").payload.val).toEqual([{v: 1}]);
    });

    it("fetchFlightEhasEuPresentAndEhasType is a no-op without a dictionary version", async() => {
        const spy = sinon.stub(dictionaryApi, "getFlightEhas").resolves({ehas: {}});
        stubs.push(spy);
        await waitEhaStore.actions.fetchFlightEhasEuPresentAndEhasType(
            {commit, getters: {}},
            {channelType: "T", dictionaryVersion: "", channelName: "CH"}
        );
        expect(spy.called).toBe(false);
        expect(commits.length).toBe(0);
    });
});

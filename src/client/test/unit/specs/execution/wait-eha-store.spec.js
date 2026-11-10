import store from "../../../../src/modules/elements/executable/wait-eha/wait-eha-store";

describe("Store wait-eha-store.js", () => {
    describe("getters", () => {
        it("ehas - get list of all ehas currently in the store.", () => {
            let ehaValues = [{
                channel_id: "ACM-007",
                derived: "No",
                eha_description: "a bit packed u32 containing the...",
                eha_name: "acm_categories",
                operations_category: "ACM"
            }];

            const state = {
                ehas: ehaValues
            };

            let ehas = store.getters.ehas(state);
            expect(ehas.length).toBe(1);
            expect(ehas).toBe(ehaValues);
        });

        it("ehaCount - get the count of all the ehas currently in the store.", () => {
            let count = 5;
            const state = {
                ehaCount: count
            };

            let ehaCount = store.getters.ehaCount(state);
            expect(ehaCount).toBe(count);
        });
    });
    describe("mutations", () => {
        it("receive ehas - adds Ehas and total", () => {

            const ehaPayload = [
                {
                    channel_id: "SSE2-0199",
                    derived: "No",
                    eha_description: "125_NS_CTR",
                    eha_name: "125_MS_CTR",
                    operations_category: "SSE"
                },
                {
                    channel_id: "SSE2-0120",
                    derived: "No",
                    eha_description: "126_NS_CTR",
                    eha_name: "126_MS_CTR",
                    operations_category: "SSE"
                },
            ];

            const total = 10;
            const state = {
                ehas: [],
                ehaCount: 0
            };

            expect(state.ehas.length).toBe(0);
            expect(state.ehaCount).toBe(0);

            store.mutations.receiveEhas(state, {
                ehas: ehaPayload,
                total: total
            });

            expect(state.ehas.length).toBe(ehaPayload.length);
            expect(state.ehaCount).toBe(total);
            expect(state.ehaCount).toEqual(jasmine.any(Number));
        });

        it("setBooleanKey - set loadingCmds indicator true/false", () => {
            const state = {
                loadingEhas: true
            };

            expect(state.loadingEhas).toBe(true);

            store.mutations.setBooleanKey(state, {
                key: "loadingEhas",
                bool: false
            });

            expect(state.loadingEhas).toBe(false);
        });
    });
});
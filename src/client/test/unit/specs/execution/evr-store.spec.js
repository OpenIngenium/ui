import * as faker from "faker";
import store from "../../../../src/modules/elements/executable/query-evr/evr-store";

describe("Store evr-store.js", () => {
    describe("getters", () => {
        it("evrs - get a list of all evrs currently in the store.", () => {
            let evrValues = [{
                evr_name: faker.random.word(),
                evr_id: faker.random.uuid(),
                operations_category: faker.random.word(),
                evr_description: faker.random.word(),
                evr_message: faker.random.word(),
                evr_level: faker.random.word()
            }];

            const state = {
                evrs: evrValues
            };

            let evrs = store.getters.evrs(state);
            expect(evrs.length).toBe(1);
            expect(evrs).toBe(evrValues);
        });

        it("evrCount - get the count of all the evrs currently in the store.", () => {
            let count = 5;
            const state = {
                evrCount: count
            };

            let evrCount = store.getters.evrCount(state);
            expect(evrCount).toBe(count);
        });
    });

    describe("mutations", () => {
        it("receiveEvrs - adds evr and total", () => {
            const evrsPayload = [
                {
                    evr_name: faker.random.word(),
                    evr_id: faker.random.uuid(),
                    operations_category: faker.random.word(),
                    evr_description: faker.random.word(),
                    evr_message: faker.random.word(),
                    evr_level: faker.random.word()
                },
                {
                    evr_name: faker.random.word(),
                    evr_id: faker.random.uuid(),
                    operations_category: faker.random.word(),
                    evr_description: faker.random.word(),
                    evr_message: faker.random.word(),
                    evr_level: faker.random.word()
                }
            ];
            const total = 50;
            const state = {
                evrs: [],
                evrCount: 0
            };

            expect(state.evrs.length).toBe(0);
            expect(state.evrCount).toBe(0);

            store.mutations.receiveEvrs(state, {
                evrs: evrsPayload,
                total: total
            });

            expect(state.evrs.length).toBe(evrsPayload.length);
            expect(state.evrCount).toBe(total);
        });

        it("receiveEvrs - adds evr and total off nominal", () => {
            const evrsPayload = "blah";
            const total = 50;
            const state = {
                evrs: [],
                evrCount: 0
            };

            expect(state.evrs.length).toBe(0);
            expect(state.evrCount).toBe(0);

            store.mutations.receiveEvrs(state, {
                evrs: evrsPayload,
                total: total
            });

            expect(state.evrs).toBe("blah");
            expect(state.evrCount).toBe(total);
        });

        it("setBooleanKey - set loadingEvrs indicator true/false", () => {
            const state = {
                loadingEvrs: true
            };

            expect(state.loadingEvrs).toBe(true);

            store.mutations.setBooleanKey(state, {
                key: "loadingEvrs",
                bool: false
            });

            expect(state.loadingEvrs).toBe(false);
        });
    });
});
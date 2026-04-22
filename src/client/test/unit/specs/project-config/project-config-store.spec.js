import store from "../../../../src/modules/project-config/project-config-store";

describe("Store project-config-store.js", () => {
    describe("Flight", () => {
        describe("(getters)", () => {
            it("flight", () => {
                let flight = {
                    "v1": {
                        "foo": "bar"
                    }
                };

                const state = {
                    flight: flight
                };

                let flight_result = store.getters.flight(state);

                expect(flight_result).toBe(flight);
            });

            it("flightVersions", () => {
                let flight = {
                    "v1": {
                        "sse": {
                            "foo": "bar"
                        }
                    }
                };

                const state = {
                    flight: flight
                };

                let flight_result = store.getters.flightVersions(state, "v1", "sse");
                
                expect(flight_result).toBe(flight_result);
            });
        });
        describe("(mutations)", () => {
            it("receiveDictionaries", () => {
                const state = {
                    "sse": {}
                };

                expect(typeof state).toBe('object');

                store.mutations.receiveDictionaries(state, {
                    dictionaries: [
                        {
                            "dictionary_type": "sse",
                            "dictionary_version": "v1",
                            "foo": "bar"
                        }
                    ],
                    total: 1
                });

                expect(typeof state.sse).toBe('object');
            });
        });
    });

    describe("SSE", () => { 
        describe("(getters)", () => {

        });
        describe("(mutations)", () => {

        });
    });

    describe("Vis", () => {
        describe("(getters)", () => {

        });
        describe("(mutations)", () => {

        });
    });

    describe("Custom Scripts", () => { 
        describe("(getters)", () => {

        });
        describe("(mutations)", () => {

        });
    });
});
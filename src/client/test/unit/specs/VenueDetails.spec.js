import { mount, shallow } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import VenueDetails from "../../../src/modules/execution/VenueDetails.vue";
import executionStore from "../../../src/modules/execution/execution-store";
import * as faker from "faker";

const localVue = createLocalVue();
localVue.use(Vuex);

const {
    execution,
    venue,
    follow,
    mode,
    pageTitle,
} = executionStore.getters;

const {
    toggleExecutionFollow,
} = executionStore.actions;

describe("VenueDetails.vue", () => {
    let actions;
    let getters;
    let mutations;
    let store;
    let $route;
    let venueId = "fake-venue-id";

    beforeEach(() => {
        actions = {
            fetchVenue: sinon.spy(),
            toggleExecutionFollow,
        };

        getters = { execution, venue, follow, mode, pageTitle};

        mutations = {
            receiveVenue(state, venue) {
                state.venue = venue;
            }
        };

        store = new Vuex.Store({
            modules: {
                execution: {
                    state: {
                        venue: {
                            name: "venue 1",
                            description: 'this is test venue',
                            type: 'test',
                            location: 'test',
                            ampcs_address: 'test',
                            venue_status: {
                                execution_id: 'test',
                                test_conductor: 'test',
                                started_on: faker.date.past(),
                            }
                        },
                        follow: false
                    },
                    actions,
                    getters,
                    mutations
                }
            }
        });

        $route = {
            path: '/execute_spa/fake-execution-id/',
            params: {
                venueId: venueId
            }
        };
    });

    xit("grabs venue_id from the url", () => {
        shallow(VenueDetails, {store, localVue, mocks: {$route},
            propsData: {
                venueId: venueId,
                isAsRun: false
            },
        });
        expect(actions.fetchVenue.calledOnce).toBeTruthy();
        expect(actions.fetchVenue.args[0][1]).toBe(venueId);
    });

});

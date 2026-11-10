import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import Venues from "../../../src/modules/dashboard/Venues.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("Venues.vue", () => {
    let actions;
    let getters;
    let store;

    beforeEach(() => {
        actions = {
            getVenues: sinon.spy()
        };
    });

    it("shows a message when there are no venues", () => {
        getters = {
            venues: () => [],
            totalVenues: () => 0
        };

        store = new Vuex.Store({
            state: {},
            actions,
            getters
        });

        const wrapper = shallow(Venues, {
            propsData: {
                currentUser: "test-user"
            },
            store,
            localVue,
            stubs: {
                'paginator': true,
                'venue-tile': true,
                'ing-table': true,
                'venue-status-dot': true,
                'venue-action-link': true,
            }
        });
        const emptyDiv = wrapper.find("div div .alert");
        expect(emptyDiv.text()).toContain("There are no venues on the server");
        expect(actions.getVenues.calledOnce).toBeTruthy();
    });

});

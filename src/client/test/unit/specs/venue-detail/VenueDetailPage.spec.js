import { shallow, createLocalVue } from "@vue/test-utils";
import sinon from "sinon";
import VenueDetailPage from "../../../../src/modules/venue-detail/VenueDetailPage.vue";
import Vuex from "vuex";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("VenueDetailPage.vue", () => {
    let actions;
    let getters;
    let store;
    let $route;

    beforeEach(() => {
        actions = {
            fetchVenueData: sinon.spy(),
            fetchVenueConfigHistory: sinon.spy()
        };
        getters = {
            venueData: () => {
                /* eslint-disable no-unused-labels */
                return {
                    ampcsAddress: "foo",
                    description: "bar",
                    location: "LA",
                    name: "test venue",
                    type: "WSTS",
                    url: "jpl dot gov",
                    venueId: "a long string",
                    venueStatus: {
                        status: "IN_USE",
                        testConductor: "mr test",
                    }
                };
                /* eslint-enable no-unused-labels */
            },
            historyElements: () => [
                {
                    time: '2018-04-25T18:15:31.997Z',
                    changes: [
                        {
                            fieldName: 'one',
                            newValue: '1',
                            oldValue: '2'
                        },
                        {
                            fieldName: 'two',
                            newValue: '1',
                            oldValue: '2'
                        },
                        {
                            fieldName: 'three',
                            newValue: '1',
                            oldValue: '2'
                        }
                    ]
                },
                {
                    time: '2018-04-20T18:15:31.997Z',
                    changes: [
                        {
                            fieldName: 'four',
                            newValue: '1',
                            oldValue: '2'
                        },
                        {
                            fieldName: 'five',
                            newValue: '1',
                            oldValue: '2'
                        },
                        {
                            fieldName: 'six',
                            newValue: '1',
                            oldValue: '2'
                        },
                        {
                            fieldName: 'seven',
                            newValue: '1',
                            oldValue: '2'
                        }
                    ]
                }
            ]
        };

        store = new Vuex.Store({
            state: {},
            actions,
            getters
        });

        $route = {
            path: '/venues/aVenueId/',
            params: {
                venueId: 'aVenueId'
            }
        };

    });

    it ("Displays the correct msg and icon for the venue", () => {

        const wrapper = shallow(VenueDetailPage, {
            store,
            mocks: {$route},
            localVue,
        });

        wrapper.setData({
            currentUser: "mr test"
        });

        expect(wrapper.vm.venueIcon).toEqual('glyphicon-play-circle');
        expect(wrapper.vm.venueMessage).toEqual('Continue Executing');

        wrapper.setData({
            currentUser: "other user"
        });

        expect(wrapper.vm.venueMessage).toEqual('Watch Now');
    });

    it ("Builds config and history urls", () => {

        const wrapper = shallow(VenueDetailPage, {
            propsData: {
                currentUser: "mr test"
            },
            store,
            mocks: {$route},
            localVue,
        });

        expect(wrapper.vm.configUrl).toEqual('/core/venues/config/configs/WSTS/config/aVenueId');
        expect(wrapper.vm.historyUrl).toEqual('/core/venues/config/configs/WSTS/history/aVenueId');
    });
});


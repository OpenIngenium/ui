import { shallow } from "@vue/test-utils";
import VenueTile from "../../../src/modules/dashboard/VenueTile.vue";

describe("VenueTile.vue", () => {
    let stubs = {
        'font-awesome-icon': true,
        'venue-status-dot': true,
        'venue-action-link': true,
    };

    xit("displays a WSTS venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "WSTS",
                    executionId: "1",
                    venueId: "1",
                    status: "AVAILABLE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        const icon = venueTile.find("svg");
        expect(icon.attributes()['data-icon']).toContain("server");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h1").find("a").attributes()['href']).toContain("/venues/1");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-green");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Execute");
        expect(actionNode.find("span").classes()).toContain("glyphicon-play-circle");
    });

    xit("displays a Testbed venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Testbed",
                    executionId: "1",
                    venueId: "1",
                    status: "AVAILABLE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        const icon = venueTile.find("svg");
        expect(icon.attributes()['data-icon']).toContain("flask");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-green");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Execute");
        expect(actionNode.find("span").classes()).toContain("glyphicon-play-circle");
    });

    xit("displays an ATLO venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "ATLO",
                    executionId: "1",
                    venueId: "1",
                    status: "AVAILABLE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        const icon = venueTile.find("svg");
        expect(icon.attributes()['data-icon']).toContain("wrench");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-green");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Execute");
        expect(actionNode.find("span").classes()).toContain("glyphicon-play-circle");
    });

    xit("displays an Other venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Other",
                    executionId: "1",
                    venueId: "1",
                    status: "AVAILABLE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        const icon = venueTile.find("svg");
        expect(icon.attributes()['data-icon']).toContain("rebel");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-green");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Execute");
        expect(actionNode.find("span").classes()).toContain("glyphicon-play-circle");
    });

    xit("displays a down venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Other",
                    executionId: "1",
                    venueId: "1",
                    status: "DOWN",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-red");
    });

    xit("displays a unavailable venue tile", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Other",
                    executionId: "1",
                    venueId: "1",
                    status: "",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        expect(venueTile.find("h1").text()).toBe("test");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-grey");
    });

    xit("displays status details for in use venues", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Testbed",
                    executionId: "1",
                    venueId: "1",
                    status: "IN_USE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "Mr. West"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-yellow");
        expect(venueTile.findAll("h3").at(1).text()).toContain("Mr. West");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Watch Now");
        expect(actionNode.find("span").classes()).toContain("glyphicon-eye-open");
    });

    xit("handles the case for continuing an execution on a venue if same user", () => {
        const wrapper = shallow(VenueTile, {
            propsData: {
                currentUser: "test-user",
                venueData: {
                    name: "test",
                    type: "Testbed",
                    executionId: "1",
                    venueId: "1",
                    status: "IN_USE",
                    startedOn: "2018-04-25T18:15:31.997Z",
                    testConductor: "test-user"
                }
            },
            stubs: stubs,
        });
        const venueTile = wrapper.find(".venue");
        expect(venueTile.find("h2 span").classes()).toContain("status-dot-yellow");
        expect(venueTile.findAll("h3").at(1).text()).toContain("test-user");
        const actionNode = venueTile.find("h4");
        expect(actionNode.find("a").text()).toContain("Continue Executing");
        expect(actionNode.find("span").classes()).toContain("glyphicon-play-circle");
    });
});

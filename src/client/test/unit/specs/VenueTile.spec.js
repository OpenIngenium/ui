import { shallowMount } from "@vue/test-utils";
import VenueTile from "../../../src/modules/dashboard/VenueTile.vue";

const stubs = {
    "font-awesome-icon": true,
    "venue-status-dot": true,
    "venue-action-link": true
};

function build(venueData) {
    return shallowMount(VenueTile, {
        propsData: {currentUser: "test-user", venueData},
        stubs
    });
}

function baseVenue(overrides = {}) {
    return {name: "test", type: "WSTS", executionId: "1", venueId: "1", status: "AVAILABLE", ...overrides};
}

describe("VenueTile.vue", () => {
    afterEach(() => window.localStorage.clear());

    it("venueUrl and venueGroupLabel derive from venueData", () => {
        const vm = build(baseVenue({venueId: "42", venueGroupName: "GroupA"})).vm;
        expect(vm.venueUrl).toBe("/venues/42");
        expect(vm.venueGroupLabel).toBe("Venue Group: GroupA");
    });

    it("isInUse reflects the status", () => {
        expect(build(baseVenue({status: "IN_USE"})).vm.isInUse).toBe(true);
        expect(build(baseVenue({status: "AVAILABLE"})).vm.isInUse).toBe(false);
    });

    it("serverIcon maps venue type to the correct icon", () => {
        expect(build(baseVenue({type: "WSTS"})).vm.serverIcon.iconName).toBe("server");
        expect(build(baseVenue({type: "Testbed"})).vm.serverIcon.iconName).toBe("flask");
        expect(build(baseVenue({type: "ATLO"})).vm.serverIcon.iconName).toBe("wrench");
        expect(build(baseVenue({type: "Other"})).vm.serverIcon.iconName).toBe("rebel");
    });

    it("saveVenueToLocalStorage seeds recent-venues when empty", () => {
        build(baseVenue({venueId: "v9"})).vm.saveVenueToLocalStorage();
        expect(JSON.parse(window.localStorage.getItem("recent-venues"))).toEqual([{venueId: "v9"}]);
    });

    it("saveVenueToLocalStorage prepends unique venues", () => {
        window.localStorage.setItem("recent-venues", JSON.stringify([{venueId: "old"}]));
        build(baseVenue({venueId: "new"})).vm.saveVenueToLocalStorage();
        const stored = JSON.parse(window.localStorage.getItem("recent-venues"));
        expect(stored[0]).toEqual({venueId: "new"});
        expect(stored.map((v) => v.venueId)).toContain("old");
    });

    it("saveVenueToLocalStorage caps the list at 6 entries", () => {
        const existing = ["a", "b", "c", "d", "e", "f"].map((venueId) => ({venueId}));
        window.localStorage.setItem("recent-venues", JSON.stringify(existing));
        build(baseVenue({venueId: "new"})).vm.saveVenueToLocalStorage();
        expect(JSON.parse(window.localStorage.getItem("recent-venues")).length).toBe(6);
    });

    // The old per-type/status DOM tests asserted inline markup (svg[data-icon],
    // h2 span.status-dot-*, the action link text) that has since been extracted into the
    // <font-awesome-icon>, <venue-status-dot> and <venue-action-link> child components
    // (stubbed here). That behavior is now covered by the serverIcon computed test above
    // and by the VenueStatusDot / VenueActionLink specs, so the remaining VenueTile
    // responsibilities are the title, the status wiring, and the in-use time block.
    it("renders the venue name, link and status text VenueTile owns", () => {
        const wrapper = build(baseVenue({name: "cruise", venueId: "7", status: "AVAILABLE"}));
        const tile = wrapper.find(".venue");
        expect(tile.find("h1").text()).toBe("cruise");
        expect(tile.find("h1 a").attributes("href")).toBe("/venues/7");
        expect(tile.find("h2").text()).toContain("Available");
    });

    it("passes the venue status through to venue-status-dot and venue-action-link", () => {
        const wrapper = build(baseVenue({status: "IN_USE"}));
        expect(wrapper.find("venue-status-dot-stub").attributes("status")).toBe("IN_USE");
        expect(wrapper.find("venue-action-link-stub").attributes("status")).toBe("IN_USE");
    });

    it("renders the test conductor when present and omits it otherwise", () => {
        expect(build(baseVenue({testConductor: "Mr. West"})).find("h2").text()).toContain("Mr. West");
        const noConductor = build(baseVenue({testConductor: ""}));
        expect(noConductor.find(".glyphicon-user").exists()).toBe(false);
    });

    it("shows the started-on time block only when the venue is in use", () => {
        const inUse = build(baseVenue({status: "IN_USE", startedOn: "2018-04-25T18:15:31.997Z"}));
        expect(inUse.find("h3 .glyphicon-time").exists()).toBe(true);

        const available = build(baseVenue({status: "AVAILABLE", startedOn: "2018-04-25T18:15:31.997Z"}));
        expect(available.find("h3").exists()).toBe(false);
    });
});

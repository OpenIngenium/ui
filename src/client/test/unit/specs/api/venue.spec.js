import sinon from "sinon";
import venueApi from "../../../../src/api/venue";
import transport from "../../../../src/api/transport";

describe("api/venue.js", () => {
    let stubs;

    beforeEach(() => {
        stubs = [];
    });

    afterEach(() => {
        stubs.forEach((s) => s.restore());
    });

    function stub(method, behavior) {
        const s = sinon.stub(transport, method);
        behavior(s);
        stubs.push(s);
        return s;
    }

    it("venue group create/get/edit return response data", async() => {
        stub("post", (s) => s.resolves({data: {venue_group_id: "vg1"}}));
        stub("get", (s) => s.resolves({data: {venue_group_id: "vg1"}}));
        stub("patch", (s) => s.resolves({data: {edited: true}}));
        expect(await venueApi.createVenueGroup({})).toEqual({venue_group_id: "vg1"});
        expect(await venueApi.getVenueGroup("vg1")).toEqual({venue_group_id: "vg1"});
        expect(await venueApi.editVenueGroup("vg1", {})).toEqual({edited: true});
    });

    it("getVenueGroups returns venueGroups + total", async() => {
        stub("get", (s) => s.resolves({data: [{v: 1}], headers: {"x-total-count": "3"}}));
        expect(await venueApi.getVenueGroups({})).toEqual({venueGroups: [{v: 1}], total: 3});
    });

    it("getVenueGroups returns undefined on error", async() => {
        stub("get", (s) => s.rejects(new Error("boom")));
        expect(await venueApi.getVenueGroups({})).toBeUndefined();
    });

    it("venue get/create/edit return response data", async() => {
        stub("get", (s) => s.resolves({data: {venue_id: "v1"}}));
        stub("post", (s) => s.resolves({data: {venue_id: "new"}}));
        stub("patch", (s) => s.resolves({data: {edited: true}}));
        expect(await venueApi.getVenue("v1")).toEqual({venue_id: "v1"});
        expect(await venueApi.createVenue({})).toEqual({venue_id: "new"});
        expect(await venueApi.editVenue("v1", {})).toEqual({edited: true});
    });

    it("getVenues returns data + total", async() => {
        stub("get", (s) => s.resolves({data: [{v: 1}], headers: {"x-total-count": "2"}}));
        expect(await venueApi.getVenues({})).toEqual({data: [{v: 1}], total: 2});
    });

    it("getDashboardVenues maps venues + total", async() => {
        stub("get", (s) => s.resolves({data: [{v: 1}], headers: {"x-total-count": "2"}}));
        expect(await venueApi.getDashboardVenues({})).toEqual({venues: [{v: 1}], total: 2});
    });
});

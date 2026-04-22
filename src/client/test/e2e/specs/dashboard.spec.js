const { login } = require("../helpers/authentication.js");
const { getVenues, createVenue, createVenues, deleteVenues } = require("../fixtures/venues.js");
const { createExecution, deleteExecutions, getExecutions, statusChangeExecution } = require("../fixtures/executions.js");


describe("Dashboard", function() {
    const until = protractor.ExpectedConditions;

    beforeAll(async function() {
        browser.ignoreSynchronization = true;

        try {
            await deleteExecutions();
            await deleteVenues();
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    beforeEach(async function() {
        try {
            await login();
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    afterEach(async function() {
        try {
            await deleteExecutions();
            await deleteVenues();
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    it("displays an alert when no venues exist", async function() {
        await deleteVenues();

        try {
            // make sure we have no venues first
            const venues = await getVenues();
            expect(venues.length).toEqual(0);

            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            const venueAlert = await element.all(by.css(".venue-content div")).first();
            expect(await venueAlert.getText()).toContain("There are no venues on the server");

        } catch(error) {
            fail(error);
        }

    });

    it("displays venues tiles", async function() {
        const venueCount = 15;
        const tilesPerPage = 12; // default
        await createVenues(venueCount);
        try {
            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            const venuesTitle = await element.all(by.css(".venue-display h2")).first();
            expect(await venuesTitle.getText()).toEqual("Venues");

            const viewListBtn = await element(by.css("#venue_list_btn"));
            const viewTileBtn = await element(by.css("#venue_tile_btn"));

            expect(await viewTileBtn.getAttribute("class")).toContain("active");
            expect(await viewListBtn.getAttribute("class")).not.toContain("active");

            const venueTiles = await element.all(by.css(".all-venues-tile .venue"));
            expect(venueTiles.length).toEqual(tilesPerPage);

            await viewListBtn.click();
            await browser.wait(until.presenceOf(element(by.css(".venue-content .ing-table"))), 500);
            expect(await viewListBtn.getAttribute("class")).toContain("active");
            expect(await viewTileBtn.getAttribute("class")).not.toContain("active");
        } catch(error) {
            fail(error);
        }
    });

    it("handles paginating tiles", async function() {
        const tilesPerPage = 12; // default
        const venueCount = 2 * tilesPerPage - 1;
        await createVenues(venueCount);

        try {
            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".venue-content"))), 500);

            const viewPageListBtns = await element.all(by.css(".pagination li"));
            expect(await viewPageListBtns[0].getText()).toEqual("1");
            expect(await viewPageListBtns[0].getAttribute("class")).toContain("active");

            let venueTiles = await element.all(by.css(".all-venues-tile .venue"));
            expect(venueTiles.length).toEqual(tilesPerPage);

            expect(await viewPageListBtns[2].getText()).toEqual("Next");
            await viewPageListBtns[2].all(by.css("a")).first().click();
            expect(await viewPageListBtns[1].getAttribute("class")).toContain("active");

            venueTiles = await element.all(by.css(".all-venues-tile .venue"));

            // Next page should have 1 less tile
            expect(venueTiles.length).toEqual(tilesPerPage - 1);

        }  catch(error) {
            fail(error);
        }
    });

    // disabled until sorting has been implemented
    xit("dashboard venue table sorting", async function() {
        await createVenue({name: "A-Venue", venue_status: {status: "UNKNOWN"}});
        await createVenue({name: "B-Venue", venue_status: {status: "DOWN"}});
        await createVenue({name: "C-Venue", venue_status: {status: "AVAILABLE"}});
        await createVenue({name: "D-Venue", venue_status: {status: "IN_USE", test_conductor: "selenium"}});
        await createVenue({name: "E-Venue", venue_status: {status: "RETIRED"}});

        try {
            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            const venuesTitle = await element.all(by.css("#venue_display_div h2")).first();
            expect(await venuesTitle.getText()).toEqual("Venues");

            const viewListBtn = await element(by.css("#venue_list_btn"));
            await viewListBtn.click();
            await browser.wait(until.presenceOf(element(by.css("#venue_list_table"))), 500);

            let firstColumnRow = await element.all(by.css("#venue_list_table tbody tr > td")).first();
            expect(await firstColumnRow.getText()).toEqual("A-Venue");

            const venueNameColumnHeader = await element.all(by.css("#venue_list_table thead tr > th")).first();
            await venueNameColumnHeader.click();
            expect(await firstColumnRow.getText()).toEqual("E-Venue");

            const venueStatusColumnHeader = await element.all(by.css("#venue_list_table thead tr th:nth-child(2n)")).first();
            await venueStatusColumnHeader.click();
            let secondColumnRow = await element.all(by.css("#venue_list_table tbody tr td:nth-child(2n)")).first();
            expect(await secondColumnRow.getText()).toContain("Available");
            await venueStatusColumnHeader.click();
            expect(await secondColumnRow.getText()).toContain("Unknown");
        } catch(error) {
            fail(error);
        }

    });

    it("latest activity reports displays empty message", async function() {
        try {
            // make sure we have no venues first
            const venues = await getVenues();
            expect(venues.length).toEqual(0);

            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            const activityTitle = await element.all(by.css(".main-content h2")).get(1);
            expect(activityTitle.getText()).toEqual("Executions");

            const tableMessage = await element(by.css(".main-content .row:nth-child(2n) table tbody tr td:first-of-type"));
            expect(await tableMessage.getText()).toEqual("There has been no recent activity");
        } catch(error) {
            fail(error);
        }
    });

    it("latest activity reports displays execution histories", async function() {
        try {
            // make sure we have no executions first
            const executions = await getExecutions();
            expect(executions.length).toEqual(0);

            let execution1 = await createExecution();
            let execution2 = await createExecution();
            await browser.sleep(1000);
            await statusChangeExecution(execution1.execution_id, "CLOSED");
            await statusChangeExecution(execution2.execution_id, "CLOSED");

            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            const historyRows = await element.all(by.css(".main-content .row:nth-child(2n) table tbody tr"));
            expect(historyRows.length).toEqual(2);
            expect(await historyRows[0].getText()).toContain(execution2.venue_name);
            expect(await historyRows[1].getText()).toContain(execution1.venue_name);
        } catch(error) {
            fail(error);
        }
    });
});

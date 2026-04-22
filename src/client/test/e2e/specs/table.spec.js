const { login } = require("../helpers/authentication.js");
const { createVenue, deleteVenue } = require("../fixtures/venues.js");
const { createVenueConfig, deleteVenueConfigTemplate, deleteVenueConfigs } = require("../fixtures/venue-config.js");


describe("Table", function() {
    const until = protractor.ExpectedConditions;
    let venue;
    let venueId;
    let venueName;

    beforeAll(async function() {
        browser.ignoreSynchronization = true;
        try {
            await deleteVenueConfigTemplate('WSTS');
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    beforeEach(async function() {
        try {
            await login();
            venue = await createVenue();
            venueId = venue.venue_id;
            venueName = venue.name;
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    afterEach(async function() {
        try {
            await deleteVenue(venueId);
        } catch(error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
    });

    it("Displays filtered data correctly", async function() {

        // create three config elements
        await createVenueConfig(venueId, venueName,{
            elem_name: 'Foo'
        });
        await createVenueConfig(venueId, venueName,{
            elem_name: 'Bar'
        });
        await createVenueConfig(venueId, venueName,{
            elem_name: 'Baz'
        });

        try {
            const venueUrl = "/venues/" + venueId;

            await browser.get(venueUrl);
            await browser.wait(until.presenceOf(element(by.css("table.ing-table"))), 1000);

            const rows = await $$("table.ing-table").get(1).$$("tbody tr");
            await expect(rows.length).toBe(3);

            await element.all(by.css("div.filter-btn")).get(1).click();
            await browser.sleep(500);
            const elemNameField = await $$("li.filter-dropdown-element input").get(2);
            await elemNameField.clear().sendKeys('Foo');
            const filterButton = await element.all(by.css("button[type='submit']")).get(1);
            await filterButton.click();
            await browser.sleep(500);

            let filteredRows = await $$("table.ing-table tbody tr");
            await expect(filteredRows.length).toBe(2);

        } catch(error) {
            fail(error);
        }
    });

    it("displays an alert when no config exists", async function() {
        try {
            await deleteVenueConfigs(venueId);
            const venueUrl = "/venues/" + venueId;

            await browser.get(venueUrl);
            await browser.wait(until.presenceOf(element(by.css(".main-content"))), 500);

            let venueAlert = await $$("table.ing-table tbody tr").first();
            expect(await venueAlert.getText()).toContain("There is no data to display.");

        } catch(error) {
            fail(error);
        }
    });
});

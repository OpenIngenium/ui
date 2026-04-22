const { login } = require("../helpers/authentication.js");
const { createExecution, deleteExecutions } = require('../fixtures/executions.js');
const { createVenue, deleteVenues} = require('../fixtures/venues.js');
const { createStepsByType } = require ('../fixtures/elements.js');

describe("Error Handling", function() {
    const until = protractor.ExpectedConditions;
    let venue;
    let execution;

    beforeAll(async function() {
        browser.ignoreSynchronization = true;

        try {
            venue = await createVenue();
            execution = await createExecution(venue.venue_id);
        } catch(error) {
            fail(error);
        }
    });

    beforeEach(async function()
    {
        browser.waitForAngularEnabled(false);
        try {
            await login();
        } catch(error) {
            fail(error);
        }
    });

    afterAll(async function() {
        try {
            await deleteExecutions();
            await deleteVenues();
        } catch(error) {
            fail(error);
        }
    });
    it("Displays an error modal on execution error", async function() {
        try {
            const execURL = `/execute_spa/${execution.venue_id}/${execution.execution_id}`;
            await createStepsByType(execution.execution_id, 'wait_steps');

            await browser.get(execURL);
            await browser.wait(until.presenceOf(element(by.id("steps_toolbar"))), 500);
            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            const executionBtn = await element(by.css("button#runExecution"));
            await executionBtn.click();
            await browser.sleep(200);

            const moveToStepButton = await element(by.css(".step_execution_box_button_container button.glyphicon-screenshot"));
            moveToStepButton.click();
            await browser.sleep(200);

            // delete current execution to throw error on next core request
            await deleteExecutions();

            const executeWaitStepButton = await element(by.css(".step_execution_box_button_container button.glyphicon-flash"));
            executeWaitStepButton.click();
            await browser.sleep(200);

            const feedbackModal = await element(by.css("div.feedback-modal"));
            expect(await feedbackModal.isDisplayed()).toBeTruthy();
        }
        catch(error) {
            fail(error);
        }
    });
});

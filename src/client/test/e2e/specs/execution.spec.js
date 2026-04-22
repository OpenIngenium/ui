const { login } = require("../helpers/authentication.js");
const { createExecution, deleteExecutions } = require('../fixtures/executions.js');
const { createVenues, deleteVenues, getVenues} = require('../fixtures/venues.js');
const { getStepsByType, createStepsByType } = require ('../fixtures/elements.js');
const { dragAndDrop } = require ('../helpers/native_js_drag_and_drop.js');

describe("Execution", function() {
    const until = protractor.ExpectedConditions;

    beforeAll(async function() {
        browser.ignoreSynchronization = true;

        try {
            await deleteExecutions();
            await deleteVenues();
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

    afterEach(async function() {
        try {
            await deleteExecutions();
            await deleteVenues();
        } catch(error)
        {
            fail(error);
        }
    });
    it("Venue Execute Button & Toggle Venue Table", async function() {
        try {
            await createVenues(1);
            const venues = await getVenues();

            //Gets the first Venue's execution button in Dashboard
            const firstVenue = await element(by.css(".all-venues-tile .venue h4 a"));

            await browser.get("/");
            await browser.wait(until.presenceOf(element(by.css(".venue-content"))), 500);

            await firstVenue.click();
            await browser.wait(until.presenceOf(element(by.css(".bootstrap-switch-wrapper"))), 2500);

            //Gets the Venue toggle (HIDE / SHOW) button in Execution page
            const toggleShow = await element(by.css(".bootstrap-switch-wrapper"));
            //Gets the name of the first Venue
            const titleName = venues[0]['name'];
            //Gets the Venue table
            const venueTable = await element.all(by.css(".table")).first();
            //Gets the 'Name' from Venue table (first column first row) in Execution
            const nameContainer = await element.all(by.css(".table td")).first();
            //Gets the Name from Venue table (second column first row) in Execution
            const venueName = await element.all(by.css(".table td a")).first();

            //TOGGLE is HIDE - Initial State of Table & Toggle
            expect(await venueTable.isDisplayed()).toEqual(false);

            //TOGGLE is now SHOW
            await toggleShow.click();
            expect(await venueTable.isDisplayed()).toEqual(true);
            expect(await nameContainer.getText()).toContain("Name");
            expect(await venueName.getText()).toEqual(titleName);

            //TOGGLE is now HIDE
            await toggleShow.click();
            expect(await venueTable.isDisplayed()).toEqual(false);
        }
        catch(error) {
            fail(error);
        }
    });
    it("Drag & Drop CMD Step Onto Canvas", async function() {
        try {
            //Creates Venue if non-existant.
            const execDetails = await createExecution();

            //Gets direct link to execution URL
            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);
            await browser.wait(until.presenceOf(element(by.id("steps_toolbar"))), 500);
            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            //Gets CMD step's move button - 12th item is step_type CMD
            const cmdStep = await element.all(by.css("#steps_toolbar .steps_list .step")).get(12);

            const stepsCanvas = await element(by.css("#steps_canvas [level='CHILD']"));

            await browser.executeScript(dragAndDrop, cmdStep, stepsCanvas);

            //Wait for Step 'name' to show up in step table
            await browser.wait(until.presenceOf(element.all(by.css("#steps_canvas .step-container .step_type")).first()), 2500);

            const cmdStepName = await element.all(by.css("#steps_canvas .step-container .step_type")).first();
            expect(await cmdStepName.getText()).toEqual("Cmd");

            //Gets cmd_step count number from database = 1 (has one entry)
            const stepCount = await getStepsByType(execDetails['execution_id'], 'cmd_steps');
            expect(await stepCount.length).toEqual(1);
        }
        catch(error) {
            fail(error);
        }
    });
    it("Execution's Steps Canvas Drag & Drop Functionality", async function() {
        try {
            const execDetails = await createExecution();

            //Gets direct link to execution URL
            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);
            await browser.wait(until.presenceOf(element(by.id("steps_toolbar"))), 500);
            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            //Gets Cmd Step from Steps toolbar
            const cmdStep = await element.all(by.css("#steps_toolbar .steps_list .step")).get(12);
            //Gets CmdFile Step from Steps toolbar
            const cmdFileStep = await element.all(by.css("#steps_toolbar .steps_list .step")).get(13);

            const stepsCanvasChild = await element.all(by.css("#steps_canvas [level='CHILD']")).first();
            const stepsCanvasSibling = await element.all(by.css("#steps_canvas [level='SIBLING']")).first();

            it("Creates steps when dragged from the palette to the canvas", async function() {
                //CMD step dragged and checked
                await browser.executeScript(dragAndDrop, cmdStep, stepsCanvasChild);

                await browser.wait(until.presenceOf(element.all(by.css("#steps_canvas .step-container .step_type")).first()), 2500);

                const firstStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).first();
                expect(await firstStepType.getText()).toEqual("Cmd");

                const firstStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).first();
                expect(await firstStepNumber.getText()).toEqual("1");

                //CMD File step dragged and checked
                await browser.executeScript(dragAndDrop, cmdFileStep, stepsCanvasSibling);

                await browser.wait(until.presenceOf(element.all(by.css("#steps_canvas .step-container .step_type")).get(1)), 2500);

                const secondStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(1);
                expect(await secondStepType.getText()).toEqual("Cmd File");

                const secondStepNumber = await element.all(by.css("#steps_canvas .step.step_executable .step_number")).get(1);
                expect(await secondStepNumber.getText()).toEqual("2");
            });

            it("Reorders steps when dragged within the canvas", async function() {
                //Drag occuring within Step Canvas and checked if updated.
                const secondStepDragElem = await element.all(by.css("#steps_canvas .step.step_executable[draggable='true']")).get(1);
                await browser.executeScript(dragAndDrop, secondStepDragElem, stepsCanvasChild);
                await browser.sleep(5000); //sleep since element is there, and we want to see a change.
                const firstElementType = await element.all(by.css("#steps_canvas .step-container .step_type")).first();
                expect(await firstElementType.getText()).toEqual("Cmd File");
            });

            it("Adds the correct drag classes", async function() {
                // Gets CmdSCMF Step from Steps toolbar
                const cmdSCMFStep = await element.all(by.css("#steps_toolbar .steps_list .step")).get(14);
                const childDraggedOver = await element.all(by.css("#steps_canvas .drag-over")).first();
                expect(childDraggedOver.isPresent()).toBe(false);

                //Drag over check
                await browser.executeScript(dragAndDrop, cmdSCMFStep, stepsCanvasChild, "DRAG-OVER");
                await browser.wait(until.presenceOf(element.all(by.css("#steps_canvas .drag-over")).first()), 1000);
                expect(childDraggedOver.isPresent()).toBe(true);

                //Drag locked check when drag exits
                await browser.executeScript(dragAndDrop, cmdSCMFStep, stepsCanvasChild, "DRAG-AND-LEAVE");
                await browser.sleep(1000); //sleep since we're not waiting for any elements
                expect(childDraggedOver.isPresent()).toBe(false);
            });
        }
        catch(error) {
            fail(error);
        }
    });
    it("Step Sorting & Numbering", async function() {
        try {
            const execDetails = await createExecution();
            await createStepsByType(execDetails['execution_id'], 'cmd_steps');
            await createStepsByType(execDetails['execution_id'], 'cmd_file_steps');
            await createStepsByType(execDetails['execution_id'], 'cmd_steps');
            await createStepsByType(execDetails['execution_id'], 'cmd_file_steps');
            await createStepsByType(execDetails['execution_id'], 'cmd_scmf_steps');
            await createStepsByType(execDetails['execution_id'], 'cmd_sse_steps');
            await createStepsByType(execDetails['execution_id'], 'query_evr_steps');
            await createStepsByType(execDetails['execution_id'], 'wait_eha_steps');
            await createStepsByType(execDetails['execution_id'], 'wait_eha_steps');
            await createStepsByType(execDetails['execution_id'], 'sections');
            await createStepsByType(execDetails['execution_id'], 'procedure_sections');

            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);
            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            const firstStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(0);
            expect(await firstStepType.getText()).toEqual("Procedure Section");
            const firstStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(0);
            expect(await firstStepNumber.getText()).toEqual("1");

            const secondStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(1);
            expect(await secondStepType.getText()).toEqual("Section");
            const secondStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(1);
            expect(await secondStepNumber.getText()).toEqual("2");

            const thirdStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(2);
            expect(await thirdStepType.getText()).toEqual("Wait Eha");
            const thirdStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(2);
            expect(await thirdStepNumber.getText()).toEqual("3");

            const fourthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(3);
            expect(await fourthStepType.getText()).toEqual("Wait Eha");
            const fourthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(3);
            expect(await fourthStepNumber.getText()).toEqual("4");

            const fifthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(4);
            expect(await fifthStepType.getText()).toEqual("Query Evr");
            const fifthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(4);
            expect(await fifthStepNumber.getText()).toEqual("5");

            const sixthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(5);
            expect(await sixthStepType.getText()).toEqual("Cmd Sse");
            const sixthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(5);
            expect(await sixthStepNumber.getText()).toEqual("6");

            const seventhStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(6);
            expect(await seventhStepType.getText()).toEqual("Cmd Scmf");
            const seventhStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(6);
            expect(await seventhStepNumber.getText()).toEqual("7");

            const eigthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(7);
            expect(await eigthStepType.getText()).toEqual("Cmd File");
            const eigthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(7);
            expect(await eigthStepNumber.getText()).toEqual("8");

            const ninthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(8);
            expect(await ninthStepType.getText()).toEqual("Cmd");
            const ninthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(8);
            expect(await ninthStepNumber.getText()).toEqual("9");

            const tenthStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(9);
            expect(await tenthStepType.getText()).toEqual("Cmd File");
            const tenthStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(9);
            expect(await tenthStepNumber.getText()).toEqual("10");

            const eleventhStepType = await element.all(by.css("#steps_canvas .step-container .step_type")).get(10);
            expect(await eleventhStepType.getText()).toEqual("Cmd");
            const eleventhStepNumber = await element.all(by.css("#steps_canvas .step-container .step_number")).get(10);
            expect(await eleventhStepNumber.getText()).toEqual("11");

            await browser.sleep(3000);
        }
        catch(error) {
            fail(error);
        }
    });
    it("Sets the correct default detail level for element viewState", async function() {
        try {
            const execDetails = await createExecution();
            await createStepsByType(execDetails['execution_id'], 'cmd_steps');
            await createStepsByType(execDetails['execution_id'], 'query_evr_steps');

            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);

            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            const levelTwoDetail = await element.all(by.css("#steps_canvas .data-bar-element"));

            for(let i = 0; i < levelTwoDetail.length; i++) {
                expect(levelTwoDetail[i].isPresent()).toBe(true);
            }

            const levelThreeDetail = await element.all(by.css("#steps_canvas .edit-container"));

            for(let i = 0; i < levelThreeDetail.length; i++) {
                expect(levelThreeDetail[i].isPresent()).toBe(false);
            }
        }
        catch(error) {
            fail(error);
        }
    });
    it("Toggles individual element viewState", async function() {
        try {
            const execDetails = await createExecution();
            await createStepsByType(execDetails['execution_id'], 'wait_steps');
            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);

            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            let levelTwoDetail = await element(by.css("#steps_canvas .data-bar-element"));
            let levelThreeDetail = await element(by.css("#steps_canvas .edit-container"));
            await browser.sleep(1000);

            expect(levelTwoDetail.isPresent()).toBe(true);
            expect(levelThreeDetail.isPresent()).toBe(false);

            const levelThreeButton = await element(by.css("button.toggle_button[title='Level 3']"));
            await levelThreeButton.click();
            await browser.sleep(1000);

            levelTwoDetail = await element(by.css("#steps_canvas .data-bar-element"));
            levelThreeDetail = await element(by.css("#steps_canvas .edit-container"));

            expect(levelTwoDetail.isPresent()).toBe(true);
            expect(levelThreeDetail.isPresent()).toBe(true);
        }
        catch(error) {
            fail(error);
        }
    });
    it("Toggles parent-child element viewState", async function() {
        try {
            const execDetails = await createExecution();

            // section at root
            const parentSectionElement = await createStepsByType(execDetails['execution_id'], 'sections');
            // children
            await createStepsByType(execDetails['execution_id'], 'wait_steps', parentSectionElement.elem.elem_id, 'CHILD');
            const childSectionElement = await createStepsByType(execDetails['execution_id'], 'sections', parentSectionElement.elem.elem_id, 'CHILD');
            // grandchild
            await createStepsByType(execDetails['execution_id'], 'wait_steps', childSectionElement.elem.elem_id, 'CHILD');
            // sibling of root
            await createStepsByType(execDetails['execution_id'], 'wait_steps', parentSectionElement.elem.elem_id, 'SIBLING');

            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);

            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            let levelThreeDetail = await element.all(by.css("#steps_canvas .edit-container"));

            // all elements initialize at level 2
            for(let i = 0; i < levelThreeDetail.length; i++) {
                expect(levelThreeDetail[i].isPresent()).toBe(false);
            }

            const levelThreeButton = await element.all(by.css("button.toggle_button[title='Level 3']")).first();
            await levelThreeButton.click();
            await browser.sleep(500);

            levelThreeDetail = await element.all(by.css("#steps_canvas .edit-container"));

            // should expand all children and grandchildren.
            // section elements dont contain level 3 detail at this time so we only see the wait steps
            expect(levelThreeDetail[0].isPresent()).toBe(true);
            expect(levelThreeDetail[1].isPresent()).toBe(true);

            // should not affect state of sibling
            expect(levelThreeDetail.length).toBe(2);
        }
        catch(error) {
            fail(error);
        }
    });
    it("Deletes an element and removes it from the canvas", async function() {
        try {
            const execDetails = await createExecution();
            await createStepsByType(execDetails['execution_id'], 'cmd_steps');

            const execURL = `/execute_spa/${execDetails.venue_id}/${execDetails.execution_id}`;
            await browser.get(execURL);

            await browser.wait(until.presenceOf(element(by.id("steps_canvas"))), 500);

            let elementOnCanvas = await element(by.css("#steps_canvas li.step"));
            expect(elementOnCanvas.isPresent()).toBe(true);
            const deleteButton = await element(by.css("button.step_remove_button"));
            await deleteButton.click();
            await browser.sleep(1000);
            expect(elementOnCanvas.isPresent()).toBe(false);
        }
        catch(error) {
            fail(error);
        }
    });
});

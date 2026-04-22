from random import choice
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from ingenium_test_case import IngeniumTestCase
from ingenium.views.ingenium_models.venue_model import VenueModel


class VenueConfigAdminEditorTestCase(IngeniumTestCase):
    """
    Verify venue configuration admin template editor functionality is working as expected.
    """
    
    # Start browser, navigate to localhost, and login
    def setUp(self):
        super(VenueConfigAdminEditorTestCase, self).setUp()
        self.known_venue_types = [venue_type_list[1] for venue_type_list in VenueModel.TYPES]
        self.browser.get(self.host)

    def pick_random_venue(self):
        # pick a random venue type for testing
        venue_type = choice(self.known_venue_types)
        template_editor_url = "{}/admin/manage/venue_config_template/{}/".format(self.host, venue_type)
        self.browser.get(template_editor_url)

    # Assert that new element editor (green row at bottom of table) is displayed correctly
    def test_new_element_editor_is_displayed(self):
        for venue_type in self.known_venue_types:
            template_editor_url = "{}/admin/manage/venue_config_template/{}/".format(self.host, venue_type)
            self.browser.get(template_editor_url)
            editor_row = self.browser.find_element_by_css_selector(".template-editor tbody tr:nth-last-child(2)")
            self.assertTrue(editor_row.is_displayed())

            # check inline editor empty text prompt is displayed
            name_cell = editor_row.find_element_by_css_selector("td:first-child a")
            description_cell = editor_row.find_element_by_css_selector("td:nth-child(1) a")
            self.assertEqual(name_cell.text, "Click to add")
            self.assertEqual(description_cell.text, "Click to add")

            # check choose type is the selected type option
            choose_type_option = editor_row.find_element_by_css_selector("td:nth-child(3) option:first-child")
            self.assertEqual(choose_type_option.text, "Choose Type")
            self.assertTrue(choose_type_option.is_selected())

        self.browser.close()

    """
    Assert that table adds new elements when a value for "Name" field is added.
    Assert that table deletes the row.
    """
    def test_add_delete_new_element_editor_name_field(self):
        self.pick_random_venue()

        original_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        original_row_count = len(original_rows)

        editor_row = self.browser.find_element_by_css_selector(".template-editor tbody tr:nth-last-child(2)")
        name_cell = editor_row.find_element_by_css_selector("td:first-child")
        name_link = name_cell.find_element_by_css_selector("a")
        name_link.click()

        # wait for x-editable to add the input form control
        wait = WebDriverWait(self.browser, 4)
        wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, ".template-editor tbody tr:nth-last-child(2) td:first-child .editable-input .form-control")))

        name_cell = editor_row.find_element_by_css_selector("td:first-child")  # refresh so new children are picked up
        name_input = name_cell.find_element_by_css_selector(".editable-input .form-control")
        name_input.send_keys("sample element name")

        inline_submit_btn = name_cell.find_element_by_css_selector(".editableform .editable-submit")
        inline_submit_btn.click()

        wait.until(self.ajax_complete, "Timeout waiting for ajax operation")
        all_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        self.assertEqual(original_row_count + 1, len(all_rows))

        # delete newly created element to avoid polluting the environment
        newest_element = self.browser.find_element_by_css_selector(".template-editor tbody tr:nth-last-child(3)")
        delete_icon = newest_element.find_element_by_css_selector(".vc-admin-delete-element")
        delete_icon.click()

        # self.browser.switch_to_alert().accept()
        wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, ".bootbox-confirm.in .modal-dialog")))
        delete_confirmation_btn = self.browser.find_element_by_css_selector(".bootbox-confirm.in .modal-footer button.btn-primary")
        delete_confirmation_btn.click()

        wait.until(ec.staleness_of(newest_element))
        wait.until(self.ajax_complete, "Timeout waiting for ajax operation")

        all_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        self.assertEqual(original_row_count, len(all_rows))

    """
    Assert that table adds new elements when a value for "Description" field is added.
    Assert that table deletes the row.
    """
    def test_add_delete_new_element_editor_description_field(self):
        self.pick_random_venue()

        original_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        original_row_count = len(original_rows)

        editor_row = self.browser.find_element_by_css_selector(".template-editor tbody tr:nth-last-child(2)")
        description_cell = editor_row.find_element_by_css_selector("td:nth-child(2)")
        description_link = description_cell.find_element_by_css_selector("a")
        description_link.click()

        # wait for x-editable to add the input form control
        wait = WebDriverWait(self.browser, 4)
        wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, ".template-editor tbody tr:nth-last-child(2) td:nth-child(2) .editable-input .form-control")))

        description_cell = editor_row.find_element_by_css_selector("td:nth-child(2)")  # refresh so new children are picked up
        description_input = description_cell.find_element_by_css_selector(".editable-input .form-control")
        description_input.send_keys("sample element description")

        inline_submit_btn = description_cell.find_element_by_css_selector(".editableform .editable-submit")
        inline_submit_btn.click()

        wait.until(self.ajax_complete, "Timeout waiting for ajax operation")
        all_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        self.assertEqual(original_row_count + 1, len(all_rows))

        # delete newly created element to avoid polluting the environment
        newest_element = self.browser.find_element_by_css_selector(".template-editor tbody tr:nth-last-child(3)")
        delete_icon = newest_element.find_element_by_css_selector(".vc-admin-delete-element")
        delete_icon.click()

        wait.until(ec.visibility_of_element_located((By.CSS_SELECTOR, ".bootbox-confirm.in .modal-dialog")))
        delete_confirmation_btn = self.browser.find_element_by_css_selector(".bootbox-confirm.in .modal-footer button.btn-primary")
        delete_confirmation_btn.click()

        wait.until(ec.staleness_of(newest_element))
        wait.until(self.ajax_complete, "Timeout waiting for ajax operation")

        all_rows = self.browser.find_elements_by_css_selector(".template-editor tbody tr")
        self.assertEqual(original_row_count, len(all_rows))

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from ingenium_test_case import IngeniumTestCase


class VenueConfigListTestCase(IngeniumTestCase):
    """
    Verify venue configuration list view is working as expected.
    """

    # Start browser, navigate to localhost, and login
    def setUp(self):
        super(VenueConfigListTestCase, self).setUp()
        self.browser.get(self.host)

    # Assert that venue configs available to edit in Admin section are the correct four. 
    def test_venue_configs_are_displayed(self):
        known_venue_types = ["WSTS", "Testbed", "ATLO", "Other"]

        venue_configs_url = "{}/admin/manage/venue_config_templates/".format(self.host)
        self.browser.get(venue_configs_url)

        wait = WebDriverWait(self.browser, 2)
        wait.until(ec.visibility_of_element_located((By.CLASS_NAME, 'table-condensed')))

        venue_cells = self.browser.find_elements_by_css_selector('tbody tr > td:first-child')
        venue_types_count = len(venue_cells)
        self.assertGreater(venue_types_count, 3)  # supposed to have at least 4

        # make sure we're only showing known venue types
        for venue_cell in venue_cells:
            self.assertIn(venue_cell.text, known_venue_types)

        self.browser.close()

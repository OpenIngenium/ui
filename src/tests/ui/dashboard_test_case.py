from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from ingenium_test_case import IngeniumTestCase


class DashboardTestCase(IngeniumTestCase):
    """
    Verify the main dashboard fuctionality is working as expected.
    """

    # Start browser, navigate to localhost, and login
    def setUp(self):
        super(DashboardTestCase, self).setUp()
        self.browser.get(self.host)

    # Asserts that there are at least two venues visible on the dashboard
    def test_default_venues_display(self):
        venues = self.browser.find_elements_by_class_name('venue')
        venue_count = len(venues)
        self.assertGreater(venue_count, 1)
        self.browser.close()

    # Asserts that venue display should match selected view - tile or list.
    def test_toggle_venue_view_layouts(self):
        list_toggle = self.browser.find_element_by_id("venue_list_btn")
        tile_toggle = self.browser.find_element_by_id("venue_tile_btn")

        self.assertTrue("active" in tile_toggle.get_attribute("class"))
        self.assertFalse("active" in list_toggle.get_attribute("class"))

        list_toggle.click()

        wait = WebDriverWait(self.browser, 5)
        wait.until(ec.visibility_of_element_located((By.ID, 'venue_list_table_wrapper')))

        # refresh stale elements
        list_toggle = self.browser.find_element_by_id("venue_list_btn")
        tile_toggle = self.browser.find_element_by_id("venue_tile_btn")

        # make sure active class matches toggle state
        self.assertFalse("active" in tile_toggle.get_attribute("class"))
        self.assertTrue("active" in list_toggle.get_attribute("class"))

        venue_rows = self.browser.find_elements_by_css_selector("#venue_list_table tbody tr")
        tile_venue_count = len(venue_rows)
        self.assertGreater(tile_venue_count, 1)

        count_indicator_text = self.browser.find_element_by_id("venue_list_table_info").text
        self.assertIn("{} entries".format(tile_venue_count), count_indicator_text)

        # refresh stale element
        tile_toggle = self.browser.find_element_by_id("venue_tile_btn")
        tile_toggle.click()

        # confirm switching back to tile view works
        wait.until(ec.visibility_of_element_located((By.CLASS_NAME, "all-venues-tile")))
        tile_venues = self.browser.find_elements_by_class_name('venue')
        self.assertEqual(len(tile_venues), tile_venue_count)
        self.browser.close()

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from ingenium_test_case import IngeniumTestCase


class UserProfileTestCase(IngeniumTestCase):
    """
    Verify user profile fuctionality is working as expected.
    """
    
    # Start browser, navigate to localhost, and login
    def setUp(self):
        super(UserProfileTestCase, self).setUp()
        self.browser.get(self.host)

    # Assert that user permissions are displayed in the user profile dropdown
    def test_permissions_are_displayed(self):
        user_dropdown_image = self.browser.find_element_by_id('user_dropdown_image')
        user_dropdown_image.click()

        wait = WebDriverWait(self.browser, 2)
        wait.until(ec.visibility_of_element_located((By.CLASS_NAME, 'dropdown-menu-body')))

        permissions = self.browser.find_elements_by_css_selector('.permissions-list li')
        permissions_count = len(permissions)
        self.assertGreater(permissions_count, 1)

        self.browser.close()

    # Assert that user roles are displayed in the user profile dropdown
    def test_roles_are_displayed(self):
        user_dropdown_image = self.browser.find_element_by_id('user_dropdown_image')
        user_dropdown_image.click()

        wait = WebDriverWait(self.browser, 2)
        wait.until(ec.visibility_of_element_located((By.CLASS_NAME, 'dropdown-menu-body')))

        roles = self.browser.find_element_by_css_selector('.roles')
        self.assertIn('Admin', roles.text.split(','))

        roles_count = len(roles.text.split(','))
        self.assertGreater(roles_count, 0)

        self.browser.close()

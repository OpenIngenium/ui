from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from ingenium_test_case import IngeniumTestCase
from time import time


class SessionExpirationTestCase(IngeniumTestCase):
    """
    Verify modal session expiration functionality is working as expected.
    """
    
    # Start browser, navigate to localhost, and login
    def setUp(self):
        super(SessionExpirationTestCase, self).setUp()
        self.browser.get(self.host)

    # Assert that the client is checking for an expired cookie, and logging the user out
    def test_session_expired_modal(self):
        executions_url = "{}/executions/".format(self.host)
        quick_expires = int(time())

        # set the expiration time in the cookie super low to trigger the modal
        self.browser.add_cookie({'name': 'expiration_date', 'value': str(quick_expires), 'path': '/'})

        self.browser.get(executions_url)
        # client checks session expiration value every 15 seconds
        wait = WebDriverWait(self.browser, 16)
        wait.until(ec.visibility_of_element_located((By.ID, 'sessionExpireModal')))

        expired_title = self.browser.find_element_by_css_selector('#sessionExpireModal .modal-title')
        self.assertTrue("expired" in expired_title.text)

        # clear out session data to remove JWT token
        self.browser.delete_all_cookies()

        login_button = self.browser.find_element_by_id('continue_session_button')
        self.assertTrue("Login", login_button.text)

        login_button.click()
        self.ingenium_login(navigate_to_login_page=False)

        self.assertTrue(executions_url, self.browser.current_url)
        self.browser.close()

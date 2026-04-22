import unittest
from os import environ
from selenium import webdriver
from selenium.common.exceptions import WebDriverException


class IngeniumTestCase(unittest.TestCase):
    """
    Base test case class to use for all TestCase classes.
    """

    def setUp(self):
        self.browser = self.build_browser()
        if environ.get("LOCAL"):
            self.host = "http://127.0.0.1:8000"
        else:
            self.host = environ.get("UI_NGINX_URL", "http://ingenium-ci.jpl.nasa.gov")

        self.ingenium_login()

    def build_browser(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--window-size=1200x2900')
        options.add_argument('--disable-gpu')
        options.add_argument('--ignore-certificate-errors')

        if environ.get("LOCAL"):
            return webdriver.Chrome('/usr/local/bin/chromedriver', chrome_options=options)
        else:
            return webdriver.Remote('http://selenium_chrome:4444/wd/hub', options.to_capabilities())

    def ingenium_login(self, navigate_to_login_page=True):
        if environ.get("LOCAL"):
            test_username = environ.get("TEST_USER")
            test_password = environ.get("TEST_PASS")
        else:
            test_username = environ.get("USERNAME")
            test_password = environ.get("PASSWORD")

        if navigate_to_login_page:
            self.browser.get('{}/login/'.format(self.host))

        username_field = self.browser.find_element_by_id("username")
        password_field = self.browser.find_element_by_id("password")
        username_field.send_keys(test_username)
        password_field.send_keys(test_password)

        sign_in_btn = self.browser.find_element_by_css_selector("[type='submit']")
        sign_in_btn.click()

    def ajax_complete(self, driver):
        try:
            return 0 == driver.execute_script("return jQuery.active")
        except WebDriverException:
            pass

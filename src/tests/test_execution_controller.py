from django.test import TestCase

from ingenium.views.controllers.execution_controller import get_latest_executions


class TestExecutionController(TestCase):
    def setUp(self):
        pass

    def test_get_latest_executions(self):
        executions = get_latest_executions()

from django.test import TestCase

from ingenium.views.controllers.venue_controller import get_all_venues


class TestVenueController(TestCase):
    def setUp(self):
        pass

    def test_get_all_venues(self):
        total, venues = get_all_venues(None)


from django.shortcuts import render

from ingenium.views.controllers.venue_controller import get_all_venues


def venues_display_html(request, display_view):
    """
    Will return back a rendered HTML block containing the Venues in a Tile or List view;  This view also incorporates
    filters and sorting

    :param request: Request Object
    :param display_view: 'tile' or 'list' depending on the view you want rendered
    :return:
    """

    if display_view not in ['tile', 'list']:
        display_view = 'tile'

    try:
        total, venues = get_all_venues(request, limit=1000)

    except Exception:
        venues = None

    response = render(request, 'ui/pages/dashboard/elements/venue_display.html', {
        "venues": venues,
        "venue_display_view": display_view,
    })

    response.set_cookie('venue_display_view', display_view)

    return response
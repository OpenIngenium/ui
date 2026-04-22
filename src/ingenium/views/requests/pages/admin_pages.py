from django.shortcuts import render, redirect
from django.conf import settings

from ingenium.views.controllers.dictionary_controller import get_sse_parsers, get_flight_parsers
from ingenium.views.data_tables.health_check.health_check_data_table import HealthCheckDataTable
from ingenium.views.data_tables.roles.roles_data_table import RolesDataTable
from ingenium.views.data_tables.user_groups.user_groups_data_table import UserGroupsDataTable
from ingenium.views.data_tables.users.users_data_table import UsersDataTable
from ingenium.views.data_tables.venues.manage_venues_data_table import ManageVenuesDataTable
from ingenium.views.ingenium_models.venue_config_element_model import VenueConfigElementModel

def admin_page(request):
    return render(request, 'ui/pages/admin/admin.html', {
        'admin_js_bundle': settings.ADMIN_JS_BUNDLE,
    })

def manage_venues_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/manage_venues.html', {
        'data_table': ManageVenuesDataTable(request),
    })


def manage_dictionary_parsers_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    try:
        sse_parsers = get_sse_parsers(request=request)
        flight_parsers = get_flight_parsers(request=request)
    except TypeError:
        sse_parsers = None
        flight_parsers = None

    return render(request, 'ui/pages/admin/manage_parsers.html', {
        'sse_parsers': sse_parsers,
        'flight_parsers': flight_parsers,
    })


def list_venue_config_templates_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/venue_config_tpl_list.html')


def edit_venue_config_template_page(request, venue_type):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    elements = get_elements_by_venue_type(request, venue_type)

    return render(request, 'ui/pages/admin/venue_config_tpl_editor.html', {
        'venue_type': venue_type,
        'elements': elements,
        'element_types': VenueConfigElementModel.TYPES
    })


def manage_groups_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/manage_groups.html', {
        'data_table': UserGroupsDataTable(request),
    })


def manage_users_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/manage_users.html', {
        'data_table': UsersDataTable(request),
    })


def manage_roles_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/manage_roles.html', {
        'data_table': RolesDataTable(request)
    })


def health_check_page(request):
    user = request.user

    if not user.is_admin():
        return redirect("/")

    return render(request, 'ui/pages/admin/health_check.html', {
        'data_table': HealthCheckDataTable(request),
    })

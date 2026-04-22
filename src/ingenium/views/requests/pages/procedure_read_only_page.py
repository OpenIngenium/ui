from django.shortcuts import render

from ingenium.views.controllers.procedure_version_controller import get_procedure_version_by_id, get_procedure_version_structure_elements
from ingenium.views.controllers.procedure_controller import get_procedure_by_id


def procedure_read_only_page(request, procedure_id, version):
    procedure = get_procedure_by_id(request, procedure_id)
    procedure_version = get_procedure_version_by_id(request, procedure_id, version)
    elements = get_procedure_version_structure_elements(request, procedure_id, version)

    return render(request, 'ui/pages/procedures/procedure_read_only.html', {
        'procedure': procedure,
        'procedure_version': procedure_version,
        'version': version,
        'ingenium_steps': [],
        'elements': elements,
    })


def print_friendly_procedure_page(request, procedure_id, version):
    procedure = get_procedure_by_id(request, procedure_id)
    procedure_version = get_procedure_version_by_id(request, procedure_id, version)
    elements = get_procedure_version_structure_elements(request, procedure_id, version)

    return render(request, 'ui/pages/procedures/print_friendly_procedure.html', {
        'procedure': procedure,
        'procedure_version': procedure_version,
        'version': version,
        'ingenium_steps': [],
        'elements': elements,
    })

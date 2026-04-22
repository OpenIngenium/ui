from django.shortcuts import render

from django.middleware.csrf import get_token
from ingenium.views.data_tables.executions.executions_data_table import ExecutionsDataTable

def executions_page(request):
    user = request.user

    venue_count = 0
    venues = []
            
    return render(request, 'ui/pages/review.html', {
        'csrf_token': get_token(request),
        'scopes': user.get_permissions,
        'venues': venues,
        'data_table': ExecutionsDataTable(request),
    })


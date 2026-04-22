import mimetypes
import os
import stat

from django.http import HttpResponse
from django.utils.encoding import smart_str


def serve_file(request, path):
    """
    We use Core to upload the file but the uploaded file needs to be served by ui_nginx after Django checking that the user is logged on.
    :param request:
    :param path:
    :return:
    """
    response = HttpResponse()
    url = "/file_server_internal/" + path
    # print 'url=', url

    # filename = os.path.basename(path)
    # print 'filename=', filename

    # disposition_header = 'inline' if path.lower().endswith(('.png', '.jpeg', '.jpg', '.gif')) else 'attachment; filename=%s' % smart_str(filename)
    # print 'disposition_header=', disposition_header
    
    # response['Content-Disposition'] = disposition_header
    response['X-Accel-Redirect'] = url

    # response['Content-Type'] = 'image/png'
    return response


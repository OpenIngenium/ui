from datetime import datetime

import requests
import logging
import settings
from ingenium.views.ingenium_settings import IngeniumSettings

logger = logging.getLogger(__name__)


def __output_request_debug_information__(method, url, headers, params, data):
    return "{0}('{1}') --params: {3} --data: {4} --headers: {2}".format(method, url, headers, params, data)


def __output_response_debug_information__(response):
    try:
        return "Response: ({0}): {1}".format(response.status_code, response.text)
    except UnicodeEncodeError as e:
        return (response.status_code, response.text)


def curl_command(response):
    req = response.request

    command = "curl -X {method} -H {headers} -d '{data}' '{uri}'"
    method = req.method
    uri = req.url
    data = req.body
    headers = ['"{0}: {1}"'.format(k, v) for k, v in req.headers.items()]
    headers = " -H ".join(headers)
    return command.format(method=method, headers=headers, data=data, uri=uri)


def log_request(method, url, headers, params, data):
    request_log = __output_request_debug_information__("get_request", url, headers, params, data)

    # if debug enabled, log the request
    if IngeniumSettings.debug_information_enabled():
        logger.info(request_log)


def log_response(response):
    response_log = __output_response_debug_information__(response)

    # always log response errors, or log info if debug is enabled
    if not response.ok:
        logger.warning(response_log)
    elif IngeniumSettings.debug_information_enabled():
        logger.info(response_log)


def get_request(url, data=None, params=None, token=None, auth=None, headers=None, **kwargs):
    if headers is None:
        headers = {
            'content-type': 'application/json',
            'Authorization': "Bearer %s" % token,
        }

    log_request("get_request", url, headers, params, data)

    response = requests.get(url, data=data, headers=headers, auth=auth, params=params,
                            verify=settings.VERIFY_REQUESTS_SSL, **kwargs)

    log_response(response)

    return response


def post_request(url, data=None, token=None, params=None, headers=None, files=None, **kwargs):
    if headers is None:
        headers = {
            'content-type': 'application/json',
            'Authorization': "Bearer %s" % token,
        }

    log_request("post_request", url, headers, params, data)

    response = requests.post(url,
                             data=data,
                             verify=settings.VERIFY_REQUESTS_SSL,
                             headers=headers,
                             params=params,
                             files=files,
                             **kwargs)

    log_response(response)

    return response


def delete_request(url, data=None, params=None, token=None, headers=None):
    if headers is None:
        headers = {
            'content-type': 'application/json',
            'Authorization': "Bearer %s" % token,
        }

    log_request("delete_request", url, headers, params, data)
    response = requests.delete(url, data=data, headers=headers, verify=settings.VERIFY_REQUESTS_SSL)
    log_response(response)

    return response


def put_request(url, data, params=None, token=None, headers=None):
    if headers is None:
        headers = {
            'content-type': 'application/json',
            'Authorization': "Bearer %s" % token,
        }

    log_request("put_request", url, headers, params, data)
    response = requests.put(url, data=data, params=params, verify=settings.VERIFY_REQUESTS_SSL, headers=headers)
    log_response(response)

    return response


def patch_request(url, data=None, params=None, token=None, headers=None, files=None, **kwargs):
    if headers is None:
        headers = {
            'content-type': 'application/json',
            'Authorization': "Bearer %s" % token,
        }

    log_request("patch_request", url, headers, params, data)
    response = requests.patch(url,
                              data=data,
                              headers=headers,
                              files=files,
                              verify=settings.VERIFY_REQUESTS_SSL,
                              **kwargs)

    log_response(response)

    return response

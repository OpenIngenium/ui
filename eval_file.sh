#!/bin/sh
# Specify env variables to be replaced. Otherwise nginx variables such as $1 $remote_addr will be replaced, which is not we want.
envsubst '${DJANGO_HOST} ${AUTH_API_HOST} ${CORE_API_HOST} ${DICT_API_HOST} ${VENUE_CONFIG_API_HOST} ${FILE_SERVER_API_HOST} ${SEARCH_SERVER_API_HOST} ${REPORT_SERVER_API_HOST} ${REPORT_API_URL} ${EXECUTION_MONITOR_API_HOST}' < $1

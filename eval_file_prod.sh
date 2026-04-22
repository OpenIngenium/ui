#!/bin/sh
# Specify env variables to be replaced. Otherwise nginx variables such as $1 $remote_addr will be replaced, which is not we want.
envsubst '${FILE_SERVER_API_HOST} ${SEARCH_API_URL} ${REPORT_API_URL}' < $1
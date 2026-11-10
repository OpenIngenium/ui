#!/bin/bash
CWD_ORIG=$(pwd)
SCRIPT_FILE=$(realpath $0)
SCRIPT_DIR=$(dirname $SCRIPT_FILE)
#
#echo SCRIPT_DIR=$SCRIPT_DIR
#
CHANGED=$(git --work-tree=${SCRIPT_DIR} status --porcelain)
#
STATUS_MSG=$(git status | head -1)
TOKENS=( $STATUS_MSG )
if [[ "${STATUS_MSG}" == "On branch"* ]]; then
    BRANCH=${TOKENS[-1]}
    HASH=$(cd $SCRIPT_DIR && git rev-parse HEAD | cut -c 1-10 && cd $CWD_ORIG)
    if [[ $CHANGED ]]; then
        VERSION="${BRANCH}-${HASH}-MOD"
    else
        VERSION="${BRANCH}-${HASH}"
    fi
elif [[ $STATUS_MSG == "HEAD detached at"* ]]; then
    TAG=${TOKENS[-1]}
    if [[ $CHANGED ]]; then
        VERSION="${TAG}-MOD"
    else
        VERSION="${TAG}"
    fi
else
    echo "Failed parse git status output: ${STATUS_MSG}"
    exit 1
fi
#
echo "VERSION: ${VERSION}"
#
echo "{\"version\": \"${VERSION}\"}" > "${SCRIPT_DIR}/src/client/src/assets/ing_version.json"

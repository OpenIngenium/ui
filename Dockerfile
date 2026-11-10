################################################################################
#Generates "ui" image                                                          #
################################################################################

# Generate version string from Git repo
# The python image has git, which is used to generate the version string.
FROM python:3.13.17 as python
COPY . /ui
# Need to copy hidden directory explicitly
COPY .git /ui/.git
RUN cd /ui && ./gen_version.sh

# Compile JS Bundles{{{
FROM node:22.23.4-alpine as node

RUN mkdir /src;
COPY --from=python /ui/src /src

WORKDIR /src/client

# dart-sass (sass) is pure JS, so no native node-sass rebuild is required.
# --legacy-peer-deps mirrors the resolution used to generate package-lock.json.
RUN npm ci --legacy-peer-deps && \
    npm run build
# }}}


# Generate js_bundle_export{{{
FROM python:3.13.17 as bash

RUN mkdir -p /src/client/dist
COPY --from=node /src/client/dist /src/client/dist

COPY ./js_filename_to_env.sh /js_filename_to_env.sh
RUN /js_filename_to_env.sh /src/client/dist js_bundle_env_var_export.sh
# }}}


# Run the Node/Express server (replaces Django/gunicorn) to serve dynamic content{{{
FROM node:22.23.4-alpine

COPY --from=bash /js_bundle_env_var_export.sh /

ENV APP_USER=ingenium
ENV APP_ROOT=/src

RUN mkdir -p ${APP_ROOT}/client/dist ${APP_ROOT}/server

# Built Vue bundles - server.js expects these at ../client/dist relative to itself
# (see src/server/src/config/index.js CLIENT_DIST_DIR - i.e. <APP_ROOT>/client/dist next to
# <APP_ROOT>/server, mirroring the src/client + src/server layout in the repo).
COPY --from=node /src/client/dist ${APP_ROOT}/client/dist

# Server code (package.json first, for better layer caching on npm ci).
COPY ./src/server/package*.json ${APP_ROOT}/server/
WORKDIR ${APP_ROOT}/server
RUN npm ci --omit=dev

COPY ./src/server ${APP_ROOT}/server

RUN addgroup -S ${APP_USER} \
    && adduser -S -h ${APP_ROOT} -s /sbin/nologin -G ${APP_USER} ${APP_USER} \
    && chown -R ${APP_USER}:${APP_USER} ${APP_ROOT}

ENV NODE_ENV=production
ENV SERVER_ENVIRONMENT="prod"

USER ${APP_USER}

EXPOSE 5000

CMD \
  . /js_bundle_env_var_export.sh && \
  node server.js
# }}}

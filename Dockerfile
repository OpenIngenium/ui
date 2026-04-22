################################################################################
#Generates "ui" image                                                          #
################################################################################

# Generate version string from Git repo
# The python image has git, which is used to generate the version string.
FROM cae-artifactory.jpl.nasa.gov:17001/python:3.8.2 as python
COPY . /ui
# Need to copy hidden directory explicitly
COPY .git /ui/.git
RUN cd /ui && ./gen_version.sh

# Compile JS Bundles{{{
FROM cae-artifactory.jpl.nasa.gov:17001/node:8.11.1-alpine as node

RUN mkdir /src;
COPY --from=python /ui/src /src

WORKDIR /src/client

RUN npm cache verify && \
    npm rebuild node-sass && \
    npm install --unsafe-perm && \
    npm run build-single-node
# }}}


# Generate js_bundle_export{{{
FROM cae-artifactory.jpl.nasa.gov:17001/python:3.8.2 as bash

RUN mkdir -p /src/client/dist
COPY --from=node /src/client/dist /src/client/dist

COPY ./js_filename_to_env.sh /js_filename_to_env.sh
RUN /js_filename_to_env.sh /src/client/dist js_bundle_env_var_export.sh
# }}}


# Run the python server to serve dynamic python content{{{
FROM cae-artifactory.jpl.nasa.gov:17001/python:3.8.2
ENV PYTHONUNBUFFERED 1


COPY --from=bash /js_bundle_env_var_export.sh /

ENV APP_USER ingenium
ENV APP_ROOT /src
RUN mkdir /src;

COPY ./src /src

RUN groupadd -r ${APP_USER} \
    && useradd -r -m \
    --home-dir ${APP_ROOT} \
    -s /usr/sbin/nologin \
    -g ${APP_USER} ${APP_USER}

WORKDIR ${APP_ROOT}
RUN chown -R ${APP_USER}:${APP_USER} ${APP_ROOT}

RUN mkdir /config

ADD config/requirements.txt /config/
RUN pip install --trusted-host cae-artifactory.jpl.nasa.gov -r /config/requirements.txt

ENV SERVER_ENVIRONMENT="prod"

USER ${APP_USER}
ADD . ${APP_ROOT}

EXPOSE 5000

CMD \
  . /js_bundle_env_var_export.sh && \
  gunicorn --bind=0.0.0.0:5000 --workers=9 --worker-class=gevent --timeout=300 --access-logfile='-' --log-file='-' --log-level=info ingenium.wsgi
# }}}

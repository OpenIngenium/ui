## How to Setup the project

**Prerequisites**
* Python 3
* Python Package: VirtualEnv
* pip installed


1)  Clone the repository to your local/remote machine  

    `git clone https://github.jpl.nasa.gov/Ingenium/ui.git`

2)  Setup a VirtualEnv to install application Python packages

    `virtualenv ~/<PATH>/ingenium-env`

3)  Activate your VirtualEnv

    `source ~/<PATH>/ingenium-env/bin/activate`

4)  install the required packages

    `pip install -r requirements.txt`

* Python 3+
* Python Package: VirtualEnv
* pip3 installed.

3)  Activate your Python 3 VirtualEnv

    `source ~/<PATH>/ingenium-env/bin/activate`

4)  install the required packages

    `pip3 install -r requirements.txt`

**Note** We are using JPLs Artifactory to host some Django Packages. This means you have to either be on the JPL Network or VPNed in to the network to access the machine.

5) Set Environment Variables and secrets.

Ask a team member to send via a secure method like jabber or lft.

Add the environment variables to your `bash_profile` or `bashrc`.

Save the file and source it: `source ~/.bash_profile`

**Note** MacOSX Catalina 10.15 does not allow write access to `/` anymore. In the `ingenium_dep` Dockerfile be sure to modify volume paths to point to `/System/Volumes/data` or a location of your choosing. 

~~Create a `/data/arangodb` at the root most level of your machine.~~

Run the following command `sudo chmod -R 777 data` to upgrade permission

In Docker allow access to the `/data` folder by navigating to `Preferences... > File Sharing > Add folder /data`

## How to Run the Project

In order to protect backend services and handle CORS-related issues we proxy all requests through an NGINX instance. NGINX captures all OPTIONS requests and returns a 204 response to the browser. Following a successful OPTIONS response, all other requests are routed to the correct backend service. 

There are two common ways to run the UI. 

### Local Django and local Vue app (NGINX) with Single Node

- Ensure that your environment variables are configured for single node. To use dictionary service and auth service from CI, point to them in environment variable. Below is an example.
```
export CORE_API_URL=http://127.0.0.1:8002/api/v5/
export ARCHIVE_API_URL=http://127.0.0.1:8010/api/v5/
export VENUE_CONFIG_API_URL=http://127.0.0.1:5151/api/v1/
export DICT_API_URL=https://ingenium-ci.jpl.nasa.gov/dict_service/api/v3/
export VNV_API_URL=http://127.0.0.1:8500/vnvspring/api/v3/vnv/
export AUTH_API_URL=https://ingenium-ci.jpl.nasa.gov/auth_server/api/v2/
export EXECUTION_SERVER_URL=http://127.0.0.1:9999/api/v3/
export UI_ENABLE_DEBUG_INFORMATION=True
#export SERVER_ENVIRONMENT=prod
export SERVER_ENVIRONMENT=

export AUTHORING_JS_BUNDLE=authoring-bundle.js
export DASHBOARD_JS_BUNDLE=dashboard-bundle.js
export EXECUTE_AS_RUN_JS_BUNDLE=execute-as-run-bundle.js
export EXECUTION_JS_BUNDLE=execution-bundle.js
export EXECUTIONS_JS_BUNDLE=executions-bundle.js
export PROJECT_CONFIG_JS_BUNDLE=project-config-bundle.js
export VENUE_DETAIL_JS_BUNDLE=venue-detail-bundle.js
export HEADER_JS_BUNDLE=header-bundle.js
export ADMIN_JS_BUNDLE=admin-bundle.js
export SEARCH_JS_BUNDLE=search-bundle.js
export SEARCH_API_URL=http://127.0.0.1:3025
export REPORT_API_URL=http://127.0.0.1:3003
```

- From the root of the `ingenium-dep` directory (https://github.jpl.nasa.gov/Ingenium/ingenium-dep), build ui_nginx in dev mode. `./compose_single_node/run_compose.sh build ui_nginx_dev`
- From the root of the `ingenium-dep` directory (https://github.jpl.nasa.gov/Ingenium/ingenium-dep), run single node for ui `.compose_single_node/run_compose.sh up ui_dev`.
- Set up Python virtual env at the top directory of this repo. Make sure you use Python 2.7. `pip install -r config/requirements -p python2.7` or `pip install -r config/requirements` if python2.7 is default in your environment.
- In `src` directory, run django on port 5000 using `./manage.py runserver 0.0.0.0:5000`
- Open another terminal, change to the `src/client` directory, and start the node service to watch and process changes to the frontend. `npm run dev`
- Access Ingenium UI using `http://localhost`, which is served by ui_nginx, which also serves Django pages through reverse proxy.


### Running Unit Tests
Unit tests live in `src/client/test/unit` and can be run via npm or cli.

Single run (headless jsdom) then exits — this is what CI runs:
```
npm test
```

Watch mode, keeps the browser open for troubleshooting and report viewing (click debug to see html report):
```
npm run test:watch
```

With coverage report:
```
npm run test:coverage
```

### Running E2E Tests Locally
End to end tests live in `src/client/test/e2e`. The tests are 
[selenium tests](http://nightwatchjs.org/guide) which will require ChromeDriver to run locally.

1) make sure the following environment variables are set
``` 
export JWT_SECRET=Put_Your_Secret_Here
export TEST_USER=ask-for-latest-username
export TEST_PASS=ask-for-latest-password
```

2) install ChromeDriver

MacOS via brew or [Windows installer](https://sites.google.com/a/chromium.org/chromedriver/downloads) 
```
brew install chromedriver
```

3) run all the tests in another terminal window
```
npm run e2e
```

## Misc Notes

You will also have to make sure the IP is in the ALLOWED_HOSTS setting or you have a '*' in the setting.  Note never run
a '*' in production.  This should only be done on local for testing


# ESLint Configuration for VSCode
Install the [ESLint plugin](https://github.com/Microsoft/vscode-eslint) and add these settings to your Workspace settings file:
```
{
    "eslint.options": {
        "configFile": "src/client/package.json"
    },
    "eslint.validate": ["javascript", {"autoFix": true, "language": "vue"}],
    "eslint.enable": true
} 
```

# Configuring API Endpoints
All the endpoints are defined at the bottom of the `settings/base.py` file.  This was done so people would not have to look through
multiple files to change the urls to endpoint services. 

Each API Endpoint can be changed individually to point ot different host. e.g (Core, Execution, Venue, Auth, etc)


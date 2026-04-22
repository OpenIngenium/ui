let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    SELENIUM_PROMISE_MANAGER: false,

    seleniumAddress: "http://selenium-chrome:4444/wd/hub",

    // used for local testing/verification
    // baseUrl: "http://host.docker.internal",
    baseUrl: process.env.UI_NGINX_URL,

    specs: [
        "specs/*.spec.js",
    ],

    params: {
        login: {
            testUser: process.env.TEST_USER,
            testPass: process.env.TEST_PASS
        }
    },

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        stopOnFailure: true,
        includeStackTrace: true,
        isVerbose: true,
        print: function() {}
    },

    onPrepare: function() {
        jasmine.getEnv().addReporter(new SpecReporter({
            spec: {
                displayStacktrace: true
            }
        }));
    },

    restartBrowserBetweenTests: true
};

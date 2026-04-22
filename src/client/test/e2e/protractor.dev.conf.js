let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    SELENIUM_PROMISE_MANAGER: false,

    baseUrl: "http://127.0.0.1:80",
    specs: [
        "specs/*.spec.js",
    ],
    params: {
        login: {
            testUser: process.env.TEST_USER,
            testPass: process.env.TEST_PASS
        }
    },
    // Bypass selenium and use chromedriver directly
    // tests will run FASTER
    // directConnect: true,

    // for use with standalone server
    // seleniumAddress: 'http://localhost:4444/wd/hub',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        showColors: true,
        stopOnFailure: true,
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

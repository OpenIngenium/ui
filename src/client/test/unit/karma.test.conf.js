const webpackConfig = require("../../webpack.config.js");

module.exports = function(config) {
    config.set({
        frameworks: ["jasmine"],

        files: [
            "specs/**/*.spec.js"
        ],

        exclude: [
            // jsdom doesn't support DataTransfer
            "specs/execution/IngElementWrapper.spec.js"
        ],

        preprocessors: {
            "**/*.spec.js": ["webpack"]
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            logLevel: "error",
            stats: "errors-only"
        },

        reporters: ["spec", "junit", "coverage"],

        junitReporter: {
            outputDir: "../test-reports",
            outputFile: "unit-junit.xml",
            useBrowserName: false,
        },

        coverageReporter: {
            dir: "../test-reports",
            subdir: ".",
            file: "unit-coverage.json",
            reporters: [
                { type: "json-summary" }
            ],
            instrumenterOptions: {
                istanbul: { noCompact: true }
            },
            includeAllSources: true
        },
        browsers: ["jsdom"],
        browserNoActivityTimeout: 60000,
        browserDisconnectTimeout: 60000
    });
};

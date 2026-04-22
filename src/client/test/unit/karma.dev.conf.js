const webpackConfig = require("../../webpack.config.js");

module.exports = function(config) {
    config.set({
        frameworks: ["jasmine"],

        files: [
            "specs/**/*.spec.js",
        ],

        preprocessors: {
            "**/*.spec.js": ["webpack"]
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            logLevel: "error",
            stats: "errors-only"
        },

        reporters: ["spec", "kjhtml", "coverage"],

        coverageReporter: {
            reporters: [
                { type: "text" }
            ],
            instrumenterOptions: {
                istanbul: { noCompact: true }
            },
            includeAllSources: true
        },
        browsers: ["Chrome"]
    });
};

// Fast local iteration config: jsdom, minimal reporters, no coverage/junit,
// and a non-production webpack build (skips source-maps + minification).
// Use SPEC_GLOB to target a subset of specs, e.g.
//   SPEC_GLOB="specs/execution/WaitElement.spec.js" \
//     ./node_modules/.bin/karma start test/unit/karma.fast.conf.js --single-run
const webpackConfig = require("../../webpack.test.js");

module.exports = function(config) {
    config.set({
        frameworks: ["jasmine"],

        files: [
            "setup.js",
            process.env.SPEC_GLOB || "specs/**/*.spec.js"
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

        reporters: ["spec"],

        browsers: ["jsdom"],
        browserNoActivityTimeout: 60000,
        browserDisconnectTimeout: 60000
    });
};

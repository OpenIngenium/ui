// Coverage config: jsdom + istanbul-instrumented sources (NODE_ENV=test).
// Reports coverage of first-party src only (specs/test excluded via .babelrc).
// Run with:
//   NODE_ENV=test NODE_OPTIONS=--max-old-space-size=8192 \
//     ./node_modules/.bin/karma start test/unit/karma.coverage.conf.js --single-run
// Optionally scope with SPEC_GLOB.
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

        reporters: ["spec", "coverage"],

        coverageReporter: {
            dir: "../test-reports/coverage",
            subdir: ".",
            reporters: [
                { type: "text-summary" },
                { type: "html", subdir: "html" },
                { type: "lcovonly", subdir: ".", file: "lcov.info" },
                { type: "json-summary", subdir: ".", file: "coverage-summary.json" }
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

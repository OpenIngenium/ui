// Global unit-test bootstrap.
//
// This file is loaded before any spec (see karma.*.conf.js `files`) and is NOT
// webpack-preprocessed, so it must not use ES module imports. It runs once in
// the jsdom page context, so anything it patches on the global `window` applies
// to every spec bundle.
//
// It addresses two sources of noise/failure that occur even though all specs
// pass:
//
// 1. Expected console noise: many API modules and components intentionally
//    `console.error(error)` inside catch blocks (see e.g. src/api/*.js). Unit
//    tests deliberately exercise those rejection paths, dumping large expected
//    stack traces. We silence console.error/warn while still letting specs
//    `spyOn(console, ...)` if they need to assert on logging.
//
// 2. Leaked real network requests: a few component specs mount components whose
//    lifecycle hooks fire unstubbed API calls (e.g. GET /procedures/{id}/versions/1).
//    Against the karma web-server those log `WARN 404`, and — worse — their
//    XHR callbacks resolve *after* the jsdom window is torn down, which makes
//    jsdom throw `Cannot read properties of null (reading '_location')` as an
//    UncaughtException in karma-server and fail the run with exit code 1.
//    No unit spec relies on real XHR (they stub `transport`/`*Api` methods), so
//    we replace XMLHttpRequest with an inert no-op: requests never touch the
//    network and their callbacks never fire, so nothing leaks past teardown.
/* eslint-disable no-console */
(function silenceExpectedConsoleNoise() {
    var noop = function() {};
    console.error = noop;
    console.warn = noop;
})();
/* eslint-enable no-console */

(function blockRealNetworkRequests() {
    // Minimal, inert XMLHttpRequest replacement. It implements just enough of
    // the interface for axios' xhr adapter (and jQuery) to call it without
    // throwing, but send() is a no-op so no request is ever dispatched and no
    // load/error/timeout callbacks ever run. Specs that need a response stub
    // the API layer directly, bypassing this entirely.
    function InertXMLHttpRequest() {
        this.readyState = 0;
        this.status = 0;
        this.statusText = "";
        this.response = "";
        this.responseText = "";
        this.responseURL = "";
        this.responseType = "";
        this.timeout = 0;
        this.withCredentials = false;
        this.upload = {
            addEventListener: function() {},
            removeEventListener: function() {}
        };
        this.onreadystatechange = null;
    }
    InertXMLHttpRequest.UNSENT = 0;
    InertXMLHttpRequest.OPENED = 1;
    InertXMLHttpRequest.HEADERS_RECEIVED = 2;
    InertXMLHttpRequest.LOADING = 3;
    InertXMLHttpRequest.DONE = 4;
    InertXMLHttpRequest.prototype.open = function() { this.readyState = 1; };
    InertXMLHttpRequest.prototype.setRequestHeader = function() {};
    InertXMLHttpRequest.prototype.overrideMimeType = function() {};
    InertXMLHttpRequest.prototype.send = function() {};
    InertXMLHttpRequest.prototype.abort = function() {};
    InertXMLHttpRequest.prototype.getResponseHeader = function() { return null; };
    InertXMLHttpRequest.prototype.getAllResponseHeaders = function() { return ""; };
    InertXMLHttpRequest.prototype.addEventListener = function() {};
    InertXMLHttpRequest.prototype.removeEventListener = function() {};
    InertXMLHttpRequest.prototype.dispatchEvent = function() { return false; };

    window.XMLHttpRequest = InertXMLHttpRequest;
})();

'use strict';
// Template version: {{ template_version }}
// see http://vuejs-templates.github.io/webpack for documentation.

const dev = require('./dev.env');
const test = require('./test.env');
const prod = require('./prod.env');

module.exports = {
    dev: dev,
    test: test,
    prod: prod,
};

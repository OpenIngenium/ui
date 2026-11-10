const merge = require('webpack-merge');
const prodEnv = require('./prod.env');


const venuesUrl = '"http://" + window.location.hostname + "/core_server/api/v5/venues/"';

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    VENUES_URL: venuesUrl,
    DEBUG_MODE: true // this overrides the DEBUG_MODE value of prod.env
});

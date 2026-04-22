const merge = require('webpack-merge');
const prodEnv = require('./prod.env');


const venuesUrl = '"http://" + window.location.hostname + "/core_server/api/v5/venues/"';
const venueConfigUrl = '"http://" + window.location.hostname + "/venue_config/api/v1/configurations/"';

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    VENUES_URL: venuesUrl,
    VENUE_CONFIG_URL: venueConfigUrl,
    DEBUG_MODE: true // this overrides the DEBUG_MODE value of prod.env
});

require('dotenv').config();

const createApp = require('./src/app');
const config = require('./src/config');

const app = createApp();

const server = app.listen(config.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Ingenium server listening on port ${config.PORT} (${config.NODE_ENV})`);
});

// Let WebSocket-based proxies (e.g. /execution_monitor) hook into the raw upgrade event -
// Express's app.use() alone doesn't forward WS upgrade handshakes.
app.emit('upgrade-proxy-targets', server);

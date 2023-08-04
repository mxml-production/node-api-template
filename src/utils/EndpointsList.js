const listEndpoints = require('express-list-endpoints');

const endpointsList = (app) => listEndpoints(app);

module.exports = endpointsList;
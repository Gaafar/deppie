const deppie = require('deppie');

// require all modules
const config = require('./modules/config');
const apiClient = require('./modules/api-client');
const routes = require('./modules/routes');
const app = require('./modules/app');

const moduleDefinitions = {
    app,
    config,
    apiClient,
    routes,
};

// create all modules
deppie(moduleDefinitions);

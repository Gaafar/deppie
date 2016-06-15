const deppie = require('deppie');

// modules
const config = { port: 8088 };
const apiClient = require('./modules/api-client');
const logStart = require('./modules/log-start');
const routes = require('./routes');
const app = require('./app');

// each module is an object with one key (module name) and the value is the module
const moduleDefinitions = {
    app,
    config: () => config,
    apiClient,
    routes,
    logStart,
};

// bootstrap all modules
deppie(moduleDefinitions);

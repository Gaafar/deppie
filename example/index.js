const deppie = require('deppie');

// modules
const config = { port: 8088 };
const apiClient = require('./modules/api-client');
const routes = require('./routes');
const app = require('./app');

// the modules need to be defined in order of dependency
// Hash (key: string, factoryMethod: (dependencies) -> module)
const moduleDefinitions = {
    // the first module can't have any dependencies
    config: () => config,
    apiClient,
    routes,
    app,
    // the last module(s) are the entry points since they cannot be used by any other modules
};

// bootstrap all modules
deppie(moduleDefinitions);

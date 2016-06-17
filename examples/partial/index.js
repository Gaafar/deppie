const express = require('express');
const _ = require('lodash');
const deppie = require('deppie');

/*
here config is not defined as a module that can be passed to deppie
maybe it's an old piece of code you don't want to touch
but still want it to be available for other modules created by deppie
*/
const config = { port: 8888, apiURL: 'http://myrestapi.com' };

// these modules are defined to be used by deppie
const apiClient = require('./modules/api-client');
const routes = require('./modules/routes');

const moduleDefinitions = {
    apiClient,
    routes,
};

/*
deppie takes and optional second argument (existing modules),
which represent modules that are constructed outside deppie
but will be required as dependency for some deppie modules as is,
deppie will then return all the modules it created
as well as the existing modules you passed initially
*/
const modules = deppie(moduleDefinitions, { config });

// then you can use the return modules in code outside of deppie
const app = express();

// Add routes from module.routes which was created by deppie
_.each(modules.routes, ({ method, pattern, middleware = [], handler }) =>
app[method](pattern, [...middleware, handler]));

// you can also use the same config you passed to deppie from the returned modules
app.listen(modules.config.port);
console.log(`listening on port ${modules.config.port}`);

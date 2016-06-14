const bodyParser = require('body-parser');
const express = require('express');
const f = require('lodash/fp');
const di = require('./di');
const config = { port: 8088 }

const app = express()
    .use(bodyParser.text())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

// the modules need to be defined in order of dependency
// Hash (key: string, factoryMethod: (dependencies) -> module)
const moduleDefinitions = {
    config: () => config,
};

const dependencies = di(moduleDefinitions);

console.log(dependencies)
// // Add routes
// f.each(({ method, pattern, middleware = [], handler }) =>
//     app[method](pattern, [...middleware, handler]), routes);

app.listen(config.port);
console.log(`listening on port ${config.port}`);
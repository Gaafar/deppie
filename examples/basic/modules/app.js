// this module is void (has no return)
// it's an entry point that starts the express server
// and will not be used by other modules
const express = require('express');
const _ = require('lodash');

module.exports = ({ routes, config }) => {
    const app = express();

    // Add routes
    _.each(routes, ({ method, pattern, middleware = [], handler }) =>
    app[method](pattern, [...middleware, handler]));

    app.listen(config.port);
    console.log(`listening on port ${config.port}`);
};

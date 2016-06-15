const bodyParser = require('body-parser');
const express = require('express');
const f = require('lodash/fp');

module.exports = ({ routes, config }) => {
    const app = express()
    .use(bodyParser.text())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

    // Add routes
    f.each(({ method, pattern, middleware = [], handler }) =>
    app[method](pattern, [...middleware, handler]), routes);

    app.listen(config.port);
    console.log(`listening on port ${config.port}`);
    // ignore return to prevent use of this module
    // return app;
};

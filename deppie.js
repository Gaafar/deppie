const f = require('lodash/fp');
const babylon = require('babylon');

const parseDependencies = (functionStr) => {
    const parsed = babylon.parse(functionStr, {
        sourceType: 'script' });
    // get the first argument of the function, then get its desctructued properties
    const properties = f.flow(
        f.get('program.body.0.expression.params.0.properties'),
        f.map('key.name')
        )(parsed);
    return properties;
};

const checkMissingDependencies = (factoryMethod, dependencies) => {
    // check if all dependencies are available for module
    const functionStr = factoryMethod.toString();
    const requiredDependencies = parseDependencies(functionStr);

    const missingDependencies = f.filter(d => !dependencies[d], requiredDependencies);

    return missingDependencies;
};

const createProxy = (dependencies) => {
    const proxyHandler = {
        get(target, name) {
            // check string names only to avoid breaking symbols (console.log)
            if (typeof name === 'string' && !target[name]) {
                console.trace(`dependency "${name}" not found`);
            }
            return target[name];
        },
        // prevent setting object properties
        set(target, name, value) {
            // console.log({target, name, value});
            console.trace(`dependencies cannot be set, tried to set dependency "${name}"`);
        },
    };

    return new Proxy(dependencies, proxyHandler);
};

// TODO: use getters for lazy loading?
// TODO: test with existingDependencies
// TODO: use a prefix for all log messages
module.exports = (moduleDefinitions, existingDependencies = {}) =>
    f.flow(
        f.toPairs,
        f.reduce((dependencies, [name, factoryMethod]) => {
            if (dependencies[name]) {
                throw new Error(`dependency name (${name}) already exists`);
            }

            // check if all dependencies are available for module
            const missingDependencies = checkMissingDependencies(factoryMethod, dependencies);
            if (missingDependencies.length) {
                console.trace(`missing dependencies "${missingDependencies.join(', ')}" \
for module "${name}"
these dependencies must be defined before "${name}"`);
            }

            // ignore modules with no return, with a log message
            const createdModule = factoryMethod(dependencies);
            if (createdModule == undefined) {
                console.log(`no return from module "${name}", it will not be available to inject`);
                return dependencies;
            }
            return f.assign(dependencies, { [name]: createdModule });
        }, existingDependencies),
        createProxy
    )(moduleDefinitions);

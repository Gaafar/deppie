const f = require('lodash/fp');
const babylon = require('babylon');
const madge = require('madge');
const {
    checkMissingDependencies,
    checkCircularDependencies,
    checkVoidModules,
} = require('./lib/checks');

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

// returns new modules hash
const createModule = (name, dependencyGraph, existingModules, moduleDefinitions) => {
    // check if module already exists
    const existingDependency = existingModules[name];
    if (existingDependency) {
        return existingModules;
    }

    // create dependencies recursively
    const moduleDependencies = dependencyGraph[name];
    const updatedDependencies = f.reduce(
        (accumulatedModules, name) =>
            f.assign(
                accumulatedModules,
                createModule(name, dependencyGraph, accumulatedModules, moduleDefinitions)
            ),
        existingModules
    )(moduleDependencies);

    // create module
    const createdModule = moduleDefinitions[name](updatedDependencies);
    // return dependencies with new module
    return f.assign(updatedDependencies, { [name]: createdModule });
};

const createAllModules = (dependencyGraph, existingModules, moduleDefinitions) => f.flow(
    f.keys,
    f.reduce(
        (accumulatedModules, name) =>
            createModule(name, dependencyGraph, accumulatedModules, moduleDefinitions),
        existingModules
    )
)(dependencyGraph);

const createProxy = (dependencies) => {
    const proxyHandler = {
        // prevent setting object properties
        set(target, name) {
            console.trace(`dependencies cannot be set, tried to set dependency "${name}"`);
        },
    };
    return new Proxy(dependencies, proxyHandler);
};

// TODO: use getters for lazy loading?
// TODO: test with existingModules
// TODO: use a prefix for all log messages
// TODO: rename modules, dependencies to ?
// TODO: tests!!
// TODO: readme
module.exports = (moduleDefinitions, existingModules = {}) => {
    const dependencyGraph = f.mapValues(
        module => parseDependencies(module.toString())
    )(moduleDefinitions);

    checkMissingDependencies(moduleDefinitions, existingModules, dependencyGraph);

    const graphDetails = madge(dependencyGraph);

    checkCircularDependencies(graphDetails);

    const createdModules = createAllModules(dependencyGraph, existingModules, moduleDefinitions);

    checkVoidModules(createdModules, graphDetails);

    // remove void modules from return
    const availableModules = f.omitBy(module => module == null)(createdModules);

    // return proxy
    return createProxy(availableModules);
};

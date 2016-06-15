const f = require('lodash/fp');
const babylon = require('babylon');
const madge = require('madge');

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
        get(target, name) {
            // check string names only to avoid breaking symbols (for console.log)
            // not needed as checks are done at bootstrap time
            // if (typeof name === 'string' && target[name] == null) {
            //     console.trace(`dependency "${name}" not found`);
            // }
            return target[name];
        },
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
module.exports = (moduleDefinitions, existingModules = {}) => {
    const dependencyGraph = f.mapValues(
        module => parseDependencies(module.toString())
    )(moduleDefinitions);

    // check for missing dependencies
    const missingDependencies = f.flow(
        f.mapValues(
            f.reject(dependencyName =>
            moduleDefinitions[dependencyName] || existingModules[dependencyName]
            )
        ),
        f.pickBy('length'),
        f.toPairs
    )(dependencyGraph);

    if (missingDependencies.length) {
        f.forEach(([name, missing]) => {
            console.log(`unable to find dependencies "${missing.join(', ')}" for module "${name}"`);
        })(missingDependencies);
        throw new Error('missing dependencies');
    }

    const graphDetails = madge(dependencyGraph);

    // check for cirular dependencies
    const cirularDependencies = graphDetails.circular().getArray();
    if (cirularDependencies.length) {
        f.forEach(modules => {
            if (modules.length === 1) {
                console.log(`found self dependency in module "${modules[0]}"`);
            } else {
                console.log(`found circular dependencies between modules "${modules.join(', ')}"`);
            }
        })(cirularDependencies);
        throw new Error('circular dependencies');
    }

    const createdModules = f.flow(
        (moduleDefinitions) => createAllModules(dependencyGraph, existingModules, moduleDefinitions)
    )(moduleDefinitions);

    // warn about void modules
    const voidModulesInjected = f.flow(
        f.pickBy(module => module == null),
        f.keys,
        f.map(moduleName => [moduleName, graphDetails.depends(moduleName)]),
        f.filter('1.length')
    )(createdModules);

    if (voidModulesInjected.length) {
        f.flow(
            f.forEach(([moduleName, dependents]) => {
                console.log(`the module "${moduleName}" has no return and can't\
be injected in the modules "${dependents.join(', ')}"`);
            })
        )(voidModulesInjected);
        throw new Error('depending on void modules');
    }

    // remove void modules from return
    const availableModules = f.omitBy(module => module == null)(createdModules);
    // return proxy
    return createProxy(availableModules);
};

const f = require('lodash/fp');

const checkMissingDependencies = (moduleDefinitions, existingModules, dependencyGraph) => {
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
};

const checkCircularDependencies = (graphDetails) => {
    const circularDependencies = graphDetails.circular().getArray();
    if (circularDependencies.length) {
        f.forEach(modules => {
            if (modules.length === 1) {
                console.log(`found self dependency in module "${modules[0]}"`);
            } else {
                console.log(`found circular dependencies between modules "${modules.join(', ')}"`);
            }
        })(circularDependencies);
        throw new Error('circular dependencies');
    }
};

const checkVoidModules = (createdModules, graphDetails) => {
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
};

// TODO: warn for unused modules

module.exports = {
    checkMissingDependencies,
    checkCircularDependencies,
    checkVoidModules,
};

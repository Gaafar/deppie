const { assert } = require('chai');
const deppie = require('../index');

// no operation function
const noop = () => {};

describe('deppie', () => {
    describe('dependency injection', () => {
        it('should find the injected module', () => {
            const dep1 = () => ({ a: 1 });
            const dep2 = ({ dep1 }) => {
                assert.deepEqual(dep1, { a: 1 });
            };
            deppie({ dep1, dep2 });
        });
    });

    describe('existing modules', () => {
        it('should find the existing module', () => {
            const dep1 = { a: 1 };
            const dep2 = ({ dep1 }) => {
                assert.deepEqual(dep1, { a: 1 });
            };
            deppie({ dep2 }, { dep1 });
        });
    });

    describe('created modules', () => {
        const dep1 = () => ({ a: 1 });
        const dep2 = ({ dep1 }) => {
            noop(dep1);
        };
        const modules = deppie({ dep1, dep2 });
        it('should find the created module', () => {
            assert.deepEqual(modules.dep1, { a: 1 });
        });
        it('should not find the void module', () => {
            assert.notProperty(modules, 'dep2');
        });
    });

    describe('modifying created modules', () => {
        it('should throw exception for modifying created modules', () => {
            const dep1 = () => ({ a: 1 });
            const dep2 = ({ dep1 }) => noop(dep1);
            const modules = deppie({ dep1, dep2 });
            assert.throws(() => { modules.dep1 = {}; },
                'modifying dependency'
            );
        });
    });


    describe('missing dependency', () => {
        it('should throw exception for missing dependencies', () => {
            const dep1 = ({ dep3 }) => ({ a: dep3 });
            const dep2 = ({ dep1 }) => ({ a: dep1 });
            assert.throws(() => deppie({ dep1, dep2 }),
                'missing dependencies'
            );
        });
    });

    describe('circular dependency', () => {
        it('should throw exception for circular dependencies', () => {
            const dep1 = ({ dep2 }) => ({ a: dep2 });
            const dep2 = ({ dep1 }) => ({ a: dep1 });
            assert.throws(() => deppie({ dep1, dep2 }),
                'circular dependencies'
            );
        });
    });

    describe('self dependency', () => {
        it('should throw exception for self dependency', () => {
            const dep1 = ({ dep1 }) => ({ a: dep1 });
            const dep2 = ({ dep1 }) => ({ a: dep1 });
            assert.throws(() => deppie({ dep1, dep2 }),
                'circular dependencies'
            );
        });
    });

    describe('void dependency', () => {
        it('should throw exception for depending on void module ', () => {
            const dep1 = () => {};
            const dep2 = ({ dep1 }) => ({ a: dep1 });
            assert.throws(() => deppie({ dep1, dep2 }),
                'depending on void modules'
            );
        });
    });
});

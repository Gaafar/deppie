const { assert } = require('chai');
const deppie = require('../index');

describe('deppie', () => {
    describe('missing dependency', () => {
        it('should throw exception for missing dependencies', () => {
            const dep1 = ({ dep2, dep3 }) => ({ a: dep2, b: dep3 });
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

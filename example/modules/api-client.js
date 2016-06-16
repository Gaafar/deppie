const bb = require('bluebird');

module.exports = ({ config: { apiURL } }) => ({
    getUsers() {
		// make a request to the apiURL
        console.log(`mocking request to ${apiURL}`);
        return bb.resolve([
			{ name: 'user1', age: 20 },
			{ name: 'user2', age: 30 },
			{ name: 'user3', age: 40 },
        ]);
    },
});

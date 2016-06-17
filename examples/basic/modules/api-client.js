// this module is a sample for an api client that fetches data from a rest api
module.exports = ({ config: { apiURL } }) => ({
    getUsers() {
		// make a request to the apiURL
        console.log(`mocking request to ${apiURL}`);
        return new Promise((resolve) => {
            setTimeout(() => resolve([
                { name: 'user1', age: 20 },
                { name: 'user2', age: 30 },
                { name: 'user3', age: 40 },
            ]), 1000);
        });
    },
});

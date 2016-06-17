// this module returns all the routes that will be added to the express server
module.exports = ({ apiClient }) => [{
    method: 'get',
    pattern: '/api/users',
    handler: (req, res) => {
        apiClient.getUsers()
            .then(data => {
                res.send(data);
            })
            .catch(err => res.status(500).send(err.toString()));
    },
}];

const bcrypt = require('bcryptjs');
const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const Users = require('mongo-crud-simple')(dsn, 'users');

// generate password
const pass = (pwd) => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(pwd, salt);

    return hash;
};

const users = [
    {
        username: 'admin',
        name: 'admin',
        email: 'admin@birdreport.se',
        role: 'admin',
        password: pass('admin'),
        image: 'http://i.pravatar.cc/128'
    },
    {
        username: 'doe',
        name: 'doe',
        email: 'doe@birdreport.se',
        role: 'user',
        password: pass('doe'),
        image: 'http://i.pravatar.cc/128'
    }
];

users.forEach((user) => {
    Users.create(user);
});

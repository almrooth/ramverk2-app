// Middleware handling authentication service for express
// const bcrypt = require('bcryptjs');
const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;

module.exports = (dsn, collection) => {
    /**
    * Create and return connection to DB
    *
    * @async
    *
    * @return {object} Connection and collection
    */
    async function connect() {
        try {
            const db    = await MongoClient.connect(dsn);
            const col   = await db.collection(collection);

            return { db, col };
        } catch (error) {
            throw error;
        }
    }

    return {
        // protect route for logged in users
        isLoggedIn(req, res, next) {
            let user = req.session.user;

            if (typeof user === 'undefined') {
                res.redirect('/auth/login');
            } else {
                next();
            }
        },

        // protect route for logged in admin users
        isLoggedInAdmin(req, res, next) {
            let user = req.session.user;

            if (typeof user === 'undefined') {
                res.redirect('/auth/login');
            } else if (user.role !== 'admin') {
                res.redirect('/');
            } else {
                next();
            }
        },

        // route only for guests (not logged in)
        guest(req, res, next) {
            let user = req.session.user;

            if (typeof user !== 'undefined') {
                res.redirect('/');
            } else {
                next();
            }
        },

        // get user
        async getUser(username) {
            try {
                const { db, col } = await connect();
                const res = await col.findOne({ username: username });

                await db.close();
                return res;
            } catch (error) {
                throw error;
            }
        },

        // check if username exists
        async checkUsername(username) {
            let user = await this.getUser(username);

            return (user === null) ? false : true;
        }
    };
};

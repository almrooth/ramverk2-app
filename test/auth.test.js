// const request = require('supertest');
const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const auth = require('../src/auth')(dsn, 'test');
const next = jest.fn();

describe('isLoggedIn', () => {
    test('returns next() when logged in', async () => {
        let req = {
            session: { user: ''}
        };
        let res = {
            redirect: (value) => {
                return value;
            },
        };

        await auth.isLoggedIn(req, res, next);
        expect(next).toBeCalled();
    });

    test('returns res.redirect() when not logged in', async () => {
        let req = {
            session: {}
        };
        let res = {
            redirect: jest.fn().mockReturnThis()
        };

        await auth.isLoggedIn(req, res, next);
        expect(res.redirect).toBeCalled();
    });
});

describe('isLoggedInAdmin', () => {
    test('returns next() when logged in', async () => {
        let req = {
            session: { user: { role: 'admin'}}
        };
        let res = {
            redirect: (value) => {
                return value;
            },
        };

        await auth.isLoggedInAdmin(req, res, next);
        expect(next).toBeCalled();
    });

    test('returns next() when logged in', async () => {
        let req = {
            session: { user: { role: 'user'}}
        };
        let res = {
            redirect: (value) => {
                return value;
            },
        };

        await auth.isLoggedInAdmin(req, res, next);
        expect(next).toBeCalled();
    });

    test('returns res.redirect() when not logged in', async () => {
        let req = {
            session: {}
        };
        let res = {
            redirect: jest.fn().mockReturnThis()
        };

        await auth.isLoggedInAdmin(req, res, next);
        expect(res.redirect).toBeCalled();
    });
});

describe('guest', () => {
    test('returns next() when not logged in', async () => {
        let req = {
            session: {}
        };
        let res = {
            redirect: (value) => {
                return value;
            },
        };

        await auth.guest(req, res, next);
        expect(next).toBeCalled();
    });

    test('returns res.redirect() when logged in', async () => {
        let req = {
            session: { user: ''}
        };
        let res = {
            redirect: jest.fn().mockReturnThis()
        };

        await auth.guest(req, res, next);
        expect(res.redirect).toBeCalled();
    });
});

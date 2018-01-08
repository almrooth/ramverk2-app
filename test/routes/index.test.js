"use strict";

const request = require('supertest');
const app = require('../../app');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';
const bcrypt = require('bcryptjs');

beforeAll(async () => {
    let db    = await MongoClient.connect(dsn);
    let col   = await db.collection('users');

    let testAdmin = {
        username: 'testAdmin',
        role: 'admin',
        password: bcrypt.hashSync('testAdmin', bcrypt.genSaltSync(10))
    };

    let testUser = {
        username: 'testUser',
        role: 'user',
        password: bcrypt.hashSync('testUser', bcrypt.genSaltSync(10))
    };

    await col.insertOne(testAdmin);
    await col.insertOne(testUser);

    await db.close();
});

afterAll(async () => {
    let db    = await MongoClient.connect(dsn);
    let col   = await db.collection('users');

    let testAdmin = await col.findOne({username: 'testAdmin'});
    let testUser = await col.findOne({username: 'testUser'});

    await col.findOneAndDelete({ _id: ObjectId(testAdmin._id)});
    await col.findOneAndDelete({ _id: ObjectId(testUser._id)});

    await db.close();
});

describe('Base routes', () => {
    test('GET / exists', async () => {
        let res = await request(app).get('/');

        expect(res.status).toBe(200);
    });

    test('GET /about exists', async () => {
        let res = await request(app).get('/about');

        expect(res.status).toBe(200);
    });

    test('GET /404 does not exists, should return 404', async () => {
        let res = await request(app).get('/404');

        expect(res.status).toBe(404);
    });
});

describe('Chat route', () => {
    test('not logged in', async () => {
        let res = await request(app).get('/chat');

        expect(res.status).toBe(302);
    });

    test('logged in', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/chat');

        expect(res.status).toBe(200);
    });
});

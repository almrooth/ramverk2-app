"use strict";

const request = require('supertest');
const app = require('../../app');

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dsn = process.env.DBWEBB_DSN || 'mongodb://127.0.0.1:27017/birdreport';

afterAll(async () => {
    let db    = await MongoClient.connect(dsn);
    let col   = await db.collection('users');

    let testUser = await col.findOne({username: 'testUser'});

    await col.findOneAndDelete({ _id: ObjectId(testUser._id)});

    await db.close();
});

describe('/auth routes', () => {
    test('GET /auth/register exists', async () => {
        let res = await request(app).get('/auth/register');

        expect(res.status).toBe(200);
    });

    test('POST /auth/register', async () => {
        let form = { username: 'testUser', password: 'testUser', password2: 'testUser'};
        let res = await request(app).post('/auth/register').send(form);

        expect(res.status).toBe(302);
    });

    test('POST /auth/register, taken username', async () => {
        let form = { username: 'testUser', password: 'testUser', password2: '456'};
        let res = await request(app).post('/auth/register').send(form);

        expect(res.status).toBe(302);
    });

    test('POST /auth/register, passwords dont match', async () => {
        let form = { username: '4564654', password: 'testUser', password2: '456'};
        let res = await request(app).post('/auth/register').send(form);

        expect(res.status).toBe(302);
    });

    test('GET /auth/login exists', async () => {
        let res = await request(app).get('/auth/login');

        expect(res.status).toBe(200);
    });

    test('POST /auth/login wrong username', async () => {
        let form = { username: 'asdkljsldkjasdlkjsd', password: 'test'};
        let res = await request(app).post('/auth/login').send(form);

        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/auth/login');
    });

    test('POST /auth/login wrong password', async () => {
        let form = { username: 'testUser', password: 'test2'};
        let res = await request(app).post('/auth/login').send(form);

        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/auth/login');
    });

    test('POST /auth/login correct credentials', async () => {
        let form = { username: 'testUser', password: 'testUser'};
        let res = await request(app).post('/auth/login').send(form);

        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/');
    });

    test('GET /auth/logout when logged in', async () => {
        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/auth/logout');

        expect(res.status).toBe(302);
    });

    test('GET /auth/logout when logged out', async () => {
        let res = await request(app).get('/auth/logout');

        expect(res.status).toBe(302);
    });
});

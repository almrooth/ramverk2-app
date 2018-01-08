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

describe('GET /observations', () => {
    test('route works', async () => {
        let res = await request(app).get('/observations');

        expect(res.status).toBe(200);
    });
});

describe('GET /create', () => {
    test('not logged in', async () => {
        let res = await request(app).get('/observations/create');

        expect(res.status).toBe(302);
    });

    test('logged in', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/create');

        expect(res.status).toBe(200);
    });
});

describe('GET /observations/overview', () => {
    test('not logged in', async () => {
        let res = await request(app).get('/observations/overview');

        expect(res.status).toBe(302);
    });

    test('logged in', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/overview');

        expect(res.status).toBe(200);
    });
});

describe('POST /create', () => {
    test('not logged in', async () => {
        let res = await request(app).post('/observations/create');

        expect(res.status).toBe(302);
    });

    test('logged in', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        form = { bird: 'testDodo' };

        let res = await agent.post('/observations/create').send(form);

        expect(res.status).toBe(302);
    });
});

describe('GET /observations/show/:id', () => {
    test('route works', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        let res = await request(app).get('/observations/show/' + testDodo._id);

        expect(res.status).toBe(200);
    });
});

describe('GET /observations/edit/:id', () => {
    test('happy path', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/edit/' + testDodo._id);

        expect(res.status).toBe(200);
    });

    test('good path', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/edit/' + testDodo._id);

        expect(res.status).toBe(302);
    });
});

describe('POST /observations/edit/:id', () => {
    test('good path', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        form = { bird: 'testDodo', location: 'koko' };

        let res = await agent.post('/observations/edit/' + testDodo._id).send(form);

        expect(res.status).toBe(302);
    });

    test('not authorzed', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        form = { bird: 'testDodo', location: 'koko2' };

        let res = await agent.post('/observations/edit/' + testDodo._id).send(form);

        expect(res.status).toBe(302);
    });
});

describe('/GET /observations/delete/:id', () => {
    test('not authorized', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/delete/' + testDodo._id);

        expect(res.status).toBe(302);
    });

    test('good path', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('observations');

        let testDodo = await col.findOne({bird: 'testDodo'});

        await db.close();

        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/observations/delete/' + testDodo._id);

        expect(res.status).toBe(302);
    });
});

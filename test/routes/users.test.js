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

describe('GET /users route', () => {
    test('admin is authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/users');

        expect(res.status).toBe(200);
    });
});

describe('GET /profile route', () => {
    test('invalid profile', async () => {
        let res = await request(app).get('/users/profile/456');

        expect(res.status).toBe(500);
    });

    test('valid profile', async () => {
        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let testAdmin = await col.findOne({username: 'testAdmin'});

        await db.close();
        let res = await request(app).get('/users/profile/' + testAdmin._id);

        expect(res.status).toBe(200);
    });
});

describe('GET /create route', () => {
    test('admin is authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let res = await agent.get('/users/create');

        expect(res.status).toBe(200);
    });
});

describe('POST /create route', () => {
    test('password mismatch', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        form = {username: 'koko', password: 'koko'};

        let res = await agent.post('/users/create').send(form);

        expect(res.status).toBe(302);
    });

    test('username taken', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        form = {username: 'testAdmin', password: 'koko'};

        let res = await agent.post('/users/create').send(form);

        expect(res.status).toBe(302);
    });

    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        form = {username: 'koko', password: 'koko', password2: 'koko'};

        let res = await agent.post('/users/create').send(form);

        expect(res.status).toBe(302);
    });
});

describe('GET /edit', () => {
    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        let res = await agent.get('/users/edit/' + koko._id);

        expect(res.status).toBe(200);
    });

    test('not authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        let res = await agent.get('/users/edit/' + koko._id);

        expect(res.status).toBe(302);
    });
});

describe('POST /users/edit', () => {
    test('not authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'koko2' };

        let res = await agent.post('/users/edit/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });

    test('username already taken', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'testUser', image: 'test' };

        let res = await agent.post('/users/edit/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });

    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'koko', image: 'test' };

        let res = await agent.post('/users/edit/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });
});

describe('GET /users/pwd', () => {
    test('not authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        let res = await agent.get('/users/pwd/' + koko._id);

        expect(res.status).toBe(302);
    });

    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        let res = await agent.get('/users/pwd/' + koko._id);

        expect(res.status).toBe(200);
    });
});

describe('POST /users/pwd', () => {
    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'koko', password: 'koko2', password2: 'koko2' };

        let res = await agent.post('/users/pwd/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });

    test('passwords dont match', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'koko', password: 'koko2', password2: 'koko' };

        let res = await agent.post('/users/pwd/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });

    test('not authorized', async () => {
        const agent = request.agent(app);
        let form = { username: 'testUser', password: 'testUser'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        form = { username: 'koko', password: 'koko2', password2: 'koko2' };

        let res = await agent.post('/users/pwd/' + koko._id).send(form);

        expect(res.status).toBe(302);
    });
});

describe('GET /delete', () => {
    test('good path', async () => {
        const agent = request.agent(app);
        let form = { username: 'testAdmin', password: 'testAdmin'};

        await agent.post('/auth/login').send(form);

        let db    = await MongoClient.connect(dsn);
        let col   = await db.collection('users');

        let koko = await col.findOne({username: 'koko'});

        await db.close();

        let res = await agent.get('/users/delete/' + koko._id);

        expect(res.status).toBe(302);
    });
});

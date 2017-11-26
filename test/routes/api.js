"use strict";

const request = require('supertest');
const app = require('../../app.js');

describe('Check API', function() {
    it('Exists?', function(done) {
        request(app)
            .get('/api/chat')
            .expect(200, done);
    });

    it('Returns JSON', function(done) {
        request(app)
            .get('/api/chat')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('Returns {id: 1, content: "Message 1"}', function(done) {
        request(app)
            .get('/api/chat/0')
            .expect(200, {
                id: 1,
                content: "Message 1"
            }, done);
    });
});

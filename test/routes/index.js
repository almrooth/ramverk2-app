"use strict";

const request = require('supertest');
const app = require('../../app.js');

describe('Check routes', function() {
    it('Index page', function(done) {
        request(app)
            .get('/')
            .expect(200, done);
    });
});

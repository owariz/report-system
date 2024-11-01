const request = require('supertest');
const express = require('express');
const healthcheckRouter = require('../controller/healthcheck.controller');

const app = express();
app.use('/api', healthcheckRouter); // Mount the router

describe('Healthcheck Router', () => {
    describe('GET /api/healthcheck', () => {
        it('should return a 200 status with a message', async () => {
            const response = await request(app).get('/api/healthcheck');

            expect(response.status).toBe(200);
            expect(response.text).toBe('API is running');
        });
    });
});

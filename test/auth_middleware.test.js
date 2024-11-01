const express = require('express');
const request = require('supertest');
const passport = require('passport');
const authenticate = require('../middleware/auth.middleware');

jest.mock('passport');

describe('Authentication Middleware', () => {
    const app = express();

    app.use(express.json());
    app.get('/protected', authenticate, (req, res) => {
        res.status(200).json({ message: 'Access granted', user: req.user });
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });

    it('should grant access for valid token', async () => {
        const mockUser = { uid: 'test_user_id' };

        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                callback(null, mockUser);
            };
        });

        const response = await request(app).get('/protected').set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Access granted', user: mockUser });
    });

    it('should deny access for invalid token', async () => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                callback(null, false); // No user found
            };
        });

        const response = await request(app).get('/protected').set('Authorization', 'Bearer invalid_token');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ isErrror: true, message: 'Unauthorized: Invalid token' });
    });

    it('should handle errors during authentication', async () => {
        passport.authenticate.mockImplementation((strategy, options, callback) => {
            return (req, res, next) => {
                callback(new Error('Authentication error'), false);
            };
        });

        const response = await request(app).get('/protected').set('Authorization', 'Bearer error_token');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ isErrror: true, message: 'Unauthorized: Invalid token' });
    });
});

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const authRouter = require('../controller/authen.controller');

const app = express();
app.use(express.json());
app.use('/api', authRouter); // Mount the router

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        account: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const mockPrisma = new PrismaClient();

describe('Auth Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/login', () => {
        it('should return 404 if user not found', async () => {
            mockPrisma.account.findUnique.mockResolvedValue(null);

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ isError: true, message: 'User not found' });
        });

        it('should return 401 if password is invalid', async () => {
            mockPrisma.account.findUnique.mockResolvedValue({
                password: await bcrypt.hash('wrongpassword', 12),
            });

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ isError: true, message: 'Invalid credentials' });
        });

        it('should return 403 if email is not verified', async () => {
            mockPrisma.account.findUnique.mockResolvedValue({
                password: await bcrypt.hash('password123', 12),
                isVerified: false,
            });

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ isError: true, message: 'Email not verified' });
        });

        it('should return 200 and tokens on successful login', async () => {
            const hashedPassword = await bcrypt.hash('password123', 12);
            mockPrisma.account.findUnique.mockResolvedValue({
                email: 'test@example.com',
                password: hashedPassword,
                isVerified: true,
            });
            jest.mock('../lib/jwt', () => jest.fn(() => 'fakeAccessToken'));

            const response = await request(app).post('/api/login').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                isError: false,
                message: "Login successful!",
                accessToken: 'fakeAccessToken',
                refreshToken: expect.any(String), // since refresh token is random
            });
        });
    });

    describe('POST /api/register', () => {
        it('should create a new user and send a verification email', async () => {
            mockPrisma.account.create.mockResolvedValue({
                email: 'test@example.com',
                username: 'testuser',
            });

            jest.mock('../lib/verificationemail', () => jest.fn());

            const response = await request(app).post('/api/register').send({
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ isError: false, message: "Registration successful! Please check your email for verification." });
        });

        it('should return 400 if email already exists', async () => {
            mockPrisma.account.create.mockRejectedValue({ code: 'P2002' });

            const response = await request(app).post('/api/register').send({
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ isError: true, message: 'Email already exists' });
        });
    });

    // Additional tests for other endpoints like logout, status update, etc.

    describe('GET /api/logout', () => {
        // Mock authenticate middleware if necessary
        it('should return 400 if refresh token is missing', async () => {
            const response = await request(app).get('/api/logout').query({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ isError: true, message: 'Missing refresh token' });
        });

        it('should return 200 on successful logout', async () => {
            // Assuming authenticate middleware is working and user is authenticated
            const refreshToken = 'validRefreshToken';

            mockPrisma.account.findUnique.mockResolvedValue({ refreshToken });

            const response = await request(app).get('/api/logout').query({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ isError: false, message: 'Logout successful' });
        });
    });
});

const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const dashboardRouter = require('../controller/admin/admin.controller'); // Adjust the path accordingly
const authenticate = require('../../middleware/auth.middleware');

const app = express();
app.use(express.json());
app.use('/api', dashboardRouter); // Mount the router

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        student: {
            findMany: jest.fn(),
            createMany: jest.fn(),
        },
        score: {
            findMany: jest.fn(),
        },
        account: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn(),
        },
        log: {
            create: jest.fn(),
        },
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const mockPrisma = new PrismaClient();

describe('Dashboard Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/dashboard', () => {
        it('should return dashboard data successfully', async () => {
            mockPrisma.student.findMany.mockResolvedValue([
                {
                    createdAt: new Date(),
                    scores: [{ totalScore: 90 }],
                },
                {
                    createdAt: new Date(Date.now() - 86400000), // 1 day ago
                    scores: [{ totalScore: 80 }],
                },
                {
                    createdAt: new Date(Date.now() - 172800000), // 2 days ago
                    scores: [{ totalScore: 70 }],
                },
            ]);

            const response = await request(app).get('/api/dashboard').set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                isError: false,
                result: {
                    averageScore: 80,
                    maxScore: 90,
                    newStudentsCount: 1,
                    totalStudentsCount: 3,
                },
            });
        });

        it('should handle errors gracefully', async () => {
            mockPrisma.student.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/dashboard').set('Authorization', 'Bearer token');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'An error occurred', error: 'Database error' });
        });
    });

    describe('POST /api/add/student', () => {
        it('should add students successfully', async () => {
            const studentsData = [
                { sid: '123', prefix: 'Mr.', firstName: 'John', lastName: 'Doe', grade: 'A', classroom: '1A' },
                { sid: '124', prefix: 'Ms.', firstName: 'Jane', lastName: 'Smith', grade: 'B', classroom: '1B' },
            ];

            const response = await request(app).post('/api/add/student').send(studentsData).set('Authorization', 'Bearer token');

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ isError: false, message: 'Students added successfully!' });
        });

        it('should return 400 for invalid student data', async () => {
            const invalidData = [{ sid: '123' }]; // Missing required fields

            const response = await request(app).post('/api/add/student').send(invalidData).set('Authorization', 'Bearer token');

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ isError: true, message: 'Invalid student data' });
        });

        it('should handle errors gracefully', async () => {
            const studentsData = [
                { sid: '123', prefix: 'Mr.', firstName: 'John', lastName: 'Doe', grade: 'A', classroom: '1A' },
            ];

            mockPrisma.student.createMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).post('/api/add/student').send(studentsData).set('Authorization', 'Bearer token');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'An error occurred', error: 'Database error' });
        });
    });

    describe('GET /api/report', () => {
        it('should return report data successfully', async () => {
            mockPrisma.score.findMany.mockResolvedValue([
                {
                    totalScore: 95,
                    deductedScore: 5,
                    finalScore: 90,
                    reportDetail: 'Good job!',
                    createdAt: new Date(),
                    student: { prefix: 'Mr.', firstName: 'John', lastName: 'Doe' },
                },
            ]);

            const response = await request(app).get('/api/report').set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                isError: false,
                result: {
                    reportData: [
                        {
                            key: 1,
                            username: 'Mr. John Doe',
                            date: expect.any(String), // Format date to Thai format
                            score: 95,
                            deductedScore: 5,
                            finalScore: 90,
                            reportDetail: 'Good job!',
                        },
                    ],
                    totalReports: 1,
                },
            });
        });

        it('should return 204 if no scores found', async () => {
            mockPrisma.score.findMany.mockResolvedValue([]);

            const response = await request(app).get('/api/report').set('Authorization', 'Bearer token');

            expect(response.status).toBe(204);
            expect(response.body).toEqual({ isError: false, message: 'ไม่มีข้อมูลคะแนน' });
        });

        it('should handle errors gracefully', async () => {
            mockPrisma.score.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/report').set('Authorization', 'Bearer token');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'An error occurred', error: 'Database error' });
        });
    });

    // Additional tests for account management endpoints can be added here

    describe('GET /api/account', () => {
        it('should return account data successfully', async () => {
            mockPrisma.account.findMany.mockResolvedValue([
                {
                    id: 1,
                    uid: 'abc123',
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    isVerified: true,
                    status: 'active',
                },
            ]);

            const response = await request(app).get('/api/account').set('Authorization', 'Bearer token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                isError: false,
                message: 'Get data ok',
                result: [
                    {
                        id: 1,
                        uid: 'abc123',
                        username: 'admin',
                        email: 'admin@example.com',
                        role: 'admin',
                        isVerified: true,
                        status: 'active',
                    },
                ],
            });
        });

        it('should handle errors gracefully', async () => {
            mockPrisma.account.findMany.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/account').set('Authorization', 'Bearer token');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'An error occurred', error: 'Database error' });
        });
    });

    // Add tests for POST /api/add/account, PUT /api/edit/account/:uid, and DELETE /api/delete/account/:uid
});


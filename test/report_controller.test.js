const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const studentRouter = require('../controller/report.controller');

const app = express();
app.use(express.json());
app.use('/students', studentRouter);

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        student: {
            findUnique: jest.fn(),
        },
        score: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        log: {
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mPrismaClient),
    };
});

const mockPrisma = new PrismaClient();

describe('Student Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /students/:sid', () => {
        it('should return a student if found', async () => {
            mockPrisma.student.findUnique.mockResolvedValue({
                id: 1,
                sid: 123,
                firstName: 'John',
                lastName: 'Doe',
            });

            const response = await request(app).get('/students/123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                isError: true,
                message: 'ok',
                result: {
                    id: 1,
                    sid: 123,
                    firstName: 'John',
                    lastName: 'Doe',
                },
            });
        });

        it('should return 404 if student not found', async () => {
            mockPrisma.student.findUnique.mockResolvedValue(null);

            const response = await request(app).get('/students/123');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                isError: true,
                message: 'student not found',
            });
        });

        it('should return 500 on error', async () => {
            mockPrisma.student.findUnique.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/students/123');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                isError: true,
                message: 'An error occurred',
            });
        });
    });

    describe('POST /students/report', () => {
        it('should create a report successfully', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return callback(mockPrisma);
            });
            mockPrisma.student.findUnique.mockResolvedValue({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
            });
            mockPrisma.score.findFirst.mockResolvedValue({
                finalScore: 80,
            });
            mockPrisma.score.create.mockResolvedValue({
                id: 1,
                studentId: 1,
                reportTopic: 'Test Topic',
                deductedScore: 10,
                finalScore: 70,
            });
            mockPrisma.log.create.mockResolvedValue({});

            const response = await request(app).post('/students/report').send({
                studentId: 1,
                reportTopic: 'Test Topic',
                reportDetail: 'Detail of the report',
                deductedScore: 10,
                username: 'admin',
                email: 'admin@example.com',
            });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                isError: false,
                message: 'รายงานถูกสร้างเรียบร้อยแล้ว',
                result: { id: 1, studentId: 1, reportTopic: 'Test Topic', deductedScore: 10, finalScore: 70 },
            });
        });

        it('should return an error if student not found', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return callback(mockPrisma);
            });
            mockPrisma.student.findUnique.mockResolvedValue(null);

            const response = await request(app).post('/students/report').send({
                studentId: 1,
                reportTopic: 'Test Topic',
                deductedScore: 10,
                username: 'admin',
                email: 'admin@example.com',
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'ไม่พบข้อมูลนักศึกษา' });
        });

        it('should return an error if deducted score is greater than available score', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return callback(mockPrisma);
            });
            mockPrisma.student.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.score.findFirst.mockResolvedValue({ finalScore: 50 });

            const response = await request(app).post('/students/report').send({
                studentId: 1,
                reportTopic: 'Test Topic',
                deductedScore: 60,
                username: 'admin',
                email: 'admin@example.com',
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ isError: true, message: 'คะแนนที่หักไม่สามารถมากกว่าคะแนนที่มีอยู่ได้' });
        });
    });
});

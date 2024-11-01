const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const jwtStrategy = require('../config/passport-config');

jest.mock('@prisma/client');

const mockAccount = {
    uid: 'test_user_id',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    refreshToken: null,
    isVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
};

const prisma = new PrismaClient();

describe('JWT Strategy', () => {
    beforeAll(() => {
        jwtStrategy(passport); // Initialize the strategy
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });

    it('should validate user with valid token', async () => {
        prisma.account.findUnique.mockResolvedValue(mockAccount); // Mock Prisma response

        const done = jest.fn(); // Create a mock function for done
        const jwt_payload = { uid: 'test_user_id' }; // Simulated JWT payload

        await passport._strategies.jwt.authenticate({ payload: jwt_payload }, done);

        expect(done).toHaveBeenCalledWith(null, mockAccount); // Expect done to be called with user
    });

    it('should return false for invalid user', async () => {
        prisma.account.findUnique.mockResolvedValue(null); // Mock no user found

        const done = jest.fn();
        const jwt_payload = { uid: 'non_existent_uid' };

        await passport._strategies.jwt.authenticate({ payload: jwt_payload }, done);

        expect(done).toHaveBeenCalledWith(null, false); // Expect done to be called with false
    });

    it('should handle errors during user lookup', async () => {
        prisma.account.findUnique.mockRejectedValue(new Error('Database error')); // Mock error

        const done = jest.fn();
        const jwt_payload = { uid: 'test_user_id' };

        await passport._strategies.jwt.authenticate({ payload: jwt_payload }, done);

        expect(done).toHaveBeenCalledWith(expect.any(Error), false); // Expect done to be called with error
    });
});

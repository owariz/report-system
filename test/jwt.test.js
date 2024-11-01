const jwt = require('jsonwebtoken');
const generateToken = require('../lib/jwt');

jest.mock('jsonwebtoken');

describe('generateToken', () => {
    const user = { uid: '12345' };
    const secret = 'test_secret';

    beforeAll(() => {
        process.env.JWT_SECRET = secret;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should generate a token with the correct payload', () => {
        const expectedToken = 'mockedToken';
        jwt.sign.mockReturnValue(expectedToken);

        const token = generateToken(user);

        expect(token).toBe(expectedToken);
        expect(jwt.sign).toHaveBeenCalledWith({ uid: user.uid }, secret, { expiresIn: '1m' });
    });

    it('should throw an error if jwt.sign fails', () => {
        jwt.sign.mockImplementation(() => {
            throw new Error('JWT signing error');
        });

        expect(() => generateToken(user)).toThrow('JWT signing error');
    });
});

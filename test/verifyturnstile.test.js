const verifyTurnstile = require('../lib/verifyturnstile');

global.fetch = jest.fn(); // Mock global fetch

describe('verifyTurnstile', () => {
    const secretKey = 'test_secret_key';
    const turnstileResponse = 'test_turnstile_response';
    const ip = '127.0.0.1';

    beforeAll(() => {
        process.env.TURNSTILE_SECRET_KEY = secretKey; // Set the secret key for tests
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls after each test
    });

    it('should verify Turnstile response successfully', async () => {
        const mockApiResponse = { success: true };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockApiResponse),
        });

        const result = await verifyTurnstile(turnstileResponse, ip);

        expect(fetch).toHaveBeenCalledWith(`https://challenges.cloudflare.com/turnstile/v0/siteverify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret: secretKey, response: turnstileResponse, remoteip: ip }),
        });

        expect(result).toEqual(mockApiResponse);
    });

    it('should handle an error response from Turnstile', async () => {
        const mockApiResponse = { success: false, error: 'invalid-response' };
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockApiResponse),
        });

        const result = await verifyTurnstile(turnstileResponse, ip);

        expect(result).toEqual(mockApiResponse);
    });

    it('should throw an error for network issues', async () => {
        fetch.mockRejectedValueOnce(new Error('Network Error'));

        await expect(verifyTurnstile(turnstileResponse, ip)).rejects.toThrow('Network Error');
    });
});

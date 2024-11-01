const nodemailer = require('nodemailer');
const sendVerificationEmail = require('../lib/verificationemail');

jest.mock('nodemailer');

describe('sendVerificationEmail', () => {
    const email = 'test@example.com';
    const token = 'testToken';
    const transporterSendMailMock = jest.fn();
    
    beforeAll(() => {
        process.env.EMAIL_USER = 'your_email@gmail.com';
        process.env.EMAIL_PASS = 'your_password';
        process.env.CLIENT_URL = 'http://localhost:3000';
        
        nodemailer.createTransport.mockReturnValue({
            sendMail: transporterSendMailMock,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send a verification email', async () => {
        transporterSendMailMock.mockResolvedValueOnce('Email sent');

        await expect(sendVerificationEmail(email, token)).resolves.toEqual('Email sent');
        
        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        expect(transporterSendMailMock).toHaveBeenCalledWith({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            html: expect.stringContaining(`href="${process.env.CLIENT_URL}/auth/verify-email?token=${token}"`),
        });
    });

    it('should throw an error if sending fails', async () => {
        transporterSendMailMock.mockRejectedValueOnce(new Error('Email sending error'));

        await expect(sendVerificationEmail(email, token)).rejects.toThrow('Email sending error');
    });
});

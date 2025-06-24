const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #4CAF50;">Verify Your Email</h2>
                <p>Hi there!</p>
                <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                <a href="${process.env.CLIENT_URL}/auth/verify-email?token=${token}" 
                   style="display: inline-block; padding: 10px 20px; margin: 10px 0; 
                   background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                   Verify Email
                </a>
                <p>If you did not register, please ignore this email.</p>
                <p>Thank you!</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');

const generateToken = require('../lib/jwt');
const authenticate = require('../middleware/auth.middleware');
const sendVerificationEmail = require('../lib/verificationemail');
const verifyTurnstile = require('../lib/verifyturnstile');

const router = express.Router();
const prisma = new PrismaClient();


const createRefreshToken = () => crypto.randomBytes(40).toString('hex');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 5, // จำกัดการเข้าสู่ระบบ 5 ครั้ง
});

// Handle login
router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.account.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ isError: true, message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ isError: true, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ isError: true, message: 'Email not verified' });
        }

        const accessToken = generateToken(user);
        const refreshToken = createRefreshToken();

        await prisma.account.update({
            where: { email },
            data: { refreshToken, lastLogin: new Date(), status: 'online' },
        });

        return res.status(200).json({ isError: false, message: "Login successful!", accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Handle registration
router.post("/register", async (req, res) => {
    const { email, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    try {
        await prisma.account.create({
            data: {
                email,
                username,
                password: hashedPassword,
                verificationToken,
            },
        });

        await sendVerificationEmail(email, verificationToken);

        return res.status(201).json({ isError: false, message: "Registration successful! Please check your email for verification." });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ isError: true, message: 'Email already exists' });
        }
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Handle logout
router.get("/logout", authenticate, async (req, res) => {
    const userId = req.user.uid;
    const refreshToken = req.query.refreshToken;

    try {
        if (!refreshToken) {
            return res.status(400).json({ isError: true, message: 'Missing refresh token' });
        }

        const user = await prisma.account.findUnique({ where: { uid: userId }, select: { refreshToken: true } });
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ isError: true, message: 'Invalid refresh token' });
        }

        await prisma.account.update({
            where: { uid: userId },
            data: { refreshToken: null, status: 'offline' },
        });

        return res.status(200).json({ isError: false, message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Update user status
router.put('/status', authenticate, async (req, res) => {
    const { status } = req.body; // ค่าที่รับจากผู้ใช้ (เช่น "online", "offline", "ban", "mute")
    
    const validStatuses = ['online', 'offline', 'ban', 'mute'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ isError: true, message: 'Invalid status' });
    }

    try {
        await prisma.account.update({
            where: { uid: req.user.uid },
            data: { status },
        });

        return res.status(200).json({ isError: false, message: 'Status updated successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Refresh Token
router.get("/refresh", async (req, res) => {
    const { refreshToken } = req.query;

    try {
        const user = await prisma.account.findFirst({ where: { refreshToken } });
        if (!user) {
            return res.status(403).json({ isError: true, message: 'Invalid refresh token' });
        }

        const newRefreshToken = createRefreshToken();
        await prisma.account.update({ where: { email: user.email }, data: { refreshToken: newRefreshToken } });

        const accessToken = generateToken(user);
        return res.status(200).json({ accessToken, refreshToken: newRefreshToken, isVerified: user.isVerified });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Email Verification
router.get('/verifyemail', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ isError: true, message: 'Verification token is required' });
    }

    try {
        const user = await prisma.account.findFirst({ where: { verificationToken: token } });
        if (!user) {
            return res.status(400).json({ isError: true, message: 'Invalid verification token' });
        }

        await prisma.account.update({
            where: { uid: user.uid },
            data: { isVerified: true, verificationToken: null },
        });

        return res.status(200).json({ isError: false, message: "Email verified successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

// Get Current User
router.get('/@me', authenticate, async (req, res) => {
    try {
        const user = await prisma.account.findUnique({
            where: { uid: req.user.uid },
            select: {
                uid: true,
                email: true,
                username: true,
                role: true,
                isVerified: true,
                status: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ isError: true, message: 'User not found' });
        }

        return res.status(200).json({ isError: false, result: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const authenticate = require('../../middleware/auth.middleware');
const sendVerificationEmail = require('../../lib/verificationemail');
const formatDateTimeToThai = require('../../lib/formatDate');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/dashboard', authenticate, async (req, res) => {
    try {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 1);

        const students = await prisma.student.findMany({
            where: { status: 'active' },
            include: {
                scores: {
                    select: {
                        totalScore: true,
                    }
                }
            },
        });

        const newStudentsCount = students.filter(student => new Date(student.createdAt) >= threeDaysAgo).length;
        const totalStudentsCount = students.length;

        const validScores = students.flatMap(student => 
            student.scores.map(score => score.totalScore).filter(score => score >= 0 && score <= 100)
        );

        const totalScore = validScores.reduce((sum, score) => sum + score, 0);
        const averageScore = validScores.length > 0 ? totalScore / validScores.length : null;
        const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;

        return res.status(200).json({
            isError: false,
            result: {
                averageScore,
                maxScore,
                newStudentsCount,
                totalStudentsCount,
            }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.get('/report', authenticate, async (req, res) => {
    try {
        const scores = await prisma.score.findMany({
            include: {
                student: {
                    select: {
                        prefix: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        if (scores.length === 0) {
            return res.status(204).json({ isError: false, message: 'ไม่มีข้อมูลคะแนน' });
        }

        const reportData = scores.map((score, index) => ({
            key: index + 1,
            username: `${score.student.prefix} ${score.student.firstName} ${score.student.lastName}`,
            date: formatDateTimeToThai(score.createdAt),
            score: score.totalScore,
            deductedScore: score.deductedScore || 0,
            finalScore: score.finalScore,
            reportDetail: score.reportDetail || 'ไม่มีรายละเอียด'
        }));

        return res.status(200).json({
            isError: false,
            result: {
                reportData,
                totalReports: scores.length,
            }
        });
    } catch (error) {
        console.error('Error fetching report:', error.message);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.post('/add/student', authenticate, async (req, res) => {
    const studentsData = req.body;

    try {
        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ isError: true, message: 'Invalid student data' });
        }

        const validStudents = studentsData.map(student => {
            if (!student.sid || !student.prefix || !student.firstName || !student.lastName || !student.grade || student.classroom === undefined) {
                throw new Error('Invalid student data format');
            }

            return {
                sid: student.sid,
                prefix: student.prefix,
                firstName: student.firstName,
                lastName: student.lastName,
                nickname: student.nickname || null,
                email: student.email || null,
                phoneNumber: student.phoneNumber || null,
                grade: student.grade,
                classroom: student.classroom,
                status: "active",
            };
        });

        await prisma.student.createMany({
            data: validStudents,
        });

        return res.status(201).json({ isError: false, message: 'Students added successfully!' });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.get('/account', authenticate, async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({
            select: {
                id: true,
                uid: true,
                username: true,
                email: true,
                role: true,
                isVerified: true,
                status: true,
            },
        });

        if (!accounts) {
            return res.status(404).json({ isError: true, message: 'Accounts not found' });
        }

        return res.status(200).json({ isError: false, message: 'Get data ok', result: accounts });
    } catch (error) {
        console.error('An error occurred:', error.message);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.post('/add/account', authenticate, async (req, res) => {
    const { username, password, email, role } = req.body;

    try {
        if (!username || !email || !role) {
            return res.status(400).json({ isError: true, message: 'Invalid user data' });
        }

        const existingUser = await prisma.account.findFirst({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ isError: true, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.$transaction(async (tx) => {
            const user = await tx.account.create({
                data: {
                    username,
                    password: hashedPassword,
                    email,
                    role,
                    isVerified: false,
                    verificationToken: verificationToken,
                },
            });

            await sendVerificationEmail(email, verificationToken);

            await tx.log.create({
                data: {
                    action: 'สร้างรายงาน',
                    details: `บัญชีผู้ใช้ใหม่สำหรับ ${username} - อีเมล: ${email}`,
                    studentId: null,
                    username: req.user.username,
                    email: req.user.email,
                    // ipAddress: req.ip,
                },
            });
        });

        return res.status(201).json({ isError: false, message: 'User added successfully! Please check your email for verification.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.put('/edit/account/:uid', authenticate, async (req, res) => {
    const uid = req.params.uid;
    const { username, password, email, role, isVerified } = req.body;

    const transaction = await prisma.$transaction(async (prisma) => {
        const account = await prisma.account.findUnique({
            where: { uid },
            select: {
                uid: true,
                email: true,
            },
        });
        if (!account) return res.status(404).json({ isError: true, message: 'Account not found' });

        if (email && email !== account.email) {
            const existingUser = await prisma.account.findFirst({ where: { email } });
            if (existingUser) return res.status(409).json({ isError: true, message: 'Email already exists' });
        }

        const hashedPassword = password ? await bcrypt.hash(password, 12) : account.password;
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const updatedAccount = await prisma.account.update({
            where: { uid },
            data: {
                username,
                password: hashedPassword,
                email,
                role,
                isVerified,
                verificationToken,
            },
        });

        if (updatedAccount.email !== account.email) {
            await sendVerificationEmail(updatedAccount.email, updatedAccount.verificationToken);
        }

        if (updatedAccount.isVerified === false && account.isVerified === true) {
            await sendVerificationEmail(updatedAccount.email, updatedAccount.verificationToken);
        }

        await prisma.log.create({
            data: {
                action: 'สร้างรายงาน',
                details: `บัญชีผู้ใช้นี้ uid: ${uid} - ${username} - อีเมล: ${email} ถูกแก้ไข`,
                studentId: null,
                username: req.user.username,
                email: req.user.email,
                // ipAddress: req.ip,
            },
        });

        return updatedAccount;
    });

    try {
        await transaction;
        return res.status(200).json({ isError: false, message: 'Account updated successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

router.delete('/delete/account/:uid', authenticate, async (req, res) => {
    const uid = req.params.uid;

    try {
        const account = await prisma.account.findUnique({ where: { uid } });
        if (!account) return res.status(404).json({ isError: true, message: 'Account not found' });

        await prisma.$transaction(async (prisma) => {
            await prisma.account.delete({ where: { uid } });

            await prisma.log.create({
                data: {
                    action: 'สร้างรายงาน',
                    details: `ลบบัญชีผู้ใช้ ${uid}`,
                    studentId: null,
                    username: req.user.username,
                    email: req.user.email,
                    // ipAddress: req.ip,
                },
            });
        });

        return res.status(200).json({ isError: false, message: 'Account deleted successfully!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
});

module.exports = router;
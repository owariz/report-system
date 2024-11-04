const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:sid', async (req, res) => {
    const { sid } = req.params;

    try {
        const student = await prisma.student.findUnique({
            where: { sid: Number(sid) },
            include: {
                scores: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
        });
        if (!student) return res.status(404).json({ isError: true, message: 'student not found' });

        const latestScore = student.scores.length > 0 ? student.scores[0].finalScore : 100;

        console.log(sid);
        return res.status(200).json({ isError: false, message: 'ok', result: { ...student, latestScore } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

router.post('/report', async (req, res) => {
    const { studentId, reportTopic, reportDetail, deductedScore, username, email } = req.body;

    const transaction = await prisma.$transaction(async (prisma) => {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            throw new Error('ไม่พบข้อมูลนักศึกษา');
        }

        const latestScore = await prisma.score.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });

        const previousFinalScore = latestScore ? latestScore.finalScore : 100;
        
        if (Number(deductedScore) > previousFinalScore) {
            throw new Error('คะแนนที่หักไม่สามารถมากกว่าคะแนนที่มีอยู่ได้');
        }

        const newFinalScore = previousFinalScore - Number(deductedScore);

        // สร้างรายงานใหม่
        const report = await prisma.score.create({
            data: {
                studentId,
                reportTopic,
                reportDetail,
                deductedScore: Number(deductedScore),
                finalScore: newFinalScore,
                term: 'เทอมที่ 1',
                comments: '',
            },
        });

        await prisma.log.create({
            data: {
                studentId,
                action: 'สร้างรายงาน',
                details: `รายงานใหม่สำหรับนักเรียน ${student.firstName} ${student.lastName} - หัวข้อ: ${reportTopic}`,
                username,
                email,
                // ipAddress: req.ip, 
            },
        });

        return report;
    });

    return res.status(201).json({ isError: false, message: 'รายงานถูกสร้างเรียบร้อยแล้ว', result: transaction });
});

// Error handling middleware (optional but recommended)
router.use((error, req, res, next) => {
    console.error(error.message);
    res.status(500).json({ isError: true, message: error.message });
});

module.exports = router;
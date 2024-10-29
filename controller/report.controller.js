const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:sid', async (req, res) => {
    const { sid } = req.params;
    
    try {
        const student = await prisma.student.findUnique({
            where: { sid: Number(sid) },
        })

        if (!student) return res.status(404).json({ isError: true, message: 'student not found' });

        console.log(sid)

        return res.status(200).json({ isError: true, message: 'ok', result: student });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
});

router.post('/report', async (req, res) => {
    const { studentId, reportTopic, reportDetail, deductedScore, username, email } = req.body;

    try {
        // ตรวจสอบว่านักเรียนมีอยู่ในฐานข้อมูลหรือไม่
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ isError: true, message: 'นักเรียนไม่พบ' });
        }

        // ดึงคะแนนสุดท้ายก่อนหน้านี้
        const latestScore = await prisma.score.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });

        // คำนวณคะแนนสุดท้ายใหม่
        const previousFinalScore = latestScore ? latestScore.finalScore : 100; // หากไม่มีคะแนนก่อนหน้านี้ ให้เริ่มจาก 100
        
        // ตรวจสอบว่าคะแนนที่หักไม่เกินคะแนนสุดท้าย
        if (Number(deductedScore) > previousFinalScore) {
            return res.status(400).json({ isError: true, message: 'คะแนนที่หักไม่สามารถมากกว่าคะแนนที่มีอยู่ได้' });
        }

        const newFinalScore = previousFinalScore - Number(deductedScore); // หักคะแนนจากคะแนนสุดท้ายที่มีอยู่

        // สร้างรายงานใหม่
        const report = await prisma.score.create({
            data: {
                studentId,
                reportTopic,
                reportDetail,
                deductedScore: Number(deductedScore), // แปลงเป็นตัวเลข
                finalScore: newFinalScore, // ใช้คะแนนสุดท้ายที่คำนวณใหม่
                term: 'เทอมที่ 1', // คุณสามารถปรับตามต้องการ
                comments: '', // หากต้องการให้มีความคิดเห็นเพิ่มเติม สามารถเพิ่มได้
            },
        });

        // บันทึก log
        await prisma.log.create({
            data: {
                studentId,
                action: 'สร้างรายงาน',
                details: `รายงานใหม่สำหรับนักเรียน ${student.firstName} ${student.lastName} - หัวข้อ: ${reportTopic}`,
                username,
                email,
                // คุณสามารถเพิ่มข้อมูล IP Address ได้ถ้ามี
                // ipAddress: req.ip, 
            },
        });

        return res.status(201).json({ isError: false, message: 'รายงานถูกสร้างเรียบร้อยแล้ว', result: report });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ isError: true, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน' });
    }
});

module.exports = router;
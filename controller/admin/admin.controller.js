const express = require('express');
const { PrismaClient } = require('@prisma/client');

const authenticate = require('../../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// ฟังก์ชันสมมติสำหรับการสร้างข้อมูลการใช้งาน
const getUsageData = async () => {
    // ตัวอย่างข้อมูลการใช้งาน
    const usageData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'ยอดการใช้งาน',
                data: [3000, 2000, 4000, 5000, 6000, 7000, 8000], // แทนที่ด้วยข้อมูลที่ถูกต้อง
                fill: false,
                borderColor: '#8884d8',
                tension: 0.1,
            },
        ],
    };
    return usageData;
};

const formatDateTimeToThai = (dateTime) => {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    // แปลงเวลา UTC เป็นเวลาท้องถิ่นของไทย
    return new Date(dateTime).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', ...options });
};

router.get('/', async (req, res) => {
    return res.status(200).json({ isError: false, data: 'Welcome to Student Management API' });
});

router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3); // คำนวณวันที่ 3 วันที่ผ่านมา

        // ดึงข้อมูลนักเรียนทั้งหมด
        const students = await prisma.student.findMany({
            where: { status: 'active' },
            include: {
                scores: { // รวมคะแนนที่เกี่ยวข้อง
                    select: {
                        totalScore: true, // ดึงคะแนนรวม
                    }
                }
            },
        });

        // คำนวณนักเรียนใหม่
        const newStudentsCount = students.filter(student => new Date(student.createdAt) >= threeDaysAgo).length; // นับนักเรียนใหม่
        const totalStudentsCount = students.length; // นับนักเรียนทั้งหมด

        // คำนวณคะแนนเฉลี่ยและคะแนนสูงสุด
        const validScores = students.flatMap(student => 
            student.scores.map(score => score.totalScore).filter(score => score >= 0 && score <= 100)
        );

        const totalScore = validScores.reduce((sum, score) => sum + score, 0);
        const averageScore = validScores.length > 0 ? totalScore / validScores.length : null; // คะแนนเฉลี่ย
        const maxScore = validScores.length > 0 ? Math.max(...validScores) : null; // คะแนนสูงสุด

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
        return res.status(500).json({ isError: true, message: 'เกิดข้อผิดพลาด', error: error.message });
    }
});

router.get('/report', async (req, res) => {
    try {
        const scores = await prisma.score.findMany({
            include: {
                student: {
                    select: {
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

        // สร้างข้อมูลตาราง
        const reportData = scores.map((score, index) => ({
            key: index + 1,
            username: `${score.student.firstName} ${score.student.lastName}`, // รวมชื่อและนามสกุล
            date: formatDateTimeToThai(score.createdAt),
            score: score.totalScore,
            deductedScore: score.deductedScore || 0, // คะแนนที่โดนหัก
            finalScore: score.finalScore, // คะแนนสุดท้าย
            reportDetail: score.reportDetail || 'ไม่มีรายละเอียด' // รายละเอียดการรายงาน
        }));

        const usageData = await getUsageData();

        return res.status(200).json({
            isError: false,
            result: {
                reportData,
                usageData,
                totalReports: scores.length, // จำนวนรายงานทั้งหมด
            }
        });
    } catch (error) {
        console.error('Error fetching report:', error.message);
        return res.status(500).json({ isError: true, message: 'เกิดข้อผิดพลาดในการดึงรายงาน', error: error.message });
    }
});

router.post('/add/student', async (req, res) => {
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

module.exports = router;
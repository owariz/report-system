const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

// Report Repository (data access)
class ReportRepository {
  async findAllReports() {
    return prisma.score.findMany({
      include: {
        student: true,
        logs: {
          take: 1,
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findStudentBySid(sid) {
    // SID is now an integer
    const studentSid = parseInt(sid, 10);
    if (isNaN(studentSid)) {
      return null;
    }
    return prisma.student.findUnique({
      where: { sid: studentSid },
      include: {
        scores: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });
  }

  async createReport({ studentId, studentSid, reportTopic, reportDetail, deductedScore, username, email }) {
    let studentIdInt = null;
    if (studentId) {
      studentIdInt = parseInt(studentId, 10);
    } else if (studentSid) {
      // หา id จาก sid
      const student = await prisma.student.findUnique({ where: { sid: parseInt(studentSid, 10) } });
      if (!student) return null;
      studentIdInt = student.id;
    }
    if (!studentIdInt || isNaN(studentIdInt)) {
      throw new Error("Invalid student ID or SID format");
    }

    return prisma.$transaction(async (prisma) => {
      const student = await prisma.student.findUnique({ where: { id: studentIdInt } });
      if (!student) return null;

      const latestScore = await prisma.score.findFirst({
        where: { studentId: studentIdInt },
        orderBy: { createdAt: 'desc' }
      });

      const previousFinalScore = latestScore ? latestScore.finalScore : 100;
      const deductedScoreInt = parseInt(deductedScore, 10);
      if (deductedScoreInt > previousFinalScore) return false;

      const newFinalScore = previousFinalScore - deductedScoreInt;

      const report = await prisma.score.create({
        data: {
          studentId: studentIdInt,
          reportTopic,
          reportDetail,
          deductedScore: deductedScoreInt,
          finalScore: newFinalScore,
          term: 'เทอมที่ 2', // This might need to be dynamic
          comments: '',
        },
      });

      // Now we can link the log to the created score
      await prisma.log.create({
        data: {
          studentId: studentIdInt,
          scoreId: report.id, // Link to the new score
          action: 'สร้างรายงาน',
          details: `รายงานใหม่สำหรับนักเรียน ${student.firstName} ${student.lastName} - หัวข้อ: ${reportTopic}`,
          username,
          email,
        },
      });

      return report;
    });
  }

  async getReportSummary() {
    // จำนวนรายงานทั้งหมด
    const totalReports = await prisma.score.count();
    return { totalReports };
  }

  async getReportTrend() {
    // Group รายงานตามเดือน/ปี (12 เดือนล่าสุด)
    const result = await prisma.$queryRaw`
      SELECT 
        to_char("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "score"
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12;
    `;
    // แปลงข้อมูลให้เรียงจากเก่าไปใหม่
    return (result || []).reverse();
  }

  async getRecentReports(limit = 10) {
    return prisma.score.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

module.exports = ReportRepository; 
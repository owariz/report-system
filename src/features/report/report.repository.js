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

  async createReport({ studentId, reportTopic, reportDetail, deductedScore, username, email }) {
    // studentId is now an integer
    const studentIdInt = parseInt(studentId, 10);
    if (isNaN(studentIdInt)) {
        throw new Error("Invalid student ID format");
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
}

module.exports = ReportRepository; 
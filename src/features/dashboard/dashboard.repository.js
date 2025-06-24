const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays } = require('date-fns');

class DashboardRepository {
  async getDashboardStats() {
    const totalUsersCount = await prisma.account.count();
    const newUsersCount = await prisma.account.count({
      where: {
        createdAt: {
          gte: subDays(new Date(), 7),
        },
      },
    });

    const studentScores = await prisma.student.findMany({
        include: {
            scores: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    const averageScore = studentScores.reduce((acc, student) => acc + (student.scores[0]?.finalScore || 0), 0) / (studentScores.length || 1);
    const maxScore = Math.max(...studentScores.map(student => student.scores[0]?.finalScore || 0));

    const allScores = await prisma.score.findMany({
        select: { finalScore: true, deductedScore: true, student: { select: { id: true, firstName: true, lastName: true, sid: true } } }
    });

    const scoreDistribution = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
    allScores.forEach(score => {
        if (score.finalScore <= 20) scoreDistribution[0]++;
        else if (score.finalScore <= 40) scoreDistribution[1]++;
        else if (score.finalScore <= 60) scoreDistribution[2]++;
        else if (score.finalScore <= 80) scoreDistribution[3]++;
        else scoreDistribution[4]++;
    });
    
    const usersWithMostDeductedPoints = await prisma.student.findMany({
        include: {
            scores: {
                select: {
                    deductedScore: true
                }
            }
        }
    });
    
    const topUsers = usersWithMostDeductedPoints.map(student => {
        const totalDeducted = student.scores.reduce((acc, score) => acc + score.deductedScore, 0);
        return {
            sid: student.sid,
            name: `${student.firstName} ${student.lastName}`,
            deductedPoints: totalDeducted
        };
    })
    .sort((a, b) => b.deductedPoints - a.deductedPoints)
    .slice(0, 5);


    return {
      totalUsersCount,
      newUsersCount,
      averageScore,
      maxScore,
      scoreDistribution,
      usersWithMostDeductedPoints: topUsers,
    };
  }
}

module.exports = DashboardRepository; 
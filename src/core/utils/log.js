const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createLog(logData) {
  const { email, username, action, details, studentId = null, ipAddress = null } = logData;
  try {
    await prisma.log.create({
      data: {
        email,
        username,
        action,
        details,
        studentId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
}

module.exports = { createLog }; 
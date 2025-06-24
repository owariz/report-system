const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// User Repository (data access)
class UserRepository {
  async findAllUsers() {
    return prisma.account.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUserByEmail(email) {
    return prisma.account.findUnique({
      where: { email },
    });
  }

  async createUser(userData) {
    const { email, username, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.account.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
      },
    });
  }

  async findUserById(id) {
    return prisma.account.findUnique({
      where: { id: parseInt(id, 10) },
    });
  }

  async deleteUserById(id) {
    return prisma.account.delete({
      where: { id: parseInt(id, 10) },
    });
  }

  async updateUserById(id, userData) {
    return prisma.account.update({
      where: { id: parseInt(id, 10) },
      data: userData,
    });
  }

  async findLogsByEmail(email, { page = 1, limit = 5 } = {}) {
    const skip = (page - 1) * limit;

    const [logs, totalLogs] = await prisma.$transaction([
      prisma.log.findMany({
        where: { email },
        orderBy: { timestamp: 'desc' },
        skip: skip,
        take: limit,
      }),
      prisma.log.count({
        where: { email },
      }),
    ]);

    return {
      logs,
      pagination: {
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
      },
    };
  }
}

module.exports = UserRepository; 
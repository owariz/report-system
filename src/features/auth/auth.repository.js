const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auth Repository (data access)
class AuthRepository {
  async findAccountByEmail(email) {
    return prisma.account.findUnique({
      where: { email },
      select: {
        uid: true,
        email: true,
        username: true,
        password: true,
        isVerified: true,
        role: true
      }
    });
  }

  async updateAccountByEmail(email, data) {
    return prisma.account.update({ where: { email }, data });
  }

  async createAccount(data) {
    return prisma.account.create({ data });
  }

  async findAccountByUid(uid) {
    return prisma.account.findUnique({ where: { uid }, select: { refreshToken: true, email: true, username: true } });
  }

  async updateAccountByUid(uid, data) {
    return prisma.account.update({ where: { uid }, data });
  }

  async findAccountByRefreshToken(refreshToken) {
    return prisma.account.findFirst({ where: { refreshToken } });
  }

  async findAccountByVerificationToken(token) {
    return prisma.account.findFirst({ where: { verificationToken: token } });
  }

  async findAccountByUidForMe(uid) {
    return prisma.account.findUnique({
      where: { uid },
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
  }
}

module.exports = AuthRepository; 
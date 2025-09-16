const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StudentRepository {
  async createStudent(studentData) {
    return prisma.student.create({
      data: studentData,
    });
  }
}

module.exports = new StudentRepository();

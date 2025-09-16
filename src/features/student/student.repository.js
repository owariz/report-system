const prisma = require('../../core/prisma');

class StudentRepository {
  async createStudent(studentData) {
    return prisma.student.create({
      data: studentData,
    });
  }
}

module.exports = new StudentRepository();

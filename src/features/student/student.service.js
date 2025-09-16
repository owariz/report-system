const studentRepository = require('./student.repository');

class StudentService {
  async createStudent(studentData) {
    // In the future, you can add business logic here, like validation, etc.
    return studentRepository.createStudent(studentData);
  }
}

module.exports = new StudentService();

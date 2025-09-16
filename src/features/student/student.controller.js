const StudentService = require('./student.service');

class StudentController {
  constructor(studentService) {
    this.studentService = studentService;
  }

  createStudent = async (req, res, next) => {
    try {
      const student = await this.studentService.createStudent(req.body);
      res.status(201).json({
        isError: false,
        message: 'Student created successfully',
        result: student,
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('sid')) {
        return res.status(409).json({ isError: true, message: 'Student with this SID already exists.' });
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ isError: true, message: 'Student with this email already exists.' });
      }
      next(error);
    }
  };
}

module.exports = new StudentController(StudentService);

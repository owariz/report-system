class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getReport = async (req, res) => {
    try {
      const { reportData, totalReports } = await this.userService.getReport();
      if (reportData.length === 0) {
        return res.status(204).json({ isError: false, message: 'ไม่มีข้อมูลคะแนน' });
      }
      return res.status(200).json({ isError: false, result: { reportData, totalReports } });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred', error: error.message });
    }
  };

  addStudents = async (req, res) => {
    const studentsData = req.body;
    try {
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({ isError: true, message: 'Invalid student data' });
      }
      // validate format (optional, สามารถเพิ่มได้)
      await this.userService.addStudents(studentsData);
      return res.status(201).json({ isError: false, message: 'เพิ่มนักเรียนสำเร็จ' });
    } catch (error) {
      return res.status(500).json({ isError: true, message: error.message });
    }
  };

  getAllUsers = async (req, res) => {
    try {
      const users = await this.userService.findAllUsers();
      res.status(200).json({ isError: false, result: users });
    } catch (error) {
      res.status(500).json({ isError: true, message: 'An error occurred while fetching users.' });
    }
  }

  createUser = async (req, res) => {
    try {
      const { username, password, email, role } = req.body;
      
      // Validate required fields
      if (!username || !password || !email || !role) {
        return res.status(400).json({ 
          isError: true, 
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
        });
      }

      const newUser = await this.userService.createUser({
        username,
        password,
        email,
        role
      }, req.user);

      res.status(201).json({ 
        isError: false, 
        message: 'สร้างผู้ใช้สำเร็จ',
        result: newUser 
      });
    } catch (error) {
      // Check for unique constraint violation
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          isError: true, 
          message: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' 
        });
      }
      res.status(500).json({ 
        isError: true, 
        message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้' 
      });
    }
  }

  getUserLogs = async (req, res) => {
    try {
      const { email } = req.params;
      const { page = 1, limit = 5 } = req.query; // Get pagination from query

      const { logs, pagination } = await this.userService.getLogsByUser(email, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(200).json({ 
        isError: false, 
        result: {
          logs,
          pagination,
        }
      });
    } catch (error) {
      res.status(500).json({ isError: true, message: 'An error occurred while fetching user logs.' });
    }
  }

  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(parseInt(id, 10), req.user);
      res.status(200).json({ isError: false, message: 'User deleted successfully.' });
    } catch (error) {
      if (error.message.includes("your own account")) {
        return res.status(403).json({ isError: true, message: "ไม่สามารถลบบัญชีของตัวเองได้" });
      }
      if (error.message.includes("SUPERADMIN")) {
        return res.status(403).json({ isError: true, message: "ไม่สามารถลบบัญชี SUPERADMIN ได้" });
      }
      res.status(500).json({ isError: true, message: 'An error occurred while deleting the user.' });
    }
  }

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      await this.userService.updateUser(parseInt(id, 10), userData, req.user);
      res.status(200).json({ isError: false, message: 'User updated successfully.' });
    } catch (error) {
      res.status(500).json({ isError: true, message: 'An error occurred while updating the user.' });
    }
  }
}

module.exports = UserController;
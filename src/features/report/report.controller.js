class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  getAllReports = async (req, res) => {
    try {
      const reports = await this.reportService.getAllReports();
      res.status(200).json({ isError: false, result: reports });
    } catch (error) {
      res.status(500).json({ isError: true, message: error.message });
    }
  };

  getStudent = async (req, res) => {
    const { sid } = req.params;
    try {
      const student = await this.reportService.getStudentWithLatestScore(sid);
      if (!student) return res.status(404).json({ isError: true, message: 'student not found' });
      const latestScore = student.scores.length > 0 ? student.scores[0].finalScore : 100;
      return res.status(200).json({ isError: false, message: 'ok', result: { ...student, latestScore } });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  createReport = async (req, res) => {
    const { studentId, reportTopic, reportDetail, deductedScore, username, email } = req.body;
    try {
      const result = await this.reportService.createReport({ studentId, reportTopic, reportDetail, deductedScore, username, email });
      if (result === null) return res.status(404).json({ isError: true, message: 'ไม่พบนักศึกษา' });
      if (result === false) return res.status(400).json({ isError: true, message: 'คะแนนที่หักไม่สามารถมากกว่าคะแนนที่มีอยู่ได้' });
      return res.status(201).json({ isError: false, message: 'รายงานถูกสร้างเรียบร้อยแล้ว', result });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน' });
    }
  };
}

module.exports = ReportController;
class ReportController {
  constructor(reportService) {
    this.reportService = reportService;
  }

  getAllReports = async (req, res) => {
    try {
      const reports = await this.reportService.getAllReports();
      res.status(200).json({ isError: false, result: convertBigIntToString(reports) });
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
    const { studentId, studentSid, reportTopic, reportDetail, deductedScore, username, email } = req.body;
    try {
      const result = await this.reportService.createReport({ studentId, studentSid, reportTopic, reportDetail, deductedScore, username, email });
      if (result === null) return res.status(404).json({ isError: true, message: 'ไม่พบนักศึกษา' });
      if (result === false) return res.status(400).json({ isError: true, message: 'คะแนนที่หักไม่สามารถมากกว่าคะแนนที่มีอยู่ได้' });
      return res.status(201).json({ isError: false, message: 'รายงานถูกสร้างเรียบร้อยแล้ว', result: convertBigIntToString(result) });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ isError: true, message: 'เกิดข้อผิดพลาดในการสร้างรายงาน' });
    }
  };

  getReportSummary = async (req, res) => {
    try {
      const summary = await this.reportService.getReportSummary();
      res.status(200).json({ isError: false, result: convertBigIntToString(summary) });
    } catch (error) {
      res.status(500).json({ isError: true, message: error.message });
    }
  };

  getReportTrend = async (req, res) => {
    try {
      const trend = await this.reportService.getReportTrend();
      res.status(200).json({ isError: false, result: convertBigIntToString(trend) });
    } catch (error) {
      res.status(500).json({ isError: true, message: error.message });
    }
  };

  getRecentReports = async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    try {
      const recent = await this.reportService.getRecentReports(limit);
      res.status(200).json({ isError: false, result: convertBigIntToString(recent) });
    } catch (error) {
      res.status(500).json({ isError: true, message: error.message });
    }
  };
}

function convertBigIntToString(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : convertBigIntToString(v)])
    );
  }
  return obj;
}

module.exports = ReportController;
// Report Service (business logic)
class ReportService {
  constructor(reportRepository) {
    this.reportRepository = reportRepository;
  }

  async getAllReports() {
    return this.reportRepository.findAllReports();
  }

  async getStudent(sid) {
    if (!sid) {
      // ... existing code ...
    }
  }

  async getReportSummary() {
    return this.reportRepository.getReportSummary();
  }

  async getReportTrend() {
    return this.reportRepository.getReportTrend();
  }

  async getRecentReports(limit = 10) {
    return this.reportRepository.getRecentReports(limit);
  }

  async getStudentWithLatestScore(sid) {
    return this.reportRepository.findStudentBySid(sid);
  }

  async createReport({ studentId, studentSid, reportTopic, reportDetail, deductedScore, username, email }) {
    return this.reportRepository.createReport({ studentId, studentSid, reportTopic, reportDetail, deductedScore, username, email });
  }

  // เพิ่ม method ตาม business logic ที่ต้องการ
}

module.exports = ReportService; 
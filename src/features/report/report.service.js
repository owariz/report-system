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

  // เพิ่ม method ตาม business logic ที่ต้องการ
}

module.exports = ReportService; 
const DashboardRepository = require('./dashboard.repository');

class DashboardService {
  constructor() {
    this.dashboardRepository = new DashboardRepository();
  }

  async getDashboardStats() {
    return this.dashboardRepository.getDashboardStats();
  }
}

module.exports = DashboardService; 
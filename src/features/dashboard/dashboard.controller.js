const DashboardService = require('./dashboard.service');

class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = DashboardController; 
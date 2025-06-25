const DashboardService = require('./dashboard.service');

class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(200).json(convertBigIntToString(stats));
    } catch (error) {
      next(error);
    }
  };
}

// ฟังก์ชันแปลง BigInt เป็น string (อยู่นอก class)
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

module.exports = DashboardController; 
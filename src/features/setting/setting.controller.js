const SettingService = require('./setting.service');

class SettingController {
  constructor() {
    this.settingService = new SettingService();
  }

  getSettings = async (req, res, next) => {
    try {
      const settings = await this.settingService.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req, res, next) => {
    try {
      const updatedSettings = await this.settingService.updateSettings(req.body);
      res.status(200).json(updatedSettings);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = SettingController; 
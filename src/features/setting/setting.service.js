const SettingRepository = require('./setting.repository');

class SettingService {
  constructor() {
    this.settingRepository = new SettingRepository();
  }

  async getSettings() {
    return this.settingRepository.getSettings();
  }

  async updateSettings(data) {
    // Add any business logic/validation here in the future
    return this.settingRepository.updateSettings(data);
  }
}

module.exports = SettingService; 
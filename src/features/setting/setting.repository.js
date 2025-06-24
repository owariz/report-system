const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SETTINGS_ID = 1;

class SettingRepository {
  async getSettings() {
    // Using upsert to create settings if they don't exist, ensuring there's always a row to fetch.
    return prisma.setting.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: {
        id: SETTINGS_ID,
        siteName: 'Report System',
      },
    });
  }

  async updateSettings(data) {
    return prisma.setting.update({
      where: { id: SETTINGS_ID },
      data: data,
    });
  }
}

module.exports = SettingRepository; 
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // ลบข้อมูลทุกตาราง (ระวัง! ข้อมูลทั้งหมดจะหายหมด)
  await prisma.log.deleteMany();
  await prisma.score.deleteMany();
  await prisma.student.deleteMany();
  // await prisma.account.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.setting.deleteMany();
  console.log('All data deleted.');

  const existingSuperAdmin = await prisma.account.findFirst({
    where: { role: 'SUPERADMIN' },
  });

  if (existingSuperAdmin) {
    console.log('Superadmin already exists.');
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const superadmin = await prisma.account.create({
      data: {
        email: 'superadmin@gmail.com',
        username: 'superadmin',
        password: hashedPassword,
        role: 'SUPERADMIN',
        isVerified: true,
      },
    });
    console.log(`Created superadmin with id: ${superadmin.id}`);
  }

  // Seed students (30 คน)
  const prefixes = ['นาย', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'];
  const firstNames = ['กิตติ', 'ณัฐวุฒิ', 'ปิยะ', 'ศิริพร', 'วราภรณ์', 'สมชาย', 'สมหญิง', 'อรทัย', 'จิราภรณ์', 'ธีรศักดิ์', 'สุภาพร', 'สุชาติ', 'สุจิตรา', 'อาทิตย์', 'อาภาพร'];
  const lastNames = ['ใจดี', 'สุขสันต์', 'ทองดี', 'ศรีสุข', 'วัฒนกุล', 'บุญมี', 'แซ่ลิ้ม', 'วงศ์ไทย', 'สกุลไทย', 'ศรีไทย', 'ทองมาก', 'บุญช่วย', 'ศรีสม', 'ทองสุข', 'ใจงาม'];
  const nicknames = ['บอล', 'กิ๊ฟ', 'บาส', 'ปอ', 'ออม', 'บีม', 'ฟ้า', 'ตูน', 'อาร์ต', 'มายด์', 'ปั้น', 'อิ๋ว', 'อาร์ม', 'ออย', 'บูม'];
  const grades = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];
  const classrooms = [1, 2, 3, 4];
  const statuses = ['active', 'inactive'];

  for (let i = 1; i <= 30; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const classroom = classrooms[Math.floor(Math.random() * classrooms.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const sid = 65000 + i;
    const email = `student${i}@gmail.com`;
    const phoneNumber = `08${Math.floor(10000000 + Math.random() * 89999999)}`;

    await prisma.student.upsert({
      where: { sid },
      update: {},
      create: {
        sid,
        prefix,
        firstName,
        lastName,
        nickname,
        email,
        phoneNumber,
        grade,
        classroom,
        status,
      },
    });
  }
  console.log('Seeded 30 students.');

  // เพิ่มบัญชี admin/กรรมการ 1 คน ถ้ายังไม่มี
  const existingAdmin = await prisma.account.findFirst({ where: { role: 'ADMIN' } });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    await prisma.account.create({
      data: {
        email: 'admin@gmail.com',
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      },
    });
    console.log('Created admin account.');
  }

  // หลังจาก seed student
  const reportTopics = [
    'แต่งกายผิดระเบียบ', 'ทรงผมผิดระเบียบ', 'ไม่คล้องบัตรประจำตัว', 'หนีเรียน',
    'เสพยาเสพติด', 'การพนัน', 'ทะเลาะวิวาท', 'อื่น ๆ'
  ];
  const reportDetails = [
    'พบเห็นนักเรียนแต่งกายไม่ถูกระเบียบ', 'ทรงผมไม่เรียบร้อย', 'ไม่คล้องบัตรประจำตัว',
    'ขาดเรียนโดยไม่มีเหตุผล', 'มีพฤติกรรมเสี่ยง', 'มีส่วนร่วมในการพนัน', 'มีเรื่องทะเลาะวิวาท', 'อื่น ๆ'
  ];
  const terms = ['เทอมที่ 1', 'เทอมที่ 2'];

  const students = await prisma.student.findMany();
  for (const student of students) {
    const reportCount = Math.floor(Math.random() * 4) + 2; // 2-5 รายงาน
    let finalScore = 100;
    let totalDeducted = 0;
    let lastDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    for (let i = 0; i < reportCount; i++) {
      if (totalDeducted >= 100) break; // ถ้าหักครบ 100 แล้วหยุด
      const topicIdx = Math.floor(Math.random() * reportTopics.length);
      const reportTopic = reportTopics[topicIdx];
      const reportDetail = reportDetails[topicIdx] + ' ' + (Math.random() + 1).toString(36).substring(7);
      let deductedScore = [5, 10, 20, 30, 50][Math.floor(Math.random() * 5)];
      if (totalDeducted + deductedScore > 100) {
        deductedScore = 100 - totalDeducted; // หักเท่าที่เหลือ
      }
      const term = terms[Math.floor(Math.random() * terms.length)];
      finalScore = Math.max(0, finalScore - deductedScore);
      totalDeducted += deductedScore;
      // สุ่มวันที่ระหว่าง lastDate ถึงวันนี้
      const nextDate = new Date(lastDate.getTime() + Math.floor(Math.random() * (Date.now() - lastDate.getTime())));
      lastDate = nextDate;

      const score = await prisma.score.create({
        data: {
          studentId: student.id,
          reportTopic,
          reportDetail,
          totalScore: 100,
          deductedScore,
          finalScore,
          term,
          comments: 'หมายเหตุ ' + (Math.random() + 1).toString(36).substring(7),
          createdAt: lastDate,
        },
      });

      await prisma.log.create({
        data: {
          studentId: student.id,
          scoreId: score.id,
          action: 'สร้างรายงาน',
          details: `รายงานหัวข้อ: ${reportTopic}`,
          username: 'กรรมการ' + Math.floor(Math.random() * 10),
          email: 'committee' + Math.floor(Math.random() * 100) + '@gmail.com',
          timestamp: lastDate,
        },
      });
    }
  }
  console.log('Seeded random reports for students.');

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 
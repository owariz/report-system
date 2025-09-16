const express = require('express');
const authRoutes = require('../features/auth/auth.routes');
const healthcheckRoutes = require('../features/healthcheck/healthcheck.routes');
const reportRoutes = require('../features/report/report.routes');
const userRoutes = require('../features/user/user.routes');
const settingRoutes = require('../features/setting/setting.routes');
const dashboardRoutes = require('../features/dashboard/dashboard.routes');
const studentRoutes = require('../features/student/student.routes');

const router = express.Router();

// Mount all v1 routes
router.use('/auth', authRoutes);
router.use('/healthcheck', healthcheckRoutes);
router.use('/student/reports', reportRoutes);
router.use('/admin/users', userRoutes);
router.use('/admin/settings', settingRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/students', studentRoutes);

module.exports = router; 
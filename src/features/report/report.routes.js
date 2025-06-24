const express = require('express');
const router = express.Router();
const ReportRepository = require('./report.repository');
const ReportService = require('./report.service');
const ReportController = require('./report.controller');

const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

router.get('/', reportController.getAllReports);
router.get('/:sid', reportController.getStudent);
router.post('/report', reportController.createReport);

module.exports = router; 
const express = require('express');
const SettingController = require('./setting.controller');
const { protect, isAdmin } = require('../../core/middleware/auth');

const router = express.Router();
const settingController = new SettingController();

// @route   GET /api/v1/admin/settings
// @desc    Get system settings
// @access  Public (No auth required)
router.get('/', settingController.getSettings);

// @route   PUT /api/v1/admin/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/', protect, isAdmin, settingController.updateSettings);

module.exports = router; 
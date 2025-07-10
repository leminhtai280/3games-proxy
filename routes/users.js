const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('fullName').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('avatar').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        balance: user.balance,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/users/balance
// @desc    Get user balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
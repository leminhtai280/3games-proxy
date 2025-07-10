const express = require('express');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    
    // Calculate total revenue
    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('user', 'username email fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalPayments,
        pendingPayments,
        completedPayments,
        totalRevenue
      },
      recentPayments,
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private/Admin
router.get('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Get user's payment history
    const payments = await Payment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      payments
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', [auth, admin], async (req, res) => {
  try {
    const { isActive, role, balance } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    if (balance !== undefined) user.balance = balance;

    await user.save();

    res.json({
      message: 'Cập nhật người dùng thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        balance: user.balance,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/admin/payments
// @desc    Get all payments with pagination
// @access  Private/Admin
router.get('/payments', [auth, admin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const method = req.query.method || '';
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (method) {
      query.method = method;
    }

    const payments = await Payment.find(query)
      .populate('user', 'username email fullName')
      .populate('processedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/admin/payments/:id
// @desc    Get payment details
// @access  Private/Admin
router.get('/payments/:id', [auth, admin], async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'username email fullName phone')
      .populate('processedBy', 'username fullName');

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
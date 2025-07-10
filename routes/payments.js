const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// Generate unique transaction ID
const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// @route   POST /api/payments/create
// @desc    Create a new payment request
// @access  Private
router.post('/create', auth, [
  body('amount').isFloat({ min: 10000 }).withMessage('Số tiền tối thiểu là 10,000 VNĐ'),
  body('method').isIn(['bank_transfer', 'credit_card', 'paypal', 'momo', 'zalopay']).withMessage('Phương thức thanh toán không hợp lệ'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, description } = req.body;

    const payment = new Payment({
      user: req.user._id,
      amount,
      method,
      description: description || 'Nạp tiền vào tài khoản',
      transactionId: generateTransactionId()
    });

    await payment.save();

    res.status(201).json({
      message: 'Yêu cầu nạp tiền đã được tạo',
      payment: {
        id: payment._id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        description: payment.description,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get user's payment history
// @access  Private
router.get('/my-payments', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user._id });

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

// @route   GET /api/payments/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'username email fullName')
      .populate('processedBy', 'username fullName');

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT /api/payments/:id/upload-proof
// @desc    Upload proof image for payment
// @access  Private
router.put('/:id/upload-proof', auth, async (req, res) => {
  try {
    const { proofImage } = req.body;

    if (!proofImage) {
      return res.status(400).json({ message: 'Vui lòng cung cấp hình ảnh chứng minh' });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }

    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể upload chứng minh cho giao dịch đang chờ xử lý' });
    }

    payment.proofImage = proofImage;
    await payment.save();

    res.json({
      message: 'Upload chứng minh thành công',
      payment: {
        id: payment._id,
        proofImage: payment.proofImage,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Upload proof error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   PUT /api/payments/:id/process
// @desc    Process payment (admin only)
// @access  Private/Admin
router.put('/:id/process', [auth, admin], [
  body('status').isIn(['completed', 'failed', 'cancelled']).withMessage('Trạng thái không hợp lệ'),
  body('adminNote').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNote } = req.body;

    const payment = await Payment.findById(req.params.id)
      .populate('user', 'balance');

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể xử lý giao dịch đang chờ' });
    }

    payment.status = status;
    payment.adminNote = adminNote;
    payment.processedBy = req.user._id;
    payment.processedAt = new Date();

    // If payment is completed, add money to user's balance
    if (status === 'completed') {
      const user = await User.findById(payment.user._id);
      user.balance += payment.amount;
      await user.save();
    }

    await payment.save();

    res.json({
      message: 'Xử lý giao dịch thành công',
      payment: {
        id: payment._id,
        status: payment.status,
        processedAt: payment.processedAt,
        adminNote: payment.adminNote
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
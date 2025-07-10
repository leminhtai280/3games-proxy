const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị khóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware to check if user is admin
const admin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Cần đăng nhập' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { auth, admin };
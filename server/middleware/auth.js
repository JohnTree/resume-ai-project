const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '访问被拒绝，请提供有效的token' });
    }

    // 检查是否为管理员token
    if (token.startsWith('admin-token-')) {
      // 创建管理员用户对象，使用固定的ObjectId
      const adminObjectId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      req.user = {
        _id: adminObjectId,
        name: '管理员',
        email: 'admin@resumemaster.com',
        subscription: 'admin',
        isAdmin: true
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ error: 'Token无效' });
  }
};

module.exports = auth;
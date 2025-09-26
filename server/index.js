const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const templateRoutes = require('./routes/template');
const aiRoutes = require('./routes/ai');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || process.env.RAILWAY_STATIC_PORT || 3001;

// 安全中间件 - 配置CSP允许内联脚本和事件处理器用于调试
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "https://dashscope.aliyuncs.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  }
}));
app.use(compression());

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use(limiter);

// 基础中间件
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://*.vercel.app', 
    'https://*.netlify.app',
    'https://*.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('../public'));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.json({
    message: '🚀 简历大师 API 服务',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      resume: '/api/resume',
      template: '/api/template',
      ai: '/api/ai',
      pdf: '/api/pdf'
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 简历大师服务器启动成功！`);
  console.log(`📡 服务地址: http://0.0.0.0:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 端口: ${PORT}`);
});

module.exports = app;
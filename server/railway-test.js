// Railway 测试服务器 - 简化版本
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Railway 测试服务器运行正常',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: '简历大师后端服务',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Railway 测试服务器启动成功`);
  console.log(`📡 服务地址: http://0.0.0.0:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 端口: ${PORT}`);
});

module.exports = app;
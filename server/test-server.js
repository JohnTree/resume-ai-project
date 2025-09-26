const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// 最简单的健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '服务器运行正常',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: '简历大师AI后端服务',
    version: '1.0.0',
    status: 'running'
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 测试服务器启动成功！`);
  console.log(`📡 服务地址: http://0.0.0.0:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 基础中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resume AI API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// API基础端点
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Resume AI API',
    available: true
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: 'error', 
    message: 'Internal server error' 
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Endpoint not found' 
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
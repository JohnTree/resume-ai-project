// PM2 生产环境配置
module.exports = {
  apps: [{
    name: 'resumeai-backend',
    script: 'index.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 自动重启配置
    watch: false,
    max_memory_restart: '1G',
    
    // 健康检查
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true
  }]
};
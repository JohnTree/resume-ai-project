// API配置常量
export const API_CONFIG = {
  // 开发环境
  DEV: {
    BASE_URL: 'http://localhost:3001/api',
    TIMEOUT: 10000,
  },
  // 生产环境 - 🔥 请修改为你的实际生产服务器地址
  PROD: {
    BASE_URL: 'https://your-production-domain.com/api', // 🚨 必须修改这个地址
    TIMEOUT: 15000,
  },
};

// 根据环境选择配置
export const getCurrentConfig = () => {
  return __DEV__ ? API_CONFIG.DEV : API_CONFIG.PROD;
};

// 其他应用配置
export const APP_CONFIG = {
  // 应用版本
  VERSION: '1.0.0',
  
  // 功能开关
  FEATURES: {
    AI_OPTIMIZATION: true,
    CLOUD_SYNC: true,
    PDF_EXPORT: true,
    PRO_FEATURES: true,
  },
  
  // 限制配置
  LIMITS: {
    MAX_CONTENT_LENGTH: 2000,
    MAX_SKILLS_COUNT: 20,
    MAX_EXPERIENCE_COUNT: 10,
    MAX_EDUCATION_COUNT: 5,
  },
};
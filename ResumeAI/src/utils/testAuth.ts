import { SimpleStorage } from './storage';

// 开发环境下设置测试用户认证
export const setupTestAuth = async () => {
  try {
    // 在开发环境下自动设置测试token
    if (__DEV__) {
      await SimpleStorage.setItem('authToken', 'admin-token-dev-2024');
      console.log('✅ 开发环境测试认证已设置');
    }
  } catch (error) {
    console.error('设置测试认证失败:', error);
  }
};

// 清除认证信息
export const clearAuth = async () => {
  try {
    await SimpleStorage.removeItem('authToken');
    console.log('✅ 认证信息已清除');
  } catch (error) {
    console.error('清除认证信息失败:', error);
  }
};
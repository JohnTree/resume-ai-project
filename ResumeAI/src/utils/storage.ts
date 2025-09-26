// 简化的存储工具，避免依赖冲突
let storage: { [key: string]: string } = {};

export const SimpleStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // 在实际应用中，这里应该使用真正的AsyncStorage
      // 现在先用内存存储作为临时方案
      return storage[key] || null;
    } catch (error) {
      console.error('获取存储数据失败:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      storage[key] = value;
    } catch (error) {
      console.error('保存存储数据失败:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      delete storage[key];
    } catch (error) {
      console.error('删除存储数据失败:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      storage = {};
    } catch (error) {
      console.error('清空存储数据失败:', error);
    }
  }
};
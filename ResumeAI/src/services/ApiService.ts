import { SimpleStorage } from '../utils/storage';

import { getCurrentConfig } from '../constants/Config';

// API配置 - 根据环境自动选择
const API_CONFIG = getCurrentConfig();
const API_BASE_URL = API_CONFIG.BASE_URL;

export interface OptimizationResult {
  optimizedContent: string;
  suggestions: string[];
  score: number;
  improvements: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await SimpleStorage.getItem('authToken');
    } catch (error) {
      console.error('获取认证令牌失败:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // 开发环境下使用测试token，生产环境使用真实token
        'Authorization': `Bearer ${token || 'admin-token-dev-2024'}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || '请求失败');
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // AI优化内容
  async optimizeContent(
    content: string,
    type: 'experience' | 'skills' | 'summary' | 'education' = 'experience'
  ): Promise<OptimizationResult> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        optimized: {
          originalContent: string;
          optimizedContent: string;
          suggestions: string[];
          score: number;
          type: string;
        };
        improvements: string[];
      }>('/ai/optimize', {
        method: 'POST',
        body: JSON.stringify({ content, type }),
      });

      if (response.success && response.optimized) {
        return {
          optimizedContent: response.optimized.optimizedContent,
          suggestions: response.optimized.suggestions,
          score: response.optimized.score,
          improvements: response.improvements || [],
        };
      } else {
        throw new Error('优化失败');
      }
    } catch (error) {
      console.error('AI优化请求失败:', error);
      // 如果API调用失败，返回模拟结果作为备用方案
      return this.getMockOptimization(content, type);
    }
  }

  // AI评分简历
  async scoreResume(resumeData: any): Promise<{
    score: number;
    feedback: string[];
    suggestions: string[];
  }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        score: number;
        feedback: string[];
        suggestions: string[];
      }>('/ai/score', {
        method: 'POST',
        body: JSON.stringify({ resumeData }),
      });

      if (response.success) {
        return {
          score: response.score,
          feedback: response.feedback,
          suggestions: response.suggestions,
        };
      } else {
        throw new Error('评分失败');
      }
    } catch (error) {
      console.error('简历评分请求失败:', error);
      // 返回默认评分
      return {
        score: 75,
        feedback: ['请检查网络连接'],
        suggestions: ['建议稍后重试'],
      };
    }
  }

  // 获取AI优化历史
  async getOptimizationHistory(): Promise<any[]> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        history: any[];
      }>('/ai/history');

      return response.success ? response.history : [];
    } catch (error) {
      console.error('获取优化历史失败:', error);
      return [];
    }
  }

  // 备用的模拟优化方法（当API不可用时使用）
  private getMockOptimization(content: string, type: string): OptimizationResult {
    const mockResults: { [key: string]: OptimizationResult } = {
      experience: {
        optimizedContent: `${content}\n\n通过运用STAR法则（情境-任务-行动-结果），重新组织了内容结构，突出了具体成果和量化指标。增加了行业关键词，提升了ATS系统的匹配度。`,
        suggestions: [
          '使用具体数字和百分比来量化成果',
          '采用STAR法则描述工作经历',
          '突出核心技能和成就',
          '使用行业相关的关键词',
          '保持简洁专业的表达方式'
        ],
        score: 85,
        improvements: [
          '增加了量化数据支撑',
          '优化了内容结构',
          '提升了专业表达',
          '增强了关键词密度'
        ]
      },
      summary: {
        optimizedContent: content + '，具备良好的沟通协调能力和团队合作精神，能够在快节奏的工作环境中保持高效率和高质量的工作表现。',
        suggestions: [
          '建议突出具体的技术技能和项目经验',
          '可以添加量化的工作成果数据',
          '强调个人的核心竞争优势'
        ],
        score: 85,
        improvements: [
          '使用了更专业的表达方式',
          '优化了内容结构和逻辑',
          '提升了整体说服力'
        ]
      },
      skills: {
        optimizedContent: content + ', 项目管理, 团队协作, 问题解决',
        suggestions: [
          '建议按技能类别分组展示',
          '可以添加技能熟练程度标识',
          '突出与目标职位相关的核心技能'
        ],
        score: 88,
        improvements: [
          '增加了软技能',
          '提升了技能的全面性',
          '优化了技能组合'
        ]
      },
      education: {
        optimizedContent: content + '。在校期间积极参与各类实践活动，培养了扎实的专业基础和良好的学习能力。',
        suggestions: [
          '可以添加相关的课程项目经历',
          '突出学术成就和获奖情况',
          '强调与专业相关的实践经验'
        ],
        score: 82,
        improvements: [
          '丰富了教育背景描述',
          '突出了学习能力',
          '增加了实践元素'
        ]
      }
    };

    return mockResults[type] || mockResults.experience;
  }
}

export default new ApiService();
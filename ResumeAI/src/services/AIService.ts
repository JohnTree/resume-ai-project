import ApiService, { OptimizationResult } from './ApiService';

export type ContentType = 'experience' | 'skills' | 'summary' | 'education';

export interface AIOptimizationHookResult {
  optimizeContent: (content: string, type: ContentType) => Promise<OptimizationResult>;
  scoreResume: (resumeData: any) => Promise<{
    score: number;
    feedback: string[];
    suggestions: string[];
  }>;
  getOptimizationHistory: () => Promise<any[]>;
  isOptimizing: boolean;
}

class AIService {
  private isOptimizing = false;

  async optimizeContent(content: string, type: ContentType): Promise<OptimizationResult> {
    if (this.isOptimizing) {
      throw new Error('正在优化中，请稍候...');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('内容不能为空');
    }

    if (content.length > 2000) {
      throw new Error('内容过长，请控制在2000字符以内');
    }

    this.isOptimizing = true;

    try {
      const result = await ApiService.optimizeContent(content, type);
      return result;
    } catch (error) {
      console.error('AI优化失败:', error);
      throw error;
    } finally {
      this.isOptimizing = false;
    }
  }

  async scoreResume(resumeData: any) {
    try {
      return await ApiService.scoreResume(resumeData);
    } catch (error) {
      console.error('简历评分失败:', error);
      throw error;
    }
  }

  async getOptimizationHistory() {
    try {
      return await ApiService.getOptimizationHistory();
    } catch (error) {
      console.error('获取优化历史失败:', error);
      return [];
    }
  }

  getIsOptimizing(): boolean {
    return this.isOptimizing;
  }

  // 验证内容质量
  validateContent(content: string, type: ContentType): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('内容不能为空');
    }

    if (content.length > 2000) {
      errors.push('内容过长，请控制在2000字符以内');
    }

    if (content.length < 10) {
      warnings.push('内容过短，建议添加更多详细信息');
    }

    // 根据类型进行特定验证
    switch (type) {
      case 'experience':
        if (!content.includes('负责') && !content.includes('完成') && !content.includes('参与')) {
          warnings.push('建议使用动作词汇描述工作内容');
        }
        break;
      case 'skills':
        const skills = content.split(',').map(s => s.trim()).filter(s => s);
        if (skills.length < 3) {
          warnings.push('建议至少列出3项技能');
        }
        break;
      case 'summary':
        if (content.length < 50) {
          warnings.push('个人简介建议至少50字符');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 获取优化建议（不调用API）
  getQuickSuggestions(content: string, type: ContentType): string[] {
    const suggestions: string[] = [];

    switch (type) {
      case 'experience':
        suggestions.push('使用STAR法则（情境-任务-行动-结果）描述经历');
        suggestions.push('添加具体的数字和成果数据');
        suggestions.push('突出解决的关键问题和创造的价值');
        break;
      case 'skills':
        suggestions.push('按技能类别分组（技术技能、软技能等）');
        suggestions.push('标注技能熟练程度');
        suggestions.push('突出与目标职位相关的核心技能');
        break;
      case 'summary':
        suggestions.push('突出核心竞争优势');
        suggestions.push('包含职业目标和发展方向');
        suggestions.push('体现个人特色和价值主张');
        break;
      case 'education':
        suggestions.push('突出相关课程和项目经历');
        suggestions.push('包含学术成就和获奖情况');
        suggestions.push('强调与专业相关的实践经验');
        break;
    }

    return suggestions;
  }
}

export default new AIService();
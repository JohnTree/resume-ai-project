import { useState, useCallback } from 'react';
import AIService, { ContentType } from '../services/AIService';
import { Alert } from 'react-native';

export interface UseAIResult {
  isOptimizing: boolean;
  optimizeContent: (content: string, type: ContentType) => Promise<{
    optimizedContent: string;
    suggestions: string[];
    score: number;
    improvements: string[];
  } | null>;
  scoreResume: (resumeData: any) => Promise<{
    score: number;
    feedback: string[];
    suggestions: string[];
  } | null>;
  validateContent: (content: string, type: ContentType) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  getQuickSuggestions: (content: string, type: ContentType) => string[];
}

export const useAI = (): UseAIResult => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeContent = useCallback(async (content: string, type: ContentType) => {
    if (isOptimizing) {
      Alert.alert('提示', '正在优化中，请稍候...');
      return null;
    }

    // 验证内容
    const validation = AIService.validateContent(content, type);
    if (!validation.isValid) {
      Alert.alert('内容验证失败', validation.errors.join('\n'));
      return null;
    }

    // 显示警告（如果有）
    if (validation.warnings.length > 0) {
      Alert.alert('提示', validation.warnings.join('\n'));
    }

    setIsOptimizing(true);

    try {
      const result = await AIService.optimizeContent(content, type);
      return result;
    } catch (error: any) {
      console.error('AI优化失败:', error);
      Alert.alert('优化失败', error.message || '请检查网络连接后重试');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing]);

  const scoreResume = useCallback(async (resumeData: any) => {
    if (isOptimizing) {
      Alert.alert('提示', '正在处理中，请稍候...');
      return null;
    }

    setIsOptimizing(true);

    try {
      const result = await AIService.scoreResume(resumeData);
      return result;
    } catch (error: any) {
      console.error('简历评分失败:', error);
      Alert.alert('评分失败', error.message || '请检查网络连接后重试');
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing]);

  const validateContent = useCallback((content: string, type: ContentType) => {
    return AIService.validateContent(content, type);
  }, []);

  const getQuickSuggestions = useCallback((content: string, type: ContentType) => {
    return AIService.getQuickSuggestions(content, type);
  }, []);

  return {
    isOptimizing,
    optimizeContent,
    scoreResume,
    validateContent,
    getQuickSuggestions,
  };
};
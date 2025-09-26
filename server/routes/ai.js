const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// AI优化简历内容
router.post('/optimize', auth, async (req, res) => {
  try {
    const { content, type = 'experience' } = req.body;

    // 验证输入
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        error: '请提供要优化的内容',
        message: 'Content is required' 
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({ 
        error: '内容过长，请控制在2000字符以内',
        message: 'Content too long' 
      });
    }

    console.log('AI优化请求:', { 
      userId: req.user.userId, 
      contentLength: content.length, 
      type 
    });

    // 调用AI服务进行优化
    const optimized = await aiService.optimizeContent(content, type);

    console.log('AI优化完成:', { 
      score: optimized.score, 
      suggestionsCount: optimized.suggestions.length 
    });

    res.json({
      success: true,
      optimized: {
        originalContent: content,
        optimizedContent: optimized.optimizedContent,
        suggestions: optimized.suggestions,
        score: optimized.score,
        type: type
      },
      improvements: optimized.improvements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI优化错误:', error);
    res.status(500).json({ 
      error: 'AI优化服务暂时不可用，请稍后重试',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 获取AI优化历史
router.get('/history', auth, async (req, res) => {
  try {
    // 这里可以从数据库获取用户的优化历史
    // 暂时返回空数组
    res.json({
      success: true,
      history: [],
      message: '优化历史功能即将上线'
    });
  } catch (error) {
    console.error('获取优化历史错误:', error);
    res.status(500).json({ 
      error: '获取历史记录失败',
      message: error.message 
    });
  }
});

// AI评分简历
router.post('/score', auth, async (req, res) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ 
        error: '请提供简历数据',
        message: 'Resume data is required' 
      });
    }

    // 简单的评分逻辑
    let score = 60;
    const feedback = [];

    // 检查基本信息
    if (resumeData.personalInfo && resumeData.personalInfo.name) {
      score += 5;
    } else {
      feedback.push('缺少个人基本信息');
    }

    // 检查工作经验
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += 15;
      if (resumeData.experience.length >= 2) score += 5;
    } else {
      feedback.push('建议添加工作经验');
    }

    // 检查教育背景
    if (resumeData.education && resumeData.education.length > 0) {
      score += 10;
    } else {
      feedback.push('建议添加教育背景');
    }

    // 检查技能
    if (resumeData.skills && resumeData.skills.length > 0) {
      score += 10;
    } else {
      feedback.push('建议添加专业技能');
    }

    res.json({
      success: true,
      score: Math.min(score, 100),
      feedback,
      suggestions: [
        '使用具体数字量化成果',
        '突出核心技能和成就',
        '保持格式整洁统一',
        '使用行业关键词'
      ]
    });

  } catch (error) {
    console.error('简历评分错误:', error);
    res.status(500).json({ 
      error: '评分服务暂时不可用',
      message: error.message 
    });
  }
});

module.exports = router;
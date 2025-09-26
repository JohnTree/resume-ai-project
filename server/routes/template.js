const express = require('express');
const router = express.Router();

// 获取所有模板
router.get('/', (req, res) => {
  const templates = [
    {
      id: 'modern',
      name: '现代简约',
      description: '简洁现代的设计风格，适合大多数行业',
      preview: '/templates/modern-preview.jpg',
      category: 'professional',
      isPremium: false
    },
    {
      id: 'creative',
      name: '创意设计',
      description: '富有创意的设计，适合设计师和创意工作者',
      preview: '/templates/creative-preview.jpg',
      category: 'creative',
      isPremium: true
    },
    {
      id: 'executive',
      name: '高管商务',
      description: '专业商务风格，适合高级管理人员',
      preview: '/templates/executive-preview.jpg',
      category: 'executive',
      isPremium: true
    },
    {
      id: 'minimal',
      name: '极简风格',
      description: '极简设计，突出内容本身',
      preview: '/templates/minimal-preview.jpg',
      category: 'minimal',
      isPremium: false
    }
  ];
  
  res.json({ templates });
});

// 获取单个模板详情
router.get('/:id', (req, res) => {
  const templateId = req.params.id;
  
  // 这里可以返回具体的模板配置
  const templateConfig = {
    id: templateId,
    layout: 'single-column',
    sections: ['personalInfo', 'summary', 'experience', 'education', 'skills'],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Inter',
      fontSize: '14px'
    }
  };
  
  res.json({ template: templateConfig });
});

module.exports = router;
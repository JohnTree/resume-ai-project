const express = require('express');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取用户所有简历
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('title createdAt updatedAt template')
      .sort({ updatedAt: -1 });
    
    res.json({ resumes });
  } catch (error) {
    console.error('获取简历列表错误:', error);
    res.status(500).json({ error: '获取简历列表失败' });
  }
});

// 获取单个简历
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    res.json({ resume });
  } catch (error) {
    console.error('获取简历错误:', error);
    res.status(500).json({ error: '获取简历失败' });
  }
});

// 创建新简历
router.post('/', auth, async (req, res) => {
  try {
    console.log('收到创建简历请求:', {
      userId: req.user._id,
      body: req.body
    });
    
    const resumeData = {
      ...req.body,
      userId: req.user._id
    };
    
    // 验证必需字段
    if (!resumeData.title) {
      return res.status(400).json({ error: '简历标题不能为空' });
    }
    
    if (!resumeData.personalInfo || !resumeData.personalInfo.name) {
      return res.status(400).json({ error: '姓名不能为空' });
    }
    
    if (!resumeData.personalInfo.email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }
    
    const resume = new Resume(resumeData);
    await resume.save();
    
    console.log('简历创建成功:', resume._id);
    res.status(201).json({ resume });
  } catch (error) {
    console.error('创建简历详细错误:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: '数据验证失败', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: '创建简历失败',
      message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
    });
  }
});

// 更新简历
router.put('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    res.json({ resume });
  } catch (error) {
    console.error('更新简历错误:', error);
    res.status(500).json({ error: '更新简历失败' });
  }
});

// 删除简历
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    res.json({ message: '简历删除成功' });
  } catch (error) {
    console.error('删除简历错误:', error);
    res.status(500).json({ error: '删除简历失败' });
  }
});

module.exports = router;
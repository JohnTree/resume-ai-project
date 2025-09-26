const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

// 生成PDF简历
router.post('/generate-pdf', auth, async (req, res) => {
  let browser;
  
  try {
    const { resumeData, template = 'modern' } = req.body;
    
    if (!resumeData || !resumeData.personalInfo || !resumeData.personalInfo.name) {
      return res.status(400).json({ error: '请提供完整的简历数据' });
    }
    
    console.log('开始生成PDF:', { 
      name: resumeData.personalInfo.name, 
      template 
    });
    
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--memory-pressure-off'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      timeout: 60000,
      protocolTimeout: 60000
    });
    
    const page = await browser.newPage();
    
    // 生成HTML内容
    const htmlContent = generateResumeHTML(resumeData, template);
    
    // 设置页面内容
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    console.log('PDF生成成功，大小:', pdfBuffer.length, 'bytes');
    
    // 设置响应头 - 使用URL编码处理中文文件名
    const fileName = encodeURIComponent(`${resumeData.personalInfo.name}_简历.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // 发送PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF生成错误:', error);
    res.status(500).json({ 
      error: 'PDF生成失败',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// 生成简历HTML
function generateResumeHTML(resumeData, template) {
  const { personalInfo, summary, experience, education, skills } = resumeData;
  
  // 根据模板选择样式
  const templateStyles = getTemplateStyles(template);
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personalInfo.name} - 简历</title>
    <style>
        ${templateStyles}
    </style>
</head>
<body>
    <div class="resume-container">
        <!-- 个人信息 -->
        <header class="header">
            <h1 class="name">${personalInfo.name}</h1>
            <div class="contact-info">
                ${personalInfo.email ? `<span class="contact-item"><i class="icon">📧</i> ${personalInfo.email}</span>` : ''}
                ${personalInfo.phone ? `<span class="contact-item"><i class="icon">📱</i> ${personalInfo.phone}</span>` : ''}
                ${personalInfo.address ? `<span class="contact-item"><i class="icon">📍</i> ${personalInfo.address}</span>` : ''}
            </div>
        </header>
        
        <!-- 个人简介 -->
        ${summary ? `
        <section class="section">
            <h2 class="section-title">个人简介</h2>
            <div class="section-content">
                <p class="summary">${summary}</p>
            </div>
        </section>
        ` : ''}
        
        <!-- 工作经验 -->
        ${experience && experience.length > 0 ? `
        <section class="section">
            <h2 class="section-title">工作经验</h2>
            <div class="section-content">
                ${experience.map(exp => `
                <div class="experience-item">
                    <div class="item-header">
                        <div class="item-left">
                            <h3 class="position">${exp.position}</h3>
                            <div class="company">${exp.company}</div>
                        </div>
                        <div class="item-right">
                            <div class="date">${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : '至今'}</div>
                        </div>
                    </div>
                    ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <!-- 教育背景 -->
        ${education && education.length > 0 ? `
        <section class="section">
            <h2 class="section-title">教育背景</h2>
            <div class="section-content">
                ${education.map(edu => `
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-left">
                            <h3 class="degree">${edu.degree} ${edu.major}</h3>
                            <div class="school">${edu.school}</div>
                        </div>
                        <div class="item-right">
                            <div class="date">${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : '至今'}</div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </section>
        ` : ''}
        
        <!-- 专业技能 -->
        ${skills && skills.length > 0 && skills[0].items && skills[0].items.length > 0 ? `
        <section class="section">
            <h2 class="section-title">专业技能</h2>
            <div class="section-content">
                <div class="skills-list">
                    ${skills[0].items.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>
  `;
}

// 获取模板样式
function getTemplateStyles(template) {
  const baseStyles = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: white;
    }
    
    .resume-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
    }
    
    .header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 2px solid #e5e7eb;
    }
    
    .name {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 15px;
    }
    
    .contact-info {
        display: flex;
        justify-content: center;
        gap: 30px;
        flex-wrap: wrap;
    }
    
    .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;
        font-size: 1rem;
    }
    
    .icon {
        font-size: 1.1rem;
    }
    
    .section {
        margin-bottom: 35px;
    }
    
    .section-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .section-content {
        padding-left: 0;
    }
    
    .summary {
        font-size: 1rem;
        line-height: 1.7;
        color: #475569;
    }
    
    .experience-item,
    .education-item {
        margin-bottom: 25px;
    }
    
    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }
    
    .position,
    .degree {
        font-size: 1.2rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 5px;
    }
    
    .company,
    .school {
        font-size: 1rem;
        color: #3b82f6;
        font-weight: 500;
    }
    
    .date {
        font-size: 0.9rem;
        color: #64748b;
        white-space: nowrap;
    }
    
    .description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: #475569;
        margin-top: 8px;
    }
    
    .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .skill-tag {
        background: #eff6ff;
        color: #1d4ed8;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
    }
  `;
  
  // 根据模板添加特定样式
  const templateSpecificStyles = {
    modern: `
      .name {
        color: #3b82f6;
      }
      .section-title {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
      }
    `,
    creative: `
      .name {
        color: #8b5cf6;
        font-style: italic;
      }
      .section-title {
        color: #8b5cf6;
        border-bottom-color: #8b5cf6;
      }
      .skill-tag {
        background: #f3e8ff;
        color: #7c3aed;
      }
    `,
    executive: `
      .name {
        color: #059669;
      }
      .section-title {
        color: #059669;
        border-bottom-color: #059669;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .skill-tag {
        background: #ecfdf5;
        color: #047857;
      }
    `
  };
  
  return baseStyles + (templateSpecificStyles[template] || templateSpecificStyles.modern);
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  return `${year}年${month}月`;
}

module.exports = router;
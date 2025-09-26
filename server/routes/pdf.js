const express = require('express');
const { jsPDF } = require('jspdf');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取模板颜色主题
function getTemplateColors(template) {
  const themes = {
    modern: {
      primary: { r: 59, g: 130, b: 246 },    // 蓝色
      secondary: { r: 100, g: 116, b: 139 }, // 灰蓝
      background: { r: 248, g: 250, b: 252 }, // 浅蓝灰
      text: { r: 30, g: 41, b: 59 }          // 深色文字
    },
    classic: {
      primary: { r: 52, g: 73, b: 94 },      // 深蓝灰
      secondary: { r: 149, g: 165, b: 166 }, // 中灰
      background: { r: 255, g: 255, b: 255 }, // 白色
      text: { r: 44, g: 62, b: 80 }
    },
    creative: {
      primary: { r: 139, g: 92, b: 246 },    // 紫色
      secondary: { r: 168, g: 85, b: 247 },  // 亮紫
      background: { r: 250, g: 245, b: 255 }, // 浅紫
      text: { r: 44, g: 62, b: 80 }
    },
    executive: {
      primary: { r: 5, g: 150, b: 105 },     // 绿色
      secondary: { r: 16, g: 185, b: 129 },  // 亮绿
      background: { r: 240, g: 253, b: 244 }, // 浅绿
      text: { r: 44, g: 62, b: 80 }
    }
  };
  
  return themes[template] || themes.modern;
}

// 添加章节标题
function addSectionTitle(doc, title, yPos, colors, margin, contentWidth) {
  // 背景矩形
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(margin - 3, yPos - 5, contentWidth + 6, 10, 'F');
  
  // 标题文字
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPos + 1);
  
  return yPos + 12;
}

// 生成PDF简历
=======
router.post('/generate-pdf', auth, async (req, res) => {
  try {
    const { resumeData, template = 'modern' } = req.body;
    
    if (!resumeData || !resumeData.personalInfo || !resumeData.personalInfo.name) {
      return res.status(400).json({ error: '请提供完整的简历数据' });
    }
    
    console.log('开始生成PDF:', { 
      name: resumeData.personalInfo.name, 
      template 
    });
    
    // 创建PDF文档
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // 设置字体
    doc.setFont('helvetica');
    
    let yPosition = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // 根据模板设置颜色主题
    const colors = getTemplateColors(template);
    
    // 添加页面背景色（浅色）
    doc.setFillColor(colors.background.r, colors.background.g, colors.background.b);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
    
    // 添加个人信息
    const { personalInfo } = resumeData;
    
    // 添加顶部装饰条
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // 姓名 - 大标题，使用主题色
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(personalInfo.name || 'Name', margin, yPosition);
    yPosition += 12;
    
    // 添加姓名下方的装饰线
    doc.setDrawColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, margin + 60, yPosition);
    yPosition += 8;
    
    // 联系信息 - 使用图标样式
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    let contactY = yPosition;
    if (personalInfo.email) {
      doc.text(`📧 ${personalInfo.email}`, margin, contactY);
      contactY += 6;
    }
    if (personalInfo.phone) {
      doc.text(`📱 ${personalInfo.phone}`, margin, contactY);
      contactY += 6;
    }
    if (personalInfo.address) {
      doc.text(`📍 ${personalInfo.address}`, margin, contactY);
      contactY += 6;
    }
    
    yPosition = contactY + 12;
    
    // 个人简介
    if (resumeData.summary) {
      yPosition = addSectionTitle(doc, '个人简介', yPosition, colors, margin, contentWidth);
      
      doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth - 10);
      doc.text(summaryLines, margin + 5, yPosition);
      yPosition += summaryLines.length * 5 + 15;
    }
    
    // 工作经验
    if (resumeData.experience && resumeData.experience.length > 0) {
      yPosition = addSectionTitle(doc, '工作经验', yPosition, colors, margin, contentWidth);
      
      resumeData.experience.forEach(exp => {
        // 检查是否需要新页面
        if (yPosition > 250) {
          doc.addPage();
          // 重新设置背景
          doc.setFillColor(colors.background.r, colors.background.g, colors.background.b);
          doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
          yPosition = 20;
        }
        
        // 职位名称 - 使用主题色
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.position || 'Position', margin + 5, yPosition);
        yPosition += 7;
        
        // 公司名称 - 使用次要色
        doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(exp.company || 'Company', margin + 5, yPosition);
        yPosition += 6;
        
        // 时间段 - 右对齐
        if (exp.startDate || exp.endDate) {
          const dateRange = `${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : '至今'}`;
          doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          const dateWidth = doc.getTextWidth(dateRange);
          doc.text(dateRange, pageWidth - margin - dateWidth, yPosition - 13);
        }
        
        // 工作描述
        if (exp.description) {
          doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(exp.description, contentWidth - 15);
          descLines.forEach(line => {
            doc.text(`• ${line}`, margin + 8, yPosition);
            yPosition += 5;
          });
        }
        
        yPosition += 8;
      });
    }
    
    // 教育背景
    if (resumeData.education && resumeData.education.length > 0) {
      // 检查是否需要新页面
      if (yPosition > 220) {
        doc.addPage();
        // 重新设置背景
        doc.setFillColor(colors.background.r, colors.background.g, colors.background.b);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        yPosition = 20;
      }
      
      yPosition = addSectionTitle(doc, '教育背景', yPosition, colors, margin, contentWidth);
      
      resumeData.education.forEach(edu => {
        // 学位和专业 - 使用主题色
        doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree || '学位'} ${edu.major || '专业'}`, margin + 5, yPosition);
        yPosition += 7;
        
        // 学校名称 - 使用次要色
        doc.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(edu.school || '学校', margin + 5, yPosition);
        yPosition += 6;
        
        // 时间段 - 右对齐
        if (edu.startDate || edu.endDate) {
          const dateRange = `${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : '至今'}`;
          doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          const dateWidth = doc.getTextWidth(dateRange);
          doc.text(dateRange, pageWidth - margin - dateWidth, yPosition - 13);
        }
        
        yPosition += 8;
      });
    }
    
    // 专业技能
    if (resumeData.skills && resumeData.skills.length > 0 && resumeData.skills[0].items) {
      // 检查是否需要新页面
      if (yPosition > 240) {
        doc.addPage();
        // 重新设置背景
        doc.setFillColor(colors.background.r, colors.background.g, colors.background.b);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        yPosition = 20;
      }
      
      yPosition = addSectionTitle(doc, '专业技能', yPosition, colors, margin, contentWidth);
      
      // 技能标签样式
      const skills = resumeData.skills[0].items;
      let xPosition = margin + 5;
      let currentY = yPosition;
      
      skills.forEach((skill, index) => {
        // 设置技能标签样式
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const skillWidth = doc.getTextWidth(skill) + 8;
        const skillHeight = 6;
        
        // 检查是否需要换行
        if (xPosition + skillWidth > pageWidth - margin) {
          xPosition = margin + 5;
          currentY += 10;
        }
        
        // 绘制技能标签背景
        doc.setFillColor(colors.primary.r + 30, colors.primary.g + 30, colors.primary.b + 30);
        doc.roundedRect(xPosition - 2, currentY - 4, skillWidth, skillHeight, 2, 2, 'F');
        
        // 绘制技能文字
        doc.setTextColor(colors.primary.r - 20, colors.primary.g - 20, colors.primary.b - 20);
        doc.text(skill, xPosition + 2, currentY);
        
        xPosition += skillWidth + 8;
      });
    }
    
    // 生成PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    console.log('PDF生成成功，大小:', pdfBuffer.length, 'bytes');
    
    // 设置响应头
    const fileName = encodeURIComponent(`${personalInfo.name}_简历.pdf`);
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
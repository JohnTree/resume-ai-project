const express = require('express');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

// 生成PDF简历 - 临时返回HTML用于调试
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
    
    // 生成HTML内容
    const htmlContent = generateResumeHTML(resumeData, template);
    
    // 返回JSON响应，包含HTML内容，让前端在新窗口中打开
    const printableHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.name} - 简历</title>
    <style>
        ${getTemplateStyles(template)}
        
        /* 打印专用样式 */
        @media print {
            body { margin: 0; }
            .print-button { display: none !important; }
            .resume-container { 
                max-width: none; 
                padding: 20px;
                box-shadow: none;
            }
        }
        
        /* 屏幕显示样式 */
        @media screen {
            body { 
                background: #f5f5f5; 
                padding: 20px;
            }
            .resume-container {
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
            }
            .print-button:hover {
                background: #2563eb;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ 打印/保存为PDF</button>
    ${htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]}
    
    <script>
        // 页面加载完成后自动弹出打印对话框
        window.addEventListener('load', function() {
            setTimeout(function() {
                if (confirm('是否立即打印/保存为PDF？')) {
                    window.print();
                }
            }, 1000);
        });
    </script>
</body>
</html>`;
    
    console.log('HTML简历生成成功');
    
    // 返回JSON格式，包含HTML内容
    res.json({
      success: true,
      html: printableHTML,
      fileName: `${resumeData.personalInfo.name}_简历`
    });
    
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
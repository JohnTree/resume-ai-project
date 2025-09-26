// 全局变量
let currentTemplate = 'traditional';
let currentUser = null;
let isProUser = false;
let isAdminUser = false;
let resumeData = {};

// 将全局变量挂载到window对象，供其他脚本访问
window.currentUser = currentUser;
window.isProUser = isProUser;
window.isAdminUser = isAdminUser;

// API基础URL
const API_BASE = 'https://resume-ai-project-production.up.railway.app/api';

// Admin账号配置
const ADMIN_EMAIL = 'admin@resumemaster.com';
const ADMIN_PASSWORD = 'admin123456';

// 用户认证状态管理
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        if (this.token && this.user) {
            this.setAuthenticatedState(this.user);
        } else {
            this.setUnauthenticatedState();
        }
    }

    setAuthenticatedState(user) {
        currentUser = user;
        isAdminUser = user.email === ADMIN_EMAIL;
        isProUser = user.subscription === 'pro' || isAdminUser;
        
        // 同步到window对象
        window.currentUser = currentUser;
        window.isAdminUser = isAdminUser;
        window.isProUser = isProUser;
        
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('userName').textContent = user.name;
        
        // 显示"我的简历"链接
        const resumeListLink = document.getElementById('resumeListLink');
        if (resumeListLink) {
            resumeListLink.style.display = 'inline-flex';
        }
        
        // 更新升级按钮
        const upgradeBtn = document.getElementById('upgradeProBtn');
        if (isAdminUser) {
            upgradeBtn.innerHTML = '<i class="fas fa-shield-alt"></i> 管理员';
            upgradeBtn.classList.remove('btn-primary');
            upgradeBtn.classList.add('btn-success');
            upgradeBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
        } else if (isProUser) {
            upgradeBtn.innerHTML = '<i class="fas fa-crown"></i> Pro用户';
            upgradeBtn.classList.remove('btn-primary');
            upgradeBtn.classList.add('btn-success');
            upgradeBtn.disabled = true;
        }
        
        // 更新模板可见性
        if (typeof updateTemplateVisibility === 'function') {
            updateTemplateVisibility();
        }
    }

    setUnauthenticatedState() {
        currentUser = null;
        isProUser = false;
        isAdminUser = false;
        
        // 同步到window对象
        window.currentUser = currentUser;
        window.isAdminUser = isAdminUser;
        window.isProUser = isProUser;
        
        document.getElementById('loginBtn').style.display = 'inline-flex';
        document.getElementById('userInfo').style.display = 'none';
        
        // 隐藏"我的简历"链接
        const resumeListLink = document.getElementById('resumeListLink');
        if (resumeListLink) {
            resumeListLink.style.display = 'none';
        }
        
        // 更新模板可见性
        if (typeof updateTemplateVisibility === 'function') {
            updateTemplateVisibility();
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.setAuthenticatedState(this.user);
                closeAuthModal();
                showNotification('登录成功！', 'success');
                
                // 登录后自动加载用户的简历
                await this.loadUserResumes();
                
                return true;
            } else {
                showNotification(data.message || '登录失败', 'error');
                return false;
            }
        } catch (error) {
            console.error('登录错误:', error);
            showNotification('网络错误，请稍后重试', 'error');
            return false;
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                this.setAuthenticatedState(this.user);
                closeAuthModal();
                showNotification('注册成功！欢迎使用简历大师', 'success');
                
                return true;
            } else {
                showNotification(data.message || '注册失败', 'error');
                return false;
            }
        } catch (error) {
            console.error('注册错误:', error);
            showNotification('网络错误，请稍后重试', 'error');
            return false;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        this.setUnauthenticatedState();
        showNotification('已退出登录', 'info');
    }

    async loadUserResumes() {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${API_BASE}/resume`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // 这里可以显示用户的简历列表
                console.log('用户简历:', data.resumes);
            }
        } catch (error) {
            console.error('加载简历错误:', error);
        }
    }
}

// 付费墙管理
class PaywallManager {
    constructor() {
        this.freeTemplates = ['traditional', 'split']; // 免费模板
        this.dailyLimit = 3; // 每日免费生成次数
        this.todayCount = parseInt(localStorage.getItem('todayPdfCount') || '0');
        this.lastDate = localStorage.getItem('lastPdfDate');
        
        // 检查是否是新的一天
        const today = new Date().toDateString();
        if (this.lastDate !== today) {
            this.todayCount = 0;
            localStorage.setItem('todayPdfCount', '0');
            localStorage.setItem('lastPdfDate', today);
        }
    }

    canUseTemplate(templateId) {
        if (isProUser) return true;
        return this.freeTemplates.includes(templateId);
    }

    canGeneratePDF() {
        if (isProUser) return true;
        return this.todayCount < this.dailyLimit;
    }

    canSaveDraft() {
        return currentUser !== null; // 需要登录才能保存
    }

    incrementPdfCount() {
        if (!isProUser) {
            this.todayCount++;
            localStorage.setItem('todayPdfCount', this.todayCount.toString());
        }
    }

    showTemplatePaywall() {
        showPaywall('该模板仅限Pro用户使用');
    }

    showPdfPaywall() {
        showPaywall(`今日免费生成次数已用完（${this.dailyLimit}次）`);
    }

    showSavePaywall() {
        showAuthModal();
    }
}

// 初始化管理器
const authManager = new AuthManager();
const paywallManager = new PaywallManager();
let authToken = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定输入事件
    bindInputEvents();
    
    // 绑定模板选择事件
    bindTemplateEvents();
    
    // 初始化模板样式
    updatePreviewStyle();
    
    // 初始化预览
    updatePreview();
    
    // 移除自动注册，让用户主动登录
    console.log('页面加载完成，等待用户登录...');
});

// 自动注册用户
async function autoRegister() {
    try {
        console.log('开始自动注册用户...');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: `user${Date.now()}@resumeai.com`,
                password: '123456',
                name: '简历用户'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            console.log('用户自动注册成功，token:', authToken);
        } else {
            console.error('注册失败，状态码:', response.status);
            const errorData = await response.json();
            console.error('错误详情:', errorData);
        }
    } catch (error) {
        console.error('自动注册失败:', error);
    }
}

// 绑定输入事件
function bindInputEvents() {
    // 个人信息
    document.getElementById('name').addEventListener('input', updatePreview);
    document.getElementById('email').addEventListener('input', updatePreview);
    document.getElementById('phone').addEventListener('input', updatePreview);
    document.getElementById('address').addEventListener('input', updatePreview);
    
    // 个人简介
    document.getElementById('summary').addEventListener('input', updatePreview);
    
    // 技能
    document.getElementById('skills').addEventListener('input', updatePreview);
    
    // 工作经验和教育背景的事件会在动态添加时绑定
    bindExperienceEvents();
    bindEducationEvents();
}

// 绑定模板选择事件
function bindTemplateEvents() {
    document.querySelectorAll('.template-card').forEach(option => {
        option.addEventListener('click', function() {
            // 移除其他模板的active状态
            document.querySelectorAll('.template-card').forEach(opt => opt.classList.remove('active'));
            
            // 添加当前模板的active状态
            this.classList.add('active');
            
            // 更新当前模板
            currentTemplate = this.dataset.template;
            
            // 更新预览样式
            updatePreviewStyle();
            
            // 更新预览
            updatePreview();
            
            console.log('切换到模板:', currentTemplate);
        });
    });
}

// 绑定工作经验事件
function bindExperienceEvents() {
    document.querySelectorAll('.exp-company, .exp-position, .exp-start, .exp-end, .exp-description').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// 绑定教育背景事件
function bindEducationEvents() {
    document.querySelectorAll('.edu-school, .edu-major, .edu-degree, .edu-start, .edu-end').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// 更新预览
function updatePreview() {
    renderPreviewContent();
}

// 更新预览样式
function updatePreviewStyle() {
    const previewContent = document.querySelector('.preview-content');
    
    // 移除所有模板类
    previewContent.classList.remove('template-traditional', 'template-split', 'template-colorful', 'template-tech', 'template-magazine', 'template-infographic', 'template-artistic', 'template-minimal');
    
    // 添加当前模板类
    previewContent.classList.add(`template-${currentTemplate}`);
    
    // 重新渲染预览内容以适应新模板
    renderPreviewContent();
}

// 渲染预览内容 - 根据用户提供的8张图片重新设计
function renderPreviewContent() {
    const previewElement = document.getElementById('resume-preview');
    const name = document.getElementById('name').value || '您的姓名';
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const summary = document.getElementById('summary').value;
    
    // 根据不同模板渲染不同布局
    switch(currentTemplate) {
        case 'traditional':
            renderTemplate1(previewElement, name, email, phone, address, summary);
            break;
        case 'split':
            renderTemplate2(previewElement, name, email, phone, address, summary);
            break;
        case 'colorful':
            renderTemplate3(previewElement, name, email, phone, address, summary);
            break;
        case 'tech':
            renderTemplate4(previewElement, name, email, phone, address, summary);
            break;
        case 'magazine':
            renderTemplate5(previewElement, name, email, phone, address, summary);
            break;
        case 'infographic':
            renderTemplate6(previewElement, name, email, phone, address, summary);
            break;
        case 'artistic':
            renderTemplate7(previewElement, name, email, phone, address, summary);
            break;
        case 'minimal':
            renderTemplate8(previewElement, name, email, phone, address, summary);
            break;
        default:
            renderTemplate1(previewElement, name, email, phone, address, summary);
            break;
    }
    
    // 更新内容
    updateExperience();
    updateEducation();
    updateSkills();
}

// 模板1：传统简历 - 经典单栏黑白布局
function renderTemplate1(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="resume-header">
            <h1 class="resume-name">${name}</h1>
            <div class="resume-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        ${summary ? `
        <div class="resume-section">
            <h2 class="section-title">个人简介</h2>
            <p class="section-content">${summary}</p>
        </div>
        ` : ''}
        
        <div class="resume-section">
            <h2 class="section-title">工作经验</h2>
            <div id="preview-experience"></div>
        </div>
        
        <div class="resume-section">
            <h2 class="section-title">教育背景</h2>
            <div id="preview-education"></div>
        </div>
        
        <div class="resume-section">
            <h2 class="section-title">专业技能</h2>
            <div class="skill-list" id="preview-skills"></div>
        </div>
    `;
}

// 模板2：双栏分割 - 蓝色现代商务风
function renderTemplate2(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="left-column">
            <div class="profile-section">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <h1 class="profile-name">${name}</h1>
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">联系方式</h3>
                <div class="contact-info">
                    ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                    ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                    ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3 class="sidebar-title">专业技能</h3>
                <div class="skill-bars" id="sidebar-skills"></div>
            </div>
        </div>
        
        <div class="right-column">
            <div class="main-header">
                <h1 class="main-name">${name}</h1>
            </div>
            
            ${summary ? `
            <div class="main-section">
                <h2 class="main-section-title">个人简介</h2>
                <p class="main-content">${summary}</p>
            </div>
            ` : ''}
            
            <div class="main-section">
                <h2 class="main-section-title">工作经验</h2>
                <div id="preview-experience"></div>
            </div>
            
            <div class="main-section">
                <h2 class="main-section-title">教育背景</h2>
                <div id="preview-education"></div>
            </div>
        </div>
    `;
}

// 模板3：彩色卡片 - 红色活泼卡片风
function renderTemplate3(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="header-card">
            <div class="header-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h1 class="header-name">${name}</h1>
            <div class="header-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        <div class="cards-container">
            ${summary ? `
            <div class="info-card full-width-card">
                <h2 class="card-title"><i class="fas fa-user-circle"></i>个人简介</h2>
                <p class="card-content">${summary}</p>
            </div>
            ` : ''}
            
            <div class="info-card">
                <h2 class="card-title"><i class="fas fa-briefcase"></i>工作经验</h2>
                <div class="card-content" id="preview-experience"></div>
            </div>
            
            <div class="info-card">
                <h2 class="card-title"><i class="fas fa-graduation-cap"></i>教育背景</h2>
                <div class="card-content" id="preview-education"></div>
            </div>
            
            <div class="info-card full-width-card">
                <h2 class="card-title"><i class="fas fa-cogs"></i>专业技能</h2>
                <div class="skill-bubbles" id="preview-skills"></div>
            </div>
        </div>
    `;
}

// 模板4：科技未来 - 绿色科技几何风
function renderTemplate4(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="tech-grid"></div>
        <div class="tech-header">
            <div class="tech-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h1 class="tech-name">${name}</h1>
            <div class="tech-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        <div class="tech-body">
            ${summary ? `
            <div class="tech-section">
                <h2 class="tech-title">系统概述</h2>
                <p class="tech-content">${summary}</p>
            </div>
            ` : ''}
            
            <div class="tech-section">
                <h2 class="tech-title">工作履历</h2>
                <div id="preview-experience"></div>
            </div>
            
            <div class="tech-section">
                <h2 class="tech-title">学习模块</h2>
                <div id="preview-education"></div>
            </div>
            
            <div class="tech-section">
                <h2 class="tech-title">技能树</h2>
                <div class="tech-skills" id="preview-skills"></div>
            </div>
        </div>
    `;
}

// 模板5：优雅杂志 - 粉红杂志排版风
function renderTemplate5(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="magazine-header">
            <div class="magazine-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h1 class="magazine-name">${name}</h1>
            <div class="magazine-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        <div class="magazine-body">
            ${summary ? `
            <div class="quote-section">
                <p class="quote-text">${summary}</p>
            </div>
            ` : ''}
            
            <div class="magazine-columns">
                <div class="main-column">
                    <div class="magazine-section">
                        <h2 class="magazine-title">职业经历</h2>
                        <div class="magazine-content" id="preview-experience"></div>
                    </div>
                    
                    <div class="magazine-section">
                        <h2 class="magazine-title">教育背景</h2>
                        <div class="magazine-content" id="preview-education"></div>
                    </div>
                </div>
                
                <div class="sidebar-column">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">专业技能</h3>
                        <div class="elegant-skills" id="preview-skills"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 模板6：信息图表 - 黄色数据可视化风
function renderTemplate6(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="infographic-header">
            <div class="info-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="info-details">
                <h1 class="info-name">${name}</h1>
                <div class="info-contact">
                    ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                    ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                    ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
                </div>
            </div>
        </div>
        
        <div class="info-body">
            <div class="stats-section">
                <div class="stat-card">
                    <div class="stat-number">5+</div>
                    <div class="stat-label">工作年限</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">10+</div>
                    <div class="stat-label">项目经验</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">95%</div>
                    <div class="stat-label">客户满意度</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">3</div>
                    <div class="stat-label">团队规模</div>
                </div>
            </div>
            
            ${summary ? `
            <div class="data-grid">
                <div class="data-card">
                    <h2 class="data-title"><i class="fas fa-chart-line"></i>个人简介</h2>
                    <p class="data-content">${summary}</p>
                </div>
                <div class="data-card">
                    <h2 class="data-title"><i class="fas fa-cogs"></i>核心技能</h2>
                    <div class="data-content" id="preview-skills"></div>
                </div>
            </div>
            ` : ''}
            
            <div class="timeline-section">
                <h2 class="timeline-title">职业时间线</h2>
                <div class="timeline" id="preview-experience"></div>
            </div>
            
            <div class="chart-section">
                <h2 class="chart-title">教育背景</h2>
                <div id="preview-education"></div>
            </div>
        </div>
    `;
}

// 模板7：创意艺术 - 紫色几何艺术风
function renderTemplate7(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="artistic-bg"></div>
        <div class="artistic-header">
            <div class="artistic-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
            <div class="artistic-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h1 class="artistic-name">${name}</h1>
            <div class="artistic-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        <div class="artistic-body">
            ${summary ? `
            <div class="creative-section full-width">
                <h2 class="creative-title">创意理念</h2>
                <p class="creative-content">${summary}</p>
            </div>
            ` : ''}
            
            <div class="creative-grid">
                <div class="creative-section">
                    <h2 class="creative-title">工作经历</h2>
                    <div class="creative-content" id="preview-experience"></div>
                </div>
                
                <div class="creative-section">
                    <h2 class="creative-title">教育背景</h2>
                    <div class="creative-content" id="preview-education"></div>
                </div>
                
                <div class="creative-section full-width">
                    <h2 class="creative-title">艺术技能</h2>
                    <div class="artistic-skills" id="preview-skills"></div>
                </div>
            </div>
        </div>
    `;
}

// 模板8：商务简约 - 深蓝极简商务风
function renderTemplate8(element, name, email, phone, address, summary) {
    element.innerHTML = `
        <div class="minimal-header">
            <div class="minimal-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h1 class="minimal-name">${name}</h1>
            <div class="minimal-contact">
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i><span>${phone}</span></div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i><span>${email}</span></div>` : ''}
                ${address ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>${address}</span></div>` : ''}
            </div>
        </div>
        
        <div class="minimal-body">
            ${summary ? `
            <div class="minimal-summary">
                ${summary}
            </div>
            ` : ''}
            
            <div class="minimal-grid">
                <div class="minimal-main">
                    <div class="minimal-section">
                        <h2 class="minimal-title">工作经验</h2>
                        <div class="minimal-content" id="preview-experience"></div>
                    </div>
                    
                    <div class="minimal-section">
                        <h2 class="minimal-title">教育背景</h2>
                        <div class="minimal-content" id="preview-education"></div>
                    </div>
                </div>
                
                <div class="minimal-sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">专业技能</h3>
                        <div class="minimal-skills" id="preview-skills"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 更新工作经验预览
function updateExperience() {
    const experiences = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        const company = item.querySelector('.exp-company').value;
        const position = item.querySelector('.exp-position').value;
        const start = item.querySelector('.exp-start').value;
        const end = item.querySelector('.exp-end').value;
        const description = item.querySelector('.exp-description').value;
        
        if (company || position) {
            experiences.push({
                company,
                position,
                start: formatDate(start),
                end: formatDate(end) || '至今',
                description
            });
        }
    });
    
    const content = document.getElementById('preview-experience');
    
    if (experiences.length > 0 && content) {
        // 根据不同模板渲染不同样式的工作经验
        switch(currentTemplate) {
            case 'traditional':
                content.innerHTML = experiences.map(exp => `
                    <div class="experience-item">
                        <div class="item-header">
                            <div>
                                <h3 class="item-title">${exp.position}</h3>
                                <p class="item-company">${exp.company}</p>
                            </div>
                            <div class="item-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'split':
                content.innerHTML = experiences.map(exp => `
                    <div class="experience-item">
                        <div class="item-header">
                            <div>
                                <h3 class="item-position">${exp.position}</h3>
                                <p class="item-company">${exp.company}</p>
                            </div>
                            <div class="item-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'colorful':
                content.innerHTML = experiences.map(exp => `
                    <div class="experience-card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-position">${exp.position}</h3>
                                <p class="card-company">${exp.company}</p>
                            </div>
                            <div class="card-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="card-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'tech':
                content.innerHTML = experiences.map(exp => `
                    <div class="tech-item">
                        <div class="tech-item-header">
                            <div>
                                <h3 class="tech-position">${exp.position}</h3>
                                <p class="tech-company">${exp.company}</p>
                            </div>
                            <div class="tech-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="tech-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'magazine':
                content.innerHTML = experiences.map(exp => `
                    <div class="magazine-item">
                        <div class="magazine-item-header">
                            <div>
                                <h3 class="magazine-position">${exp.position}</h3>
                                <p class="magazine-company">${exp.company}</p>
                            </div>
                            <div class="magazine-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="magazine-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'infographic':
                content.innerHTML = experiences.map(exp => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <div>
                                <h3 class="timeline-position">${exp.position}</h3>
                                <p class="timeline-company">${exp.company}</p>
                            </div>
                            <div class="timeline-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="timeline-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'artistic':
                content.innerHTML = experiences.map(exp => `
                    <div class="creative-item">
                        <div class="creative-header-item">
                            <div>
                                <h3 class="creative-position">${exp.position}</h3>
                                <p class="creative-company">${exp.company}</p>
                            </div>
                            <div class="creative-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="creative-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            case 'minimal':
                content.innerHTML = experiences.map(exp => `
                    <div class="minimal-item">
                        <div class="minimal-item-header">
                            <div>
                                <h3 class="minimal-position">${exp.position}</h3>
                                <p class="minimal-company">${exp.company}</p>
                            </div>
                            <div class="minimal-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="minimal-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
                break;
                
            default:
                content.innerHTML = experiences.map(exp => `
                    <div class="experience-entry">
                        <div class="exp-header">
                            <div class="exp-info">
                                <h3 class="exp-position">${exp.position}</h3>
                                <p class="exp-company">${exp.company}</p>
                            </div>
                            <div class="exp-date">${exp.start} - ${exp.end}</div>
                        </div>
                        ${exp.description ? `<p class="exp-description">${exp.description}</p>` : ''}
                    </div>
                `).join('');
        }
    } else if (content) {
        content.innerHTML = '<div class="placeholder-text">暂无工作经验</div>';
    }
}

// 更新教育背景预览
function updateEducation() {
    const educations = [];
    document.querySelectorAll('.education-item').forEach(item => {
        const school = item.querySelector('.edu-school')?.value || '';
        const major = item.querySelector('.edu-major')?.value || '';
        const degree = item.querySelector('.edu-degree')?.value || '';
        const start = item.querySelector('.edu-start')?.value || '';
        const end = item.querySelector('.edu-end')?.value || '';
        
        if (school || major || degree) {
            educations.push({
                school,
                major,
                degree,
                start: formatDate(start),
                end: formatDate(end) || '至今'
            });
        }
    });
    
    const content = document.getElementById('preview-education');
    
    if (educations.length > 0 && content) {
        // 根据不同模板渲染不同样式的教育背景
        switch(currentTemplate) {
            case 'traditional':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="education-item">
                            <div class="item-header">
                                <div>
                                    <h3 class="item-title">${title}</h3>
                                    <p class="item-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="item-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'split':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="education-item">
                            <div class="item-header">
                                <div>
                                    <h3 class="item-position">${title}</h3>
                                    <p class="item-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="item-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'colorful':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="education-card">
                            <div class="card-header">
                                <div>
                                    <h3 class="card-position">${title}</h3>
                                    <p class="card-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="card-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'tech':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="tech-item">
                            <div class="tech-item-header">
                                <div>
                                    <h3 class="tech-position">${title}</h3>
                                    <p class="tech-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="tech-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'magazine':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="magazine-item">
                            <div class="magazine-item-header">
                                <div>
                                    <h3 class="magazine-position">${title}</h3>
                                    <p class="magazine-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="magazine-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'infographic':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="data-card">
                            <h3 class="data-title">${title}</h3>
                            <p class="data-content">${subtitle}</p>
                            ${dateRange ? `<p class="data-date">${dateRange}</p>` : ''}
                        </div>
                    `;
                }).join('');
                break;
                
            case 'artistic':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="creative-item">
                            <div class="creative-header-item">
                                <div>
                                    <h3 class="creative-position">${title}</h3>
                                    <p class="creative-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="creative-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            case 'minimal':
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="minimal-item">
                            <div class="minimal-item-header">
                                <div>
                                    <h3 class="minimal-position">${title}</h3>
                                    <p class="minimal-company">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="minimal-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                break;
                
            default:
                content.innerHTML = educations.map(edu => {
                    const title = [edu.degree, edu.major].filter(Boolean).join(' ') || '学历信息';
                    const subtitle = edu.school || '学校名称';
                    const dateRange = edu.end ? edu.end : '';
                    
                    return `
                        <div class="education-entry">
                            <div class="edu-header">
                                <div class="edu-info">
                                    <h3 class="edu-degree">${title}</h3>
                                    <p class="edu-school">${subtitle}</p>
                                </div>
                                ${dateRange ? `<div class="edu-date">${dateRange}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
        }
    } else if (content) {
        content.innerHTML = '<div class="placeholder-text">暂无教育背景</div>';
    }
}

// 更新技能预览 - 根据不同模板显示不同样式
function updateSkills() {
    const skills = document.getElementById('skills').value;
    
    if (!skills.trim()) {
        // 清空所有技能容器
        const containers = ['preview-skills', 'sidebar-skills', 'panel-skills', 'right-sidebar-skills', 'dark-skills', 'creative-skills', 'hr-skills'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<div class="placeholder-text">暂无技能信息</div>';
            }
        });
        return;
    }
    
    const skillList = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    // 根据不同模板渲染不同样式的技能
    switch(currentTemplate) {
        case 'traditional':
            renderTraditionalSkills(skillList);
            break;
        case 'split':
            renderSplitSkills(skillList);
            break;
        case 'colorful':
            renderColorfulSkills(skillList);
            break;
        case 'tech':
            renderTechSkills(skillList);
            break;
        case 'magazine':
            renderElegantSkills(skillList);
            break;
        case 'infographic':
            renderInfoSkills(skillList);
            break;
        case 'artistic':
            renderArtisticSkills(skillList);
            break;
        case 'minimal':
            renderMinimalSkills(skillList);
            break;
        default:
            renderDefaultSkills(skillList);
    }
}

// 各模板技能渲染函数
function renderTraditionalSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="skill-item">${skill}</span>`).join('');
    }
}

function renderSplitSkills(skillList) {
    const sidebarContainer = document.getElementById('sidebar-skills');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = skillList.map(skill => `
            <div class="skill-item">
                <div class="skill-name">${skill}</div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${Math.floor(Math.random() * 30) + 70}%"></div>
                </div>
            </div>
        `).join('');
    }
}

function renderColorfulSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="skill-bubble">${skill}</span>`).join('');
    }
}

function renderTechSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="tech-skill">${skill}</span>`).join('');
    }
}

function renderElegantSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="elegant-skill">${skill}</span>`).join('');
    }
}

function renderInfoSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = `
            <div class="skill-chart">
                ${skillList.map(skill => `
                    <div class="skill-bar-item">
                        <div class="skill-bar-header">
                            <span class="skill-bar-name">${skill}</span>
                            <span class="skill-bar-percent">${Math.floor(Math.random() * 30) + 70}%</span>
                        </div>
                        <div class="skill-bar-track">
                            <div class="skill-bar-fill" style="width: ${Math.floor(Math.random() * 30) + 70}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function renderArtisticSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="artistic-skill">${skill}</span>`).join('');
    }
}

function renderMinimalSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="minimal-skill">${skill}</span>`).join('');
    }
}

function renderDefaultSkills(skillList) {
    const container = document.getElementById('preview-skills');
    if (container) {
        container.innerHTML = skillList.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
    }
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    return `${year}年${month}月`;
}

// 添加工作经验
function addExperience() {
    const experienceList = document.getElementById('experience-list');
    const newExperience = document.createElement('div');
    newExperience.className = 'experience-item';
    newExperience.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">公司名称</label>
                <input type="text" class="form-input exp-company" placeholder="公司名称">
            </div>
            <div class="form-group">
                <label class="form-label">职位</label>
                <input type="text" class="form-input exp-position" placeholder="职位名称">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">开始时间</label>
                <input type="month" class="form-input exp-start">
            </div>
            <div class="form-group">
                <label class="form-label">结束时间</label>
                <input type="month" class="form-input exp-end">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">工作描述</label>
            <textarea class="form-textarea exp-description" placeholder="描述您的主要职责和成就..."></textarea>
            <button class="btn btn-ai btn-sm" onclick="optimizeExperience(this)" style="margin-top: 0.75rem;">
                <i class="fas fa-magic"></i> AI优化
            </button>
        </div>
        <button class="btn btn-secondary" onclick="removeExperience(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> 删除
        </button>
    `;
    
    experienceList.appendChild(newExperience);
    bindExperienceEvents();
}

// 删除工作经验
function removeExperience(button) {
    button.closest('.experience-item').remove();
    updatePreview();
}

// 添加教育背景
function addEducation() {
    const educationList = document.getElementById('education-list');
    const newEducation = document.createElement('div');
    newEducation.className = 'education-item';
    newEducation.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">学校名称</label>
                <input type="text" class="form-input edu-school" placeholder="学校名称">
            </div>
            <div class="form-group">
                <label class="form-label">专业</label>
                <input type="text" class="form-input edu-major" placeholder="专业名称">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">学历</label>
                <select class="form-select edu-degree">
                    <option value="">请选择学历</option>
                    <option value="高中">高中</option>
                    <option value="大专">大专</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">毕业时间</label>
                <input type="month" class="form-input edu-end">
            </div>
        </div>
        <button class="btn btn-secondary" onclick="removeEducation(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> 删除
        </button>
    `;
    
    educationList.appendChild(newEducation);
    bindEducationEvents();
}

// 删除教育背景
function removeEducation(button) {
    button.closest('.education-item').remove();
    updatePreview();
}

// AI优化内容
async function optimizeContent(type) {
    console.log('开始AI优化，类型:', type);
    console.log('当前authManager.token:', authManager.token);
    
    if (!authManager.token) {
        alert('请先登录后再使用AI优化功能');
        return;
    }
    
    let content = '';
    let targetElement = '';
    let optimizeButton = null;
    
    if (type === 'summary') {
        content = document.getElementById('summary').value;
        targetElement = 'summary';
        optimizeButton = document.querySelector('button[onclick="optimizeContent(\'summary\')"]');
    } else if (type === 'skills') {
        content = document.getElementById('skills').value;
        targetElement = 'skills';
        optimizeButton = document.querySelector('button[onclick="optimizeContent(\'skills\')"]');
    }
    
    if (!content.trim()) {
        alert('请先输入内容再进行AI优化');
        return;
    }
    
    // 显示loading状态
    if (optimizeButton) {
        optimizeButton.disabled = true;
        optimizeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI优化中...';
    }
    
    try {
        const response = await fetch('/api/ai/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authManager.token ? `Bearer ${authManager.token}` : ''
            },
            body: JSON.stringify({
                content: content,
                type: type
            })
        });
        
        const data = await response.json();
        
        console.log('AI优化响应:', response.status, data);
        
        if (response.ok) {
            // 更新内容
            document.getElementById(targetElement).value = data.optimized.optimizedContent;
            
            // 显示建议
            showAISuggestions(type, data.optimized.suggestions);
            
            // 更新预览
            updatePreview();
            
            alert(`AI优化完成！评分：${data.optimized.score}/100`);
        } else {
            console.error('AI优化失败:', data);
            alert(`AI优化失败：${data.error || data.message}`);
        }
    } catch (error) {
        alert(`网络错误：${error.message}`);
    } finally {
        // 恢复按钮状态
        if (optimizeButton) {
            optimizeButton.disabled = false;
            optimizeButton.innerHTML = '<i class="fas fa-magic"></i> AI智能优化';
        }
    }
}

// 优化工作经验
async function optimizeExperience(button) {
    if (!authManager.token) {
        alert('请先登录后再使用AI优化功能');
        return;
    }
    
    const experienceItem = button.closest('.experience-item');
    const description = experienceItem.querySelector('.exp-description').value;
    
    if (!description.trim()) {
        alert('请先输入工作描述再进行AI优化');
        return;
    }
    
    // 显示loading状态
    const originalButtonContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI优化中...';
    
    try {
        const response = await fetch('/api/ai/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authManager.token}`
            },
            body: JSON.stringify({
                content: description,
                type: 'experience'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 更新工作描述
            experienceItem.querySelector('.exp-description').value = data.optimized.optimizedContent;
            
            // 更新预览
            updatePreview();
            
            alert(`AI优化完成！评分：${data.optimized.score}/100`);
        } else {
            alert(`AI优化失败：${data.error || data.message}`);
        }
    } catch (error) {
        alert(`网络错误：${error.message}`);
    } finally {
        // 恢复按钮状态
        button.disabled = false;
        button.innerHTML = originalButtonContent;
    }
}

// 显示AI建议
function showAISuggestions(type, suggestions) {
    const suggestionsDiv = document.getElementById(`${type}-suggestions`);
    if (suggestionsDiv && suggestions.length > 0) {
        suggestionsDiv.innerHTML = `
            <h5>AI优化建议：</h5>
            <ul>
                ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
            </ul>
        `;
        suggestionsDiv.style.display = 'block';
    }
}

// 生成PDF
async function generatePDF() {
    const name = document.getElementById('name').value;
    if (!name.trim()) {
        alert('请至少填写姓名后再生成PDF');
        return;
    }
    
    if (!authManager.token) {
        alert('请先登录后再生成PDF');
        return;
    }
    
    // 显示加载状态
    const pdfButton = document.querySelector('button[onclick="generatePDF()"]');
    const originalButtonContent = pdfButton ? pdfButton.innerHTML : '';
    
    if (pdfButton) {
        pdfButton.disabled = true;
        pdfButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成PDF中...';
    }
    
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    try {
        // 收集简历数据
        const resumeData = collectResumeData();
        
        const response = await fetch('/api/pdf/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authManager.token}`
            },
            body: JSON.stringify({
                resumeData: resumeData,
                template: currentTemplate
            })
        });
        
        if (response.ok) {
            // 下载PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}_简历.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('PDF生成成功！');
        } else {
            const error = await response.json();
            alert(`PDF生成失败：${error.error || error.message}`);
        }
    } catch (error) {
        alert(`网络错误：${error.message}`);
    } finally {
        // 隐藏加载状态
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // 恢复按钮状态
        if (pdfButton) {
            pdfButton.disabled = false;
            pdfButton.innerHTML = originalButtonContent || '<i class="fas fa-download"></i> 下载PDF';
        }
    }
}

// 收集简历数据
function collectResumeData() {
    console.log('开始收集简历数据...');
    
    // 安全获取元素值的辅助函数
    function safeGetValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }
    
    // 个人信息
    const personalInfo = {
        name: safeGetValue('name'),
        email: safeGetValue('email'),
        phone: safeGetValue('phone'),
        address: safeGetValue('address')
    };
    
    console.log('个人信息:', personalInfo);
    
    // 个人简介
    const summary = safeGetValue('summary');
    console.log('个人简介:', summary);
    
    // 工作经验
    const experience = [];
    const expCompanyElements = document.querySelectorAll('input[placeholder*="公司名称"]');
    const expPositionElements = document.querySelectorAll('input[placeholder*="职位"]');
    const expStartElements = document.querySelectorAll('input[type="month"]');
    const expDescElements = document.querySelectorAll('textarea[placeholder*="工作描述"]');
    
    for (let i = 0; i < expCompanyElements.length; i++) {
        const company = expCompanyElements[i] ? expCompanyElements[i].value : '';
        const position = expPositionElements[i] ? expPositionElements[i].value : '';
        const startDate = expStartElements[i] ? expStartElements[i].value : '';
        const endDate = expStartElements[i + 1] ? expStartElements[i + 1].value : '';
        const description = expDescElements[i] ? expDescElements[i].value : '';
        
        if (company || position) {
            experience.push({
                company,
                position,
                startDate,
                endDate,
                description
            });
        }
    }
    
    console.log('工作经验:', experience);
    
    // 教育背景
    const education = [];
    const schoolElements = document.querySelectorAll('input[placeholder*="学校名称"]');
    const majorElements = document.querySelectorAll('input[placeholder*="专业"]');
    const degreeSelects = document.querySelectorAll('select');
    const graduationElements = document.querySelectorAll('input[type="month"]');
    
    for (let i = 0; i < schoolElements.length; i++) {
        const school = schoolElements[i] ? schoolElements[i].value : '';
        const major = majorElements[i] ? majorElements[i].value : '';
        const degree = degreeSelects[i] ? degreeSelects[i].value : '';
        const graduationDate = graduationElements[graduationElements.length - 1] ? graduationElements[graduationElements.length - 1].value : '';
        
        if (school || major) {
            education.push({
                school,
                major,
                degree,
                startDate: '',
                endDate: graduationDate
            });
        }
    }
    
    console.log('教育背景:', education);
    
    // 技能
    const skillsText = safeGetValue('skills');
    const skills = skillsText ? [{
        category: '专业技能',
        items: skillsText.split(',').map(skill => skill.trim()).filter(skill => skill)
    }] : [];
    
    console.log('技能:', skills);
    
    const resumeData = {
        personalInfo,
        summary,
        experience,
        education,
        skills,
        template: currentTemplate
    };
    
    console.log('完整简历数据:', resumeData);
    return resumeData;
}

// UI交互函数
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

function showPaywall(message = '') {
    const modal = document.getElementById('paywallModal');
    if (message) {
        modal.querySelector('.paywall-description').textContent = message;
    }
    modal.style.display = 'flex';
}

function closePaywall() {
    document.getElementById('paywallModal').style.display = 'none';
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // 添加通知样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 保存草稿功能
async function saveDraft() {
    if (!paywallManager.canSaveDraft()) {
        paywallManager.showSavePaywall();
        return;
    }

    try {
        // 收集表单数据
        const formData = collectFormData();
        
        // 转换为后端期望的数据结构
        const resumeData = {
            title: formData.name || '未命名简历',
            personalInfo: {
                name: formData.name || '',
                email: formData.email || '',
                phone: formData.phone || '',
                address: formData.address || ''
            },
            summary: formData.summary || '',
            experience: formData.experience || [],
            education: formData.education || [],
            skills: formData.skills ? [{
                category: '技能',
                items: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                level: 'intermediate'
            }] : [],
            template: currentTemplate || 'modern'
        };
        
        const response = await fetch(`${API_BASE}/resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authManager.token}`
            },
            body: JSON.stringify(resumeData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('草稿保存成功！可在"我的简历"中查看', 'success');
            resumeData.id = result.resume._id;
            
            // 3秒后提示用户可以查看简历列表
            setTimeout(() => {
                if (confirm('草稿已保存成功！是否前往"我的简历"查看？')) {
                    window.location.href = 'resume-list.html';
                }
            }, 2000);
        } else {
            const error = await response.json();
            console.error('保存草稿失败:', error);
            showNotification(error.error || error.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('保存草稿错误:', error);
        showNotification('网络错误，保存失败', 'error');
    }
}

// 收集表单数据
function collectFormData() {
    const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        summary: document.getElementById('summary').value,
        skills: document.getElementById('skills').value,
        experience: [],
        education: []
    };

    // 收集工作经验
    document.querySelectorAll('.experience-item').forEach(item => {
        const exp = {
            company: item.querySelector('.exp-company')?.value || '',
            position: item.querySelector('.exp-position')?.value || '',
            startDate: item.querySelector('.exp-start')?.value || '',
            endDate: item.querySelector('.exp-end')?.value || '',
            current: false,
            description: item.querySelector('.exp-description')?.value || '',
            achievements: []
        };
        if (exp.company || exp.position) {
            data.experience.push(exp);
        }
    });

    // 收集教育背景
    document.querySelectorAll('.education-item').forEach(item => {
        const edu = {
            school: item.querySelector('.edu-school')?.value || '',
            degree: item.querySelector('.edu-degree')?.value || '',
            major: item.querySelector('.edu-major')?.value || '',
            startDate: item.querySelector('.edu-start')?.value || '',
            endDate: item.querySelector('.edu-end')?.value || '',
            gpa: '',
            description: ''
        };
        if (edu.school || edu.major) {
            data.education.push(edu);
        }
    });

    return data;
}

// 支付功能
function startPayment() {
    // 这里集成真实的支付接口
    showNotification('支付功能开发中，敬请期待！', 'info');
    closePaywall();
}

// 重写模板选择函数，添加付费墙检查
function selectTemplate(templateId) {
    if (!paywallManager.canUseTemplate(templateId)) {
        paywallManager.showTemplatePaywall();
        return;
    }
    
    currentTemplate = templateId;
    
    // 更新UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[data-template="${templateId}"]`).classList.add('active');
    
    // 重新渲染预览
    updatePreview();
}

// PDF生成函数，需要登录才能使用
async function generatePDF() {
    // 检查用户是否已登录
    console.log('检查登录状态:', {
        token: authManager.token,
        user: authManager.user,
        currentUser: currentUser
    });
    
    if (!currentUser) {
        alert('请先登录后再下载PDF');
        // 显示登录模态框
        document.getElementById('loginModal').style.display = 'block';
        return;
    }
    
    // 检查付费墙限制
    if (!paywallManager.canGeneratePDF()) {
        paywallManager.showPdfPaywall();
        return;
    }
    
    const name = document.getElementById('name').value;
    if (!name.trim()) {
        alert('请至少填写姓名后再生成PDF');
        return;
    }
    
    // 显示加载状态
    document.getElementById('loading').style.display = 'block';
    
    try {
        const resumeData = collectResumeData();
        
        const token = authManager.token || localStorage.getItem('authToken');
        console.log('使用的token:', token);
        
        if (!token) {
            alert('认证token无效，请重新登录');
            document.getElementById('loginModal').style.display = 'block';
            return;
        }
        
        const response = await fetch('/api/pdf/generate-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                resumeData: resumeData,
                template: currentTemplate
            })
        });

        if (response.ok) {
            // 先检查响应的Content-Type
            const contentType = response.headers.get('content-type');
            console.log('响应Content-Type:', contentType);
            
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (result.success && result.html) {
                    // 在新窗口中打开HTML简历
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(result.html);
                    newWindow.document.close();
                    
                    paywallManager.incrementPdfCount();
                    alert('简历已在新窗口中打开，您可以使用浏览器的打印功能保存为PDF！');
                } else {
                    alert('PDF生成失败：响应格式错误');
                }
            } else {
                // 如果不是JSON，可能是HTML，直接在新窗口打开
                const htmlContent = await response.text();
                const newWindow = window.open('', '_blank');
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                
                paywallManager.incrementPdfCount();
                alert('简历已在新窗口中打开，您可以使用浏览器的打印功能保存为PDF！');
            }
        } else {
            try {
                const error = await response.json();
                alert(`PDF生成失败：${error.error || error.message}`);
            } catch (e) {
                const errorText = await response.text();
                console.error('错误响应:', errorText);
                alert(`PDF生成失败：服务器错误 (${response.status})`);
            }
        }
    } catch (error) {
        console.error('PDF生成错误:', error);
        alert(`网络错误：${error.message}`);
    } finally {
        // 隐藏加载状态
        document.getElementById('loading').style.display = 'none';
    }
}

// 事件监听器设置
document.addEventListener('DOMContentLoaded', function() {
    // 保存草稿按钮
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    
    // 升级Pro按钮
    document.getElementById('upgradeProBtn').addEventListener('click', function() {
        if (!isProUser) {
            showPaywall();
        }
    });
    
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', showAuthModal);
    
    // 退出按钮
    document.getElementById('logoutBtn').addEventListener('click', function() {
        authManager.logout();
    });
    
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // 检查是否为Admin账号
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // 创建Admin用户对象
            const adminUser = {
                id: 'admin',
                name: '管理员',
                email: ADMIN_EMAIL,
                subscription: 'admin',
                isAdmin: true
            };
            
            // 生成管理员token（模拟token）
            const adminToken = 'admin-token-' + Date.now();
            
            // 设置authManager的token和user
            authManager.token = adminToken;
            authManager.user = adminUser;
            
            // 保存到localStorage
            localStorage.setItem('authToken', adminToken);
            localStorage.setItem('user', JSON.stringify(adminUser));
            
            // 设置认证状态
            authManager.setAuthenticatedState(adminUser);
            closeAuthModal();
            showNotification('管理员登录成功！', 'success');
            return;
        }
        
        await authManager.login(email, password);
    });
    
    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        await authManager.register(name, email, password);
    });
    
    // 模板选择事件
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template');
            selectTemplate(templateId);
        });
    });
    
    // 关闭模态框的点击事件
    document.getElementById('authModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });
    
    document.getElementById('paywallModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePaywall();
        }
    });
    
    // 初始化
    updatePreview();
    
    // 初始化模板可见性
    if (typeof updateTemplateVisibility === 'function') {
        updateTemplateVisibility();
    }
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
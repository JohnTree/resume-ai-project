// 模板可见性管理
class TemplateVisibilityManager {
    constructor() {
        // 延迟初始化，等待DOM和全局变量准备好
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.updateTemplateVisibility();
    }

    updateTemplateVisibility() {
        const templateCards = document.querySelectorAll('.template-card');
        
        // 检查全局变量是否存在
        const currentUser = window.currentUser || null;
        const isAdminUser = window.isAdminUser || false;
        const isProUser = window.isProUser || false;
        
        templateCards.forEach(card => {
            const isProTemplate = card.classList.contains('pro-template');
            
            // 所有用户都能看到所有模板
            card.style.display = 'block';
            
            if (isProTemplate) {
                // 根据用户权限显示不同状态
                if (isAdminUser || isProUser) {
                    // Admin或Pro用户：移除锁定效果
                    this.removeProLock(card);
                } else {
                    // 未登录/普通用户：保持锁定效果，但仍然可见
                    this.addProLock(card);
                }
            }
        });
    }

    removeProLock(card) {
        const isAdminUser = window.isAdminUser || false;
        const isProUser = window.isProUser || false;
        
        // 移除遮罩层
        card.classList.remove('pro-template');
        card.classList.add('unlocked-template');
        
        // 隐藏锁定图标和提示
        const lock = card.querySelector('.pro-lock');
        const tooltip = card.querySelector('.pro-tooltip');
        if (lock) lock.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';
        
        // 更新Pro标识为已解锁状态
        const badge = card.querySelector('.pro-badge');
        if (badge && isAdminUser) {
            badge.innerHTML = '<span class="pro-crown">🛡️</span>ADMIN';
            badge.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
        } else if (badge && isProUser) {
            badge.innerHTML = '<span class="pro-crown">👑</span>PRO';
        }
    }

    addProLock(card) {
        // 确保锁定效果存在
        card.classList.add('pro-template');
        card.classList.remove('unlocked-template');
        
        const lock = card.querySelector('.pro-lock');
        const tooltip = card.querySelector('.pro-tooltip');
        if (lock) lock.style.display = 'flex';
        if (tooltip) tooltip.style.display = 'block';
    }
}

// 全局实例变量
let templateVisibilityManager = null;

// 初始化函数
function initTemplateVisibilityManager() {
    if (!templateVisibilityManager) {
        templateVisibilityManager = new TemplateVisibilityManager();
    }
}

// 监听用户状态变化
function updateTemplateVisibility() {
    if (!templateVisibilityManager) {
        initTemplateVisibilityManager();
    }
    if (templateVisibilityManager) {
        templateVisibilityManager.updateTemplateVisibility();
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTemplateVisibilityManager);
} else {
    initTemplateVisibilityManager();
}
/**
 * 通用JavaScript函数
 */

const API_BASE_URL = 'http://localhost:5000/api';

// 工具函数
const Utils = {
    formatDate(dateStr) {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '--';
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatHours(hours) {
        if (hours === undefined || hours === null) return '--';
        return `${hours.toFixed(1)} 小时`;
    },

    formatProgress(progress) {
        if (progress === undefined || progress === null) return '--';
        return `${progress.toFixed(1)}%`;
    },

    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading">加载中...</div>';
        }
    },

    showError(element, message) {
        if (element) {
            element.innerHTML = `<div class="error">${message}</div>`;
        }
    }
};

// API调用函数
const API = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    },

    // 项目相关
    async getProjects() {
        return this.request('/projects');
    },

    async getProject(id) {
        return this.request(`/projects/${id}`);
    },

    // 任务相关
    async getTasks(projectId) {
        const endpoint = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
        return this.request(endpoint);
    },

    async getTask(id) {
        return this.request(`/tasks/${id}`);
    },

    // 每日工作相关
    async getTodayWork() {
        return this.request('/daily-work/today');
    },

    async getDailyWorks(params = {}) {
        const query = new URLSearchParams(params).toString();
        const endpoint = query ? `/daily-work?${query}` : '/daily-work';
        return this.request(endpoint);
    },

    async submitDailyWork(data) {
        return this.request('/daily-work', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async submitBatchDailyWork(works) {
        return this.request('/daily-work/batch', {
            method: 'POST',
            body: JSON.stringify({ works })
        });
    },

    // 进度相关
    async getProgressOverview(projectId) {
        const endpoint = projectId ? `/progress/overview?project_id=${projectId}` : '/progress/overview';
        return this.request(endpoint);
    },

    async getChartData(projectId, days = 30) {
        const endpoint = projectId ? `/progress/chart-data?project_id=${projectId}&days=${days}` : `/progress/chart-data?days=${days}`;
        return this.request(endpoint);
    },

    async getDetailedProgress(projectId) {
        return this.request(`/progress/detailed?project_id=${projectId}`);
    },

    // 用户相关
    async getUsers() {
        return this.request('/users');
    },

    // 系统相关
    async generateTodayForms() {
        try {
            const response = await fetch(`${API_BASE_URL}/daily-work/today`, { method: 'POST' });
            return await response.json();
        } catch (error) {
            // 如果POST不支持，尝试使用命令行方式
            console.warn('直接生成失败，尝试备用方法');
            return { message: '请使用系统命令生成今日表格' };
        }
    },

    async checkAPIStatus() {
        try {
            const response = await fetch(API_BASE_URL);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

// 模态框管理
const Modal = {
    init() {
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.modalCloseBtn = document.getElementById('modal-close-btn');
        this.modalConfirmBtn = document.getElementById('modal-confirm-btn');
        this.modalCloseElements = document.querySelectorAll('.modal-close');

        this.setupEvents();
    },

    setupEvents() {
        // 关闭按钮
        this.modalCloseBtn.addEventListener('click', () => this.hide());

        // 模态框外部点击关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // 其他关闭元素
        this.modalCloseElements.forEach(element => {
            element.addEventListener('click', () => this.hide());
        });

        // 确认按钮
        this.modalConfirmBtn.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
            }
            this.hide();
        });
    },

    show(options = {}) {
        const {
            title = '提示',
            content = '',
            showConfirm = false,
            confirmText = '确认',
            confirmCallback = null,
            showCancel = true,
            cancelText = '关闭'
        } = options;

        this.modalTitle.textContent = title;

        if (typeof content === 'string') {
            this.modalBody.innerHTML = `<p>${content}</p>`;
        } else {
            this.modalBody.innerHTML = '';
            this.modalBody.appendChild(content);
        }

        this.modalConfirmBtn.textContent = confirmText;
        this.confirmCallback = confirmCallback;
        this.modalConfirmBtn.style.display = showConfirm ? 'block' : 'none';
        this.modalCloseBtn.textContent = cancelText;
        this.modalCloseBtn.style.display = showCancel ? 'block' : 'none';

        this.modal.classList.add('active');
    },

    hide() {
        this.modal.classList.remove('active');
        this.confirmCallback = null;
    },

    confirm(options) {
        return new Promise((resolve) => {
            this.show({
                ...options,
                showConfirm: true,
                confirmCallback: () => resolve(true)
            });
        });
    },

    alert(message, title = '提示') {
        this.show({ title, content: message });
    }
};

// 通知系统
const Notification = {
    show(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 添加样式
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 3000;
                    animation: slideIn 0.3s ease;
                    border-left: 4px solid;
                }
                .notification-info { border-left-color: #4361ee; }
                .notification-success { border-left-color: #4cc9f0; }
                .notification-warning { border-left-color: #f72585; }
                .notification-error { border-left-color: #e63946; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex: 1;
                }
                .notification-content i {
                    font-size: 1.2rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6c757d;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // 关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    },

    getIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'info-circle';
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    }
};

// 进度条组件
const ProgressBar = {
    create(progress, options = {}) {
        const {
            height = '10px',
            showText = true,
            textPosition = 'right'
        } = options;

        const container = document.createElement('div');
        container.className = 'progress-container';

        const barWrapper = document.createElement('div');
        barWrapper.className = 'progress-bar';
        barWrapper.style.height = height;
        barWrapper.style.backgroundColor = '#e9ecef';
        barWrapper.style.borderRadius = '5px';
        barWrapper.style.overflow = 'hidden';

        const barFill = document.createElement('div');
        barFill.className = 'progress-fill';
        barFill.style.height = '100%';
        barFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        barFill.style.background = 'linear-gradient(90deg, #4361ee, #3a0ca3)';
        barFill.style.borderRadius = '5px';
        barFill.style.transition = 'width 0.3s ease';

        barWrapper.appendChild(barFill);
        container.appendChild(barWrapper);

        if (showText) {
            const text = document.createElement('span');
            text.className = 'progress-text';
            text.textContent = `${progress.toFixed(1)}%`;
            text.style.marginLeft = '10px';
            text.style.fontSize = '0.9em';
            text.style.color = '#495057';

            if (textPosition === 'right') {
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.appendChild(text);
            } else if (textPosition === 'inside') {
                text.style.position = 'absolute';
                text.style.left = '50%';
                text.style.top = '50%';
                text.style.transform = 'translate(-50%, -50%)';
                text.style.color = 'white';
                text.style.fontSize = '0.8em';
                text.style.fontWeight = 'bold';
                barWrapper.style.position = 'relative';
                barWrapper.appendChild(text);
            }
        }

        return container;
    },

    update(element, progress) {
        const barFill = element.querySelector('.progress-fill');
        const text = element.querySelector('.progress-text');

        if (barFill) {
            barFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        if (text) {
            text.textContent = `${progress.toFixed(1)}%`;
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化模态框
    Modal.init();

    // 设置今日日期
    const today = new Date();
    const todayStr = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long'
    });

    // 更新页面中的今日日期显示
    const todayDateElements = document.querySelectorAll('.today-date');
    todayDateElements.forEach(el => {
        if (el.textContent.includes('加载中')) {
            el.textContent = todayStr;
        }
    });

    // 检查API状态
    async function checkAPIStatus() {
        const apiStatusElement = document.getElementById('api-status');
        if (!apiStatusElement) return;

        try {
            const isOK = await API.checkAPIStatus();
            apiStatusElement.textContent = `API状态: ${isOK ? '正常' : '异常'}`;
            apiStatusElement.style.color = isOK ? '#4cc9f0' : '#e63946';
        } catch (error) {
            apiStatusElement.textContent = 'API状态: 检查失败';
            apiStatusElement.style.color = '#e63946';
        }
    }

    checkAPIStatus();

    // 刷新按钮事件
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    // 生成今日表格按钮事件
    const generateTodayBtn = document.getElementById('generate-today-btn');
    if (generateTodayBtn) {
        generateTodayBtn.addEventListener('click', async () => {
            try {
                Notification.info('正在生成今日工作表格...');
                const result = await API.generateTodayForms();
                Notification.success(result.message || '今日工作表格生成成功');
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                Notification.error('生成失败: ' + error.message);
            }
        });
    }

    // 查看历史记录按钮事件
    const viewHistoryBtn = document.getElementById('view-history-btn');
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            Modal.alert('历史记录功能正在开发中...', '功能预告');
        });
    }

    // 更新最后更新时间
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `最后更新: ${new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }
});

// 导出全局对象
window.Utils = Utils;
window.API = API;
window.Modal = Modal;
window.Notification = Notification;
window.ProgressBar = ProgressBar;
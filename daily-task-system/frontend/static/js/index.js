/**
 * 首页JavaScript逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 加载今日概览数据
    await loadTodayOverview();

    // 加载最近活动
    await loadRecentActivity();

    // 设置事件监听器
    setupEventListeners();
});

async function loadTodayOverview() {
    try {
        // 获取今日日期
        const today = new Date();
        const todayDateElement = document.getElementById('today-date');
        if (todayDateElement) {
            const dateStr = today.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            todayDateElement.querySelector('.card-value').textContent = dateStr;
        }

        // 获取进度总览
        const overview = await API.getProgressOverview();

        if (overview.projects && overview.projects.length > 0) {
            const project = overview.projects[0];

            // 更新待完成任务
            const pendingTasksElement = document.getElementById('pending-tasks');
            if (pendingTasksElement) {
                const pendingTasks = project.task_count - project.completed_task_count - project.in_progress_task_count;
                pendingTasksElement.querySelector('.card-value').textContent = pendingTasks;
            }

            // 更新已完成任务
            const completedTasksElement = document.getElementById('completed-tasks');
            if (completedTasksElement) {
                completedTasksElement.querySelector('.card-value').textContent = project.completed_task_count;
            }

            // 更新项目进度
            const projectProgressElement = document.getElementById('project-progress');
            if (projectProgressElement) {
                const progress = project.current_progress || 0;
                projectProgressElement.querySelector('.card-value').textContent = Utils.formatProgress(progress);

                // 添加进度条
                const progressBar = ProgressBar.create(progress, {
                    height: '8px',
                    showText: false
                });
                projectProgressElement.querySelector('.card-content').appendChild(progressBar);
            }
        } else {
            // 没有项目数据
            document.querySelectorAll('.card-value').forEach(el => {
                if (el.textContent === '加载中...') {
                    el.textContent = '无数据';
                }
            });
        }

    } catch (error) {
        console.error('加载今日概览失败:', error);
        Notification.error('加载今日概览数据失败');

        // 显示错误状态
        document.querySelectorAll('.card-value').forEach(el => {
            if (el.textContent === '加载中...') {
                el.textContent = '加载失败';
                el.style.color = '#e63946';
            }
        });
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;

    try {
        // 获取最近的每日工作记录
        const dailyWorks = await API.getDailyWorks({
            limit: 10
        });

        if (dailyWorks.length === 0) {
            activityList.innerHTML = '<div class="activity-item">暂无最近活动</div>';
            return;
        }

        // 清空加载状态
        activityList.innerHTML = '';

        // 添加活动项
        dailyWorks.forEach(work => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            const timeStr = Utils.formatDateTime(work.created_at);
            const hoursStr = Utils.formatHours(work.hours_spent);
            const progressStr = work.progress ? `${work.progress}%` : '未记录';

            activityItem.innerHTML = `
                <div class="activity-content">
                    <div class="activity-title">${work.user_name || '用户'} - ${work.task_name || '任务'}</div>
                    <div class="activity-description">
                        ${work.work_content || '无描述'} | 耗时: ${hoursStr} | 进度: ${progressStr}
                    </div>
                </div>
                <div class="activity-time">${timeStr}</div>
            `;

            activityList.appendChild(activityItem);
        });

    } catch (error) {
        console.error('加载最近活动失败:', error);
        activityList.innerHTML = '<div class="activity-item error">加载活动记录失败</div>';
    }
}

function setupEventListeners() {
    // 点击卡片跳转到对应页面
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const cardId = card.id;

            switch (cardId) {
                case 'pending-tasks':
                case 'completed-tasks':
                    window.location.href = 'dashboard.html#tasks';
                    break;
                case 'project-progress':
                    window.location.href = 'dashboard.html';
                    break;
                default:
                    break;
            }
        });
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter: 跳转到填写表单
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            window.location.href = 'daily-form.html';
        }

        // Ctrl + D: 跳转到仪表盘
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        }

        // F5: 刷新数据
        if (e.key === 'F5') {
            e.preventDefault();
            location.reload();
        }
    });

    // 页面可见性变化时刷新数据
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // 页面重新可见时刷新数据
            loadTodayOverview();
            loadRecentActivity();
        }
    });
}

// 自动刷新数据（每5分钟）
setInterval(() => {
    if (!document.hidden) {
        loadTodayOverview();
        loadRecentActivity();
    }
}, 5 * 60 * 1000);
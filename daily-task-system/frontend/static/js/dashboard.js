/**
 * 仪表盘JavaScript逻辑
 */

let currentProjectId = null;
let chartInstances = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 初始化项目选择器
    await initProjectSelector();

    // 初始化图表
    initCharts();

    // 加载初始数据
    if (currentProjectId) {
        await loadDashboardData(currentProjectId);
    }

    // 设置事件监听器
    setupEventListeners();
});

async function initProjectSelector() {
    const select = document.getElementById('project-select');

    try {
        const projects = await API.getProjects();

        if (projects.length === 0) {
            select.innerHTML = '<option value="">暂无项目</option>';
            return;
        }

        // 清空选项
        select.innerHTML = '';

        // 添加项目选项
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.name} (${project.current_progress || 0}%)`;
            select.appendChild(option);
        });

        // 选择第一个项目
        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            select.value = currentProjectId;
        }

    } catch (error) {
        console.error('加载项目列表失败:', error);
        select.innerHTML = '<option value="">加载失败</option>';
        Notification.error('加载项目列表失败');
    }
}

function initCharts() {
    // 进度趋势图
    const progressTrendCtx = document.getElementById('progress-trend-chart').getContext('2d');
    chartInstances.progressTrend = new Chart(progressTrendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '项目进度',
                data: [],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `进度: ${context.raw}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                }
            }
        }
    });

    // 任务分布图
    const taskDistributionCtx = document.getElementById('task-distribution-chart').getContext('2d');
    chartInstances.taskDistribution = new Chart(taskDistributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['待开始', '进行中', '已完成'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#FF6B6B',  // 待开始 - 红色
                    '#4ECDC4',  // 进行中 - 青色
                    '#96CEB4'   // 已完成 - 绿色
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // 工作量分布图
    const workloadCtx = document.getElementById('workload-chart').getContext('2d');
    chartInstances.workload = new Chart(workloadCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '每日工时',
                data: [],
                backgroundColor: '#4361ee',
                borderColor: '#3a0ca3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '工时 (小时)'
                    }
                }
            }
        }
    });

    // 燃尽图
    const burnDownCtx = document.getElementById('burn-down-chart').getContext('2d');
    chartInstances.burnDown = new Chart(burnDownCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '剩余工作量',
                    data: [],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '理想燃尽线',
                    data: [],
                    borderColor: '#4ECDC4',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '剩余工作量'
                    }
                }
            }
        }
    });
}

async function loadDashboardData(projectId) {
    if (!projectId) return;

    try {
        // 显示加载状态
        showLoadingState(true);

        // 并行加载数据
        const [progressData, detailedProgress, chartData] = await Promise.all([
            API.getProgressOverview(projectId),
            API.getDetailedProgress(projectId),
            API.getChartData(projectId, 30)
        ]);

        // 更新统计卡片
        updateStatsCards(progressData, detailedProgress);

        // 更新图表
        updateCharts(chartData);

        // 更新任务列表
        updateTaskList(detailedProgress);

        // 更新详细报告
        updateDetailedReport(detailedProgress);

        // 隐藏加载状态
        showLoadingState(false);

    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        Notification.error('加载数据失败: ' + error.message);
        showLoadingState(false);
    }
}

function updateStatsCards(progressData, detailedProgress) {
    if (!progressData.projects || progressData.projects.length === 0) return;

    const project = progressData.projects[0];
    const summary = detailedProgress.summary;

    // 整体进度
    const overallProgressElement = document.getElementById('overall-progress');
    if (overallProgressElement) {
        const progress = project.current_progress || 0;
        overallProgressElement.textContent = Utils.formatProgress(progress);
        overallProgressElement.style.color = progress >= 100 ? '#4cc9f0' :
                                           progress >= 70 ? '#4361ee' :
                                           progress >= 30 ? '#f72585' : '#e63946';
    }

    // 进度变化
    const progressChangeElement = document.getElementById('progress-change');
    if (progressChangeElement && project.recent_progress_history && project.recent_progress_history.length >= 2) {
        const recentHistory = project.recent_progress_history;
        const current = recentHistory[recentHistory.length - 1].overall_progress;
        const previous = recentHistory[0].overall_progress;
        const change = current - previous;

        progressChangeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        progressChangeElement.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // 任务总数
    const totalTasksElement = document.getElementById('total-tasks');
    if (totalTasksElement && summary) {
        totalTasksElement.textContent = summary.total_tasks;
    }

    // 已完成任务
    const completedTasksElement = document.getElementById('completed-tasks');
    if (completedTasksElement && summary) {
        completedTasksElement.textContent = summary.completed_tasks;
    }

    // 总工时
    const totalHoursElement = document.getElementById('total-hours');
    if (totalHoursElement && summary) {
        totalHoursElement.textContent = Utils.formatHours(summary.total_actual_hours);
    }

    // 日均工时
    const avgDailyHoursElement = document.getElementById('avg-daily-hours');
    if (avgDailyHoursElement && summary && summary.total_actual_hours && project.start_date) {
        const startDate = new Date(project.start_date);
        const today = new Date();
        const daysDiff = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
        const avgHours = summary.total_actual_hours / daysDiff;
        avgDailyHoursElement.textContent = Utils.formatHours(avgHours);
    }

    // 项目周期
    const projectDurationElement = document.getElementById('project-duration');
    const daysRemainingElement = document.getElementById('days-remaining');
    if (projectDurationElement && project.start_date) {
        const startDate = new Date(project.start_date);
        const today = new Date();
        const daysDiff = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        projectDurationElement.textContent = `${daysDiff} 天`;

        if (project.end_date) {
            const endDate = new Date(project.end_date);
            const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            daysRemainingElement.textContent = `${Math.max(0, remainingDays)} 天`;
            daysRemainingElement.style.color = remainingDays < 7 ? '#e63946' :
                                              remainingDays < 14 ? '#f72585' : '#4361ee';
        }
    }
}

function updateCharts(chartData) {
    if (!chartData) return;

    // 更新进度趋势图
    if (chartData.progress_history && chartInstances.progressTrend) {
        const history = chartData.progress_history;
        const labels = history.map(h => Utils.formatDate(h.record_date));
        const data = history.map(h => h.overall_progress);

        chartInstances.progressTrend.data.labels = labels;
        chartInstances.progressTrend.data.datasets[0].data = data;
        chartInstances.progressTrend.update();
    }

    // 更新任务分布图
    if (chartData.task_distribution && chartInstances.taskDistribution) {
        const distribution = chartData.task_distribution;
        const pending = distribution.filter(t => t.status === 'pending').length;
        const inProgress = distribution.filter(t => t.status === 'in_progress').length;
        const completed = distribution.filter(t => t.status === 'completed').length;

        chartInstances.taskDistribution.data.datasets[0].data = [pending, inProgress, completed];
        chartInstances.taskDistribution.update();
    }

    // 更新工作量分布图
    if (chartData.daily_hours && chartInstances.workload) {
        const dailyHours = chartData.daily_hours.slice(-14); // 最近14天
        const labels = dailyHours.map(d => Utils.formatDate(d.date));
        const data = dailyHours.map(d => d.hours);

        chartInstances.workload.data.labels = labels;
        chartInstances.workload.data.datasets[0].data = data;
        chartInstances.workload.update();
    }

    // 更新燃尽图
    if (chartData.progress_history && chartInstances.burnDown) {
        const history = chartData.progress_history;
        const labels = history.map(h => Utils.formatDate(h.record_date));

        // 计算剩余工作量（假设总工作量为100）
        const totalWork = 100;
        const remainingWork = history.map(h => totalWork - h.overall_progress);

        // 理想燃尽线（线性减少）
        const idealBurnDown = history.map((_, index) => {
            const days = history.length;
            return totalWork * (1 - index / (days - 1));
        });

        chartInstances.burnDown.data.labels = labels;
        chartInstances.burnDown.data.datasets[0].data = remainingWork;
        chartInstances.burnDown.data.datasets[1].data = idealBurnDown;
        chartInstances.burnDown.update();
    }
}

function updateTaskList(detailedProgress) {
    const tableBody = document.getElementById('tasks-table-body');
    if (!tableBody || !detailedProgress.tasks) return;

    // 清空表格
    tableBody.innerHTML = '';

    // 获取过滤器值
    const filter = document.getElementById('task-filter').value;

    // 过滤任务
    const filteredTasks = detailedProgress.tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    if (filteredTasks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <p>没有找到符合条件的任务</p>
                </td>
            </tr>
        `;
        return;
    }

    // 添加任务行
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');

        // 进度条HTML
        const progressBar = ProgressBar.create(task.progress, {
            height: '8px',
            showText: false
        }).outerHTML;

        // 状态徽章
        const statusClass = `status-${task.status.replace('_', '-')}`;
        const statusText = task.status === 'pending' ? '待开始' :
                          task.status === 'in_progress' ? '进行中' :
                          task.status === 'completed' ? '已完成' : task.status;

        row.innerHTML = `
            <td>
                <strong>${task.name}</strong>
                ${task.description ? `<br><small style="color: #6c757d;">${task.description}</small>` : ''}
            </td>
            <td>${task.assignee_name || '未分配'}</td>
            <td>
                <span style="color: ${
                    task.priority === 'high' ? '#e63946' :
                    task.priority === 'medium' ? '#f72585' : '#4361ee'
                }">
                    ${task.priority === 'high' ? '高' :
                      task.priority === 'medium' ? '中' : '低'}
                </span>
            </td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="progress-cell">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${progressBar}
                    <span style="min-width: 40px;">${task.progress.toFixed(1)}%</span>
                </div>
            </td>
            <td>${Utils.formatHours(task.estimated_hours)}</td>
            <td>${Utils.formatHours(task.actual_hours)}</td>
            <td>${Utils.formatDate(task.due_date)}</td>
            <td>
                <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8em;" onclick="viewTaskDetails(${task.id})">
                    <i class="fas fa-eye"></i> 查看
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function updateDetailedReport(detailedProgress) {
    const reportElement = document.getElementById('detailed-report');
    if (!reportElement || !detailedProgress) return;

    const project = detailedProgress.project;
    const summary = detailedProgress.summary;

    // 计算效率指标
    const efficiency = summary.total_estimated_hours > 0 ?
        (summary.total_actual_hours / summary.total_estimated_hours * 100).toFixed(1) : '--';

    const avgTaskProgress = summary.total_tasks > 0 ?
        (summary.overall_progress / summary.total_tasks).toFixed(1) : 0;

    const completionRate = summary.total_tasks > 0 ?
        (summary.completed_tasks / summary.total_tasks * 100).toFixed(1) : 0;

    reportElement.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            <div class="stat-card">
                <h4><i class="fas fa-chart-line"></i> 项目概览</h4>
                <div style="margin-top: 1rem;">
                    <p><strong>项目名称:</strong> ${project.name}</p>
                    <p><strong>项目状态:</strong> ${project.status === 'active' ? '进行中' :
                                                 project.status === 'completed' ? '已完成' :
                                                 project.status === 'paused' ? '已暂停' : project.status}</p>
                    <p><strong>开始日期:</strong> ${Utils.formatDate(project.start_date)}</p>
                    <p><strong>结束日期:</strong> ${Utils.formatDate(project.end_date)}</p>
                    <p><strong>目标进度:</strong> ${project.target_progress}%</p>
                </div>
            </div>

            <div class="stat-card">
                <h4><i class="fas fa-tachometer-alt"></i> 效率指标</h4>
                <div style="margin-top: 1rem;">
                    <p><strong>预估工时完成率:</strong> ${efficiency}%</p>
                    <p><strong>任务平均进度:</strong> ${avgTaskProgress}%</p>
                    <p><strong>任务完成率:</strong> ${completionRate}%</p>
                    <p><strong>日均工时:</strong> ${Utils.formatHours(summary.total_actual_hours / 30)}</p>
                    <p><strong>任务进度方差:</strong> ${calculateProgressVariance(detailedProgress.tasks)}%</p>
                </div>
            </div>

            <div class="stat-card">
                <h4><i class="fas fa-lightbulb"></i> 关键发现</h4>
                <div style="margin-top: 1rem;">
                    <p><strong>最快完成的任务:</strong> ${findFastestCompletedTask(detailedProgress.tasks)}</p>
                    <p><strong>最耗时的任务:</strong> ${findMostTimeConsumingTask(detailedProgress.tasks)}</p>
                    <p><strong>进度最快的成员:</strong> ${findMostProductiveMember(detailedProgress.tasks)}</p>
                    <p><strong>风险最高的任务:</strong> ${findHighestRiskTask(detailedProgress.tasks)}</p>
                    <p><strong>建议:</strong> ${generateRecommendations(summary)}</p>
                </div>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h4><i class="fas fa-history"></i> 最近进展</h4>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                ${generateRecentProgressHTML(detailedProgress.tasks)}
            </div>
        </div>
    `;
}

// 辅助函数
function showLoadingState(show) {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => {
        el.style.display = show ? 'block' : 'none';
    });
}

function calculateProgressVariance(tasks) {
    if (!tasks || tasks.length === 0) return 0;

    const progresses = tasks.map(t => t.progress);
    const mean = progresses.reduce((a, b) => a + b, 0) / progresses.length;
    const variance = progresses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / progresses.length;

    return Math.sqrt(variance).toFixed(1);
}

function findFastestCompletedTask(tasks) {
    const completed = tasks.filter(t => t.status === 'completed');
    if (completed.length === 0) return '暂无';

    const fastest = completed.reduce((a, b) =>
        (a.actual_hours || Infinity) < (b.actual_hours || Infinity) ? a : b
    );

    return `${fastest.name} (${Utils.formatHours(fastest.actual_hours)})`;
}

function findMostTimeConsumingTask(tasks) {
    if (tasks.length === 0) return '暂无';

    const mostTime = tasks.reduce((a, b) =>
        (a.actual_hours || 0) > (b.actual_hours || 0) ? a : b
    );

    return `${mostTime.name} (${Utils.formatHours(mostTime.actual_hours)})`;
}

function findMostProductiveMember(tasks) {
    // 这里简化处理，实际应该根据用户分组计算
    return '待实现';
}

function findHighestRiskTask(tasks) {
    const riskyTasks = tasks.filter(t =>
        t.status !== 'completed' &&
        t.due_date &&
        new Date(t.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    if (riskyTasks.length === 0) return '暂无';

    const highestRisk = riskyTasks.reduce((a, b) =>
        a.progress < b.progress ? a : b
    );

    return `${highestRisk.name} (进度: ${highestRisk.progress}%)`;
}

function generateRecommendations(summary) {
    const recommendations = [];

    if (summary.overall_progress < 30 && summary.total_tasks > 10) {
        recommendations.push('项目初期进度较慢，建议加强资源投入');
    }

    if (summary.completed_tasks / summary.total_tasks < 0.3) {
        recommendations.push('任务完成率较低，需要关注阻塞问题');
    }

    if (summary.total_actual_hours > summary.total_estimated_hours * 1.2) {
        recommendations.push('实际工时超出预估，需要调整计划或增加资源');
    }

    return recommendations.length > 0 ? recommendations.join('; ') : '项目进展良好，继续保持';
}

function generateRecentProgressHTML(tasks) {
    const recentTasks = tasks
        .filter(t => t.status === 'in_progress' || t.status === 'completed')
        .slice(0, 5);

    if (recentTasks.length === 0) {
        return '<p>暂无最近进展</p>';
    }

    return recentTasks.map(task => `
        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between;">
                <strong>${task.name}</strong>
                <span class="status-badge status-${task.status.replace('_', '-')}">
                    ${task.status === 'completed' ? '已完成' : '进行中'}
                </span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9em; color: #6c757d;">
                <span>进度: ${task.progress}%</span>
                <span>工时: ${Utils.formatHours(task.actual_hours)}</span>
                ${task.due_date ? `<span>截止: ${Utils.formatDate(task.due_date)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// 事件监听器
function setupEventListeners() {
    // 项目选择器变化
    const projectSelect = document.getElementById('project-select');
    if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
            currentProjectId = e.target.value;
            if (currentProjectId) {
                loadDashboardData(currentProjectId);
            }
        });
    }

    // 趋势周期选择
    const trendPeriodSelect = document.getElementById('trend-period');
    if (trendPeriodSelect) {
        trendPeriodSelect.addEventListener('change', (e) => {
            if (currentProjectId) {
                loadChartData(currentProjectId, parseInt(e.target.value));
            }
        });
    }

    // 工作量周期选择
    const workloadPeriodSelect = document.getElementById('workload-period');
    if (workloadPeriodSelect) {
        workloadPeriodSelect.addEventListener('change', (e) => {
            if (currentProjectId) {
                updateWorkloadChart(currentProjectId, parseInt(e.target.value));
            }
        });
    }

    // 任务过滤器
    const taskFilter = document.getElementById('task-filter');
    if (taskFilter) {
        taskFilter.addEventListener('change', () => {
            if (currentProjectId) {
                loadDashboardData(currentProjectId);
            }
        });
    }

    // 导出报告按钮
    const exportBtn = document.getElementById('export-report-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            Modal.alert('导出功能正在开发中...', '功能预告');
        });
    }

    // 查看任务详情
    window.viewTaskDetails = (taskId) => {
        Modal.alert(`查看任务 ${taskId} 的详情功能正在开发中...`, '功能预告');
    };
}

// 单独加载图表数据
async function loadChartData(projectId, days) {
    try {
        const chartData = await API.getChartData(projectId, days);
        updateCharts(chartData);
    } catch (error) {
        console.error('加载图表数据失败:', error);
        Notification.error('加载图表数据失败');
    }
}

// 更新工作量图表
async function updateWorkloadChart(projectId, days) {
    try {
        const chartData = await API.getChartData(projectId, days);
        if (chartData.daily_hours && chartInstances.workload) {
            const dailyHours = chartData.daily_hours.slice(-days);
            const labels = dailyHours.map(d => Utils.formatDate(d.date));
            const data = dailyHours.map(d => d.hours);

            chartInstances.workload.data.labels = labels;
            chartInstances.workload.data.datasets[0].data = data;
            chartInstances.workload.update();
        }
    } catch (error) {
        console.error('更新工作量图表失败:', error);
    }
}

// 自动刷新数据（每2分钟）
setInterval(() => {
    if (currentProjectId && !document.hidden) {
        loadDashboardData(currentProjectId);
    }
}, 2 * 60 * 1000);
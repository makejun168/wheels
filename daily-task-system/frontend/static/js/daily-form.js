/**
 * 每日工作填写表单JavaScript逻辑
 */

let todayTasks = [];
let formData = {};

document.addEventListener('DOMContentLoaded', async () => {
    // 设置今日日期
    const today = new Date();
    const todayStr = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    document.getElementById('today-date').textContent = `今天是：${todayStr}`;

    // 加载今日任务
    await loadTodayTasks();

    // 设置事件监听器
    setupEventListeners();

    // 从本地存储恢复草稿
    restoreDraft();
});

async function loadTodayTasks() {
    const loadingElement = document.getElementById('loading');
    const formElement = document.getElementById('daily-work-form');
    const noTasksElement = document.getElementById('no-tasks-message');

    try {
        // 获取今日工作数据
        const todayWork = await API.getTodayWork();

        if (!todayWork.tasks || todayWork.tasks.length === 0) {
            // 没有任务
            loadingElement.style.display = 'none';
            noTasksElement.style.display = 'block';
            return;
        }

        // 过滤出需要填写的任务（没有记录或状态为草稿）
        todayTasks = todayWork.tasks.filter(task => {
            return !task.has_record || (task.daily_work && task.daily_work.status === 'draft');
        });

        if (todayTasks.length === 0) {
            // 所有任务都已提交
            loadingElement.style.display = 'none';
            noTasksElement.style.display = 'block';

            const message = noTasksElement.querySelector('p');
            message.textContent = '所有任务今日已填写完成！';

            return;
        }

        // 更新任务摘要
        document.getElementById('task-summary').textContent =
            `待完成任务：${todayTasks.length} 个`;

        // 生成任务表单
        generateTaskForms();

        // 显示表单
        loadingElement.style.display = 'none';
        formElement.style.display = 'block';

        // 初始化表单数据
        initializeFormData();

    } catch (error) {
        console.error('加载今日任务失败:', error);
        loadingElement.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: #e63946; margin-bottom: 1rem;"></i>
                <p>加载失败: ${error.message}</p>
                <button class="btn" onclick="location.reload()">
                    <i class="fas fa-redo"></i> 重新加载
                </button>
            </div>
        `;
    }
}

function generateTaskForms() {
    const container = document.getElementById('task-forms-container');
    container.innerHTML = '';

    todayTasks.forEach((taskData, index) => {
        const task = taskData.task;
        const dailyWork = taskData.daily_work;
        const taskId = task.id;

        const taskForm = document.createElement('div');
        taskForm.className = 'task-form';
        taskForm.dataset.taskId = taskId;
        taskForm.style.padding = '1.5rem';
        taskForm.style.marginBottom = '1.5rem';
        taskForm.style.border = '1px solid #e9ecef';
        taskForm.style.borderRadius = '8px';
        taskForm.style.backgroundColor = '#f8f9fa';

        // 任务标题和基本信息
        taskForm.innerHTML = `
            <div class="task-header" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="task-number" style="background: #4361ee; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.9em;">
                                ${index + 1}
                            </span>
                            ${task.name}
                        </h3>
                        <p style="margin: 0.25rem 0 0 0; color: #6c757d; font-size: 0.9em;">
                            ${task.description || '无描述'}
                        </p>
                    </div>
                    <div>
                        <span class="status-badge status-${task.status}" style="font-size: 0.8em;">
                            ${task.status === 'pending' ? '待开始' :
                              task.status === 'in_progress' ? '进行中' :
                              task.status === 'completed' ? '已完成' : task.status}
                        </span>
                    </div>
                </div>
                <div style="display: flex; gap: 2rem; margin-top: 0.5rem; font-size: 0.9em; color: #6c757d;">
                    <div>
                        <i class="fas fa-user"></i> 负责人: ${task.assignee_name || '未分配'}
                    </div>
                    <div>
                        <i class="fas fa-flag"></i> 优先级:
                        <span style="color: ${
                            task.priority === 'high' ? '#e63946' :
                            task.priority === 'medium' ? '#f72585' : '#4361ee'
                        }">
                            ${task.priority === 'high' ? '高' :
                              task.priority === 'medium' ? '中' : '低'}
                        </span>
                    </div>
                    <div>
                        <i class="fas fa-chart-line"></i> 当前进度: ${task.progress}%
                    </div>
                </div>
            </div>

            <div class="task-form-fields" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-tasks"></i> 工作内容
                    </label>
                    <textarea
                        class="form-control work-content"
                        data-field="work_content"
                        rows="3"
                        placeholder="请描述今天在这个任务上完成的具体工作..."
                        required
                    >${dailyWork ? dailyWork.work_content || '' : ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-clock"></i> 花费时间 (小时)
                    </label>
                    <input
                        type="number"
                        class="form-control hours-spent"
                        data-field="hours_spent"
                        min="0"
                        max="24"
                        step="0.5"
                        placeholder="例如: 3.5"
                        value="${dailyWork ? dailyWork.hours_spent || '0' : '0'}"
                        required
                    >
                    <small style="color: #6c757d; display: block; margin-top: 0.25rem;">
                        请输入0-24之间的数字，支持小数（如3.5表示3个半小时）
                    </small>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-percentage"></i> 今日进度 (%)
                    </label>
                    <input
                        type="range"
                        class="form-control progress-slider"
                        data-field="progress"
                        min="0"
                        max="100"
                        step="5"
                        value="${dailyWork ? dailyWork.progress || task.progress : task.progress}"
                    >
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                        <span class="progress-min">0%</span>
                        <span class="progress-value" style="font-weight: bold;">
                            ${dailyWork ? dailyWork.progress || task.progress : task.progress}%
                        </span>
                        <span class="progress-max">100%</span>
                    </div>
                    <div class="progress-bar" style="margin-top: 0.5rem; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                        <div class="progress-fill" style="height: 100%; width: ${dailyWork ? dailyWork.progress || task.progress : task.progress}%; background: linear-gradient(90deg, #4361ee, #3a0ca3); border-radius: 4px;"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">
                        <i class="fas fa-sticky-note"></i> 备注
                    </label>
                    <textarea
                        class="form-control notes"
                        data-field="notes"
                        rows="2"
                        placeholder="其他需要记录的事项..."
                    ></textarea>
                </div>
            </div>
        `;

        // 添加事件监听器
        const progressSlider = taskForm.querySelector('.progress-slider');
        const progressValue = taskForm.querySelector('.progress-value');
        const progressFill = taskForm.querySelector('.progress-fill');

        progressSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            progressValue.textContent = `${value}%`;
            progressFill.style.width = `${value}%`;
            updateFormStats();
        });

        // 监听其他字段变化
        const fields = taskForm.querySelectorAll('input, textarea');
        fields.forEach(field => {
            field.addEventListener('input', () => {
                updateFormStats();
                saveDraft();
            });
            field.addEventListener('change', () => {
                updateFormStats();
                saveDraft();
            });
        });

        container.appendChild(taskForm);
    });

    // 更新表单统计
    updateFormStats();
}

function initializeFormData() {
    formData = {
        tasks: {},
        summary: '',
        issues: '',
        solutions: '',
        tomorrowPlan: ''
    };

    // 初始化每个任务的数据
    todayTasks.forEach(taskData => {
        const task = taskData.task;
        const dailyWork = taskData.daily_work;

        formData.tasks[task.id] = {
            task_id: task.id,
            work_content: dailyWork ? dailyWork.work_content || '' : '',
            hours_spent: dailyWork ? dailyWork.hours_spent || 0 : 0,
            progress: dailyWork ? dailyWork.progress || task.progress : task.progress,
            notes: ''
        };
    });

    // 设置默认用户ID（这里假设第一个用户）
    API.getUsers().then(users => {
        if (users && users.length > 0) {
            formData.user_id = users[0].id;
        }
    });
}

function updateFormStats() {
    let totalHours = 0;
    let totalProgress = 0;
    let taskCount = 0;

    // 遍历所有任务表单
    document.querySelectorAll('.task-form').forEach(taskForm => {
        const taskId = taskForm.dataset.taskId;

        // 获取小时数
        const hoursInput = taskForm.querySelector('.hours-spent');
        const hours = parseFloat(hoursInput.value) || 0;

        // 获取进度
        const progressInput = taskForm.querySelector('.progress-slider');
        const progress = parseFloat(progressInput.value) || 0;

        totalHours += hours;
        totalProgress += progress;
        taskCount++;

        // 更新formData
        if (formData.tasks[taskId]) {
            formData.tasks[taskId].hours_spent = hours;
            formData.tasks[taskId].progress = progress;

            // 更新工作内容
            const workContent = taskForm.querySelector('.work-content');
            if (workContent) {
                formData.tasks[taskId].work_content = workContent.value;
            }

            // 更新备注
            const notes = taskForm.querySelector('.notes');
            if (notes) {
                formData.tasks[taskId].notes = notes.value;
            }
        }
    });

    // 更新总工时显示
    const totalHoursElement = document.getElementById('total-hours');
    if (totalHoursElement) {
        totalHoursElement.querySelector('span').textContent = totalHours.toFixed(1);
    }

    // 更新平均进度显示
    const avgProgressElement = document.getElementById('avg-progress');
    if (avgProgressElement) {
        const avgProgress = taskCount > 0 ? totalProgress / taskCount : 0;
        avgProgressElement.querySelector('span').textContent = avgProgress.toFixed(1);
    }

    // 更新总结字段
    formData.summary = document.getElementById('daily-summary').value;
    formData.issues = document.getElementById('daily-issues').value;
    formData.solutions = document.getElementById('daily-solutions').value;
    formData.tomorrowPlan = document.getElementById('tomorrow-plan').value;
}

function setupEventListeners() {
    const form = document.getElementById('daily-work-form');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const submitBtn = document.getElementById('submit-btn');
    const generateTodayTasksBtn = document.getElementById('generate-today-tasks-btn');

    // 表单提交
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await submitForm();
        });
    }

    // 保存草稿
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            saveDraft();
            Notification.success('草稿已保存到本地');
        });
    }

    // 生成今日任务按钮
    if (generateTodayTasksBtn) {
        generateTodayTasksBtn.addEventListener('click', async () => {
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

    // 监听所有表单字段变化
    document.addEventListener('input', () => {
        updateFormStats();
    });

    // 自动保存草稿（每30秒）
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            saveDraft();
        }
    }, 30000);
}

function saveDraft() {
    try {
        updateFormStats();

        const draft = {
            formData,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        localStorage.setItem('dailyWorkDraft', JSON.stringify(draft));
    } catch (error) {
        console.error('保存草稿失败:', error);
    }
}

function restoreDraft() {
    try {
        const draftStr = localStorage.getItem('dailyWorkDraft');
        if (!draftStr) return;

        const draft = JSON.parse(draftStr);
        if (!draft.formData || !draft.formData.tasks) return;

        // 检查草稿是否过期（超过1天）
        const draftTime = new Date(draft.timestamp);
        const now = new Date();
        const hoursDiff = (now - draftTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            localStorage.removeItem('dailyWorkDraft');
            return;
        }

        // 恢复任务数据
        Object.keys(draft.formData.tasks).forEach(taskId => {
            const taskData = draft.formData.tasks[taskId];
            const taskForm = document.querySelector(`.task-form[data-task-id="${taskId}"]`);

            if (taskForm && taskData) {
                // 恢复工作内容
                const workContent = taskForm.querySelector('.work-content');
                if (workContent && taskData.work_content) {
                    workContent.value = taskData.work_content;
                }

                // 恢复小时数
                const hoursSpent = taskForm.querySelector('.hours-spent');
                if (hoursSpent && taskData.hours_spent !== undefined) {
                    hoursSpent.value = taskData.hours_spent;
                }

                // 恢复进度
                const progressSlider = taskForm.querySelector('.progress-slider');
                const progressValue = taskForm.querySelector('.progress-value');
                const progressFill = taskForm.querySelector('.progress-fill');
                if (progressSlider && taskData.progress !== undefined) {
                    progressSlider.value = taskData.progress;
                    if (progressValue) progressValue.textContent = `${taskData.progress}%`;
                    if (progressFill) progressFill.style.width = `${taskData.progress}%`;
                }

                // 恢复备注
                const notes = taskForm.querySelector('.notes');
                if (notes && taskData.notes) {
                    notes.value = taskData.notes;
                }
            }
        });

        // 恢复总结字段
        const summary = document.getElementById('daily-summary');
        const issues = document.getElementById('daily-issues');
        const solutions = document.getElementById('daily-solutions');
        const tomorrowPlan = document.getElementById('tomorrow-plan');

        if (summary && draft.formData.summary) summary.value = draft.formData.summary;
        if (issues && draft.formData.issues) issues.value = draft.formData.issues;
        if (solutions && draft.formData.solutions) solutions.value = draft.formData.solutions;
        if (tomorrowPlan && draft.formData.tomorrowPlan) tomorrowPlan.value = draft.formData.tomorrowPlan;

        // 更新表单数据
        formData = draft.formData;
        updateFormStats();

        Notification.info('已恢复上次保存的草稿', 'info', 5000);

    } catch (error) {
        console.error('恢复草稿失败:', error);
        localStorage.removeItem('dailyWorkDraft');
    }
}

async function submitForm() {
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.innerHTML;

    try {
        // 禁用提交按钮
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';

        // 验证表单
        if (!validateForm()) {
            throw new Error('请填写所有必填字段');
        }

        // 准备提交数据
        const works = [];
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 获取用户ID（假设第一个用户）
        const users = await API.getUsers();
        const userId = users && users.length > 0 ? users[0].id : 1;

        Object.keys(formData.tasks).forEach(taskId => {
            const task = formData.tasks[taskId];

            works.push({
                task_id: parseInt(taskId),
                user_id: userId,
                work_date: today,
                work_content: task.work_content,
                hours_spent: parseFloat(task.hours_spent),
                progress: parseFloat(task.progress),
                issues: formData.issues,
                solutions: formData.solutions,
                next_plan: formData.tomorrowPlan,
                status: 'submitted'
            });
        });

        // 提交数据
        const result = await API.submitBatchDailyWork(works);

        if (result.errors && result.errors.length > 0) {
            console.warn('部分任务提交失败:', result.errors);
            Notification.warning(`成功提交${result.success_count}个任务，失败${result.error_count}个`);
        } else {
            Notification.success(`成功提交${result.success_count}个任务`);
        }

        // 清除草稿
        localStorage.removeItem('dailyWorkDraft');

        // 显示成功消息并跳转
        setTimeout(() => {
            Modal.alert('工作内容已成功提交！数据已同步到项目总表。', '提交成功');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }, 500);

    } catch (error) {
        console.error('提交失败:', error);
        Notification.error('提交失败: ' + error.message);

        // 恢复提交按钮
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function validateForm() {
    let isValid = true;
    const errors = [];

    // 检查每个任务表单
    document.querySelectorAll('.task-form').forEach(taskForm => {
        const workContent = taskForm.querySelector('.work-content');
        const hoursSpent = taskForm.querySelector('.hours-spent');

        if (!workContent.value.trim()) {
            errors.push('请填写工作内容');
            workContent.style.borderColor = '#e63946';
            isValid = false;
        } else {
            workContent.style.borderColor = '';
        }

        if (!hoursSpent.value || parseFloat(hoursSpent.value) <= 0) {
            errors.push('请填写有效的工作时间');
            hoursSpent.style.borderColor = '#e63946';
            isValid = false;
        } else {
            hoursSpent.style.borderColor = '';
        }
    });

    if (errors.length > 0) {
        Modal.alert(errors.join('<br>'), '表单验证失败');
    }

    return isValid;
}
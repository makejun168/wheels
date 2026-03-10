"""
定时任务调度
"""

import logging
from datetime import datetime, date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from backend import db
from backend.models import User, Project, Task, DailyWork, ProgressHistory
from backend.config import Config

logger = logging.getLogger(__name__)

# 全局应用实例（在init_scheduler中设置）
current_app = None

def init_scheduler(app):
    """初始化定时任务调度器"""
    global current_app
    current_app = app

    scheduler = BackgroundScheduler()

    # 添加定时任务
    try:
        # 每日生成工作表格任务（每天凌晨00:05）
        scheduler.add_job(
            func=generate_daily_work_forms,
            trigger=CronTrigger(
                hour=Config.DAILY_TASK_GENERATE_HOUR,
                minute=Config.DAILY_TASK_GENERATE_MINUTE
            ),
            id='generate_daily_work_forms',
            name='生成每日工作表格',
            replace_existing=True
        )

        # 每日进度记录任务（每天23:30）
        scheduler.add_job(
            func=record_daily_progress,
            trigger=CronTrigger(hour=23, minute=30),
            id='record_daily_progress',
            name='记录每日进度',
            replace_existing=True
        )

        # 每周进度报告任务（每周一早上9:00）
        scheduler.add_job(
            func=generate_weekly_report,
            trigger=CronTrigger(day_of_week='mon', hour=9, minute=0),
            id='generate_weekly_report',
            name='生成周报',
            replace_existing=True
        )

        logger.info("定时任务调度器初始化完成")

    except Exception as e:
        logger.error(f"定时任务调度器初始化失败: {e}")
        raise

    return scheduler

def generate_daily_work_forms():
    """生成每日工作表格"""
    if not current_app:
        logger.error("应用未初始化")
        return

    with current_app.app_context():
        try:
        today = date.today()
        logger.info(f"开始生成{today}的工作表格")

        # 获取所有活跃项目
        active_projects = Project.query.filter_by(status='active').all()

        if not active_projects:
            logger.info("没有活跃项目，跳过生成工作表格")
            return

        # 获取默认用户（第一个用户）
        default_user = User.query.first()
        if not default_user:
            logger.warning("没有用户，无法生成工作表格")
            return

        generated_count = 0
        existing_count = 0

        for project in active_projects:
            # 获取项目中所有未完成的任务
            incomplete_tasks = Task.query.filter(
                Task.project_id == project.id,
                Task.status.in_(['pending', 'in_progress'])
            ).all()

            for task in incomplete_tasks:
                # 检查是否已存在今日记录
                existing_work = DailyWork.query.filter_by(
                    task_id=task.id,
                    work_date=today
                ).first()

                if existing_work:
                    existing_count += 1
                    continue

                # 创建新的每日工作记录（草稿状态）
                daily_work = DailyWork(
                    task_id=task.id,
                    user_id=default_user.id,
                    work_date=today,
                    work_content=f"待填写 - {task.name}",
                    hours_spent=0.0,
                    progress=task.progress,
                    status='draft'
                )

                db.session.add(daily_work)
                generated_count += 1

        db.session.commit()
        logger.info(f"工作表格生成完成: 新增{generated_count}条，已存在{existing_count}条")

    except Exception as e:
        db.session.rollback()
        logger.error(f"生成工作表格失败: {e}")

def record_daily_progress():
    """记录每日进度"""
    try:
        today = date.today()
        logger.info(f"开始记录{today}的进度")

        # 获取所有活跃项目
        active_projects = Project.query.filter_by(status='active').all()

        for project in active_projects:
            # 计算项目当前进度
            current_progress = project.calculate_progress()

            # 获取项目任务统计
            tasks = Task.query.filter_by(project_id=project.id).all()
            completed_tasks = len([t for t in tasks if t.status == 'completed'])

            # 计算总耗时
            total_hours = db.session.query(db.func.sum(DailyWork.hours_spent)) \
                .join(Task) \
                .filter(Task.project_id == project.id) \
                .scalar() or 0.0

            # 检查是否已记录
            from backend.models import ProgressHistory
            existing = ProgressHistory.query.filter_by(
                project_id=project.id,
                record_date=today
            ).first()

            if existing:
                # 更新现有记录
                existing.overall_progress = current_progress
                existing.completed_tasks = completed_tasks
                existing.total_tasks = len(tasks)
                existing.total_hours_spent = total_hours
            else:
                # 创建新记录
                progress_history = ProgressHistory(
                    project_id=project.id,
                    record_date=today,
                    overall_progress=current_progress,
                    completed_tasks=completed_tasks,
                    total_tasks=len(tasks),
                    total_hours_spent=total_hours
                )
                db.session.add(progress_history)

        db.session.commit()
        logger.info(f"进度记录完成，共处理{len(active_projects)}个项目")

    except Exception as e:
        db.session.rollback()
        logger.error(f"记录进度失败: {e}")

def generate_weekly_report():
    """生成每周进度报告"""
    try:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())  # 本周一
        week_end = week_start + timedelta(days=6)  # 本周日

        logger.info(f"开始生成{week_start}到{week_end}的周报")

        # 获取所有项目
        projects = Project.query.all()

        report_data = {
            'period': {
                'start': week_start.isoformat(),
                'end': week_end.isoformat(),
                'generated_at': datetime.now().isoformat()
            },
            'summary': {
                'total_projects': len(projects),
                'active_projects': len([p for p in projects if p.status == 'active']),
                'completed_projects': len([p for p in projects if p.status == 'completed']),
                'total_tasks_completed': 0,
                'total_hours_spent': 0.0
            },
            'projects': []
        }

        for project in projects:
            # 获取项目任务
            tasks = Task.query.filter_by(project_id=project.id).all()

            # 获取本周的每日工作记录
            weekly_works = DailyWork.query \
                .join(Task) \
                .filter(
                    Task.project_id == project.id,
                    DailyWork.work_date >= week_start,
                    DailyWork.work_date <= week_end
                ).all()

            # 计算本周完成的任务
            tasks_completed_this_week = []
            for task in tasks:
                # 检查任务是否在本周完成
                completion_works = DailyWork.query.filter(
                    DailyWork.task_id == task.id,
                    DailyWork.progress >= 100,
                    DailyWork.work_date >= week_start,
                    DailyWork.work_date <= week_end
                ).all()

                if completion_works:
                    tasks_completed_this_week.append({
                        'id': task.id,
                        'name': task.name,
                        'completed_date': completion_works[0].work_date.isoformat()
                    })

            # 计算本周总工时
            weekly_hours = sum(work.hours_spent for work in weekly_works)

            project_report = {
                'id': project.id,
                'name': project.name,
                'current_progress': project.calculate_progress(),
                'tasks_completed_this_week': len(tasks_completed_this_week),
                'tasks_completed_details': tasks_completed_this_week,
                'weekly_hours_spent': weekly_hours,
                'task_count': len(tasks),
                'status': project.status
            }

            report_data['projects'].append(project_report)

            # 更新汇总数据
            report_data['summary']['total_tasks_completed'] += len(tasks_completed_this_week)
            report_data['summary']['total_hours_spent'] += weekly_hours

        # 这里可以添加发送邮件的逻辑
        # send_email_report(report_data)

        logger.info(f"周报生成完成: {report_data['summary']}")

        # 保存报告到文件（示例）
        import json
        report_file = f"../reports/weekly_report_{today.strftime('%Y%m%d')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        logger.info(f"周报已保存到: {report_file}")

    except Exception as e:
        logger.error(f"生成周报失败: {e}")

def cleanup_old_data():
    """清理旧数据"""
    try:
        # 保留最近90天的数据
        cutoff_date = date.today() - timedelta(days=90)

        # 清理旧的进度历史记录
        deleted_count = ProgressHistory.query.filter(
            ProgressHistory.record_date < cutoff_date
        ).delete()

        db.session.commit()
        logger.info(f"清理了{deleted_count}条旧进度历史记录")

    except Exception as e:
        db.session.rollback()
        logger.error(f"清理旧数据失败: {e}")

def manual_generate_today_forms():
    """手动生成今日工作表格（用于测试）"""
    """这个函数可以在需要时手动调用"""
    generate_daily_work_forms()
    return {"message": "今日工作表格已生成"}

def manual_record_progress():
    """手动记录当前进度（用于测试）"""
    record_daily_progress()
    return {"message": "进度已记录"}

if __name__ == "__main__":
    # 测试定时任务
    with app.app_context():
        print("测试定时任务...")
        generate_daily_work_forms()
        record_daily_progress()
        print("测试完成")
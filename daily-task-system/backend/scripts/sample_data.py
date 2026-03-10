"""
示例数据填充脚本
"""

import random
from datetime import datetime, date, timedelta
from backend import db
from backend.models import User, Project, Task, DailyWork, ProgressHistory
from backend.config import Config

def create_sample_data():
    """创建示例数据"""
    print("开始创建示例数据...")

    # 清空现有数据（按正确顺序）
    db.session.query(DailyWork).delete()
    db.session.query(ProgressHistory).delete()
    db.session.query(Task).delete()
    db.session.query(Project).delete()
    db.session.query(User).delete()
    db.session.commit()

    # 1. 创建用户
    users = [
        User(username="张三", email="zhangsan@example.com"),
        User(username="李四", email="lisi@example.com"),
        User(username="王五", email="wangwu@example.com"),
    ]
    for user in users:
        db.session.add(user)
    db.session.commit()
    print(f"创建了{len(users)}个用户")

    # 2. 创建项目
    project = Project(
        name=Config.DEFAULT_PROJECT_NAME,
        description="一个示例软件开发项目，包含需求分析、设计、开发、测试等阶段",
        start_date=date.today() - timedelta(days=30),
        end_date=date.today() + timedelta(days=30),
        target_progress=100.0,
        status='active'
    )
    db.session.add(project)
    db.session.commit()
    print(f"创建了项目: {project.name}")

    # 3. 创建任务
    tasks = []
    for i, task_config in enumerate(Config.SAMPLE_TASKS):
        task = Task(
            project_id=project.id,
            assignee_id=users[i % len(users)].id,
            name=task_config["name"],
            description=task_config["description"],
            priority=random.choice(['high', 'medium', 'low']),
            status=random.choice(['pending', 'in_progress', 'completed']),
            progress=random.randint(0, 100),
            weight=random.uniform(0.5, 2.0),
            estimated_hours=random.uniform(8, 40),
            actual_hours=0.0,
            start_date=date.today() - timedelta(days=random.randint(0, 20)),
            due_date=date.today() + timedelta(days=random.randint(10, 40))
        )
        tasks.append(task)
        db.session.add(task)
    db.session.commit()
    print(f"创建了{len(tasks)}个任务")

    # 4. 创建过去30天的每日工作记录
    user_ids = [user.id for user in users]
    task_ids = [task.id for task in tasks]

    daily_works_count = 0
    for day_offset in range(30, -1, -1):
        work_date = date.today() - timedelta(days=day_offset)

        # 每天为2-5个任务创建工作记录
        for _ in range(random.randint(2, 5)):
            task_id = random.choice(task_ids)
            user_id = random.choice(user_ids)
            task = next(t for t in tasks if t.id == task_id)

            # 检查是否已存在记录
            existing = DailyWork.query.filter_by(
                task_id=task_id,
                work_date=work_date
            ).first()

            if existing:
                continue

            # 生成工作内容
            work_contents = [
                f"完成了{task.name}的部分功能",
                f"修复了{task.name}的相关问题",
                f"优化了{task.name}的性能",
                f"编写了{task.name}的文档",
                f"测试了{task.name}的功能",
                f"讨论了{task.name}的实现方案",
                f"审查了{task.name}的代码",
                f"部署了{task.name}的相关组件"
            ]

            hours_spent = random.uniform(1.0, 8.0)
            progress_increment = random.randint(5, 20)

            # 确保进度不超过100
            current_progress = task.progress if day_offset == 30 else random.randint(0, 100)
            new_progress = min(100, current_progress + progress_increment)

            daily_work = DailyWork(
                task_id=task_id,
                user_id=user_id,
                work_date=work_date,
                work_content=random.choice(work_contents),
                hours_spent=hours_spent,
                progress=new_progress,
                issues=random.choice([None, "遇到技术难题", "需求变更", "资源不足"]),
                solutions=random.choice([None, "查阅文档解决", "请教同事", "调整方案"]),
                next_plan=random.choice([None, "继续完善功能", "开始测试", "准备部署"]),
                status='submitted'
            )

            db.session.add(daily_work)
            daily_works_count += 1

            # 更新任务的实际工时
            task.actual_hours = (task.actual_hours or 0) + hours_spent

            # 如果进度达到100，标记任务为完成
            if new_progress >= 100:
                task.status = 'completed'
                task.progress = 100

    db.session.commit()
    print(f"创建了{daily_works_count}条每日工作记录")

    # 5. 创建进度历史记录
    progress_history_count = 0
    for day_offset in range(30, -1, -1):
        record_date = date.today() - timedelta(days=day_offset)

        # 检查是否已存在记录
        existing = ProgressHistory.query.filter_by(
            project_id=project.id,
            record_date=record_date
        ).first()

        if existing:
            continue

        # 计算当日的进度
        tasks_on_date = Task.query.filter(
            Task.project_id == project.id,
            Task.start_date <= record_date
        ).all()

        if not tasks_on_date:
            continue

        # 计算整体进度（加权平均）
        total_weight = sum(task.weight for task in tasks_on_date)
        weighted_progress = sum(task.progress * task.weight for task in tasks_on_date)
        overall_progress = round(weighted_progress / total_weight, 2) if total_weight > 0 else 0

        # 计算已完成任务数
        completed_tasks = len([t for t in tasks_on_date if t.status == 'completed'])

        # 计算总耗时（截至该日期）
        total_hours = db.session.query(db.func.sum(DailyWork.hours_spent)) \
            .join(Task) \
            .filter(
                Task.project_id == project.id,
                DailyWork.work_date <= record_date
            ).scalar() or 0.0

        history = ProgressHistory(
            project_id=project.id,
            record_date=record_date,
            overall_progress=overall_progress,
            completed_tasks=completed_tasks,
            total_tasks=len(tasks_on_date),
            total_hours_spent=total_hours
        )

        db.session.add(history)
        progress_history_count += 1

    db.session.commit()
    print(f"创建了{progress_history_count}条进度历史记录")

    # 6. 更新项目状态
    project_progress = project.calculate_progress()
    if project_progress >= 100:
        project.status = 'completed'
    elif project_progress > 0:
        project.status = 'active'
    else:
        project.status = 'pending'

    db.session.commit()

    print("示例数据创建完成！")
    print(f"项目进度: {project_progress}%")
    print(f"任务总数: {len(tasks)}")
    print(f"用户总数: {len(users)}")

if __name__ == "__main__":
    from backend.app import app
    with app.app_context():
        create_sample_data()
"""
数据模型定义
"""

from datetime import datetime, date
from backend import db

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    tasks = db.relationship('Task', backref='assignee', lazy=True)
    daily_works = db.relationship('DailyWork', backref='user', lazy=True)

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Project(db.Model):
    """项目模型"""
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.Date, nullable=False, default=date.today)
    end_date = db.Column(db.Date, nullable=True)
    target_progress = db.Column(db.Float, default=100.0)  # 目标进度百分比
    status = db.Column(db.String(50), default='active')  # active, completed, paused, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    progress_history = db.relationship('ProgressHistory', backref='project', lazy=True)

    def calculate_progress(self):
        """计算项目整体进度"""
        if not self.tasks:
            return 0.0

        total_weight = 0
        weighted_progress = 0

        for task in self.tasks:
            # 每个任务的权重可以基于重要性或预估工时
            weight = task.weight if task.weight else 1
            total_weight += weight
            weighted_progress += task.progress * weight

        return round(weighted_progress / total_weight, 2) if total_weight > 0 else 0.0

    def to_dict(self):
        """转换为字典"""
        current_progress = self.calculate_progress()

        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'target_progress': self.target_progress,
            'current_progress': current_progress,
            'status': self.status,
            'task_count': len(self.tasks),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Task(db.Model):
    """任务模型"""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default='medium')  # high, medium, low
    status = db.Column(db.String(50), default='pending')  # pending, in_progress, completed, blocked
    progress = db.Column(db.Float, default=0.0)  # 进度百分比 0-100
    weight = db.Column(db.Float, default=1.0)  # 权重，用于进度计算
    estimated_hours = db.Column(db.Float, nullable=True)  # 预估工时
    actual_hours = db.Column(db.Float, default=0.0)  # 实际工时
    start_date = db.Column(db.Date, nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    daily_works = db.relationship('DailyWork', backref='task', lazy=True, cascade='all, delete-orphan')

    def update_progress(self):
        """基于每日工作记录更新进度"""
        if self.daily_works:
            # 获取最新的工作记录中的进度
            latest_work = max(self.daily_works, key=lambda x: x.work_date, default=None)
            if latest_work and latest_work.progress is not None:
                self.progress = latest_work.progress

        db.session.commit()

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'assignee_id': self.assignee_id,
            'assignee_name': self.assignee.username if self.assignee else None,
            'name': self.name,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'progress': self.progress,
            'weight': self.weight,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'daily_work_count': len(self.daily_works),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class DailyWork(db.Model):
    """每日工作记录模型"""
    __tablename__ = 'daily_works'

    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    work_date = db.Column(db.Date, nullable=False, default=date.today)
    work_content = db.Column(db.Text, nullable=False)  # 工作内容描述
    hours_spent = db.Column(db.Float, nullable=False, default=0.0)  # 花费时间（小时）
    progress = db.Column(db.Float, nullable=True)  # 当日进度（0-100）
    issues = db.Column(db.Text, nullable=True)  # 遇到的问题
    solutions = db.Column(db.Text, nullable=True)  # 解决方案
    next_plan = db.Column(db.Text, nullable=True)  # 明日计划
    status = db.Column(db.String(50), default='draft')  # draft, submitted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 唯一约束：同一任务同一日期只能有一条记录
    __table_args__ = (
        db.UniqueConstraint('task_id', 'work_date', name='unique_task_date'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'task_id': self.task_id,
            'task_name': self.task.name if self.task else None,
            'user_id': self.user_id,
            'user_name': self.user.username if self.user else None,
            'work_date': self.work_date.isoformat() if self.work_date else None,
            'work_content': self.work_content,
            'hours_spent': self.hours_spent,
            'progress': self.progress,
            'issues': self.issues,
            'solutions': self.solutions,
            'next_plan': self.next_plan,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProgressHistory(db.Model):
    """进度历史记录模型"""
    __tablename__ = 'progress_history'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)

    record_date = db.Column(db.Date, nullable=False, default=date.today)
    overall_progress = db.Column(db.Float, nullable=False)  # 整体进度
    completed_tasks = db.Column(db.Integer, default=0)  # 已完成任务数
    total_tasks = db.Column(db.Integer, default=0)  # 总任务数
    total_hours_spent = db.Column(db.Float, default=0.0)  # 总耗时
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 唯一约束：同一项目同一日期只能有一条记录
    __table_args__ = (
        db.UniqueConstraint('project_id', 'record_date', name='unique_project_date'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'record_date': self.record_date.isoformat() if self.record_date else None,
            'overall_progress': self.overall_progress,
            'completed_tasks': self.completed_tasks,
            'total_tasks': self.total_tasks,
            'completion_rate': round(self.completed_tasks / self.total_tasks * 100, 2) if self.total_tasks > 0 else 0.0,
            'total_hours_spent': self.total_hours_spent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
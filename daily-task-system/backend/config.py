"""
配置文件
"""

import os
from datetime import time

class Config:
    """基础配置"""
    # Flask配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # 数据库配置
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{os.path.join(BASE_DIR, "../data/database.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 定时任务配置
    SCHEDULER_API_ENABLED = True

    # 每日任务生成时间（小时, 分钟）
    DAILY_TASK_GENERATE_HOUR = 0
    DAILY_TASK_GENERATE_MINUTE = 5

    # 每日提醒时间（小时, 分钟）
    DAILY_REMINDER_HOUR = 9
    DAILY_REMINDER_MINUTE = 0

    # 数据备份时间（小时, 分钟）
    DAILY_BACKUP_HOUR = 23
    DAILY_BACKUP_MINUTE = 0

    # 项目配置
    DEFAULT_PROJECT_NAME = "软件开发项目"
    DEFAULT_USER_NAME = "开发人员"

    # 模拟数据配置
    SAMPLE_TASKS = [
        {"name": "需求分析", "description": "分析用户需求，编写需求文档"},
        {"name": "系统设计", "description": "设计系统架构和数据库结构"},
        {"name": "前端开发", "description": "实现用户界面和交互逻辑"},
        {"name": "后端开发", "description": "实现API和业务逻辑"},
        {"name": "测试", "description": "编写测试用例，执行测试"},
        {"name": "部署", "description": "部署应用到生产环境"},
        {"name": "文档编写", "description": "编写用户手册和技术文档"},
        {"name": "会议", "description": "项目会议和讨论"},
        {"name": "代码审查", "description": "审查团队成员代码"},
        {"name": "问题修复", "description": "修复测试发现的问题"}
    ]

    # 可视化配置
    CHART_COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]

    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FILE = os.path.join(BASE_DIR, '../logs/app.log')

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    # 生产环境应该从环境变量读取密钥
    SECRET_KEY = os.environ.get('SECRET_KEY')

    # 生产环境使用PostgreSQL
    if os.environ.get('DATABASE_URL'):
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# 配置映射
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
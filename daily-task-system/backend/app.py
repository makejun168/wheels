"""
Flask应用主文件
"""

import os
import logging
from flask import Flask
from flask_cors import CORS
from backend import db
from backend.config import config
from backend.scheduler import init_scheduler

# 定时任务调度器
scheduler = None

def create_app(config_name='default'):
    """创建Flask应用"""
    app = Flask(__name__)

    # 加载配置
    app.config.from_object(config[config_name])

    # 初始化扩展
    db.init_app(app)
    CORS(app)  # 允许跨域请求

    # 配置日志
    configure_logging(app)

    # 创建数据目录
    create_data_directories(app)

    # 注册路由
    from backend import routes
    routes.register_routes(app)

    # 初始化定时任务（不在测试环境下）
    if not app.config.get('TESTING'):
        global scheduler
        scheduler = init_scheduler()
        scheduler.start()
        app.logger.info("定时任务调度器已启动")

    # 注册关闭钩子
    @app.teardown_appcontext
    def shutdown_scheduler(exception=None):
        if scheduler and scheduler.running:
            scheduler.shutdown()
            app.logger.info("定时任务调度器已关闭")

    return app

def configure_logging(app):
    """配置日志"""
    if not os.path.exists('logs'):
        os.makedirs('logs')

    log_level = getattr(logging, app.config['LOG_LEVEL'].upper())

    # 文件处理器
    file_handler = logging.FileHandler(app.config['LOG_FILE'])
    file_handler.setLevel(log_level)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))

    # 控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))

    # 配置根日志记录器
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)

    # 移除Flask的默认处理器
    app.logger.handlers = []

    # 设置其他日志记录器
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('apscheduler').setLevel(logging.INFO)

def create_data_directories(app):
    """创建数据目录"""
    base_dir = app.config['BASE_DIR']
    directories = [
        os.path.join(base_dir, '../data'),
        os.path.join(base_dir, '../logs'),
        os.path.join(base_dir, '../reports'),
        os.path.join(base_dir, '../frontend/static')
    ]

    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            app.logger.info(f"创建目录: {directory}")

# 创建应用实例
app = create_app()

# 导入模型（必须在创建app之后）
from backend import models

# 添加命令行命令
@app.cli.command('init-db')
def init_db_command():
    """初始化数据库"""
    with app.app_context():
        db.create_all()
        app.logger.info("数据库表已创建")

@app.cli.command('seed-db')
def seed_db_command():
    """填充示例数据"""
    from backend.scripts.sample_data import create_sample_data
    with app.app_context():
        create_sample_data()
        app.logger.info("示例数据已填充")

@app.cli.command('generate-today-forms')
def generate_today_forms_command():
    """手动生成今日工作表格"""
    from backend.scheduler import manual_generate_today_forms
    with app.app_context():
        result = manual_generate_today_forms()
        app.logger.info(result['message'])

@app.cli.command('record-progress')
def record_progress_command():
    """手动记录进度"""
    from backend.scheduler import manual_record_progress
    with app.app_context():
        result = manual_record_progress()
        app.logger.info(result['message'])

@app.cli.command('cleanup-old-data')
def cleanup_old_data_command():
    """清理旧数据"""
    from backend.scheduler import cleanup_old_data
    with app.app_context():
        cleanup_old_data()
        app.logger.info("旧数据清理完成")

if __name__ == '__main__':
    # 启动应用
    app.run(host='0.0.0.0', port=5000, debug=True)
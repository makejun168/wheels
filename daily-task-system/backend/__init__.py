"""
后端应用包
"""

from flask_sqlalchemy import SQLAlchemy
from flask import Flask

# 创建扩展实例
db = SQLAlchemy()

def create_app(config_name='default'):
    """创建应用工厂函数"""
    from backend.app import create_app as factory
    return factory(config_name)

# 导出常用对象
__all__ = ['db', 'create_app']
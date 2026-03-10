# 每日工作进度管理系统

## 项目概述

一个用于定时发布任务、填写每日工作内容、同步到总表并以可视化图形展示项目进度的管理系统。

### 核心功能
1. **定时任务发布**：每天自动生成当日工作填写表格
2. **工作内容填写**：用户填写每项任务的工作详情、进度、耗时
3. **数据同步**：自动将每日工作内容同步到项目总表
4. **进度可视化**：实时展示项目整体进度和各项指标
5. **历史记录**：查看历史工作记录和进度变化

### 适用场景
- 团队项目管理与进度跟踪
- 个人工作日志与时间管理
- 项目进度监控与报告生成
- 敏捷开发团队的每日站会记录

## 系统架构

```
daily-task-system/
├── backend/              # 后端服务 (Flask + SQLite)
│   ├── app.py           # 主应用文件
│   ├── models.py        # 数据模型
│   ├── routes.py        # API路由
│   ├── scheduler.py     # 定时任务调度
│   └── requirements.txt # Python依赖
├── frontend/            # 前端界面
│   ├── index.html       # 主页面
│   ├── daily-form.html  # 每日工作填写表单
│   ├── dashboard.html   # 进度仪表盘
│   └── static/          # 静态资源
│       ├── css/
│       ├── js/
│       └── images/
├── data/                # 数据存储
│   └── database.db      # SQLite数据库
├── scripts/             # 辅助脚本
│   ├── init_db.py       # 数据库初始化
│   └── sample_data.py   # 示例数据生成
└── docs/                # 文档
    └── api.md           # API接口文档
```

## 快速开始

### 1. 环境准备
```bash
# 进入项目目录
cd daily-task-system/backend

# 安装Python依赖
pip install -r requirements.txt
```

### 2. 初始化数据库
```bash
python scripts/init_db.py
```

### 3. 启动后端服务
```bash
python app.py
```

### 4. 访问前端
打开浏览器访问：http://localhost:5000

### 5. 添加示例数据（可选）
```bash
python scripts/sample_data.py
```

## 功能模块详解

### 1. 定时任务系统
- **每日自动生成**：每天凌晨自动创建当日工作填写表格
- **任务分配**：根据项目任务列表自动分配待办事项
- **提醒通知**：可配置邮件或消息提醒（未来扩展）

### 2. 工作内容填写
- **表单字段**：
  - 任务选择/创建
  - 工作内容描述
  - 所用时间（小时）
  - 完成进度（0-100%）
  - 遇到的问题/解决方案
  - 明日计划
- **保存与提交**：实时保存草稿，最终提交锁定

### 3. 数据同步与汇总
- **自动同步**：提交后自动更新项目总表
- **进度计算**：实时计算项目整体进度
- **数据关联**：关联任务、人员、时间维度

### 4. 可视化仪表盘
- **进度总览**：项目整体完成情况
- **任务分布**：各任务进度对比
- **时间分析**：工作量随时间变化
- **团队贡献**：成员工作量和效率
- **燃尽图**：剩余工作量预测

## 数据模型设计

### 主要数据表
1. **Project** - 项目信息
2. **Task** - 任务项
3. **DailyWork** - 每日工作记录
4. **User** - 用户信息
5. **ProgressHistory** - 进度历史记录

### 关系说明
- 一个项目包含多个任务
- 一个任务有多个每日工作记录
- 一个用户负责多个任务
- 每日工作记录关联具体任务和用户

## API接口

### 项目相关
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建新项目
- `GET /api/projects/<id>` - 获取项目详情
- `PUT /api/projects/<id>` - 更新项目信息

### 任务相关
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建新任务
- `GET /api/tasks/<id>` - 获取任务详情
- `PUT /api/tasks/<id>` - 更新任务信息

### 每日工作相关
- `GET /api/daily-work/today` - 获取今日工作表格
- `POST /api/daily-work` - 提交工作记录
- `GET /api/daily-work` - 获取历史记录
- `PUT /api/daily-work/<id>` - 更新工作记录

### 进度相关
- `GET /api/progress/overview` - 获取进度总览
- `GET /api/progress/chart-data` - 获取图表数据
- `GET /api/progress/detailed` - 获取详细进度报告

## 配置说明

### 定时任务配置
在 `backend/scheduler.py` 中配置：
- 每日生成时间（默认：凌晨00:05）
- 提醒时间（默认：早上9:00）
- 数据备份时间（默认：每日23:00）

### 项目参数配置
在 `backend/config.py` 中配置：
- 数据库路径
- 服务器端口
- 允许的域名
- 日志级别

## 使用示例

### 场景一：项目经理使用
1. 创建新项目，定义项目任务
2. 分配任务给团队成员
3. 每天查看团队工作进展
4. 通过仪表盘监控项目进度
5. 导出进度报告

### 场景二：团队成员使用
1. 每天打开系统查看今日待办
2. 填写每项任务的工作内容
3. 记录遇到的问题和解决方案
4. 提交当日工作记录
5. 查看个人贡献和项目整体进展

### 场景三：个人时间管理
1. 创建个人项目（如学习计划）
2. 定义每日需要完成的任务
3. 记录每天的实际完成情况
4. 分析时间使用效率
5. 调整计划以提高效率

## 扩展功能

### 计划中的功能
1. **多用户协作**：团队角色和权限管理
2. **移动端适配**：响应式设计，支持手机访问
3. **通知系统**：邮件、钉钉、微信集成
4. **文件附件**：支持上传工作相关文件
5. **数据导出**：Excel、PDF格式导出

### 技术扩展
1. **Docker部署**：容器化部署方案
2. **RESTful API**：完整的API文档和测试
3. **单元测试**：后端接口和前端组件测试
4. **性能优化**：数据库索引、缓存策略

## 维护与部署

### 开发环境
```bash
# 安装开发依赖
pip install -r requirements-dev.txt

# 运行开发服务器
flask run --debug

# 运行测试
pytest tests/
```

### 生产部署
```bash
# 使用Gunicorn部署
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 使用Docker部署
docker build -t daily-task-system .
docker run -p 5000:5000 daily-task-system
```

### 数据备份
```bash
# 手动备份数据库
cp data/database.db data/backups/database_$(date +%Y%m%d).db

# 使用脚本自动备份
python scripts/backup_db.py
```

## 常见问题

### Q1: 如何修改每日生成时间？
A: 修改 `backend/scheduler.py` 中的 `schedule_daily_tasks()` 函数。

### Q2: 数据保存在哪里？
A: 默认使用SQLite数据库，文件位于 `data/database.db`。

### Q3: 支持多少用户同时使用？
A: 轻量级应用，适合中小团队（10-50人）。如需大规模使用，建议更换为PostgreSQL。

### Q4: 如何添加新的图表类型？
A: 修改 `frontend/static/js/dashboard.js` 中的图表配置。

### Q5: 是否支持离线使用？
A: 目前需要网络连接。未来计划添加PWA支持。

## 贡献指南

### 报告问题
1. 在GitHub Issues中描述问题
2. 提供复现步骤和环境信息
3. 附上相关截图或日志

### 提交代码
1. Fork项目仓库
2. 创建特性分支
3. 提交清晰的commit信息
4. 创建Pull Request

### 代码规范
- 遵循PEP 8 (Python)
- 使用ES6+标准 (JavaScript)
- 添加必要的注释和文档

## 许可证

MIT License

## 更新日志

### v1.0.0 (2026-03-06)
- 初始版本发布
- 基本功能：任务管理、每日填写、进度可视化
- 支持单用户使用
- 基础图表展示

---
*如有问题或建议，请提交Issue或联系维护者*
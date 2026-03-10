"""
API路由定义
"""

from datetime import datetime, date, timedelta
from flask import request, jsonify
from backend import db
from backend.models import User, Project, Task, DailyWork, ProgressHistory
from backend.config import Config

def register_routes(app):
    """注册所有路由"""

    @app.route('/')
    def index():
        """首页"""
        return jsonify({
            'message': '每日工作进度管理系统 API',
            'version': '1.0.0',
            'endpoints': {
                'projects': '/api/projects',
                'tasks': '/api/tasks',
                'daily_work': '/api/daily-work',
                'progress': '/api/progress'
            }
        })

    # ========== 项目相关接口 ==========

    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        """获取所有项目"""
        projects = Project.query.all()
        return jsonify([project.to_dict() for project in projects])

    @app.route('/api/projects', methods=['POST'])
    def create_project():
        """创建新项目"""
        data = request.get_json()

        # 验证必要字段
        if not data or 'name' not in data:
            return jsonify({'error': '项目名称不能为空'}), 400

        # 创建项目
        project = Project(
            name=data['name'],
            description=data.get('description'),
            start_date=data.get('start_date', date.today()),
            end_date=data.get('end_date'),
            target_progress=data.get('target_progress', 100.0),
            status=data.get('status', 'active')
        )

        db.session.add(project)
        db.session.commit()

        return jsonify(project.to_dict()), 201

    @app.route('/api/projects/<int:project_id>', methods=['GET'])
    def get_project(project_id):
        """获取项目详情"""
        project = Project.query.get_or_404(project_id)
        return jsonify(project.to_dict())

    @app.route('/api/projects/<int:project_id>', methods=['PUT'])
    def update_project(project_id):
        """更新项目信息"""
        project = Project.query.get_or_404(project_id)
        data = request.get_json()

        if 'name' in data:
            project.name = data['name']
        if 'description' in data:
            project.description = data['description']
        if 'start_date' in data:
            project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            project.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date() if data['end_date'] else None
        if 'target_progress' in data:
            project.target_progress = data['target_progress']
        if 'status' in data:
            project.status = data['status']

        project.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(project.to_dict())

    # ========== 任务相关接口 ==========

    @app.route('/api/tasks', methods=['GET'])
    def get_tasks():
        """获取所有任务"""
        project_id = request.args.get('project_id')
        status = request.args.get('status')
        assignee_id = request.args.get('assignee_id')

        query = Task.query

        if project_id:
            query = query.filter_by(project_id=project_id)
        if status:
            query = query.filter_by(status=status)
        if assignee_id:
            query = query.filter_by(assignee_id=assignee_id)

        tasks = query.all()
        return jsonify([task.to_dict() for task in tasks])

    @app.route('/api/tasks', methods=['POST'])
    def create_task():
        """创建新任务"""
        data = request.get_json()

        # 验证必要字段
        if not data or 'name' not in data or 'project_id' not in data:
            return jsonify({'error': '任务名称和项目ID不能为空'}), 400

        # 验证项目是否存在
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'error': '项目不存在'}), 404

        # 创建任务
        task = Task(
            project_id=data['project_id'],
            assignee_id=data.get('assignee_id'),
            name=data['name'],
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            progress=data.get('progress', 0.0),
            weight=data.get('weight', 1.0),
            estimated_hours=data.get('estimated_hours'),
            actual_hours=data.get('actual_hours', 0.0),
            start_date=data.get('start_date'),
            due_date=data.get('due_date')
        )

        db.session.add(task)
        db.session.commit()

        return jsonify(task.to_dict()), 201

    @app.route('/api/tasks/<int:task_id>', methods=['GET'])
    def get_task(task_id):
        """获取任务详情"""
        task = Task.query.get_or_404(task_id)

        # 获取该任务的每日工作记录
        daily_works = DailyWork.query.filter_by(task_id=task_id).order_by(DailyWork.work_date.desc()).all()

        task_dict = task.to_dict()
        task_dict['daily_works'] = [work.to_dict() for work in daily_works]

        return jsonify(task_dict)

    @app.route('/api/tasks/<int:task_id>', methods=['PUT'])
    def update_task(task_id):
        """更新任务信息"""
        task = Task.query.get_or_404(task_id)
        data = request.get_json()

        # 更新字段
        update_fields = ['name', 'description', 'priority', 'status', 'progress',
                        'weight', 'estimated_hours', 'actual_hours', 'assignee_id']

        for field in update_fields:
            if field in data:
                setattr(task, field, data[field])

        # 处理日期字段
        if 'start_date' in data:
            task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data['start_date'] else None
        if 'due_date' in data:
            task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data['due_date'] else None

        task.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(task.to_dict())

    # ========== 每日工作相关接口 ==========

    @app.route('/api/daily-work/today', methods=['GET'])
    def get_today_work():
        """获取今日工作表格"""
        today = date.today()

        # 获取所有活跃任务
        active_tasks = Task.query.filter(Task.status.in_(['pending', 'in_progress'])).all()

        # 检查哪些任务已经有今日记录
        today_works = DailyWork.query.filter_by(work_date=today).all()
        existing_task_ids = [work.task_id for work in today_works]

        # 构建返回数据
        result = {
            'date': today.isoformat(),
            'tasks': []
        }

        for task in active_tasks:
            # 查找今日记录
            today_record = next((work for work in today_works if work.task_id == task.id), None)

            result['tasks'].append({
                'task': task.to_dict(),
                'daily_work': today_record.to_dict() if today_record else None,
                'has_record': task.id in existing_task_ids
            })

        return jsonify(result)

    @app.route('/api/daily-work', methods=['GET'])
    def get_daily_works():
        """获取每日工作记录"""
        task_id = request.args.get('task_id')
        user_id = request.args.get('user_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        limit = request.args.get('limit', 100, type=int)

        query = DailyWork.query

        if task_id:
            query = query.filter_by(task_id=task_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if start_date:
            query = query.filter(DailyWork.work_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
        if end_date:
            query = query.filter(DailyWork.work_date <= datetime.strptime(end_date, '%Y-%m-%d').date())

        # 按日期倒序排列
        daily_works = query.order_by(DailyWork.work_date.desc()).limit(limit).all()

        return jsonify([work.to_dict() for work in daily_works])

    @app.route('/api/daily-work', methods=['POST'])
    def create_daily_work():
        """创建或更新每日工作记录"""
        data = request.get_json()

        # 验证必要字段
        required_fields = ['task_id', 'user_id', 'work_date', 'work_content', 'hours_spent']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'字段{field}不能为空'}), 400

        # 检查任务和用户是否存在
        task = Task.query.get(data['task_id'])
        if not task:
            return jsonify({'error': '任务不存在'}), 404

        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': '用户不存在'}), 404

        # 检查是否已存在记录
        existing_work = DailyWork.query.filter_by(
            task_id=data['task_id'],
            work_date=datetime.strptime(data['work_date'], '%Y-%m-%d').date()
        ).first()

        if existing_work:
            # 更新现有记录
            existing_work.work_content = data['work_content']
            existing_work.hours_spent = data['hours_spent']
            existing_work.progress = data.get('progress')
            existing_work.issues = data.get('issues')
            existing_work.solutions = data.get('solutions')
            existing_work.next_plan = data.get('next_plan')
            existing_work.status = data.get('status', 'submitted')
            existing_work.updated_at = datetime.utcnow()

            work = existing_work
        else:
            # 创建新记录
            work = DailyWork(
                task_id=data['task_id'],
                user_id=data['user_id'],
                work_date=datetime.strptime(data['work_date'], '%Y-%m-%d').date(),
                work_content=data['work_content'],
                hours_spent=data['hours_spent'],
                progress=data.get('progress'),
                issues=data.get('issues'),
                solutions=data.get('solutions'),
                next_plan=data.get('next_plan'),
                status=data.get('status', 'submitted')
            )
            db.session.add(work)

        # 更新任务的进度和实际工时
        if data.get('progress') is not None:
            task.progress = data['progress']
            task.status = 'completed' if data['progress'] >= 100 else 'in_progress'

        # 累加实际工时
        task.actual_hours = (task.actual_hours or 0) + data['hours_spent']

        db.session.commit()

        # 记录进度历史
        record_progress_history(task.project_id)

        return jsonify(work.to_dict()), 201

    @app.route('/api/daily-work/batch', methods=['POST'])
    def create_batch_daily_work():
        """批量创建每日工作记录"""
        data = request.get_json()

        if not data or 'works' not in data:
            return jsonify({'error': 'works字段不能为空'}), 400

        works = data['works']
        results = []
        errors = []

        for work_data in works:
            try:
                # 验证必要字段
                required_fields = ['task_id', 'user_id', 'work_date', 'work_content', 'hours_spent']
                missing_fields = [field for field in required_fields if field not in work_data]

                if missing_fields:
                    errors.append({
                        'index': works.index(work_data),
                        'error': f'缺少字段: {", ".join(missing_fields)}'
                    })
                    continue

                # 检查是否已存在记录
                existing_work = DailyWork.query.filter_by(
                    task_id=work_data['task_id'],
                    work_date=datetime.strptime(work_data['work_date'], '%Y-%m-%d').date()
                ).first()

                if existing_work:
                    # 更新现有记录
                    existing_work.work_content = work_data['work_content']
                    existing_work.hours_spent = work_data['hours_spent']
                    existing_work.progress = work_data.get('progress')
                    existing_work.issues = work_data.get('issues')
                    existing_work.solutions = work_data.get('solutions')
                    existing_work.next_plan = work_data.get('next_plan')
                    existing_work.status = work_data.get('status', 'submitted')
                    existing_work.updated_at = datetime.utcnow()

                    work = existing_work
                else:
                    # 创建新记录
                    work = DailyWork(
                        task_id=work_data['task_id'],
                        user_id=work_data['user_id'],
                        work_date=datetime.strptime(work_data['work_date'], '%Y-%m-%d').date(),
                        work_content=work_data['work_content'],
                        hours_spent=work_data['hours_spent'],
                        progress=work_data.get('progress'),
                        issues=work_data.get('issues'),
                        solutions=work_data.get('solutions'),
                        next_plan=work_data.get('next_plan'),
                        status=work_data.get('status', 'submitted')
                    )
                    db.session.add(work)

                # 更新任务进度
                task = Task.query.get(work_data['task_id'])
                if task and work_data.get('progress') is not None:
                    task.progress = work_data['progress']
                    task.status = 'completed' if work_data['progress'] >= 100 else 'in_progress'
                    task.actual_hours = (task.actual_hours or 0) + work_data['hours_spent']

                results.append(work.to_dict())

            except Exception as e:
                errors.append({
                    'index': works.index(work_data),
                    'error': str(e)
                })

        db.session.commit()

        # 记录进度历史（如果有成功的记录）
        if results:
            # 假设所有工作都属于同一个项目
            first_task = Task.query.get(works[0]['task_id'])
            if first_task:
                record_progress_history(first_task.project_id)

        return jsonify({
            'success_count': len(results),
            'error_count': len(errors),
            'results': results,
            'errors': errors
        }), 201

    # ========== 进度相关接口 ==========

    @app.route('/api/progress/overview', methods=['GET'])
    def get_progress_overview():
        """获取进度总览"""
        project_id = request.args.get('project_id')

        if project_id:
            project = Project.query.get_or_404(project_id)
            projects = [project]
        else:
            projects = Project.query.all()

        overview = {
            'total_projects': len(projects),
            'active_projects': len([p for p in projects if p.status == 'active']),
            'completed_projects': len([p for p in projects if p.status == 'completed']),
            'projects': []
        }

        for project in projects:
            # 计算项目统计
            tasks = Task.query.filter_by(project_id=project.id).all()
            completed_tasks = len([t for t in tasks if t.status == 'completed'])
            in_progress_tasks = len([t for t in tasks if t.status == 'in_progress'])

            # 获取最近7天的进度历史
            seven_days_ago = date.today() - timedelta(days=7)
            recent_history = ProgressHistory.query.filter(
                ProgressHistory.project_id == project.id,
                ProgressHistory.record_date >= seven_days_ago
            ).order_by(ProgressHistory.record_date).all()

            project_data = project.to_dict()
            project_data.update({
                'task_count': len(tasks),
                'completed_task_count': completed_tasks,
                'in_progress_task_count': in_progress_tasks,
                'recent_progress_history': [h.to_dict() for h in recent_history]
            })

            overview['projects'].append(project_data)

        return jsonify(overview)

    @app.route('/api/progress/chart-data', methods=['GET'])
    def get_chart_data():
        """获取图表数据"""
        project_id = request.args.get('project_id')
        days = request.args.get('days', 30, type=int)

        end_date = date.today()
        start_date = end_date - timedelta(days=days)

        if project_id:
            # 获取指定项目的数据
            project = Project.query.get_or_404(project_id)
            history = ProgressHistory.query.filter(
                ProgressHistory.project_id == project_id,
                ProgressHistory.record_date >= start_date,
                ProgressHistory.record_date <= end_date
            ).order_by(ProgressHistory.record_date).all()

            # 获取任务分布
            tasks = Task.query.filter_by(project_id=project_id).all()
            task_distribution = [
                {
                    'name': task.name,
                    'progress': task.progress,
                    'status': task.status,
                    'weight': task.weight
                }
                for task in tasks
            ]

            # 获取每日工作量
            daily_works = DailyWork.query.join(Task).filter(
                Task.project_id == project_id,
                DailyWork.work_date >= start_date,
                DailyWork.work_date <= end_date
            ).all()

            # 按日期分组工作量
            daily_hours = {}
            for work in daily_works:
                date_str = work.work_date.isoformat()
                daily_hours[date_str] = daily_hours.get(date_str, 0) + work.hours_spent

            # 转换为列表
            daily_hours_list = [
                {'date': date, 'hours': hours}
                for date, hours in sorted(daily_hours.items())
            ]

            chart_data = {
                'project': project.to_dict(),
                'progress_history': [h.to_dict() for h in history],
                'task_distribution': task_distribution,
                'daily_hours': daily_hours_list,
                'time_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                }
            }

        else:
            # 获取所有项目的汇总数据
            projects = Project.query.all()
            chart_data = {
                'projects_progress': [
                    {
                        'name': project.name,
                        'progress': project.calculate_progress(),
                        'status': project.status
                    }
                    for project in projects
                ],
                'time_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': days
                }
            }

        return jsonify(chart_data)

    @app.route('/api/progress/detailed', methods=['GET'])
    def get_detailed_progress():
        """获取详细进度报告"""
        project_id = request.args.get('project_id')
        if not project_id:
            return jsonify({'error': 'project_id参数不能为空'}), 400

        project = Project.query.get_or_404(project_id)
        tasks = Task.query.filter_by(project_id=project_id).all()

        detailed_data = {
            'project': project.to_dict(),
            'tasks': [],
            'summary': {
                'total_tasks': len(tasks),
                'completed_tasks': len([t for t in tasks if t.status == 'completed']),
                'in_progress_tasks': len([t for t in tasks if t.status == 'in_progress']),
                'pending_tasks': len([t for t in tasks if t.status == 'pending']),
                'total_estimated_hours': sum(t.estimated_hours for t in tasks if t.estimated_hours),
                'total_actual_hours': sum(t.actual_hours for t in tasks if t.actual_hours),
                'overall_progress': project.calculate_progress()
            }
        }

        for task in tasks:
            task_data = task.to_dict()

            # 获取该任务的每日工作记录
            daily_works = DailyWork.query.filter_by(task_id=task.id).order_by(DailyWork.work_date).all()
            task_data['daily_works'] = [work.to_dict() for work in daily_works]

            detailed_data['tasks'].append(task_data)

        return jsonify(detailed_data)

    # ========== 用户相关接口 ==========

    @app.route('/api/users', methods=['GET'])
    def get_users():
        """获取所有用户"""
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])

    @app.route('/api/users', methods=['POST'])
    def create_user():
        """创建新用户"""
        data = request.get_json()

        if not data or 'username' not in data:
            return jsonify({'error': '用户名不能为空'}), 400

        # 检查用户名是否已存在
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'error': '用户名已存在'}), 400

        user = User(
            username=data['username'],
            email=data.get('email')
        )

        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201

    # ========== 辅助函数 ==========

    def record_progress_history(project_id):
        """记录项目进度历史"""
        today = date.today()

        # 检查是否已记录
        existing = ProgressHistory.query.filter_by(
            project_id=project_id,
            record_date=today
        ).first()

        if existing:
            return existing

        project = Project.query.get(project_id)
        if not project:
            return None

        tasks = Task.query.filter_by(project_id=project_id).all()
        completed_tasks = len([t for t in tasks if t.status == 'completed'])

        # 计算总耗时（从每日工作记录）
        total_hours = db.session.query(db.func.sum(DailyWork.hours_spent)) \
            .join(Task) \
            .filter(Task.project_id == project_id) \
            .scalar() or 0.0

        history = ProgressHistory(
            project_id=project_id,
            record_date=today,
            overall_progress=project.calculate_progress(),
            completed_tasks=completed_tasks,
            total_tasks=len(tasks),
            total_hours_spent=total_hours
        )

        db.session.add(history)
        db.session.commit()

        return history
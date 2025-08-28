from flask import Flask, jsonify
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import pytz

from config import Config
from models.database import init_db, db
from services.exchange_rate_service import update_exchange_rates
from api.routes import register_routes

def create_app():
    """创建并配置Flask应用"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # 允许跨域请求
    CORS(app)
    
    # 初始化数据库
    init_db(app)
    
    # 注册API路由
    register_routes(app)
    
    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Server error'}), 500
    
    return app

def init_scheduler():
    """初始化定时任务，定期更新汇率数据"""
    scheduler = BackgroundScheduler(timezone=pytz.UTC)
    scheduler.add_job(func=update_exchange_rates, 
                     trigger="interval", 
                     hours=Config.UPDATE_INTERVAL_HOURS)
    scheduler.start()
    
    # 确保应用退出时关闭调度器
    atexit.register(lambda: scheduler.shutdown())

if __name__ == '__main__':
    app = create_app()
    
    # 首次运行时更新汇率数据
    with app.app_context():
        update_exchange_rates()
    
    # 启动定时任务
    init_scheduler()
    
    # 启动应用
    app.run(host='0.0.0.0', port=5000)
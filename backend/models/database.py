from flask_sqlalchemy import SQLAlchemy

# 初始化SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """初始化数据库"""
    db.init_app(app)
    
    # 确保所有表都已创建
    with app.app_context():
        db.create_all()
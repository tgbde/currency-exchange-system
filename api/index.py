from flask import Flask
from flask_cors import CORS
import sys
import os

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

# 创建Flask应用实例
app = create_app()

# 确保CORS配置正确
CORS(app, origins=['*'])

# Vercel需要的处理函数
def handler(request):
    return app(request.environ, lambda status, headers: None)

if __name__ == '__main__':
    app.run(debug=False)
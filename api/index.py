import sys
import os

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app
from flask_cors import CORS

# 创建Flask应用实例
app = create_app()

# 确保CORS配置正确
CORS(app, origins=['*'], supports_credentials=True)

# 添加健康检查端点
@app.route('/api/health')
def health_check():
    return {'status': 'ok', 'message': 'API is running'}

# Vercel需要这个变量名
application = app

if __name__ == '__main__':
    app.run(debug=False)
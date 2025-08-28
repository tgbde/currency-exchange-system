import os
import sys
from datetime import datetime, timedelta
import random

# 添加当前目录到系统路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from models.database import init_db, db
from models.exchange_rate import ExchangeRate
from config import Config

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(Config)

# 初始化数据库
init_db(app)

def generate_sample_data():
    """生成示例数据用于测试"""
    print("正在生成示例数据...")
    
    # 支持的货币
    currencies = Config.SUPPORTED_CURRENCIES
    
    # 生成过去3年的数据
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=365*3)
    
    # 为每种货币生成数据
    for currency in currencies:
        print(f"正在生成{currency}的历史汇率数据...")
        
        # 设置基准汇率（与实际汇率接近的值）
        if currency == 'USD':
            base_rate = 0.14  # 约等于7.14人民币/美元的倒数
        elif currency == 'EUR':
            base_rate = 0.13  # 约等于7.69人民币/欧元的倒数
        elif currency == 'JPY':
            base_rate = 19.0  # 约等于0.053人民币/日元的倒数
        elif currency == 'GBP':
            base_rate = 0.11  # 约等于9.09人民币/英镑的倒数
        else:
            # 其他货币使用随机值
            base_rate = random.uniform(0.1, 20.0)
        
        # 生成每天的汇率数据
        current_date = start_date
        rate = base_rate
        
        while current_date <= end_date:
            # 添加一些随机波动
            rate_change = random.uniform(-0.005, 0.005)
            rate = max(0.001, rate * (1 + rate_change))  # 确保汇率为正
            
            # 创建汇率记录
            exchange_rate = ExchangeRate(
                currency_code=currency,
                rate=rate,
                date=current_date
            )
            
            db.session.add(exchange_rate)
            
            # 移动到下一天
            current_date += timedelta(days=1)
        
    # 提交所有更改
    db.session.commit()
    print("示例数据生成完成！")

if __name__ == '__main__':
    with app.app_context():
        # 检查是否已有数据
        existing_data = ExchangeRate.query.first()
        
        if existing_data:
            user_input = input("数据库中已有数据，是否清除并重新生成？(y/n): ")
            if user_input.lower() == 'y':
                # 清除现有数据
                db.session.query(ExchangeRate).delete()
                db.session.commit()
                generate_sample_data()
            else:
                print("操作已取消")
        else:
            generate_sample_data()
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 基础配置
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key_for_currency_exchange')
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///currency_exchange.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 汇率API配置
    EXCHANGE_RATE_API_KEY = os.getenv('EXCHANGE_RATE_API_KEY', '')
    EXCHANGE_RATE_API_URL = os.getenv('EXCHANGE_RATE_API_URL', 'https://api.exchangerate-api.com/v4/latest/')
    
    # 数据更新配置
    UPDATE_INTERVAL_HOURS = int(os.getenv('UPDATE_INTERVAL_HOURS', '24'))
    
    # 支持的货币列表
    SUPPORTED_CURRENCIES = [
        'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'NZD',
        'KRW', 'THB', 'RUB', 'INR', 'MYR', 'ZAR', 'BRL', 'MXN', 'IDR', 'TRY'
    ]
    
    # 基准货币 (人民币)
    BASE_CURRENCY = 'CNY'
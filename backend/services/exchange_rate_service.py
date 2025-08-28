import requests
import pandas as pd
from datetime import datetime, timedelta
import logging

from flask import current_app
from sqlalchemy import func

from models.database import db
from models.exchange_rate import ExchangeRate
from config import Config

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_exchange_rate_from_api(currency_code):
    """从API获取指定货币的汇率数据"""
    try:
        url = f"{Config.EXCHANGE_RATE_API_URL}{currency_code}"
        if Config.EXCHANGE_RATE_API_KEY:
            url = f"{url}?apikey={Config.EXCHANGE_RATE_API_KEY}"
            
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # 检查响应中是否包含汇率数据
        if 'rates' in data and Config.BASE_CURRENCY in data['rates']:
            # 获取人民币汇率
            cny_rate = data['rates'][Config.BASE_CURRENCY]
            # 返回日期和汇率 (CNY/外币汇率，即1外币=多少人民币)
            return datetime.now().date(), cny_rate
        else:
            logger.error(f"API响应中未找到{Config.BASE_CURRENCY}汇率数据")
            return None, None
    except requests.exceptions.RequestException as e:
        logger.error(f"获取{currency_code}汇率时发生错误: {str(e)}")
        return None, None

def update_exchange_rates():
    """更新所有支持货币的汇率数据"""
    logger.info("开始更新汇率数据...")
    
    for currency_code in Config.SUPPORTED_CURRENCIES:
        date, rate = get_exchange_rate_from_api(currency_code)
        
        if date and rate:
            # 检查今天是否已有数据
            existing_rate = ExchangeRate.query.filter_by(
                currency_code=currency_code,
                date=date
            ).first()
            
            if existing_rate:
                # 更新现有记录
                existing_rate.rate = rate
                logger.info(f"更新{currency_code}汇率: {rate}")
            else:
                # 创建新记录
                new_rate = ExchangeRate(
                    currency_code=currency_code,
                    rate=rate,
                    date=date
                )
                db.session.add(new_rate)
                logger.info(f"添加{currency_code}汇率: {rate}")
    
    # 提交所有更改
    db.session.commit()
    logger.info("汇率数据更新完成")

def get_historical_rates(currency_code, start_date, end_date):
    """获取指定货币在日期范围内的历史汇率数据"""
    rates = ExchangeRate.query.filter(
        ExchangeRate.currency_code == currency_code,
        ExchangeRate.date >= start_date,
        ExchangeRate.date <= end_date
    ).order_by(ExchangeRate.date).all()
    
    return [rate.to_dict() for rate in rates]

def get_monthly_average_rates(currency_code, start_date, end_date):
    """获取指定货币在日期范围内的月平均汇率"""
    # 使用SQL函数按月分组并计算平均值
    monthly_rates = db.session.query(
        func.strftime('%Y-%m', ExchangeRate.date).label('month'),
        func.avg(ExchangeRate.rate).label('average_rate')
    ).filter(
        ExchangeRate.currency_code == currency_code,
        ExchangeRate.date >= start_date,
        ExchangeRate.date <= end_date
    ).group_by('month').order_by('month').all()
    
    return [{'month': month, 'average_rate': float(avg_rate)} for month, avg_rate in monthly_rates]

def get_yearly_average_rates(currency_code, start_date, end_date):
    """获取指定货币在日期范围内的年平均汇率"""
    # 使用SQL函数按年分组并计算平均值
    yearly_rates = db.session.query(
        func.strftime('%Y', ExchangeRate.date).label('year'),
        func.avg(ExchangeRate.rate).label('average_rate')
    ).filter(
        ExchangeRate.currency_code == currency_code,
        ExchangeRate.date >= start_date,
        ExchangeRate.date <= end_date
    ).group_by('year').order_by('year').all()
    
    return [{'year': year, 'average_rate': float(avg_rate)} for year, avg_rate in yearly_rates]

def get_supported_currencies():
    """获取支持的货币列表"""
    return [{'code': code} for code in Config.SUPPORTED_CURRENCIES]
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta

from services.exchange_rate_service import (
    get_historical_rates,
    get_monthly_average_rates,
    get_yearly_average_rates,
    get_supported_currencies
)

# 创建蓝图
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/currencies', methods=['GET'])
def get_currencies():
    """获取支持的货币列表"""
    currencies = get_supported_currencies()
    return jsonify({
        'success': True,
        'data': currencies
    })

@api_bp.route('/rates/<currency_code>', methods=['GET'])
def get_rates(currency_code):
    """获取指定货币的汇率数据"""
    # 获取查询参数
    start_date_str = request.args.get('start_date', '')
    end_date_str = request.args.get('end_date', '')
    
    # 默认查询过去3年的数据
    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = (datetime.now() - timedelta(days=365*3)).date()
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = datetime.now().date()
    except ValueError:
        return jsonify({
            'success': False,
            'error': '日期格式无效，请使用YYYY-MM-DD格式'
        }), 400
    
    # 获取汇率数据
    rates = get_historical_rates(currency_code, start_date, end_date)
    
    return jsonify({
        'success': True,
        'data': {
            'currency_code': currency_code,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'rates': rates
        }
    })

@api_bp.route('/rates/<currency_code>/monthly', methods=['GET'])
def get_monthly_rates(currency_code):
    """获取指定货币的月平均汇率"""
    # 获取查询参数
    start_date_str = request.args.get('start_date', '')
    end_date_str = request.args.get('end_date', '')
    
    # 默认查询过去3年的数据
    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = (datetime.now() - timedelta(days=365*3)).date()
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = datetime.now().date()
    except ValueError:
        return jsonify({
            'success': False,
            'error': '日期格式无效，请使用YYYY-MM-DD格式'
        }), 400
    
    # 获取月平均汇率
    monthly_rates = get_monthly_average_rates(currency_code, start_date, end_date)
    
    return jsonify({
        'success': True,
        'data': {
            'currency_code': currency_code,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'monthly_rates': monthly_rates
        }
    })

@api_bp.route('/rates/<currency_code>/yearly', methods=['GET'])
def get_yearly_rates(currency_code):
    """获取指定货币的年平均汇率"""
    # 获取查询参数
    start_date_str = request.args.get('start_date', '')
    end_date_str = request.args.get('end_date', '')
    
    # 默认查询过去3年的数据
    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = (datetime.now() - timedelta(days=365*3)).date()
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = datetime.now().date()
    except ValueError:
        return jsonify({
            'success': False,
            'error': '日期格式无效，请使用YYYY-MM-DD格式'
        }), 400
    
    # 获取年平均汇率
    yearly_rates = get_yearly_average_rates(currency_code, start_date, end_date)
    
    return jsonify({
        'success': True,
        'data': {
            'currency_code': currency_code,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'yearly_rates': yearly_rates
        }
    })

def register_routes(app):
    """注册所有API路由"""
    app.register_blueprint(api_bp)
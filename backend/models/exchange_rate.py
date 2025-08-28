from datetime import datetime
from models.database import db

class ExchangeRate(db.Model):
    """汇率数据模型"""
    __tablename__ = 'exchange_rates'
    
    id = db.Column(db.Integer, primary_key=True)
    currency_code = db.Column(db.String(3), nullable=False, index=True)
    rate = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ExchangeRate {self.currency_code} {self.date} {self.rate}>'
    
    def to_dict(self):
        """将模型转换为字典"""
        return {
            'id': self.id,
            'currency_code': self.currency_code,
            'rate': self.rate,
            'date': self.date.strftime('%Y-%m-%d'),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
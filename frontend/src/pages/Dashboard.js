import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, Alert, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { getSupportedCurrencies, getHistoricalRates } from '../services/api';
import ExchangeRateChart from '../components/ExchangeRateChart';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [mainCurrencyData, setMainCurrencyData] = useState(null);
  
  // 选中的货币代码
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取支持的货币列表
        const currenciesResponse = await getSupportedCurrencies();
        if (currenciesResponse.success) {
          setCurrencies(currenciesResponse.data);
          
          // 获取选中货币的历史数据
          const mainCurrencyResponse = await getHistoricalRates(selectedCurrency);
          if (mainCurrencyResponse.success) {
            setMainCurrencyData(mainCurrencyResponse.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('获取数据失败，请稍后再试');
        setLoading(false);
        console.error('Dashboard数据获取失败:', err);
      }
    };
    
    fetchData();
  }, [selectedCurrency]);
  
  // 处理货币选择变化
  const handleCurrencyChange = (value) => {
    setSelectedCurrency(value);
    setMainCurrencyData(null);
  };
  
  // 计算汇率变化
  const calculateRateChange = () => {
    if (!mainCurrencyData || !mainCurrencyData.rates || mainCurrencyData.rates.length < 2) {
      return { current: 0, change: 0, isIncrease: false };
    }
    
    const rates = mainCurrencyData.rates;
    const sortedRates = [...rates].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const current = sortedRates[0].rate;
    const previous = sortedRates[1].rate;
    const change = ((current - previous) / previous * 100).toFixed(2);
    const isIncrease = current > previous;
    
    return { current, change, isIncrease };
  };
  
  const rateChange = mainCurrencyData ? calculateRateChange() : { current: 0, change: 0, isIncrease: false };
  
  return (
    <div>
      <h2>汇率查询系统 - 首页</h2>
      
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={16} className="card-container">
            <Col span={8}>
              <Card>
                <Statistic
                  title={`${selectedCurrency}/CNY 当前汇率`}
                  value={rateChange.current}
                  precision={4}
                  valueStyle={{ color: rateChange.isIncrease ? '#3f8600' : '#cf1322' }}
                  prefix={rateChange.isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix=""
                  className="stat-card"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="24小时变化"
                  value={rateChange.change}
                  precision={2}
                  valueStyle={{ color: rateChange.isIncrease ? '#3f8600' : '#cf1322' }}
                  prefix={rateChange.isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="%"
                  className="stat-card"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="支持货币数量"
                  value={currencies.length}
                  className="stat-card"
                />
              </Card>
            </Col>
          </Row>
          
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>选择货币：</span>
            <Select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              style={{ width: 200 }}
              showSearch
              placeholder="选择货币"
              optionFilterProp="children"
            >
              {currencies.map(currency => (
                <Select.Option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          
          {mainCurrencyData && mainCurrencyData.rates && (
            <Card title={`${selectedCurrency}/人民币汇率走势`} className="chart-card">
              <ExchangeRateChart 
                data={mainCurrencyData.rates} 
                title={`${selectedCurrency}/人民币汇率走势`} 
                xAxisType="time" 
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
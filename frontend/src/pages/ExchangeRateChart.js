import React, { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Radio, Spin, Alert, Tabs } from 'antd';
import moment from 'moment';
import { getSupportedCurrencies, getHistoricalRates, getMonthlyRates, getYearlyRates } from '../services/api';
import ExchangeRateChart from '../components/ExchangeRateChart';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ExchangeRateChartPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('daily');
  const [error, setError] = useState(null);
  
  // 获取支持的货币列表
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getSupportedCurrencies();
        if (response.success) {
          setCurrencies(response.data);
        }
      } catch (err) {
        setError('获取货币列表失败');
        console.error('获取货币列表失败:', err);
      }
    };
    
    fetchCurrencies();
  }, []);
  
  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      const { currency, dateRange } = values;
      let startDate = null;
      let endDate = null;
      
      if (dateRange && dateRange.length === 2) {
        startDate = dateRange[0].format('YYYY-MM-DD');
        endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      let response;
      
      // 根据图表类型获取不同的数据
      switch (chartType) {
        case 'daily':
          response = await getHistoricalRates(currency, startDate, endDate);
          break;
        case 'monthly':
          response = await getMonthlyRates(currency, startDate, endDate);
          break;
        case 'yearly':
          response = await getYearlyRates(currency, startDate, endDate);
          break;
        default:
          response = await getHistoricalRates(currency, startDate, endDate);
      }
      
      if (response.success) {
        setChartData(response.data);
      } else {
        setError('获取汇率数据失败');
      }
      
      setLoading(false);
    } catch (err) {
      setError('查询失败，请稍后再试');
      setLoading(false);
      console.error('汇率查询失败:', err);
    }
  };
  
  // 处理图表类型变更
  const handleChartTypeChange = e => {
    setChartType(e.target.value);
    // 如果已经有数据，重新查询
    if (chartData) {
      form.submit();
    }
  };
  
  // 获取图表数据
  const getChartData = () => {
    if (!chartData) return [];
    
    switch (chartType) {
      case 'daily':
        return chartData.rates || [];
      case 'monthly':
        return chartData.monthly_rates || [];
      case 'yearly':
        return chartData.yearly_rates || [];
      default:
        return [];
    }
  };
  
  // 获取图表标题
  const getChartTitle = () => {
    if (!chartData) return '';
    
    const currencyCode = chartData.currency_code;
    
    switch (chartType) {
      case 'daily':
        return `${currencyCode}/CNY 日汇率走势`;
      case 'monthly':
        return `${currencyCode}/CNY 月平均汇率走势`;
      case 'yearly':
        return `${currencyCode}/CNY 年平均汇率走势`;
      default:
        return `${currencyCode}/CNY 汇率走势`;
    }
  };
  
  // 获取图表X轴类型
  const getChartXAxisType = () => {
    switch (chartType) {
      case 'daily':
        return 'time';
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return 'time';
    }
  };
  
  return (
    <div>
      <h2>汇率走势图</h2>
      
      <Card>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          className="filter-form"
        >
          <Form.Item
            name="currency"
            label="货币"
            rules={[{ required: true, message: '请选择货币' }]}
            className="filter-form-item"
          >
            <Select 
              placeholder="选择货币" 
              style={{ width: 120 }}
              loading={currencies.length === 0}
            >
              {currencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.code}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="日期范围"
            className="filter-form-item"
          >
            <RangePicker 
              allowClear
              style={{ width: 300 }}
              ranges={{
                '过去7天': [moment().subtract(7, 'days'), moment()],
                '过去30天': [moment().subtract(30, 'days'), moment()],
                '过去3个月': [moment().subtract(3, 'months'), moment()],
                '过去1年': [moment().subtract(1, 'year'), moment()],
                '过去3年': [moment().subtract(3, 'years'), moment()],
              }}
            />
          </Form.Item>
          
          <Form.Item className="filter-form-item">
            <Radio.Group value={chartType} onChange={handleChartTypeChange}>
              <Radio.Button value="daily">日走势</Radio.Button>
              <Radio.Button value="monthly">月走势</Radio.Button>
              <Radio.Button value="yearly">年走势</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item className="filter-form-item">
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {error && <Alert message={error} type="error" showIcon style={{ margin: '16px 0' }} />}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : chartData ? (
        <Card style={{ marginTop: 16 }}>
          <ExchangeRateChart 
            data={getChartData()} 
            title={getChartTitle()} 
            xAxisType={getChartXAxisType()} 
          />
        </Card>
      ) : null}
    </div>
  );
};

export default ExchangeRateChartPage;
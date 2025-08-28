import React, { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, Button, Table, Spin, Alert, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getSupportedCurrencies, getHistoricalRates } from '../services/api';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ExchangeRateQuery = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [rateData, setRateData] = useState(null);
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
      
      const response = await getHistoricalRates(currency, startDate, endDate);
      if (response.success) {
        setRateData(response.data);
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
  
  // 导出CSV数据
  const exportToCSV = () => {
    if (!rateData || !rateData.rates || rateData.rates.length === 0) return;
    
    // 准备CSV内容
    const headers = ['日期', '货币代码', '汇率'];
    const rows = rateData.rates.map(rate => [
      rate.date,
      rate.currency_code,
      rate.rate
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${rateData.currency_code}_rates.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: '货币代码',
      dataIndex: 'currency_code',
      key: 'currency_code',
    },
    {
      title: '汇率',
      dataIndex: 'rate',
      key: 'rate',
      render: (text) => parseFloat(text).toFixed(4),
      sorter: (a, b) => a.rate - b.rate,
    },
  ];
  
  return (
    <div>
      <h2>汇率查询</h2>
      
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
      ) : rateData && rateData.rates ? (
        <Card 
          title={`${rateData.currency_code}/CNY 汇率数据`}
          style={{ marginTop: 16 }}
          extra={
            <Space>
              <span>共 {rateData.rates.length} 条记录</span>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={exportToCSV}
                disabled={!rateData.rates.length}
              >
                导出CSV
              </Button>
            </Space>
          }
        >
          <Table 
            dataSource={rateData.rates} 
            columns={columns} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ) : null}
    </div>
  );
};

export default ExchangeRateQuery;
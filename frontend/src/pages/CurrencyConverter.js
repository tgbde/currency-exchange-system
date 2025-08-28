import React, { useState, useEffect } from 'react';
import { Card, Select, Input, Button, Row, Col, Typography, Divider, message, Switch } from 'antd';
import { SwapOutlined, CalculatorOutlined } from '@ant-design/icons';
import { getSupportedCurrencies, getHistoricalRates } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  
  // 转换状态
  const [fromCurrency, setFromCurrency] = useState('CNY');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState(100);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isReverse, setIsReverse] = useState(false); // false: CNY->外汇, true: 外汇->CNY
  
  // 获取货币列表
  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const data = await getSupportedCurrencies();
      setCurrencies(data.currencies || []);
    } catch (error) {
      message.error('获取货币列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取最新汇率并计算转换
  const performConversion = async () => {
    if (!amount || amount <= 0) {
      message.warning('请输入有效的金额');
      return;
    }

    setConverting(true);
    try {
      const targetCurrency = isReverse ? fromCurrency : toCurrency;
      const today = new Date().toISOString().split('T')[0];
      const data = await getHistoricalRates(targetCurrency, today, today);
      
      if (data.rates && data.rates.length > 0) {
        const rate = data.rates[0].rate;
        setExchangeRate(rate);
        
        let result;
        if (isReverse) {
          // 外汇换人民币：外汇金额 * 汇率 = 人民币金额
          result = amount * rate;
        } else {
          // 人民币换外汇：人民币金额 / 汇率 = 外汇金额
          result = amount / rate;
        }
        
        setConvertedAmount(result.toFixed(4));
      } else {
        message.error('无法获取最新汇率数据');
      }
    } catch (error) {
      message.error('汇率转换失败');
    } finally {
      setConverting(false);
    }
  };

  // 切换转换方向
  const toggleDirection = () => {
    setIsReverse(!isReverse);
    setConvertedAmount(0);
    setExchangeRate(0);
  };

  // 交换货币
  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConvertedAmount(0);
    setExchangeRate(0);
  };

  const currencyOptions = currencies.map(currency => (
    <Option key={currency.code} value={currency.code}>
      {currency.code} - {currency.name}
    </Option>
  ));

  const getFromCurrencyDisplay = () => {
    return isReverse ? toCurrency : 'CNY';
  };

  const getToCurrencyDisplay = () => {
    return isReverse ? 'CNY' : toCurrency;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>汇率转换器</Title>
      <Text type="secondary">支持人民币与外币的双向实时转换</Text>
      
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="汇率转换" loading={loading}>
            {/* 转换方向切换 */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Text strong>转换方向：</Text>
              <Switch
                style={{ margin: '0 12px' }}
                checked={isReverse}
                onChange={toggleDirection}
                checkedChildren="外汇→人民币"
                unCheckedChildren="人民币→外汇"
              />
            </div>

            <Divider />

            {/* 货币选择 */}
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={10}>
                <div>
                  <Text strong>从：</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={getFromCurrencyDisplay()}
                    disabled={!isReverse && getFromCurrencyDisplay() === 'CNY'}
                    onChange={(value) => {
                      if (isReverse) {
                        setToCurrency(value);
                      }
                    }}
                    showSearch
                    placeholder="选择货币"
                    optionFilterProp="children"
                  >
                    {!isReverse && <Option value="CNY">CNY - 人民币</Option>}
                    {isReverse && currencyOptions}
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={4} style={{ textAlign: 'center' }}>
                <Button 
                  type="text" 
                  icon={<SwapOutlined />} 
                  onClick={swapCurrencies}
                  disabled={!isReverse}
                  title="交换货币"
                />
              </Col>
              
              <Col xs={24} sm={10}>
                <div>
                  <Text strong>到：</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    value={getToCurrencyDisplay()}
                    disabled={isReverse && getToCurrencyDisplay() === 'CNY'}
                    onChange={(value) => {
                      if (!isReverse) {
                        setToCurrency(value);
                      }
                    }}
                    showSearch
                    placeholder="选择货币"
                    optionFilterProp="children"
                  >
                    {isReverse && <Option value="CNY">CNY - 人民币</Option>}
                    {!isReverse && currencyOptions}
                  </Select>
                </div>
              </Col>
            </Row>

            <Divider />

            {/* 金额输入 */}
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12}>
                <Text strong>输入金额：</Text>
                <Input
                  style={{ marginTop: '8px' }}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="请输入金额"
                  addonAfter={getFromCurrencyDisplay()}
                  size="large"
                />
              </Col>
              
              <Col xs={24} sm={12}>
                <Text strong>转换结果：</Text>
                <Input
                  style={{ marginTop: '8px' }}
                  value={convertedAmount}
                  readOnly
                  placeholder="转换结果"
                  addonAfter={getToCurrencyDisplay()}
                  size="large"
                />
              </Col>
            </Row>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Button
                type="primary"
                size="large"
                icon={<CalculatorOutlined />}
                onClick={performConversion}
                loading={converting}
              >
                立即转换
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="汇率信息">
            {exchangeRate > 0 && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>当前汇率：</Text>
                  <br />
                  <Text style={{ fontSize: '18px', color: '#1890ff' }}>
                    1 {isReverse ? toCurrency : 'CNY'} = {exchangeRate.toFixed(6)} {isReverse ? 'CNY' : toCurrency}
                  </Text>
                </div>
                
                <Divider />
                
                <div>
                  <Text strong>转换说明：</Text>
                  <br />
                  <Text type="secondary">
                    {isReverse 
                      ? `${amount} ${toCurrency} × ${exchangeRate.toFixed(6)} = ${convertedAmount} CNY`
                      : `${amount} CNY ÷ ${exchangeRate.toFixed(6)} = ${convertedAmount} ${toCurrency}`
                    }
                  </Text>
                </div>
              </div>
            )}
            
            {exchangeRate === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">请点击"立即转换"获取汇率信息</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CurrencyConverter;
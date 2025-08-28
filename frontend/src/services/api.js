import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// 获取支持的货币列表
export const getSupportedCurrencies = async () => {
  try {
    const response = await axios.get(`${API_URL}/currencies`);
    return response.data;
  } catch (error) {
    console.error('获取货币列表失败:', error);
    throw error;
  }
};

// 获取指定货币的历史汇率数据
export const getHistoricalRates = async (currencyCode, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axios.get(`${API_URL}/rates/${currencyCode}`, { params });
    return response.data;
  } catch (error) {
    console.error(`获取${currencyCode}历史汇率失败:`, error);
    throw error;
  }
};

// 获取指定货币的月平均汇率
export const getMonthlyRates = async (currencyCode, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axios.get(`${API_URL}/rates/${currencyCode}/monthly`, { params });
    return response.data;
  } catch (error) {
    console.error(`获取${currencyCode}月平均汇率失败:`, error);
    throw error;
  }
};

// 获取指定货币的年平均汇率
export const getYearlyRates = async (currencyCode, startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axios.get(`${API_URL}/rates/${currencyCode}/yearly`, { params });
    return response.data;
  } catch (error) {
    console.error(`获取${currencyCode}年平均汇率失败:`, error);
    throw error;
  }
};
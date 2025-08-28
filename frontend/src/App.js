import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import 'antd/dist/antd.css';
import './App.css';

// 导入组件
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ExchangeRateQuery from './pages/ExchangeRateQuery';
import ExchangeRateChart from './pages/ExchangeRateChart';
import CurrencyConverter from './pages/CurrencyConverter';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '24px' }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: '#fff',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/query" element={<ExchangeRateQuery />} />
                <Route path="/chart" element={<ExchangeRateChart />} />
                <Route path="/converter" element={<CurrencyConverter />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { DashboardOutlined, SearchOutlined, LineChartOutlined, SwapOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  
  // 根据当前路径确定选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['1'];
    if (path === '/query') return ['2'];
    if (path === '/chart') return ['3'];
    if (path === '/converter') return ['4'];
    return ['1'];
  };

  return (
    <Sider width={200} className="site-layout-background">
      <Menu
        mode="inline"
        selectedKeys={getSelectedKey()}
        style={{ height: '100%', borderRight: 0 }}
      >
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/">首页</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<SearchOutlined />}>
          <Link to="/query">汇率查询</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<LineChartOutlined />}>
          <Link to="/chart">汇率走势</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SwapOutlined />}>
          <Link to="/converter">汇率转换</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
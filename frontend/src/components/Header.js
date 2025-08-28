import React from 'react';
import { Layout } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header = () => {
  return (
    <AntHeader className="header" style={{ display: 'flex', alignItems: 'center' }}>
      <div className="logo">
        <DollarOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
        汇率查询系统
      </div>
    </AntHeader>
  );
};

export default Header;
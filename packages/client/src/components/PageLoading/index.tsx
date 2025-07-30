import React from 'react';
import { Spin } from 'antd';
import './index.less';

interface PageLoadingProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  tip = '页面加载中...', 
  size = 'large' 
}) => {
  return (
    <div className="page-loading">
      <div className="page-loading-content">
        <Spin size={size} tip={tip} />
      </div>
    </div>
  );
};

export default PageLoading;
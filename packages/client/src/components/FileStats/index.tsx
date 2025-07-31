import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Empty,
  Space,
  Tooltip,
  Button,
  DatePicker,
  Tag,
} from 'antd';
import { Column, Pie, Area, Bar } from '@ant-design/plots';
import {
  FileOutlined,
  CloudOutlined,
  PieChartOutlined,
  RiseOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FireOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  ReloadOutlined,
  TrophyOutlined,
  WarningOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { FileService, type FileStatistics } from '@/services/fileService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface FileStatsProps {
  showAll?: boolean;
}

const FileStats: React.FC<FileStatsProps> = ({ showAll = false }) => {
  const [stats, setStats] = useState<FileStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      const result = await FileService.getFileStatistics(showAll);
      setStats(result);
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [showAll]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="暂无统计数据" />;
  }

  // 获取文件类型图标
  const getFileTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('image')) return <FileImageOutlined style={{ color: '#52c41a' }} />;
    if (lowerType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    if (lowerType.includes('word') || lowerType.includes('doc')) return <FileWordOutlined style={{ color: '#1890ff' }} />;
    if (lowerType.includes('excel') || lowerType.includes('xls')) return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    if (lowerType.includes('zip') || lowerType.includes('rar')) return <FileZipOutlined style={{ color: '#722ed1' }} />;
    if (lowerType.includes('text') || lowerType.includes('txt')) return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
    return <FileOutlined style={{ color: '#1890ff' }} />;
  };

  // 计算存储使用率
  const getStorageUsageColor = (totalSize: number) => {
    const sizeInGB = totalSize / (1024 * 1024 * 1024);
    if (sizeInGB > 10) return '#ff4d4f'; // 红色警告
    if (sizeInGB > 5) return '#faad14'; // 橙色提醒
    return '#52c41a'; // 绿色正常
  };

  // 获取热门文件类型（前3名）
  const topFileTypes = Object.entries(stats.fileTypeDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // 计算平均每日上传量
  const avgDailyUploads = stats.uploadTrend.length > 0 
    ? (stats.uploadTrend.reduce((sum, item) => sum + item.count, 0) / stats.uploadTrend.length).toFixed(1)
    : '0';

  // 准备表格数据
  const trendColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '上传数量',
      dataIndex: 'count',
      key: 'count',
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
  ];

  return (
    <div>
      {/* 操作工具栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <DatePicker.RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={(dates, dateStrings) => {
                  setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null);
                }}
              />
              <Button icon={<CalendarOutlined />}>按时间筛选</Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="刷新数据">
                <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 总览统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="文件总数"
              value={stats.totalFiles}
              prefix={<FileOutlined style={{ color: '#1890ff' }} />}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <FireOutlined /> 日均上传 {avgDailyUploads} 个
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="存储总量"
              value={stats.totalSizeFormatted}
              prefix={<CloudOutlined style={{ color: getStorageUsageColor(stats.totalSize) }} />}
              valueStyle={{ color: getStorageUsageColor(stats.totalSize) }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {stats.totalSize > 5 * 1024 * 1024 * 1024 ? (
                <><WarningOutlined style={{ color: '#faad14' }} /> 存储空间较大</>
              ) : (
                <><TrophyOutlined style={{ color: '#52c41a' }} /> 存储正常</>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="文件类型"
              value={Object.keys(stats.fileTypeDistribution).length}
              prefix={<PieChartOutlined style={{ color: '#722ed1' }} />}
              suffix="种"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <TrophyOutlined /> 最多: {topFileTypes[0]?.[0] || '无'}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="最近7天上传"
              value={stats.uploadTrend.reduce((sum, item) => sum + item.count, 0)}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <CalendarOutlined /> 日均 {avgDailyUploads} 个
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 文件类型分布饼图 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <PieChartOutlined style={{ color: '#1890ff' }} />
                <span>文件类型分布</span>
              </Space>
            } 
            hoverable
          >
            <Pie
              data={Object.entries(stats.fileTypeDistribution).map(([type, count]) => ({
                type,
                value: count,
                percentage: ((count / stats.totalFiles) * 100).toFixed(1)
              }))}
              angleField="value"
              colorField="type"
              radius={0.8}
              innerRadius={0.4}
              label={{
                type: 'inner',
                offset: '-30%',
                content: '{percentage}%',
                style: {
                  fontSize: 12,
                  textAlign: 'center',
                },
              }}
              legend={{
                position: 'bottom',
                itemName: {
                  formatter: (text, item) => {
                    return `${text}: ${item.data?.value}个`;
                  },
                },
              }}
              interactions={[
                {
                  type: 'element-active',
                },
                {
                  type: 'pie-statistic-active',
                },
              ]}
              statistic={{
                title: {
                  style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                  },
                  content: '文件总数',
                },
                content: {
                  style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  },
                  content: stats.totalFiles.toString(),
                },
              }}
              height={300}
            />
          </Card>
        </Col>

        {/* 文件类型柱状图 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>热门文件类型</span>
              </Space>
            } 
            hoverable
          >
            <Column
              data={Object.entries(stats.fileTypeDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([type, count]) => ({
                  type,
                  count,
                  percentage: ((count / stats.totalFiles) * 100).toFixed(1)
                }))}
              xField="type"
              yField="count"
              seriesField="type"
              color={({ type }) => {
                const colors = ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC', '#9270CA', '#FF9D4D'];
                const index = Object.keys(stats.fileTypeDistribution).indexOf(type);
                return colors[index % colors.length];
              }}
              label={{
                position: 'top',
                formatter: (datum) => `${datum.count}`,
              }}
              meta={{
                type: {
                  alias: '文件类型',
                },
                count: {
                  alias: '文件数量',
                },
              }}
              height={300}
              columnWidthRatio={0.6}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 上传趋势线图 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>最近7天上传趋势</span>
              </Space>
            } 
            hoverable
          >
            <Area
              data={stats.uploadTrend.map(item => ({
                date: dayjs(item.date).format('MM-DD'),
                count: item.count,
                fullDate: item.date,
                dayOfWeek: dayjs(item.date).format('ddd')
              }))}
              xField="date"
              yField="count"
              smooth={true}
              areaStyle={{
                fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
              }}
              line={{
                color: '#1890ff',
                size: 2,
              }}
              point={{
                size: 4,
                shape: 'circle',
                style: {
                  fill: '#1890ff',
                  stroke: '#ffffff',
                  lineWidth: 2,
                },
              }}
              meta={{
                date: {
                  alias: '日期',
                },
                count: {
                  alias: '上传数量',
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return {
                    name: '上传数量',
                    value: `${datum.count}个文件`,
                  };
                },
              }}
              height={300}
            />
          </Card>
        </Col>

        {/* 存储详情仪表盘 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CloudOutlined style={{ color: '#52c41a' }} />
                <span>存储详情</span>
              </Space>
            } 
            hoverable
          >
            <div style={{ marginBottom: 16 }}>
              <Statistic
                title="单文件平均大小"
                value={stats.totalFiles > 0 ? ((stats.totalSize / stats.totalFiles) / (1024 * 1024)).toFixed(2) : '0'}
                suffix="MB"
                precision={2}
                valueStyle={{ fontSize: 16, color: '#1890ff' }}
              />
            </div>
            <div>
              <Statistic
                title="存储利用率"
                value={Math.min(100, (stats.totalSize / (10 * 1024 * 1024 * 1024)) * 100)}
                suffix="%"
                precision={1}
                valueStyle={{ 
                  fontSize: 16,
                  color: getStorageUsageColor(stats.totalSize)
                }}
              />
            </div>
            {/* 存储使用进度条 */}
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c' }}>存储空间使用情况</div>
              <Bar
                data={[
                  {
                    type: '已使用',
                    value: Math.min(100, (stats.totalSize / (10 * 1024 * 1024 * 1024)) * 100),
                  },
                  {
                    type: '剩余',
                    value: Math.max(0, 100 - Math.min(100, (stats.totalSize / (10 * 1024 * 1024 * 1024)) * 100)),
                  }
                ]}
                xField="value"
                yField="type"
                seriesField="type"
                color={({ type }) => type === '已使用' ? getStorageUsageColor(stats.totalSize) : '#f0f0f0'}
                height={80}
                legend={false}
                label={{
                  position: 'middle',
                  formatter: (datum: any) => `${datum?.value?.toFixed(1)}%`,
                  style: {
                    fill: '#fff',
                    fontSize: 12,
                  },
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FileStats;
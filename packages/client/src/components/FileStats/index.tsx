import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Tag,
  Spin,
  Empty,
  Table,
  Space,
  Tooltip,
  Avatar,
  Button,
  DatePicker,
} from 'antd';
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

      {/* 详细统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 热门文件类型 */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>热门文件类型</span>
              </Space>
            } 
            size="small"
            hoverable
          >
            <List
              dataSource={topFileTypes}
              renderItem={([type, count], index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={32}
                        icon={getFileTypeIcon(type)}
                        style={{ 
                          backgroundColor: index === 0 ? '#faad14' : index === 1 ? '#8c8c8c' : '#d48806',
                          border: 'none'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Tag color={index === 0 ? 'gold' : index === 1 ? 'default' : 'orange'}>
                          #{index + 1}
                        </Tag>
                        <span style={{ fontWeight: 500 }}>{type}</span>
                      </Space>
                    }
                    description={`${count} 个文件 (${Math.round((count / stats.totalFiles) * 100)}%)`}
                  />
                </List.Item>
              )}
              size="small"
            />
          </Card>
        </Col>

        {/* 文件类型分布 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <PieChartOutlined style={{ color: '#1890ff' }} />
                <span>文件类型分布</span>
              </Space>
            } 
            size="small"
            hoverable
          >
            <List
              dataSource={Object.entries(stats.fileTypeDistribution).sort(([,a], [,b]) => b - a)}
              renderItem={([type, count]) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getFileTypeIcon(type)}
                    title={
                      <Space>
                        <Tag color="blue">{type}</Tag>
                        <span style={{ fontWeight: 500 }}>{count} 个文件</span>
                      </Space>
                    }
                  />
                  <div style={{ width: 200 }}>
                    <Progress
                      percent={Math.round((count / stats.totalFiles) * 100)}
                      size="small"
                      showInfo={true}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  </div>
                </List.Item>
              )}
              size="small"
              style={{ maxHeight: 400, overflow: 'auto' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 存储详情 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CloudOutlined style={{ color: '#52c41a' }} />
                <span>存储详情</span>
              </Space>
            } 
            size="small"
            hoverable
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="单文件平均大小"
                  value={stats.totalFiles > 0 ? ((stats.totalSize / stats.totalFiles) / (1024 * 1024)).toFixed(2) : '0'}
                  suffix="MB"
                  precision={2}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={12}>
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
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 上传趋势 */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>最近7天上传趋势</span>
              </Space>
            } 
            size="small"
            hoverable
          >
            <Table
              columns={[
                {
                  title: (
                    <Space>
                      <CalendarOutlined />
                      <span>日期</span>
                    </Space>
                  ),
                  dataIndex: 'date',
                  key: 'date',
                  render: (date: string) => (
                    <Space>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <span>{dayjs(date).format('MM-DD')}</span>
                      <Tag color="blue">{dayjs(date).format('ddd')}</Tag>
                    </Space>
                  ),
                },
                {
                  title: (
                    <Space>
                      <CloudUploadOutlined />
                      <span>上传数量</span>
                    </Space>
                  ),
                  dataIndex: 'count',
                  key: 'count',
                  render: (count: number) => (
                    <Space>
                      <Tag color={count > 5 ? 'success' : count > 2 ? 'warning' : 'default'}>
                        {count}
                      </Tag>
                      <Progress
                        percent={stats.uploadTrend.length > 0 ? Math.round((count / Math.max(...stats.uploadTrend.map(i => i.count))) * 100) : 0}
                        size="small"
                        showInfo={false}
                        style={{ width: 60 }}
                      />
                    </Space>
                  ),
                },
              ]}
              dataSource={stats.uploadTrend}
              pagination={false}
              size="small"
              rowKey="date"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FileStats;
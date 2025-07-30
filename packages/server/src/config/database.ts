import mongoose from 'mongoose';
import 'dotenv/config';

// MongoDB 连接配置
export const mongoConfig = {
  url: `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`,
  options: {
  } as mongoose.ConnectOptions
};

// 创建数据库连接
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoConfig.url, mongoConfig.options);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    process.exit(1);
  }
};

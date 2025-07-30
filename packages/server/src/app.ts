import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';

import { initRouter } from '@/routers';
import { connectDB } from '@/config/database';
import { corsConfig } from '@/config/cors';
import { authMiddleware } from '@/middleware/auth';

const app = new Koa();

// 中间件
app.use(cors(corsConfig));
app.use(logger());
app.use(bodyParser());

// 认证中间件
app.use(authMiddleware);

// 初始化路由
initRouter(app);

// 错误处理
app.on('error', (err, ctx) => {
  console.error('server error', err);
});

// 连接数据库并启动服务器
const PORT = process.env.PORT || 3000;

// 连接 MongoDB
connectDB().then(() => {
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});

export default app;

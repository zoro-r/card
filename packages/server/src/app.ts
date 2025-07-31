import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from '@koa/cors';
import koaStatic from 'koa-static';
import path from 'path';

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

// 静态文件服务 - 服务前端dist目录
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(koaStatic(clientDistPath));

// 初始化路由
initRouter(app);

// SPA fallback - 对于非API路由，返回index.html
app.use(async (ctx, next) => {
  // 如果是API路由，跳过
  if (ctx.path.startsWith('/api/')) {
    await next();
    return;
  }
  
  // 如果请求的是文件（有扩展名），跳过
  if (path.extname(ctx.path) !== '') {
    await next();
    return;
  }
  
  // 对于其他路由，返回index.html让前端路由处理
  try {
    const fs = require('fs');
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      ctx.type = 'text/html';
      ctx.body = fs.readFileSync(indexPath, 'utf8');
    } else {
      ctx.status = 404;
      ctx.body = 'Frontend build not found. Please run "npm run build" in client directory.';
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = 'Server error';
  }
});

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

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const routers_1 = require("./routers");
const database_1 = require("./config/database");
const cors_2 = require("./config/cors");
const auth_1 = require("./middleware/auth");
const app = new koa_1.default();
// 中间件
app.use((0, cors_1.default)(cors_2.corsConfig));
app.use((0, koa_logger_1.default)());
app.use((0, koa_bodyparser_1.default)());
// 认证中间件
app.use(auth_1.authMiddleware);
// 静态文件服务 - 服务前端dist目录
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
app.use((0, koa_static_1.default)(clientDistPath));
// 初始化路由
(0, routers_1.initRouter)(app);
// SPA fallback - 对于非API路由，返回index.html
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 如果是API路由，跳过
    if (ctx.path.startsWith('/api/')) {
        yield next();
        return;
    }
    // 如果请求的是文件（有扩展名），跳过
    if (path_1.default.extname(ctx.path) !== '') {
        yield next();
        return;
    }
    // 对于其他路由，返回index.html让前端路由处理
    try {
        const fs = require('fs');
        const indexPath = path_1.default.join(clientDistPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            ctx.type = 'text/html';
            ctx.body = fs.readFileSync(indexPath, 'utf8');
        }
        else {
            ctx.status = 404;
            ctx.body = 'Frontend build not found. Please run "npm run build" in client directory.';
        }
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = 'Server error';
    }
}));
// 错误处理
app.on('error', (err, ctx) => {
    console.error('server error', err);
});
// 连接数据库并启动服务器
const PORT = process.env.PORT || 3000;
// 连接 MongoDB
(0, database_1.connectDB)().then(() => {
    // 启动服务器
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('启动失败:', err);
    process.exit(1);
});
exports.default = app;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_logger_1 = __importDefault(require("koa-logger"));
const cors_1 = __importDefault(require("@koa/cors"));
const routers_1 = require("@/routers");
const database_1 = require("@/config/database");
const cors_2 = require("@/config/cors");
const auth_1 = require("@/middleware/auth");
const app = new koa_1.default();
// 中间件
app.use((0, cors_1.default)(cors_2.corsConfig));
app.use((0, koa_logger_1.default)());
app.use((0, koa_bodyparser_1.default)());
// 认证中间件
app.use(auth_1.authMiddleware);
// 初始化路由
(0, routers_1.initRouter)(app);
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

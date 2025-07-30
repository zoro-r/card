"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
// CORS配置
exports.corsConfig = {
    // 允许的域名白名单
    origin: (ctx) => {
        const allows = [
            'http://localhost:3000',
            'http://localhost:8000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
        ];
        const origin = ctx.request.header.origin || '';
        if (allows.includes(origin)) {
            return origin;
        }
        return allows[0];
    },
    // 允许的请求方法
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // 允许的请求头
    allowedHeaders: ['Content-Type', 'Authorization'],
    // 允许发送Cookie
    credentials: true,
    // 预检请求的有效期，单位秒
    maxAge: 1 * 24 * 60 * 60,
};

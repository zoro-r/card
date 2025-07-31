"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRouter = initRouter;
const router_1 = __importDefault(require("@koa/router"));
const user_1 = __importDefault(require("./user"));
const role_1 = __importDefault(require("./role"));
const menu_1 = __importDefault(require("./menu"));
const file_1 = __importDefault(require("./file"));
const wechat_1 = __importDefault(require("./wechat"));
const order_1 = __importDefault(require("./order"));
const config_1 = require("./config");
function initRouter(app) {
    const router = new router_1.default();
    // 注册子路由
    (0, user_1.default)(router);
    (0, role_1.default)(router);
    (0, menu_1.default)(router);
    (0, file_1.default)(router);
    (0, wechat_1.default)(router);
    (0, order_1.default)(router);
    // 注册配置路由
    app.use(config_1.configRouter.routes());
    app.use(config_1.configRouter.allowedMethods());
    // 注册公开配置路由
    app.use(config_1.publicRouter.routes());
    app.use(config_1.publicRouter.allowedMethods());
    app.use(router.routes());
    app.use(router.allowedMethods());
}

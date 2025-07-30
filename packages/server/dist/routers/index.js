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
function initRouter(app) {
    const router = new router_1.default();
    // 注册子路由
    (0, user_1.default)(router);
    (0, role_1.default)(router);
    (0, menu_1.default)(router);
    app.use(router.routes());
    app.use(router.allowedMethods());
}

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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const user_2 = require("../service/user");
const platform_1 = require("../utils/platform");
function resetAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, database_1.connectDB)();
            const platformId = (0, platform_1.getDefaultPlatformId)();
            const loginName = process.argv[2] || 'super'; // 从命令行参数获取用户名，默认为super
            const newPassword = process.argv[3] || 'super123'; // 从命令行参数获取新密码，默认为super123
            console.log(`正在重置用户"${loginName}"的密码... (平台ID: ${platformId})`);
            // 查找用户
            const user = yield user_1.AdminUser.findOne({ loginName, platformId });
            if (!user) {
                console.error(`错误: 用户"${loginName}"不存在`);
                process.exit(1);
            }
            // 更新密码
            const hashedPassword = (0, user_2.hashPassword)(newPassword);
            yield user_1.AdminUser.updateOne({ uuid: user.uuid }, {
                password: hashedPassword,
                updatedAt: new Date(),
                updatedBy: 'system'
            });
            console.log(`✓ 用户"${loginName}"的密码已重置为: ${newPassword}`);
            console.log(`✓ 用户信息:`);
            console.log(`  - UUID: ${user.uuid}`);
            console.log(`  - 昵称: ${user.nickname}`);
            console.log(`  - 邮箱: ${user.email}`);
            console.log(`  - 状态: ${user.status}`);
        }
        catch (error) {
            console.error('重置密码失败:', error);
            process.exit(1);
        }
        finally {
            process.exit(0);
        }
    });
}
// 显示使用说明
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('重置管理员密码工具');
    console.log('');
    console.log('用法:');
    console.log('  npm run reset-admin [用户名] [新密码]');
    console.log('');
    console.log('示例:');
    console.log('  npm run reset-admin super newpassword123');
    console.log('  npm run reset-admin admin admin123');
    console.log('  npm run reset-admin  # 使用默认值: super super123');
    console.log('');
    console.log('参数:');
    console.log('  用户名    要重置密码的用户登录名 (默认: super)');
    console.log('  新密码    新的密码 (默认: super123)');
    process.exit(0);
}
resetAdmin();

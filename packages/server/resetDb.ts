import mongoose from 'mongoose';
import { mongoConfig } from './src/config/database';
import { AdminUser } from './src/models/user';
import { Role } from './src/models/role';
import { Menu } from './src/models/menu';

async function resetDb() {
  await mongoose.connect(mongoConfig.url, mongoConfig.options);
  await AdminUser.deleteMany({});
  await Role.deleteMany({});
  await Menu.deleteMany({});
  console.log('数据库已清空');
  process.exit(0);
}

resetDb();

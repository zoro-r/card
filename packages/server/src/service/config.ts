import { Config, IConfig } from '@/models/config';

export class ConfigService {
  // 创建或更新配置
  static async upsertConfig(key: string, data: any, description?: string): Promise<IConfig> {
    return await Config.findOneAndUpdate(
      { key },
      { data, description },
      { upsert: true, new: true }
    );
  }

  // 获取配置
  static async getConfig(key: string): Promise<IConfig | null> {
    return await Config.findOne({ key });
  }

  // 获取配置列表（支持分页和搜索）
  static async getConfigsList(params: {
    page?: number;
    pageSize?: number;
    key?: string;
    description?: string;
  }): Promise<{ list: IConfig[]; total: number }> {
    const { page = 1, pageSize = 10, key, description } = params;
    
    // 构建查询条件
    const query: any = {};
    if (key) {
      query.key = { $regex: key, $options: 'i' };
    }
    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }

    // 计算总数
    const total = await Config.countDocuments(query);
    
    // 获取分页数据
    const list = await Config.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { list, total };
  }

  // 获取所有配置
  static async getAllConfigs(): Promise<IConfig[]> {
    return await Config.find({}).sort({ updatedAt: -1 });
  }

  // 删除配置
  static async deleteConfig(key: string): Promise<boolean> {
    const result = await Config.findOneAndDelete({ key });
    return !!result;
  }

  // 批量获取配置
  static async getConfigsByKeys(keys: string[]): Promise<IConfig[]> {
    return await Config.find({ key: { $in: keys } });
  }
}
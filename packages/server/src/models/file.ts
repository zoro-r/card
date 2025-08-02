import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { getDefaultPlatformId } from '../utils/platform';

/**
 * 文件模型接口定义
 * 用于定义文件管理系统中文件的数据结构和类型
 */
export interface IFile extends Document {
  uuid: string;                    // 文件唯一标识
  originalName: string;            // 原始文件名
  fileName: string;                // 存储时的文件名（含时间戳）
  fileType: string;                // 文件类型（MIME类型）
  fileExtension: string;           // 文件扩展名
  fileSize: number;                // 文件大小（字节）
  filePath: string;                // 文件存储相对路径
  fullPath: string;                // 文件完整存储路径
  uploadDate: Date;                // 上传日期
  uploadBy: string;                // 上传用户UUID
  platformId: string;              // 平台ID（多租户支持）
  isPublic: boolean;               // 是否公开访问
  downloadCount: number;           // 下载次数
  lastAccessTime?: Date;           // 最后访问时间
  tags?: string[];                 // 文件标签
  description?: string;            // 文件描述
  status: 'active' | 'deleted' | 'quarantine'; // 文件状态
  md5Hash?: string;                // 文件MD5哈希值
  createdAt?: Date;
  updatedAt?: Date;
  // 实例方法
  softDelete(): Promise<IFile>;
  incrementDownload(): Promise<IFile>;
}

/**
 * 文件MongoDB Schema定义
 * 定义文件在MongoDB中的存储结构和验证规则
 */
const fileSchema = new Schema<IFile>(
  {
    uuid: {
      type: String,
      default: uuidV4,
      unique: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileExtension: {
      type: String,
      required: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    filePath: {
      type: String,
      required: true,
    },
    fullPath: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    uploadBy: {
      type: String,
      required: true,
      index: true,
    },
    platformId: {
      type: String,
      required: true,
      index: true,
      default: getDefaultPlatformId
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastAccessTime: {
      type: Date,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'deleted', 'quarantine'],
      default: 'active',
      index: true,
    },
    md5Hash: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 创建复合索引优化查询性能
fileSchema.index({ uploadBy: 1, platformId: 1, status: 1 });
fileSchema.index({ uploadDate: -1 });
fileSchema.index({ fileType: 1 });
fileSchema.index({ tags: 1 });

// 添加虚拟字段：文件URL（用于生成访问链接）
fileSchema.virtual('fileUrl').get(function() {
  return `/api/files/download/${this.uuid}`;
});

// 添加虚拟字段：缩略图URL（针对图片文件）
fileSchema.virtual('thumbnailUrl').get(function() {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (imageTypes.includes(this.fileType)) {
    return `/api/files/thumbnail/${this.uuid}`;
  }
  return null;
});

// 中间件：软删除支持
fileSchema.pre('find', function() {
  this.where({ status: { $ne: 'deleted' } });
});

fileSchema.pre('findOne', function() {
  this.where({ status: { $ne: 'deleted' } });
});

fileSchema.pre('findOneAndUpdate', function() {
  this.where({ status: { $ne: 'deleted' } });
});

// 实例方法：软删除
fileSchema.methods.softDelete = function() {
  this.status = 'deleted';
  return this.save();
};

// 实例方法：增加下载次数
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastAccessTime = new Date();
  return this.save();
};

export const File = mongoose.model<IFile>('File', fileSchema);

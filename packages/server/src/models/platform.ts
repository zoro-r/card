import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export interface IPlatform extends Document {
  uuid: string;
  name: string;
  code: string; // 平台代码，唯一标识
  description?: string;
  logo?: string;
  domain?: string; // 平台域名
  status: 'active' | 'inactive' | 'maintenance';
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const platformSchema = new Schema<IPlatform>(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuidV4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    domain: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    createdBy: {
      type: String,
      default: 'system',
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

// 索引
platformSchema.index({ uuid: 1 }, { unique: true });
platformSchema.index({ code: 1 }, { unique: true });
platformSchema.index({ status: 1 });
platformSchema.index({ createdAt: -1 });

export const Platform = mongoose.model<IPlatform>('Platform', platformSchema);

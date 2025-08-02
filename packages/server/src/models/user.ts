import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export interface IAdminUser extends Document {
  uuid: string;
  nickname: string;
  loginName: string;
  phone?: string;
  email: string;
  avatar?: string;
  platformId: string; // 平台id
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  address?: string;
  remark?: string;
  status: 'active' | 'disabled' | 'pending' | 'banned';
  password?: string;
  isFirstLogin: boolean; // 是否为首次登录
  lastLoginAt?: Date;
  lastLoginIp?: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    uuid: {
      type: String,
      default: uuidV4,
    },
    loginName: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    platformId: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    birthday: {
      type: String,
    },
    address: {
      type: String,
    },
    remark: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'disabled', 'pending', 'banned'],
      default: 'active',
    },
    password: {
      type: String,
      required: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
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

adminUserSchema.index({ uuid: 1 }, { unique: true });
adminUserSchema.index({ platformId: 1 });
adminUserSchema.index({ platformId: 1, status: 1 });
adminUserSchema.index({ email: 1, platformId: 1 });

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', adminUserSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export interface IMenu extends Document {
  uuid: string;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  parentId?: string;
  type: 'menu' | 'button'; // 菜单类型：菜单或按钮
  permission?: string; // 权限标识
  sort: number; // 排序
  status: 'active' | 'disabled';
  platformId: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const menuSchema = new Schema<IMenu>(
  {
    uuid: {
      type: String,
      unique: true,
      default: uuidV4,
    },
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
    },
    component: {
      type: String,
    },
    icon: {
      type: String,
    },
    parentId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['menu', 'button'],
      default: 'menu',
    },
    permission: {
      type: String,
    },
    sort: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    platformId: {
      type: String,
      required: true,
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

menuSchema.index({ uuid: 1 }, { unique: true });
menuSchema.index({ parentId: 1 });
menuSchema.index({ platformId: 1 });
menuSchema.index({ permission: 1 });

export const Menu = mongoose.model<IMenu>('Menu', menuSchema);

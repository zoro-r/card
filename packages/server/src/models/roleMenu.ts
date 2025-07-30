import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export interface IRoleMenu extends Document {
  uuid: string;
  roleId: string; // 角色ID
  menuId: string; // 菜单ID
  platformId: string;
  status: 'active' | 'disabled';
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleMenuSchema = new Schema<IRoleMenu>(
  {
    uuid: {
      type: String,
      default: uuidV4,
    },
    roleId: {
      type: String,
      required: true,
    },
    menuId: {
      type: String,
      required: true,
    },
    platformId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
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

roleMenuSchema.index({ uuid: 1 }, { unique: true });
roleMenuSchema.index({ roleId: 1 });
roleMenuSchema.index({ menuId: 1 });
roleMenuSchema.index({ platformId: 1 });
roleMenuSchema.index({ roleId: 1, menuId: 1 }, { unique: true });

export const RoleMenu = mongoose.model<IRoleMenu>('RoleMenu', roleMenuSchema);

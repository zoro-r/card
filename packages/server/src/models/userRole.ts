import mongoose, { Schema } from 'mongoose';
import { getDefaultPlatformId } from '../utils/platform';

const UserRoleSchema = new Schema({
  userId: { type: String, required: true, index: true },
  roleId: { type: String, required: true, index: true },
  status: { type: String, default: 'active' },
  platformId: { type: String, required: true, index: true, default: getDefaultPlatformId },
}, { timestamps: true });

UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export const UserRole = mongoose.model('UserRole', UserRoleSchema);

import mongoose, { Schema } from 'mongoose';

const UserRoleSchema = new Schema({
  userId: { type: String, required: true, index: true },
  roleId: { type: String, required: true, index: true },
  status: { type: String, default: 'active' },
  platformId: { type: String, index: true },
}, { timestamps: true });

UserRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

export const UserRole = mongoose.model('UserRole', UserRoleSchema);

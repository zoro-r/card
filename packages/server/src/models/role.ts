import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

export interface IRole extends Document {
  uuid: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'disabled';
  platformId: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const roleSchema = new Schema<IRole>(
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
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
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

roleSchema.index({ uuid: 1 }, { unique: true });
roleSchema.index({ code: 1 }, { unique: true });
roleSchema.index({ platformId: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);

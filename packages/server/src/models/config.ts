import mongoose, { Document, Schema } from 'mongoose';

export interface IConfig extends Document {
  key: string;
  data: any;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const Config = mongoose.model<IConfig>('Config', ConfigSchema);
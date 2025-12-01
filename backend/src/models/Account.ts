import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAccount extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, required: true, enum: ['checking', 'savings', 'credit', 'investment', 'cash', 'other'] },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'USD', uppercase: true, minlength: 3, maxlength: 3 },
  description: { type: String, trim: true, maxlength: 500 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

accountSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IAccount>('Account', accountSchema);
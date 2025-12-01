import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBudget extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100, default: function () { return this.category; } },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  amount: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0, min: 0 },
  period: { type: String, required: true, enum: ['monthly', 'weekly', 'yearly', 'custom'] },
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });

export default mongoose.model<IBudget>('Budget', budgetSchema);
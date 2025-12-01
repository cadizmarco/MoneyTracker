import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description?: string;
  date: Date;
  tags?: string[];
  transferToAccountId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['income', 'expense', 'transfer'] },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  description: { type: String, trim: true, maxlength: 500 },
  date: { type: Date, required: true, default: Date.now },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  transferToAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ accountId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);
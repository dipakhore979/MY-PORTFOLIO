import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, trim: true, maxlength: 150, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    read: { type: Boolean, default: false },
    ip: { type: String, default: '' },
  },
  { timestamps: true },
);

messageSchema.index({ read: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);

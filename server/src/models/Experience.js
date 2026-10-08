import mongoose from 'mongoose';
import { EXPERIENCE_TYPES } from '../utils/constants.js';

const experienceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: EXPERIENCE_TYPES, default: 'work' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

experienceSchema.pre('validate', function clearEndDate() {
  if (this.current) this.endDate = undefined;
});

experienceSchema.index({ type: 1, startDate: -1 });

export const Experience = mongoose.model('Experience', experienceSchema);

import mongoose from 'mongoose';
import { SKILL_CATEGORIES } from '../utils/constants.js';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    category: { type: String, required: true, enum: SKILL_CATEGORIES },
    level: { type: Number, min: 0, max: 100 },
    icon: { type: String, trim: true, maxlength: 50, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

skillSchema.index({ category: 1, order: 1 });

export const Skill = mongoose.model('Skill', skillSchema);

import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { url: { type: String, trim: true }, publicId: { type: String, trim: true } },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, trim: true, maxlength: 20000, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    tech: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    liveUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

projectSchema.index({ published: 1, order: 1, createdAt: -1 });
projectSchema.index({ tech: 1 });

export const Project = mongoose.model('Project', projectSchema);

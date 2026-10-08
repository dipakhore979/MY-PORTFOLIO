import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { url: { type: String, trim: true }, publicId: { type: String, trim: true } },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: '' },
    content: { type: String, required: true, maxlength: 50000 },
    coverImage: { type: imageSchema, default: () => ({}) },
    tags: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    readingTime: { type: Number, default: 1 },
  },
  { timestamps: true },
);

postSchema.pre('save', function prepare() {
  if (this.published && !this.publishedAt) this.publishedAt = new Date();
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(words / 200));
  }
});

postSchema.index({ published: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

export const Post = mongoose.model('Post', postSchema);

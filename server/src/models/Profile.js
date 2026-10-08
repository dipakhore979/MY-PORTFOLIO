import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { url: { type: String, trim: true }, publicId: { type: String, trim: true } },
  { _id: false },
);

// Singleton document (key = "main") holding the site owner's public details.
const profileSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    tagline: { type: String, trim: true, maxlength: 300, default: '' },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    bio: { type: String, trim: true, maxlength: 3000, default: '' },
    photo: { type: imageSchema, default: () => ({}) },
    email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
    github: { type: String, trim: true, maxlength: 500, default: '' },
    linkedin: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true },
);

export const Profile = mongoose.model('Profile', profileSchema);

import mongoose from 'mongoose';
import { connectDB } from '../../src/config/db.js';

export const connect = async () => {
  if (mongoose.connection.readyState === 0) await connectDB();
};

export const disconnect = () => mongoose.disconnect();

/** Empties every collection (optionally keeping users so one admin can be reused). */
export const clearDb = async ({ keepUsers = false } = {}) => {
  const collections = Object.values(mongoose.connection.collections).filter(
    (c) => !(keepUsers && c.collectionName === 'users'),
  );
  await Promise.all(collections.map((c) => c.deleteMany({})));
};

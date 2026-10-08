import { Message } from '../models/Message.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listMessages = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const filter = req.query.unread ? { read: false } : {};

  const [data, total, unread] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ read: false }),
  ]);

  res.json({
    success: true,
    count: data.length,
    total,
    unread,
    page,
    pages: Math.ceil(total / limit) || 1,
    data,
  });
});

export const getMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');
  res.json({ success: true, data: message });
});

export const updateMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: req.body.read },
    { new: true },
  );
  if (!message) throw new ApiError(404, 'Message not found');
  res.json({ success: true, data: message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw new ApiError(404, 'Message not found');
  res.json({ success: true, message: 'Message deleted' });
});

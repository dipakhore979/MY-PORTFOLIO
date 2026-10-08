import { Message } from '../models/Message.js';
import { sendContactNotification } from '../services/mailer.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitContact = asyncHandler(async (req, res) => {
  const { website, ...fields } = req.body;

  // Honeypot filled in => almost certainly a bot. Pretend success, store nothing.
  if (website) {
    return res.status(201).json({ success: true, message: 'Message sent. Thank you!' });
  }

  const saved = await Message.create({ ...fields, ip: req.ip });

  // Email failures must not fail the request: the message is already stored.
  sendContactNotification(saved).catch((err) =>
    console.error('Contact email failed:', err.message),
  );

  return res.status(201).json({ success: true, message: 'Message sent. Thank you!' });
});

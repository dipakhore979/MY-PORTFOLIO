import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { escapeHtml } from '../utils/escape.js';

const oneLine = (value = '') => String(value).replace(/[\r\n"<>]+/g, ' ').trim();

const buildContent = ({ name, email, subject, message }) => {
  const safeSubject = oneLine(subject) || 'No subject';
  return {
    subject: `New portfolio message: ${safeSubject}`,
    text: `From: ${oneLine(name)} <${email}>\nSubject: ${safeSubject}\n\n${message}`,
    html: `
      <h2>New message from your portfolio</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
      <hr />
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `,
  };
};

/**
 * Option A: Resend's HTTPS API. Works on every host, including those that block SMTP
 * ports (Render's free plan does).
 */
const sendViaResend = async (message) => {
  const content = buildContent(message);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resend.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.resend.from,
      to: [env.resend.to],
      reply_to: message.email,
      ...content,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`Resend responded ${res.status}: ${detail}`);
  }
};

/** Option B: classic SMTP via Nodemailer (e.g. Gmail app password). */
const smtpTransporter = env.smtp.enabled
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

const sendViaSmtp = async (message) => {
  await smtpTransporter.sendMail({
    from: { name: 'Portfolio Contact Form', address: env.smtp.from },
    to: env.smtp.to,
    replyTo: { name: oneLine(message.name), address: message.email },
    ...buildContent(message),
  });
};

export const sendContactNotification = async (message) => {
  if (env.resend.enabled) return sendViaResend(message);
  if (smtpTransporter) return sendViaSmtp(message);
  console.warn('Email not configured: skipping contact notification');
  return undefined;
};

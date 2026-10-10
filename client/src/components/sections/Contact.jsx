import { CheckCircle2, Loader2, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getErrorMessage } from '../../api/client';
import { sendMessage } from '../../api/endpoints';
import { handleFromUrl, useSite } from '../../context/ProfileContext';
import Reveal from '../ui/Reveal';
import Section from '../ui/Section';
import { GitHubIcon, LinkedInIcon } from '../ui/SocialIcons';

const FIELDS = ['name', 'email', 'subject', 'message'];

function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="field-error">
      {error.message}
    </p>
  );
}

export default function Contact() {
  const site = useSite();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
  });

  const messageLength = watch('message')?.length ?? 0;

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await sendMessage(values);
      reset();
      setSent(true);
    } catch (err) {
      const details = err?.response?.data?.details;
      if (Array.isArray(details)) {
        let mapped = false;
        details.forEach(({ field, message }) => {
          if (FIELDS.includes(field)) {
            setError(field, { type: 'server', message });
            mapped = true;
          }
        });
        if (mapped) return;
      }
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <Section
      id="contact"
      eyebrow="07 — Contact"
      title="Let's work together"
      subtitle="Have a project in mind or just want to say hi? Send me a message and I'll get back to you."
      className="bg-slate-50 dark:bg-slate-900/40"
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="space-y-5">
          <a
            href={`mailto:${site.email}`}
            className="card flex items-center gap-4 p-5 transition hover:border-brand-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-900 dark:text-white">{site.email}</span>
            </span>
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 p-5 transition hover:border-brand-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <GitHubIcon />
            </span>
            <span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">GitHub</span>
              <span className="font-medium text-slate-900 dark:text-white">{handleFromUrl(site.github)}</span>
            </span>
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 p-5 transition hover:border-brand-500"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <LinkedInIcon />
            </span>
            <span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">LinkedIn</span>
              <span className="font-medium text-slate-900 dark:text-white">{handleFromUrl(site.linkedin)}</span>
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card p-6 sm:p-8">
            {sent ? (
              <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Message sent!</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Thanks for reaching out. I&apos;ll reply as soon as I can.
                </p>
                <button type="button" onClick={() => setSent(false)} className="btn btn-secondary mt-2">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className="input"
                      {...register('name', {
                        required: 'Please enter your name',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        maxLength: { value: 80, message: 'Name must be 80 characters or fewer' },
                      })}
                    />
                    <FieldError id="name-error" error={errors.name} />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      className="input"
                      {...register('email', {
                        required: 'Please enter your email',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                        maxLength: { value: 254, message: 'Email is too long' },
                      })}
                    />
                    <FieldError id="email-error" error={errors.email} />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="label">
                    Subject <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                    className="input"
                    {...register('subject', {
                      maxLength: { value: 150, message: 'Subject must be 150 characters or fewer' },
                    })}
                  />
                  <FieldError id="subject-error" error={errors.subject} />
                </div>

                <div>
                  <label htmlFor="message" className="label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : 'message-count'}
                    className="input resize-y"
                    {...register('message', {
                      required: 'Please write a message',
                      minLength: { value: 10, message: 'Message must be at least 10 characters' },
                      maxLength: { value: 3000, message: 'Message must be 3000 characters or fewer' },
                    })}
                  />
                  <div className="flex justify-between">
                    <FieldError id="message-error" error={errors.message} />
                    <p id="message-count" className="ml-auto mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {messageLength}/3000
                    </p>
                  </div>
                </div>

                {/* Honeypot: hidden from people, tempting for bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="website">Leave this field empty</label>
                  <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
                </div>

                {serverError && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    {serverError}
                  </p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full sm:w-auto">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

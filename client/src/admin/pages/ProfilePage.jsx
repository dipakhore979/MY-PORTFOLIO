import { ExternalLink, Loader2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { getProfile, resumeUrl } from '../../api/endpoints';
import { site as defaults } from '../../config/site';
import { useProfile } from '../../context/ProfileContext';
import ErrorState from '../../components/ui/ErrorState';
import Spinner from '../../components/ui/Spinner';
import { updateProfile, uploadResume } from '../api';
import EntityForm, { toFormValues } from '../components/EntityForm';
import PageHeader from '../components/PageHeader';
import { useToast } from '../context/ToastContext';

const fields = [
  { name: 'name', label: 'Full name', type: 'text', required: true, min: 2, max: 80 },
  { name: 'role', label: 'Role / title', type: 'text', required: true, min: 2, max: 120 },
  { name: 'tagline', label: 'Tagline (hero section)', type: 'textarea', max: 300, rows: 2, wide: true },
  { name: 'description', label: 'SEO description', type: 'textarea', max: 300, rows: 2, wide: true, help: 'Shown in search results and link previews.' },
  { name: 'bio', label: 'Bio (About section)', type: 'textarea', max: 3000, rows: 8, help: 'Separate paragraphs with a blank line.' },
  { name: 'photo', label: 'Profile photo', type: 'image' },
  { name: 'email', label: 'Contact email', type: 'email', max: 254 },
  { name: 'github', label: 'GitHub URL', type: 'url', max: 500 },
  { name: 'linkedin', label: 'LinkedIn URL', type: 'url', max: 500 },
];

const fallback = {
  name: defaults.name,
  role: defaults.role,
  tagline: defaults.tagline,
  description: defaults.description,
  bio: defaults.bio.join('\n\n'),
  email: defaults.email,
  github: defaults.github,
  linkedin: defaults.linkedin,
};

function ResumeUpload() {
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please choose a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('The PDF must be 5 MB or smaller');
      return;
    }
    setUploading(true);
    try {
      await uploadResume(file);
      toast.success('Resume updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="card mt-8 p-6" aria-labelledby="resume-title">
      <h2 id="resume-title" className="text-lg font-semibold text-slate-900 dark:text-white">
        Resume
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Upload a PDF (max 5 MB). The &quot;Resume&quot; buttons on your site download the latest upload.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFile} className="sr-only" aria-label="Resume PDF" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="btn btn-primary">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {uploading ? 'Uploading…' : 'Upload PDF'}
        </button>
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View current resume
        </a>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const { refresh } = useProfile();
  const [state, setState] = useState({ loading: true, error: '', doc: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));
    getProfile(controller.signal)
      .then((res) => setState({ loading: false, error: '', doc: { ...fallback, ...(res.data || {}) } }))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        setState({ loading: false, error: getErrorMessage(err), doc: null });
      });
    return () => controller.abort();
  }, [tick]);

  const handleSave = async (payload) => {
    await updateProfile(payload);
    toast.success('Profile saved');
    refresh(); // update the public site data in this tab
  };

  const { loading, error, doc } = state;

  return (
    <>
      <PageHeader title="Profile & resume" description="Your name, bio, photo and links shown on the public site." />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={() => setTick((t) => t + 1)} />}
      {doc && (
        <div className="card p-6">
          <EntityForm
            fields={fields}
            initialValues={toFormValues(fields, doc)}
            onSubmit={handleSave}
            submitLabel="Save profile"
          />
        </div>
      )}
      <ResumeUpload />
    </>
  );
}

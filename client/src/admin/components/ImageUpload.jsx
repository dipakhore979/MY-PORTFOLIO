import { Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { uploadImage } from '../api';

const MAX_BYTES = 5 * 1024 * 1024;

/** Controlled image field: value = { url, publicId }. Upload a file or paste a URL. */
export default function ImageUpload({ id, value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const url = value?.url || '';

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('Image must be 5 MB or smaller');
      return;
    }
    setError('');
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {url && (
        <img
          src={url}
          alt="Preview"
          className="mb-3 max-h-48 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          className="sr-only"
          id={id}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn btn-secondary"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          {uploading ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => onChange({ url: '', publicId: '' })}
            className="btn btn-secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <input
        type="url"
        value={url}
        onChange={(e) => onChange({ url: e.target.value, publicId: '' })}
        placeholder="…or paste an image URL"
        aria-label="Image URL"
        className="input mt-3"
      />
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
